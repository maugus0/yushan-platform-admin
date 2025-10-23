// mock axios instance and expose interceptors on globalThis
jest.mock('axios', () => {
  const instance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  instance.interceptors.request.use.mockImplementation((succ) => {
    globalThis.__axiosReqSucc_Comment = succ;
  });
  instance.interceptors.response.use.mockImplementation((succ, err) => {
    globalThis.__axiosRespErr_Comment = err;
  });
  const create = jest.fn(() => instance);
  globalThis.__axiosMockComment = { instance, create };
  return { __esModule: true, default: { create }, create };
});

import commentService from './commentservice';

let axiosInstance;

describe('commentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    axiosInstance = globalThis.__axiosMockComment.instance;
    // re-capture handlers each test
    axiosInstance.interceptors.request.use.mockImplementation((succ) => {
      globalThis.__axiosReqSucc_Comment = succ;
    });
    axiosInstance.interceptors.response.use.mockImplementation((succ, err) => {
      globalThis.__axiosRespErr_Comment = err;
    });
  });

  describe('getAllComments', () => {
    test('maps params and returns formatted data on code 200', async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: {
          code: 200,
          data: {
            comments: [
              {
                id: 'c1',
                userId: 'u1',
                username: 'alice',
                content: 'hello',
                novelId: 'n1',
                chapterId: 'ch1',
                chapterTitle: 'Chapter 1',
                likeCnt: 3,
                isSpoiler: false,
                createTime: '2024-01-01T00:00:00Z',
                updateTime: '2024-01-02T00:00:00Z',
              },
            ],
            totalCount: 1,
            totalPages: 1,
            currentPage: 0,
            pageSize: 25,
          },
        },
      });

      const res = await commentService.getAllComments({
        page: 2,
        pageSize: 25,
        sort: 'createTime',
        order: 'desc',
        novelId: 'n1',
        userId: 'u1',
        isSpoiler: true,
        search: 'hello',
      });

      const [url, cfg] = axiosInstance.get.mock.calls[0];
      expect(url).toBe('/comments/admin/all');
      expect(cfg.params).toEqual(
        expect.objectContaining({
          page: 2,
          size: 25,
          sort: 'createTime',
          order: 'desc',
          novelId: 'n1',
          userId: 'u1',
          isSpoiler: true,
          search: 'hello',
        })
      );

      expect(res.success).toBe(true);
      expect(res.total).toBe(1);
      expect(res.data[0]).toEqual(
        expect.objectContaining({
          id: 'c1',
          username: 'alice',
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
      const res = await commentService.getAllComments({});
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/fail|Failed to fetch comments/i);
      expect(res.data).toEqual([]);
      expect(res.total).toBe(0);
    });

    test('returns success=false on network error', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('net'));
      const res = await commentService.getAllComments({});
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/net|Failed to fetch comments/i);
    });
  });

  describe('getCommentsByTarget', () => {
    test('novel target forwards novelId param', async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: {
          code: 200,
          data: {
            comments: [{ id: 'c2', userId: 'u2', username: 'bob' }],
            totalCount: 1,
            totalPages: 1,
            currentPage: 0,
            pageSize: 20,
          },
        },
      });

      const res = await commentService.getCommentsByTarget('novel', 'n9', {
        page: 0,
        pageSize: 20,
      });

      const [url, cfg] = axiosInstance.get.mock.calls[0];
      expect(url).toBe('/comments/admin/all');
      expect(cfg.params).toEqual(
        expect.objectContaining({ novelId: 'n9', page: 0, size: 20 })
      );
      expect(res.success).toBe(true);
      expect(res.total).toBe(1);
    });

    test('chapter target forwards chapterId param', async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: {
          code: 200,
          data: {
            comments: [{ id: 'c3' }],
            totalCount: 1,
            totalPages: 1,
            currentPage: 0,
            pageSize: 20,
          },
        },
      });

      await commentService.getCommentsByTarget('chapter', 'ch7', { page: 1 });
      const [, cfg] = axiosInstance.get.mock.calls[0];
      expect(cfg.params).toEqual(expect.objectContaining({ chapterId: 'ch7' }));
    });

    test('returns success=false on error', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('boom'));
      const res = await commentService.getCommentsByTarget('novel', 'n1', {});
      expect(res.success).toBe(false);
      expect(res.data).toEqual([]);
    });
  });

  describe('getCommentById', () => {
    test('returns formatted data on code 200', async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: {
          code: 200,
          data: {
            id: 'c7',
            userId: 'u7',
            username: 'eve',
            content: 'nice',
            novelId: 'n7',
            chapterId: 'ch7',
            chapterTitle: 'Ch 7',
            likeCnt: 8,
            isSpoiler: false,
            createTime: '2024-01-05T00:00:00Z',
            updateTime: '2024-01-06T00:00:00Z',
          },
        },
      });

      const res = await commentService.getCommentById('c7');
      expect(axiosInstance.get).toHaveBeenCalledWith('/comments/c7');
      expect(res.success).toBe(true);
      expect(res.data).toEqual(
        expect.objectContaining({
          id: 'c7',
          likes: 8,
          createdAt: '2024-01-05T00:00:00Z',
        })
      );
    });

    test('returns success=false when code != 200', async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: { code: 404, message: 'not found' },
      });
      const res = await commentService.getCommentById('missing');
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/not found|Failed to fetch comment/i);
    });

    test('returns success=false on network error', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('err'));
      const res = await commentService.getCommentById('x');
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/err|Failed to fetch comment/i);
    });
  });

  describe('create/update/delete comment', () => {
    test('createComment returns success on code 200', async () => {
      axiosInstance.post.mockResolvedValueOnce({
        data: {
          code: 200,
          data: {
            id: 'c8',
            userId: 'u8',
            username: 'tom',
            content: 'hi',
            likeCnt: 0,
            isSpoiler: false,
            createTime: '2024-01-10T00:00:00Z',
            updateTime: '2024-01-10T00:00:00Z',
          },
        },
      });

      const res = await commentService.createComment({ content: 'hi' });
      expect(axiosInstance.post).toHaveBeenCalledWith('/comments', {
        content: 'hi',
      });
      expect(res.success).toBe(true);
      expect(res.data.id).toBe('c8');
    });

    test('createComment returns success=false on non-200 or error', async () => {
      axiosInstance.post.mockResolvedValueOnce({
        data: { code: 400, message: 'bad' },
      });
      const res1 = await commentService.createComment({});
      expect(res1.success).toBe(false);
      expect(res1.error).toMatch(/bad|Failed to create comment/i);

      axiosInstance.post.mockRejectedValueOnce(new Error('boom'));
      const res2 = await commentService.createComment({});
      expect(res2.success).toBe(false);
      expect(res2.error).toMatch(/boom|Failed to create comment/i);
    });

    test('updateComment returns success on code 200', async () => {
      axiosInstance.put.mockResolvedValueOnce({
        data: {
          code: 200,
          data: {
            id: 'c9',
            userId: 'u9',
            username: 'kim',
            content: 'edited',
            likeCnt: 1,
            isSpoiler: false,
            createTime: '2024-01-11T00:00:00Z',
            updateTime: '2024-01-12T00:00:00Z',
          },
        },
      });

      const res = await commentService.updateComment('c9', {
        content: 'edited',
      });
      expect(axiosInstance.put).toHaveBeenCalledWith('/comments/c9', {
        content: 'edited',
      });
      expect(res.success).toBe(true);
      expect(res.data.content).toBe('edited');
    });

    test('updateComment returns success=false on non-200 or error', async () => {
      axiosInstance.put.mockResolvedValueOnce({
        data: { code: 500, message: 'fail' },
      });
      const res1 = await commentService.updateComment('cX', {});
      expect(res1.success).toBe(false);
      expect(res1.error).toMatch(/fail|Failed to update comment/i);

      axiosInstance.put.mockRejectedValueOnce(new Error('err'));
      const res2 = await commentService.updateComment('cY', {});
      expect(res2.success).toBe(false);
      expect(res2.error).toMatch(/err|Failed to update comment/i);
    });

    test('deleteComment returns success on code 200', async () => {
      axiosInstance.delete.mockResolvedValueOnce({
        data: { code: 200, data: {}, message: 'ok' },
      });

      const res = await commentService.deleteComment('c11');
      expect(axiosInstance.delete).toHaveBeenCalledWith('/comments/c11');
      expect(res.success).toBe(true);
      expect(res.message).toMatch(/deleted/i);
    });

    test('deleteComment returns success=false on non-200 or error', async () => {
      axiosInstance.delete.mockResolvedValueOnce({
        data: { code: 400, message: 'bad' },
      });
      const res1 = await commentService.deleteComment('c12');
      expect(res1.success).toBe(false);
      expect(res1.error).toMatch(/bad|Failed to delete comment/i);

      axiosInstance.delete.mockRejectedValueOnce(new Error('no'));
      const res2 = await commentService.deleteComment('c13');
      expect(res2.success).toBe(false);
      expect(res2.error).toMatch(/no|Failed to delete comment/i);
    });
  });

  describe('getRecentComments', () => {
    test('returns recent comments with size param', async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: {
          code: 200,
          data: {
            comments: [{ id: 'r1' }],
            totalCount: 1,
          },
        },
      });

      const res = await commentService.getRecentComments(5);
      const [url, cfg] = axiosInstance.get.mock.calls[0];
      expect(url).toBe('/comments/admin/all');
      expect(cfg.params).toEqual(
        expect.objectContaining({
          page: 0,
          size: 5,
          sort: 'createTime',
          order: 'desc',
        })
      );
      expect(res.success).toBe(true);
      expect(res.data).toHaveLength(1);
    });

    test('returns success=false on error', async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: { code: 500, message: 'x' },
      });
      const res = await commentService.getRecentComments(3);
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/x|Failed to fetch recent comments/i);
    });
  });

  describe('getCommentStatistics', () => {
    test('returns stats on code 200', async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: { code: 200, data: { total: 5, likes: 10 } },
      });

      const res = await commentService.getCommentStatistics('ch1');
      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/comments/chapter/ch1/statistics'
      );
      expect(res.success).toBe(true);
      expect(res.data).toEqual({ total: 5, likes: 10 });
    });

    test('returns success=false on non-200 or error', async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: { code: 404, message: 'no' },
      });
      const res1 = await commentService.getCommentStatistics('chX');
      expect(res1.success).toBe(false);
      expect(res1.error).toMatch(/no|Failed to fetch comment statistics/i);

      axiosInstance.get.mockRejectedValueOnce(new Error('err'));
      const res2 = await commentService.getCommentStatistics('chY');
      expect(res2.success).toBe(false);
      expect(res2.error).toMatch(/err|Failed to fetch comment statistics/i);
    });
  });

  describe('deleteCommentAdmin', () => {
    test('returns success on code 200', async () => {
      axiosInstance.delete.mockResolvedValueOnce({
        data: { code: 200, message: 'deleted' },
      });
      const res = await commentService.deleteCommentAdmin('cA');
      expect(axiosInstance.delete).toHaveBeenCalledWith('/comments/admin/cA');
      expect(res.success).toBe(true);
      expect(res.message).toMatch(/deleted/i);
    });

    test('returns success=false on non-200 or error', async () => {
      axiosInstance.delete.mockResolvedValueOnce({
        data: { code: 400, message: 'bad' },
      });
      const res1 = await commentService.deleteCommentAdmin('cB');
      expect(res1.success).toBe(false);
      expect(res1.error).toMatch(/bad|Failed to delete comment/i);

      axiosInstance.delete.mockRejectedValueOnce(new Error('boom'));
      const res2 = await commentService.deleteCommentAdmin('cC');
      expect(res2.success).toBe(false);
      expect(res2.error).toMatch(/boom|Failed to delete comment/i);
    });
  });

  describe('interceptors', () => {
    test('request interceptor attaches Authorization header from localStorage', async () => {
      localStorage.setItem('accessToken', 'tok-xyz');
      const succ = globalThis.__axiosReqSucc_Comment;
      const cfg = await succ({ headers: {} });
      expect(cfg.headers.Authorization).toBe('Bearer tok-xyz');
    });

    test('response interceptor 401 clears tokens and redirects', async () => {
      localStorage.setItem('accessToken', 'a');
      localStorage.setItem('refreshToken', 'r');
      localStorage.setItem('tokenType', 'Bearer');
      localStorage.setItem('expiresIn', '3600');

      const originalLocation = window.location;
      delete window.location;
      // @ts-ignore
      window.location = { href: '' };

      const errHandler = globalThis.__axiosRespErr_Comment;
      await expect(
        errHandler({ response: { status: 401 } })
      ).rejects.toBeDefined();

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('tokenType')).toBeNull();
      expect(localStorage.getItem('expiresIn')).toBeNull();
      expect(window.location.href).toBe('/yushan-admin/login');

      window.location = originalLocation;
    });

    test('response interceptor non-401 rejects without clearing tokens', async () => {
      localStorage.setItem('accessToken', 'keep');
      const errHandler = globalThis.__axiosRespErr_Comment;
      await expect(
        errHandler({ response: { status: 500 } })
      ).rejects.toBeDefined();
      expect(localStorage.getItem('accessToken')).toBe('keep');
    });
  });
});
