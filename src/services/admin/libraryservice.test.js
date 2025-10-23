// mock axios instance and expose interceptors on globalThis
jest.mock('axios', () => {
  const instance = {
    get: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    defaults: { headers: {} },
  };
  instance.interceptors.request.use.mockImplementation((succ) => {
    globalThis.__axiosReqSucc_Library = succ;
  });
  instance.interceptors.response.use.mockImplementation((succ, err) => {
    globalThis.__axiosRespErr_Library = err;
  });
  const create = jest.fn(() => instance);
  globalThis.__axiosMockLibrary = { instance, create };
  return { __esModule: true, default: { create }, create };
});

import libraryService from './libraryservice';

let axiosInstance;

describe('Library Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    axiosInstance = globalThis.__axiosMockLibrary.instance;
    // re-capture handlers for each test
    axiosInstance.interceptors.request.use.mockImplementation((succ) => {
      globalThis.__axiosReqSucc_Library = succ;
    });
    axiosInstance.interceptors.response.use.mockImplementation((succ, err) => {
      globalThis.__axiosRespErr_Library = err;
    });
  });

  describe('getAllLibraries', () => {
    test('throws on invalid response format', async () => {
      axiosInstance.get.mockResolvedValueOnce({ data: {} });
      await expect(libraryService.getAllLibraries({})).rejects.toThrow(
        /Failed to fetch user libraries from API/i
      );
    });

    test('throws on network error', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('net'));
      await expect(libraryService.getAllLibraries({})).rejects.toThrow(
        /Failed to fetch user libraries from API/i
      );
    });
  });

  describe('getUserLibrary', () => {
    test('returns transformed library on success', async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: {
          users: [
            {
              username: 'bob',
              email: 'b@example.com',
              readBookNum: 30,
              readTime: 200,
              avatarUrl: 'b.png',
              profileDetail: 'p',
              birthday: '2001-01-01',
              isAuthor: false,
              isAdmin: false,
              level: 3,
              exp: 50,
              yuan: 5,
              createTime: '2024-01-01',
              updateTime: '2024-01-02',
              lastActive: '2024-01-03',
              status: 'NORMAL',
            },
          ],
          userCount: 1,
        },
      });

      const res = await libraryService.getUserLibrary('bob');
      expect(axiosInstance.get).toHaveBeenCalledWith(
        `/search/users?search=bob&pageSize=1`
      );
      expect(res.success).toBe(true);
      expect(res.data).toEqual(
        expect.objectContaining({
          id: 'bob',
          totalBooks: 30,
          totalReadingTime: 200,
        })
      );
    });

    test('throws when not found', async () => {
      axiosInstance.get.mockResolvedValueOnce({ data: { users: [] } });
      await expect(libraryService.getUserLibrary('none')).rejects.toThrow(
        /User library not found/i
      );
    });

    test('throws propagating error message', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('boom'));
      await expect(libraryService.getUserLibrary('err')).rejects.toThrow(
        /boom|Failed to fetch user library/i
      );
    });
  });

  describe('getLibraryStats', () => {
    test('returns totalUsers from response', async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: { userCount: 1234, users: [] },
      });
      const res = await libraryService.getLibraryStats();
      expect(res.success).toBe(true);
      expect(res.data.totalUsers).toBe(1234);
    });

    test('throws on network error', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('err'));
      await expect(libraryService.getLibraryStats()).rejects.toThrow(
        /Failed to fetch library statistics/i
      );
    });
  });

  describe('interceptors', () => {
    test('request interceptor adds Authorization header', async () => {
      localStorage.setItem('accessToken', 'tok-xyz');
      const succ = globalThis.__axiosReqSucc_Library;
      const cfg = await succ({ headers: {} });
      expect(cfg.headers.Authorization).toBe('Bearer tok-xyz');
    });

    test('response interceptor 401 clears tokens and redirects', async () => {
      localStorage.setItem('accessToken', 'a');
      localStorage.setItem('adminUser', 'admin1');

      const originalLocation = window.location;
      delete window.location;
      // @ts-ignore
      window.location = { href: '' };

      const errHandler = globalThis.__axiosRespErr_Library;
      await expect(
        errHandler({ response: { status: 401 } })
      ).rejects.toBeDefined();

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('adminUser')).toBeNull();
      expect(window.location.href).toBe('/admin/login');

      window.location = originalLocation;
    });

    test('response interceptor non-401 rejects without clearing token', async () => {
      localStorage.setItem('accessToken', 'keep');
      const errHandler = globalThis.__axiosRespErr_Library;
      await expect(
        errHandler({ response: { status: 500 } })
      ).rejects.toBeDefined();
      expect(localStorage.getItem('accessToken')).toBe('keep');
    });
  });
});
