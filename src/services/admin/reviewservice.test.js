// mock axios instance and expose interceptors on globalThis
jest.mock('axios', () => {
  const instance = {
    get: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  instance.interceptors.request.use.mockImplementation((succ) => {
    globalThis.__axiosReqSucc_Review = succ;
  });
  instance.interceptors.response.use.mockImplementation((succ, err) => {
    globalThis.__axiosRespErr_Review = err;
  });
  const create = jest.fn(() => instance);
  globalThis.__axiosMockReview = { instance, create };
  return { __esModule: true, default: { create }, create };
});

import reviewService from './reviewservice';

let axiosInstance;

describe('reviewservice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    axiosInstance = globalThis.__axiosMockReview.instance;
    // re-capture handlers each test
    axiosInstance.interceptors.request.use.mockImplementation((succ) => {
      globalThis.__axiosReqSucc_Review = succ;
    });
    axiosInstance.interceptors.response.use.mockImplementation((succ, err) => {
      globalThis.__axiosRespErr_Review = err;
    });
  });

  describe('getAllReviews', () => {
    test('maps params and returns formatted data on code 200', async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: {
          code: 200,
          data: {
            content: [
              {
                id: 'r1',
                uuid: 'ru-1',
                userId: 'u1',
                username: 'alice',
                novelId: 'n1',
                novelTitle: 'Novel A',
                rating: 4,
                title: 'Great',
                content: 'Nice book',
                likeCnt: 3,
                isSpoiler: false,
                createTime: '2024-01-01T00:00:00Z',
                updateTime: '2024-01-02T00:00:00Z',
              },
            ],
            totalElements: 1,
            totalPages: 1,
            currentPage: 0,
            size: 10,
          },
        },
      });

      const res = await reviewService.getAllReviews({
        page: 0,
        pageSize: 10,
        sort: 'createTime',
        order: 'desc',
        novelId: 'n1',
        rating: 4,
        isSpoiler: true,
        search: 'nice',
      });

      const [url, cfg] = axiosInstance.get.mock.calls[0];
      expect(url).toBe('/reviews/admin/all');
      expect(cfg.params).toEqual(
        expect.objectContaining({
          page: 0,
          size: 10,
          sort: 'createTime',
          order: 'desc',
          novelId: 'n1',
          rating: 4,
          isSpoiler: true,
          search: 'nice',
        })
      );

      expect(res.success).toBe(true);
      expect(res.total).toBe(1);
      expect(res.data).toHaveLength(1);
      expect(res.data[0]).toEqual(
        expect.objectContaining({
          id: 'r1',
          uuid: 'ru-1',
          username: 'alice',
          novelId: 'n1',
          novelTitle: 'Novel A',
          rating: 4,
          title: 'Great',
          content: 'Nice book',
          likes: 3,
          isSpoiler: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        })
      );
    });

    test('returns success=false when code != 200', async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: { code: 500, message: 'fail' },
      });
      const res = await reviewService.getAllReviews({});
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/fail|Failed to fetch reviews/i);
      expect(res.data).toEqual([]);
      expect(res.total).toBe(0);
    });

    test('returns success=false on network error', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('net'));
      const res = await reviewService.getAllReviews({});
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/net|Failed to fetch reviews/i);
      expect(res.data).toEqual([]);
    });
  });

  describe('deleteReviewAdmin', () => {
    test('returns success on code 200', async () => {
      axiosInstance.delete.mockResolvedValueOnce({
        data: { code: 200, message: 'deleted' },
      });
      const res = await reviewService.deleteReviewAdmin('rid-1');
      expect(axiosInstance.delete).toHaveBeenCalledWith('/reviews/admin/rid-1');
      expect(res.success).toBe(true);
      expect(res.message).toMatch(/deleted|successfully/i);
    });

    test('returns success=false when code != 200', async () => {
      axiosInstance.delete.mockResolvedValueOnce({
        data: { code: 400, message: 'bad' },
      });
      const res = await reviewService.deleteReviewAdmin('rid-2');
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/bad|Failed to delete review/i);
    });

    test('returns success=false on network error', async () => {
      axiosInstance.delete.mockRejectedValueOnce(new Error('boom'));
      const res = await reviewService.deleteReviewAdmin('rid-3');
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/boom|Failed to delete review/i);
    });
  });

  describe('interceptors', () => {
    test('request interceptor attaches Authorization header from localStorage', async () => {
      localStorage.setItem('accessToken', 'tok-xyz');
      const succ = globalThis.__axiosReqSucc_Review;
      const cfg = await succ({ headers: {} });
      expect(cfg.headers.Authorization).toBe('Bearer tok-xyz');
    });

    test('response interceptor 401 clears tokens and redirects', async () => {
      localStorage.setItem('accessToken', 'a');
      localStorage.setItem('refreshToken', 'r');
      const originalLocation = window.location;
      delete window.location;
      // @ts-ignore
      window.location = { href: '' };

      const errHandler = globalThis.__axiosRespErr_Review;
      await expect(
        errHandler({ response: { status: 401 } })
      ).rejects.toBeDefined();

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(window.location.href).toBe('/yushan-admin/login');

      window.location = originalLocation;
    });

    test('response interceptor non-401 rejects without clearing tokens', async () => {
      localStorage.setItem('accessToken', 'keep');
      const errHandler = globalThis.__axiosRespErr_Review;
      await expect(
        errHandler({ response: { status: 500 } })
      ).rejects.toBeDefined();
      expect(localStorage.getItem('accessToken')).toBe('keep');
    });
  });
});
