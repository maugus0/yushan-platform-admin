jest.mock('axios', () => {
  const callable = jest.fn((config) =>
    Promise.resolve({ data: { retried: true, config } })
  );
  callable.post = jest.fn();
  callable.get = jest.fn();
  callable.interceptors = {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  };

  callable.interceptors.request.use.mockImplementation((succ) => {
    globalThis.__axiosReqSucc_Auth = succ;
  });
  callable.interceptors.response.use.mockImplementation((succ, err) => {
    globalThis.__axiosRespSucc_Auth = succ;
    globalThis.__axiosRespErr_Auth = err;
  });
  const create = jest.fn(() => callable);
  globalThis.__axiosMockAuth = { instance: callable, create };
  return { __esModule: true, default: { create }, create };
});

import authService from './authservice';

let axiosInstance;

describe('authservice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    axiosInstance = globalThis.__axiosMockAuth.instance;
    axiosInstance.interceptors.request.use.mockImplementation((succ) => {
      globalThis.__axiosReqSucc_Auth = succ;
    });
    axiosInstance.interceptors.response.use.mockImplementation((succ, err) => {
      globalThis.__axiosRespSucc_Auth = succ;
      globalThis.__axiosRespErr_Auth = err;
    });
  });

  describe('login', () => {
    test('rejects when user is not admin', async () => {
      axiosInstance.post.mockResolvedValueOnce({
        data: {
          code: 200,
          data: {
            isAdmin: false,
            accessToken: 'a',
            refreshToken: 'r',
            tokenType: 'Bearer',
            expiresIn: 3600,
            uuid: 'u',
            email: 'e',
            username: 'n',
            avatarUrl: '',
            isAuthor: false,
            level: 1,
            status: 'NORMAL',
            lastActive: '',
            createTime: '',
          },
        },
      });
      await expect(
        authService.login({ username: 'u', password: 'p' })
      ).rejects.toThrow(/Admin privileges required/i);
    });

    test('rejects on backend error code', async () => {
      axiosInstance.post.mockResolvedValueOnce({
        data: { code: 400, message: 'bad' },
      });
      await expect(
        authService.login({ username: 'x', password: 'y' })
      ).rejects.toThrow(/bad|Login failed/i);
    });
  });

  describe('refreshToken', () => {
    test('success: updates tokens and calls setupTokenRefresh', async () => {
      localStorage.setItem('refreshToken', 'rtk');
      axiosInstance.post.mockResolvedValueOnce({
        data: {
          code: 200,
          data: { accessToken: 'atk2', refreshToken: 'rtk2', expiresIn: 1800 },
        },
      });
      const spySetup = jest
        .spyOn(authService, 'setupTokenRefresh')
        .mockImplementation(() => {});
      const res = await authService.refreshToken();
      expect(res.success).toBe(true);
      expect(localStorage.getItem('accessToken')).toBe('atk2');
      expect(localStorage.getItem('refreshToken')).toBe('rtk2');
      expect(spySetup).toHaveBeenCalledWith(1800);
      spySetup.mockRestore();
    });

    test('throws when no refresh token available', async () => {
      await expect(authService.refreshToken()).rejects.toThrow(
        /No refresh token/i
      );
    });
  });

  describe('logout', () => {
    test('clears storage and timer even if API call succeeds', async () => {
      localStorage.setItem('accessToken', 'tok');
      authService.refreshTimer = setTimeout(() => {}, 1000);
      axiosInstance.post.mockResolvedValueOnce({ data: { code: 200 } });
      const res = await authService.logout();
      expect(res.success).toBe(true);
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(authService.refreshTimer).toBeNull();
    });

    test('clears storage even if API call fails', async () => {
      localStorage.setItem('accessToken', 'tok');
      axiosInstance.post.mockRejectedValueOnce(new Error('net'));
      await authService.logout();
      expect(localStorage.getItem('accessToken')).toBeNull();
    });
  });

  describe('interceptors', () => {
    test('request interceptor attaches Authorization header from localStorage', async () => {
      localStorage.setItem('accessToken', 'tok-xyz');
      const succ = globalThis.__axiosReqSucc_Auth;
      const cfg = await succ({ headers: {} });
      expect(cfg.headers.Authorization).toBe('Bearer tok-xyz');
    });
  });

  describe('isAuthenticated and getCurrentUser', () => {
    test('isAuthenticated true only when token exists and user is admin', () => {
      localStorage.setItem('accessToken', 'tok');
      localStorage.setItem('admin_user', JSON.stringify({ isAdmin: true }));
      expect(authService.isAuthenticated()).toBe(true);

      localStorage.setItem('admin_user', JSON.stringify({ isAdmin: false }));
      expect(authService.isAuthenticated()).toBe(false);

      localStorage.removeItem('admin_user');
      expect(authService.isAuthenticated()).toBe(false);
    });

    test('getCurrentUser parses stored JSON and handles invalid JSON gracefully', () => {
      const user = { uuid: 'u', isAdmin: true };
      localStorage.setItem('admin_user', JSON.stringify(user));
      expect(authService.getCurrentUser()).toEqual(user);

      localStorage.setItem('admin_user', 'invalid');
      expect(authService.getCurrentUser()).toBeNull();
    });
  });

  describe('initializeAuth', () => {
    test('returns false when no token exists', async () => {
      const res = await authService.initializeAuth();
      expect(res).toBe(false);
    });

    test('returns true and sets refresh when token not expired', async () => {
      const now = Math.floor(Date.now() / 1000);
      localStorage.setItem('accessToken', 'tok');
      localStorage.setItem('expiresIn', String(now + 3600));
      const spy = jest
        .spyOn(authService, 'setupTokenRefresh')
        .mockImplementation(() => {});
      const res = await authService.initializeAuth();
      expect(res).toBe(true);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    test('expired token tries to refresh: success -> true', async () => {
      const now = Math.floor(Date.now() / 1000);
      localStorage.setItem('accessToken', 'tok');
      localStorage.setItem('expiresIn', String(now - 10));
      const spyRefresh = jest
        .spyOn(authService, 'refreshToken')
        .mockResolvedValue({ success: true });
      const res = await authService.initializeAuth();
      expect(res).toBe(true);
      expect(spyRefresh).toHaveBeenCalled();
      spyRefresh.mockRestore();
    });

    test('expired token refresh fails -> logout and false', async () => {
      const now = Math.floor(Date.now() / 1000);
      localStorage.setItem('accessToken', 'tok');
      localStorage.setItem('expiresIn', String(now - 10));
      const spyRefresh = jest
        .spyOn(authService, 'refreshToken')
        .mockRejectedValue(new Error('no'));
      const spyLogout = jest
        .spyOn(authService, 'logout')
        .mockResolvedValue({ success: true });
      const res = await authService.initializeAuth();
      expect(res).toBe(false);
      expect(spyRefresh).toHaveBeenCalled();
      expect(spyLogout).toHaveBeenCalled();
      spyRefresh.mockRestore();
      spyLogout.mockRestore();
    });
  });
});
