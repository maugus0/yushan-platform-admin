import reportService from './reportservice';

// mock axios instance and expose interceptors on globalThis
jest.mock('axios', () => {
  const instance = {
    get: jest.fn(),
    put: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  // capture handlers
  instance.interceptors.request.use.mockImplementation((succ) => {
    globalThis.__axiosReqSucc_Report = succ;
  });
  instance.interceptors.response.use.mockImplementation((succ, err) => {
    globalThis.__axiosRespErr_Report = err;
  });
  const create = jest.fn(() => instance);
  globalThis.__axiosMockReport = { instance, create };
  return { __esModule: true, default: { create }, create };
});

let axiosInstance;

describe('reportservice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    axiosInstance = globalThis.__axiosMockReport.instance;
    // re-capture handlers each test
    axiosInstance.interceptors.request.use.mockImplementation((succ) => {
      globalThis.__axiosReqSucc_Report = succ;
    });
    axiosInstance.interceptors.response.use.mockImplementation((succ, err) => {
      globalThis.__axiosRespErr_Report = err;
    });
  });

  describe('getAllReports', () => {
    test('maps params and returns formatted data on code 200', async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: {
          code: 200,
          data: {
            content: [
              {
                id: 'rep1',
                uuid: 'ru-1',
                reporterId: 'u1',
                reporterUsername: 'alice',
                reportType: 'SPAM',
                reason: 'Spam content',
                status: 'OPEN',
                adminNotes: 'note',
                resolvedBy: null,
                resolvedByUsername: null,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-02T00:00:00Z',
                contentType: 'NOVEL',
                contentId: 'n1',
                novelId: 'n1',
                novelTitle: 'Novel A',
                commentId: null,
                commentContent: null,
              },
            ],
            totalElements: 1,
            totalPages: 1,
            currentPage: 0,
            size: 10,
          },
        },
      });

      const res = await reportService.getAllReports({
        page: 0,
        pageSize: 10,
        sort: 'createdAt',
        order: 'desc',
        status: 'OPEN',
      });

      const [url, cfg] = axiosInstance.get.mock.calls[0];
      expect(url).toBe('/reports/admin');
      expect(cfg.params).toEqual(
        expect.objectContaining({
          page: 0,
          size: 10,
          sort: 'createdAt',
          order: 'desc',
          status: 'OPEN',
        })
      );

      expect(res.success).toBe(true);
      expect(res.total).toBe(1);
      expect(res.data).toHaveLength(1);
      expect(res.data[0]).toEqual(
        expect.objectContaining({
          id: 'rep1',
          uuid: 'ru-1',
          reporterUsername: 'alice',
          status: 'OPEN',
          novelTitle: 'Novel A',
          createdAt: '2024-01-01T00:00:00Z',
        })
      );
    });

    test('returns success=false when code != 200', async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: { code: 500, message: 'fail' },
      });
      const res = await reportService.getAllReports({});
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/fail|Failed to fetch reports/i);
      expect(res.data).toEqual([]);
      expect(res.total).toBe(0);
    });

    test('returns success=false on network error', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('net'));
      const res = await reportService.getAllReports({});
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/net|Failed to fetch reports/i);
      expect(res.data).toEqual([]);
    });
  });

  describe('getReportById', () => {
    test('returns formatted data on code 200', async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: {
          code: 200,
          data: {
            id: 'rep2',
            uuid: 'ru-2',
            reporterId: 'u2',
            reporterUsername: 'bob',
            reportType: 'ABUSE',
            reason: 'Bad words',
            status: 'OPEN',
            adminNotes: '',
            resolvedBy: null,
            resolvedByUsername: null,
            createdAt: '2024-02-01T00:00:00Z',
            updatedAt: '2024-02-02T00:00:00Z',
            contentType: 'COMMENT',
            contentId: 'c1',
            novelId: 'n2',
            novelTitle: 'Novel B',
            commentId: 'c1',
            commentContent: 'text',
          },
        },
      });

      const res = await reportService.getReportById('rep2');
      expect(axiosInstance.get).toHaveBeenCalledWith('/reports/admin/rep2');
      expect(res.success).toBe(true);
      expect(res.data).toEqual(
        expect.objectContaining({
          id: 'rep2',
          reporterUsername: 'bob',
          contentType: 'COMMENT',
          commentId: 'c1',
        })
      );
    });

    test('returns success=false when code != 200', async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: { code: 404, message: 'not found' },
      });
      const res = await reportService.getReportById('missing');
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/not found|Failed to fetch report/i);
    });

    test('returns success=false on network error', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('boom'));
      const res = await reportService.getReportById('repX');
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/boom|Failed to fetch report/i);
    });
  });

  describe('resolveReport', () => {
    test('returns success and message on code 200', async () => {
      axiosInstance.put.mockResolvedValueOnce({
        data: {
          code: 200,
          message: 'resolved',
          data: {
            id: 'rep3',
            uuid: 'ru-3',
            status: 'RESOLVED',
            resolvedBy: 'admin1',
            resolvedByUsername: 'admin',
          },
        },
      });

      const res = await reportService.resolveReport('rep3', 'dismiss', 'ok');
      expect(axiosInstance.put).toHaveBeenCalledWith(
        '/reports/admin/rep3/resolve',
        { action: 'dismiss', adminNotes: 'ok' }
      );
      expect(res.success).toBe(true);
      expect(res.message).toMatch(/resolved|successfully/i);
      expect(res.data.status).toBe('RESOLVED');
    });

    test('returns success=false when code != 200', async () => {
      axiosInstance.put.mockResolvedValueOnce({
        data: { code: 400, message: 'bad' },
      });
      const res = await reportService.resolveReport('rep4', 'dismiss', '');
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/bad|Failed to resolve report/i);
    });

    test('returns success=false on network error', async () => {
      axiosInstance.put.mockRejectedValueOnce(new Error('net'));
      const res = await reportService.resolveReport('rep5', 'ban', 'notes');
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/net|Failed to resolve report/i);
    });
  });

  describe('interceptors', () => {
    test('request interceptor attaches Authorization header from localStorage', async () => {
      localStorage.setItem('accessToken', 'tok-xyz');
      const succ = globalThis.__axiosReqSucc_Report;
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

      const errHandler = globalThis.__axiosRespErr_Report;
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
      const errHandler = globalThis.__axiosRespErr_Report;
      await expect(
        errHandler({ response: { status: 500 } })
      ).rejects.toBeDefined();
      expect(localStorage.getItem('accessToken')).toBe('keep');
    });
  });
});
