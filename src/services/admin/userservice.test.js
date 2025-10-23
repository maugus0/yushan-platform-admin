jest.setTimeout(30000);

// inline axios mock instance inside factory and expose via globalThis
jest.mock('axios', () => {
  const instance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  // capture response error handler to global
  instance.interceptors.response.use.mockImplementation((succ, err) => {
    globalThis.__axiosResponseErr = err;
  });
  // capture request success handler to global
  instance.interceptors.request.use.mockImplementation((succ /*, err */) => {
    globalThis.__axiosRequestSucc = succ;
  });
  const create = jest.fn(() => instance);
  // expose for tests
  globalThis.__axiosMock = { instance, create };
  return {
    __esModule: true,
    default: { create },
    create,
  };
});

// Import service after mocks
import userService, {
  getCurrentUserProfile,
  getUserProfileByUsername,
} from './userservice';

let axiosInstance;

describe('User Service (axios-backed)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    axiosInstance = globalThis.__axiosMock.instance;
    axiosInstance.interceptors.response.use.mockImplementation((succ, err) => {
      globalThis.__axiosResponseErr = err;
    });
    axiosInstance.interceptors.request.use.mockImplementation((succ) => {
      globalThis.__axiosRequestSucc = succ;
    });
  });

  describe('getCurrentUserProfile', () => {
    test('returns success with mapped API data (200)', async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: {
          code: 200,
          data: {
            uuid: 'u-1',
            username: 'alice',
            email: 'a@example.com',
            avatarUrl: 'avatar.png',
            status: 'NORMAL',
            isAdmin: false,
            isAuthor: true,
            createTime: '2024-01-01T00:00:00Z',
            lastActive: '2024-01-02T00:00:00Z',
            updateTime: '2024-01-03T00:00:00Z',
            gender: 'FEMALE',
          },
        },
      });
      const res = await getCurrentUserProfile();
      expect(res.success).toBe(true);
      expect(res.data.id).toBe('u-1');
      expect(res.data.username).toBe('alice');
      expect(res.data.userType).toBe('writer');
      expect(res.data.status).toBe('active');
      expect(res.data.profile.gender).toBe('female');
    });

    test('returns error object on failure', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('Network error'));
      const res = await getCurrentUserProfile();
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Network error/i);
    });
  });

  describe('getAllUsers', () => {
    test('maps filters and pagination, converts page to 0-based', async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: {
          code: 200,
          data: {
            content: [],
            totalElements: 0,
            currentPage: 1,
            size: 20,
            totalPages: 0,
            hasNext: false,
            hasPrevious: true,
          },
        },
      });

      await userService.getAllUsers({
        page: 2,
        pageSize: 20,
        status: 'active',
        userType: 'writer',
      });

      const [url, cfg] = axiosInstance.get.mock.calls[0];
      expect(url).toBe('/admin/users');
      expect(cfg.params.page).toBe(1);
      expect(cfg.params.size).toBe(20);
      expect(cfg.params.status).toBe('NORMAL');
      expect(cfg.params.isAuthor).toBe(true);
      expect(cfg.params.isAdmin).toBeUndefined();
    });

    test('applies admin filter and returns formatted paging meta', async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: {
          code: 200,
          data: {
            content: [
              {
                uuid: 'u-2',
                username: 'bob',
                email: 'b@example.com',
                status: 'SUSPENDED',
                isAdmin: true,
                isAuthor: false,
                createTime: '2024-01-01T00:00:00Z',
                updateTime: '2024-01-02T00:00:00Z',
              },
            ],
            totalElements: 1,
            currentPage: 0,
            size: 10,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false,
          },
        },
      });

      const res = await userService.getAllUsers({ userType: 'admin' });
      const [, cfg] = axiosInstance.get.mock.calls[0];
      expect(cfg.params.isAdmin).toBe(true);
      expect(res.total).toBe(1);
      expect(res.page).toBe(1);
      expect(res.data[0].status).toBe('suspended');
      expect(res.data[0].userType).toBe('admin');
    });
  });

  describe('getUserProfileByUsername', () => {
    test('if UUID-like, fetches /users/:id', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      axiosInstance.get.mockResolvedValueOnce({
        data: { id: 'id-123', username: 'jack' },
      });
      const res = await getUserProfileByUsername(uuid);
      expect(axiosInstance.get).toHaveBeenCalledWith(`/users/${uuid}`);
      expect(res.id).toBe('id-123');
      expect(res.username).toBe('jack');
    });

    test('otherwise searches /search/users with params and formats first', async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: [{ id: 'i1', username: 'eve', email: 'e@x.com' }],
      });
      const res = await getUserProfileByUsername('eve');
      const [url, cfg] = axiosInstance.get.mock.calls[0];
      expect(url).toBe('/search/users');
      expect(cfg.params).toEqual({ username: 'eve', limit: 1 });
      expect(res.username).toBe('eve');
    });
  });

  describe('updateUserStatus', () => {
    test('maps local status to API status and returns success on 200', async () => {
      axiosInstance.put.mockResolvedValueOnce({
        data: { code: 200, data: { id: 'u-9', status: 'BANNED' } },
      });
      const res = await userService.updateUserStatus('u-9', 'banned');
      expect(axiosInstance.put).toHaveBeenCalledWith(
        '/admin/users/u-9/status',
        {
          status: 'BANNED',
        }
      );
      expect(res.success).toBe(true);
    });
  });

  describe('response interceptor 401', () => {
    test('clears tokens and redirects to login', async () => {
      localStorage.setItem('accessToken', 'a');
      localStorage.setItem('refreshToken', 'r');
      localStorage.setItem('tokenType', 'Bearer');
      localStorage.setItem('expiresIn', '3600');

      const originalLocation = window.location;
      delete window.location;
      // @ts-ignore
      window.location = { href: '' };

      const errHandler = globalThis.__axiosResponseErr;
      await expect(
        errHandler({ response: { status: 401 } })
      ).rejects.toBeDefined();

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(window.location.href).toBe('/admin/login');

      window.location = originalLocation;
    });
  });

  describe('getUserProfile (by id)', () => {
    test('formats response using formatUserData', async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: {
          _id: 'id-7',
          name: 'Charlie',
          profilePicture: 'p.png',
          email: 'c@x.com',
        },
      });
      const res = await userService.getUserProfile('id-7');
      expect(res.id).toBe('id-7');
      expect(res.username).toBe('Charlie');
      expect(res.avatar).toBe('p.png');
      expect(res.status).toBe('active');
      expect(res.userType).toBe('reader');
    });

    test('throws on axios error', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('boom'));
      await expect(userService.getUserProfile('x')).rejects.toThrow(/boom/);
    });
  });

  describe('getUserProfileByUsername edge cases', () => {
    test('throws when search returns empty list', async () => {
      axiosInstance.get.mockResolvedValueOnce({ data: [] });
      await expect(getUserProfileByUsername('nobody')).rejects.toThrow(
        /User not found/i
      );
    });
  });

  describe('getAllUsers filters mapping', () => {
    test('maps reader to isAuthor=false and status=active -> NORMAL', async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: {
          code: 200,
          data: {
            content: [],
            totalElements: 0,
            currentPage: 0,
            size: 10,
            totalPages: 0,
            hasNext: false,
            hasPrevious: false,
          },
        },
      });
      await userService.getAllUsers({
        page: 1,
        pageSize: 10,
        status: 'active',
        userType: 'reader',
      });
      const [url, cfg] = axiosInstance.get.mock.calls[0];
      expect(url).toBe('/admin/users');
      expect(cfg.params.status).toBe('NORMAL');
      expect(cfg.params.isAuthor).toBe(false);
      expect(cfg.params.isAdmin).toBeUndefined();
    });

    test('direct isAuthor override respected', async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: {
          code: 200,
          data: {
            content: [],
            totalElements: 0,
            currentPage: 0,
            size: 10,
            totalPages: 0,
            hasNext: false,
            hasPrevious: false,
          },
        },
      });
      await userService.getAllUsers({ isAuthor: true });
      const [, cfg] = axiosInstance.get.mock.calls[0];
      expect(cfg.params.isAuthor).toBe(true);
    });
  });

  describe('getReaders/getWriters', () => {
    test('getReaders sets isAuthor=false', async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: {
          code: 200,
          data: {
            content: [],
            totalElements: 0,
            currentPage: 0,
            size: 10,
            totalPages: 0,
            hasNext: false,
            hasPrevious: false,
          },
        },
      });
      await userService.getReaders({ pageSize: 5 });
      const [, cfg] = axiosInstance.get.mock.calls[0];
      expect(cfg.params.isAuthor).toBe(false);
    });

    test('getWriters sets isAuthor=true', async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: {
          code: 200,
          data: {
            content: [],
            totalElements: 0,
            currentPage: 0,
            size: 10,
            totalPages: 0,
            hasNext: false,
            hasPrevious: false,
          },
        },
      });
      await userService.getWriters({});
      const [, cfg] = axiosInstance.get.mock.calls[0];
      expect(cfg.params.isAuthor).toBe(true);
    });
  });

  describe('CRUD and actions on mock users', () => {
    test('create/update/delete user success path', async () => {
      const createRes = await userService.createUser({
        userType: 'reader',
        username: 'neo',
      });
      expect(createRes.data.id).toMatch(/^reader_/);
      expect(createRes.data.joinDate).toBeDefined();

      const { id } = createRes.data;
      const upd = await userService.updateUser(id, { status: 'inactive' });
      expect(upd.data.status).toBe('inactive');

      const del = await userService.deleteUser(id);
      expect(del.data.id).toBe(id);
      // delete non-existing should throw
      await expect(userService.deleteUser(id)).rejects.toThrow(
        /User not found/i
      );
    });

    test('update not found throws', async () => {
      await expect(userService.updateUser('no-such', { a: 1 })).rejects.toThrow(
        /User not found/i
      );
    });

    test('suspend and ban user set status and payload', async () => {
      const a = await userService.createUser({
        userType: 'reader',
        username: 'john',
      });
      const b = await userService.createUser({
        userType: 'reader',
        username: 'jane',
      });

      const s = await userService.suspendUser(a.data.id, { reason: 'x' });
      expect(s.data.status).toBe('suspended');
      expect(s.data.suspension.reason).toBe('x');

      const ban = await userService.banUser(b.data.id, { reason: 'y' });
      expect(ban.data.status).toBe('banned');
      expect(ban.data.ban.reason).toBe('y');

      await expect(userService.suspendUser('missing', {})).rejects.toThrow(
        /User not found/i
      );
      await expect(userService.banUser('missing', {})).rejects.toThrow(
        /User not found/i
      );
    });

    test('bulkUpdateUsers and bulkDeleteUsers', async () => {
      const u1 = await userService.createUser({
        userType: 'writer',
        username: 'w1',
      });
      const u2 = await userService.createUser({
        userType: 'writer',
        username: 'w2',
      });
      const ids = [u1.data.id, u2.data.id];

      const updated = await userService.bulkUpdateUsers(ids, {
        status: 'active',
      });
      expect(updated.data).toHaveLength(2);
      expect(updated.data.every((u) => u.status === 'active')).toBe(true);

      const deleted = await userService.bulkDeleteUsers(ids);
      expect(deleted.data).toHaveLength(2);
      // deleting again should return empty (no errors thrown by bulkDelete)
      const deletedAgain = await userService.bulkDeleteUsers(ids);
      expect(Array.isArray(deletedAgain.data)).toBe(true);
    });
  });

  describe('promoteToAdmin', () => {
    test('success maps code 200', async () => {
      axiosInstance.post = jest.fn().mockResolvedValueOnce({
        data: { code: 200, data: { email: 'a@x.com' }, message: 'ok' },
      });
      const res = await userService.promoteToAdmin('a@x.com');
      expect(res.success).toBe(true);
      expect(res.message).toMatch(/promoted|ok/i);
    });

    test('non-200 throws error', async () => {
      axiosInstance.post = jest.fn().mockResolvedValueOnce({
        data: { code: 500, message: 'fail' },
      });
      await expect(userService.promoteToAdmin('b@x.com')).rejects.toThrow(
        /fail|Failed to promote/i
      );
    });
  });

  describe('request/response interceptors', () => {
    test('request interceptor attaches Authorization header from localStorage', async () => {
      localStorage.setItem('accessToken', 'tok-123');
      const succ = globalThis.__axiosRequestSucc;
      const cfg = await succ({ headers: {} });
      expect(cfg.headers.Authorization).toBe('Bearer tok-123');
    });

    test('response error handler (non-401) rejects without clearing tokens', async () => {
      localStorage.setItem('accessToken', 'tok');
      const errHandler = globalThis.__axiosResponseErr;
      await expect(
        errHandler({ response: { status: 500 } })
      ).rejects.toBeDefined();
      expect(localStorage.getItem('accessToken')).toBe('tok');
    });

    test('getCurrentUserProfile returns error when code != 200', async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: { code: 400, message: 'bad' },
      });
      const res = await getCurrentUserProfile();
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/bad|Failed to fetch profile/i);
    });
  });

  describe('display helpers', () => {
    test('getUserStatusColor returns mapped color or default', () => {
      expect(userService.getUserStatusColor('active')).toBe('#52c41a');
      expect(userService.getUserStatusColor('suspended')).toBe('#fa8c16');
      expect(userService.getUserStatusColor('banned')).toBe('#f5222d');
      expect(userService.getUserStatusColor('unknown')).toBe('#d9d9d9');
    });

    test('getGenderDisplayText maps values correctly', () => {
      expect(userService.getGenderDisplayText('male')).toBe('Male');
      expect(userService.getGenderDisplayText('FEMALE')).toBe('Female');
      expect(userService.getGenderDisplayText('UNKNOWN')).toBe(
        'Prefer not to say'
      );
      expect(userService.getGenderDisplayText('')).toBe('Not specified');
      expect(userService.getGenderDisplayText(null)).toBe('Not specified');
      expect(userService.getGenderDisplayText(undefined)).toBe('Not specified');
    });
  });
});
