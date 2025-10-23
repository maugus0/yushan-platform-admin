// mock axios factory and capture interceptors
jest.mock('axios', () => {
  const instance = {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  // capture interceptors for tests
  instance.interceptors.request.use.mockImplementation((succ) => {
    globalThis.__apiReqSucc = succ;
  });
  instance.interceptors.response.use.mockImplementation((succ, err) => {
    globalThis.__apiRespSucc = succ;
    globalThis.__apiRespErr = err;
  });
  const create = jest.fn((cfg) => {
    globalThis.__apiCreateCfg = cfg;
    return instance;
  });
  return { __esModule: true, default: { create }, create };
});

// import api instance after mocking axios (side-effect registers interceptors)
import api from './api';

describe('api.js axios instance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('request interceptor', () => {
    test('attaches Authorization from accessToken', async () => {
      localStorage.setItem('accessToken', 'tok-1');
      const cfg = await globalThis.__apiReqSucc({ headers: {} });
      expect(cfg.headers.Authorization).toBe('Bearer tok-1');
    });

    test('falls back to admin_token when accessToken missing', async () => {
      localStorage.setItem('admin_token', 'adm-1');
      const cfg = await globalThis.__apiReqSucc({ headers: {} });
      expect(cfg.headers.Authorization).toBe('Bearer adm-1');
    });

    test('leaves headers unchanged when no token', async () => {
      const cfg = await globalThis.__apiReqSucc({ headers: {} });
      expect(cfg.headers.Authorization).toBeUndefined();
    });
  });

  describe('response interceptor', () => {
    test('passes successful response through unchanged', async () => {
      const resp = { data: { ok: true } };
      const out = await globalThis.__apiRespSucc(resp);
      expect(out).toBe(resp);
    });

    test('401 clears tokens and redirects to login', async () => {
      localStorage.setItem('accessToken', 'a');
      localStorage.setItem('refreshToken', 'r');
      localStorage.setItem('admin_token', 'at');
      localStorage.setItem('admin_refresh_token', 'rt');
      localStorage.setItem('admin_user', JSON.stringify({}));

      const originalLocation = window.location;
      // @ts-ignore
      delete window.location;
      // @ts-ignore
      window.location = { href: '' };

      await expect(
        globalThis.__apiRespErr({ response: { status: 401 } })
      ).rejects.toBeDefined();

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('admin_token')).toBeNull();
      expect(localStorage.getItem('admin_refresh_token')).toBeNull();
      expect(localStorage.getItem('admin_user')).toBeNull();
      expect(window.location.href).toBe('/yushan-admin/login');

      window.location = originalLocation;
    });

    test('non-401 rejects and does not clear tokens', async () => {
      localStorage.setItem('accessToken', 'keep');
      await expect(
        globalThis.__apiRespErr({ response: { status: 500 } })
      ).rejects.toBeDefined();
      expect(localStorage.getItem('accessToken')).toBe('keep');
    });
  });

  test('default export is the axios instance', () => {
    // api should be the created instance reference (shape has interceptors)
    expect(api).toBeDefined();
    expect(api.interceptors).toBeDefined();
  });
});
