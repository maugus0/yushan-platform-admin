import analyticsService, {
  formatChartData,
  calculateGrowth,
  getPeriodDisplayText,
} from './analyticsservice';

describe('Analytics Service - Pure Functions', () => {
  describe('formatChartData', () => {
    test('should format valid data array correctly', () => {
      const input = [
        { date: '2024-01-01', count: 100 },
        { timestamp: '2024-01-02', value: 200 },
      ];

      const result = formatChartData(input);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('date', '2024-01-01');
      expect(result[0]).toHaveProperty('value', 100);
      expect(result[1]).toHaveProperty('date', '2024-01-02');
      expect(result[1]).toHaveProperty('value', 200);
    });

    test('should return empty array for null input', () => {
      const result = formatChartData(null);
      expect(result).toEqual([]);
    });

    test('should return empty array for undefined input', () => {
      const result = formatChartData(undefined);
      expect(result).toEqual([]);
    });

    test('should return empty array for non-array input', () => {
      const result = formatChartData('not an array');
      expect(result).toEqual([]);
    });

    test('should handle objects with no date field', () => {
      const input = [{ count: 100 }];
      const result = formatChartData(input);

      expect(result[0]).toHaveProperty('value', 100);
      expect(result[0].date).toBeUndefined();
    });

    test('should handle objects with no value/count field', () => {
      const input = [{ date: '2024-01-01' }];
      const result = formatChartData(input);

      expect(result[0]).toHaveProperty('date', '2024-01-01');
      expect(result[0]).toHaveProperty('value', 0);
    });

    test('should prioritize timestamp over date', () => {
      const input = [{ date: '2024-01-01', timestamp: '2024-02-01' }];
      const result = formatChartData(input);

      expect(result[0].date).toBe('2024-01-01');
    });

    test('should prioritize count over value', () => {
      const input = [{ count: 100, value: 200 }];
      const result = formatChartData(input);

      expect(result[0].value).toBe(100);
    });
  });

  describe('calculateGrowth', () => {
    test('should calculate positive growth correctly', () => {
      const result = calculateGrowth(150, 100);
      expect(result).toBe('50.00');
    });

    test('should calculate negative growth correctly', () => {
      const result = calculateGrowth(50, 100);
      expect(result).toBe('-50.00');
    });

    test('should calculate zero growth', () => {
      const result = calculateGrowth(100, 100);
      expect(result).toBe('0.00');
    });

    test('should return 100 when previous is 0', () => {
      const result = calculateGrowth(100, 0);
      expect(result).toBe(100);
    });

    test('should return 100 when previous is null', () => {
      const result = calculateGrowth(100, null);
      expect(result).toBe(100);
    });

    test('should return 100 when previous is undefined', () => {
      const result = calculateGrowth(100, undefined);
      expect(result).toBe(100);
    });

    test('should handle decimal current value', () => {
      const result = calculateGrowth(150.5, 100);
      expect(result).toBe('50.50');
    });

    test('should handle decimal previous value', () => {
      const result = calculateGrowth(150, 100.5);
      expect(parseFloat(result) > 49 && parseFloat(result) < 50).toBe(true);
    });

    test('should handle large numbers', () => {
      const result = calculateGrowth(2000000, 1000000);
      expect(result).toBe('100.00');
    });

    test('should handle very small growth', () => {
      const result = calculateGrowth(100.1, 100);
      expect(result).toBe('0.10');
    });
  });

  describe('getPeriodDisplayText', () => {
    test('should return Daily for daily period', () => {
      expect(getPeriodDisplayText('daily')).toBe('Daily');
    });

    test('should return Weekly for weekly period', () => {
      expect(getPeriodDisplayText('weekly')).toBe('Weekly');
    });

    test('should return Monthly for monthly period', () => {
      expect(getPeriodDisplayText('monthly')).toBe('Monthly');
    });

    test('should return original text for unknown period', () => {
      expect(getPeriodDisplayText('yearly')).toBe('yearly');
    });

    test('should return original text for null input', () => {
      expect(getPeriodDisplayText(null)).toBe(null);
    });

    test('should return original text for undefined input', () => {
      expect(getPeriodDisplayText(undefined)).toBeUndefined();
    });

    test('should return original text for empty string', () => {
      expect(getPeriodDisplayText('')).toBe('');
    });

    test('should be case-sensitive', () => {
      expect(getPeriodDisplayText('Daily')).toBe('Daily');
      expect(getPeriodDisplayText('DAILY')).toBe('DAILY');
    });
  });

  describe('analyticsService exports', () => {
    test('should export default object with methods', () => {
      expect(analyticsService).toBeDefined();
      expect(typeof analyticsService).toBe('object');
    });

    test('should export getAnalyticsSummary method', () => {
      expect(analyticsService.getAnalyticsSummary).toBeDefined();
      expect(typeof analyticsService.getAnalyticsSummary).toBe('function');
    });

    test('should export getUserTrends method', () => {
      expect(analyticsService.getUserTrends).toBeDefined();
      expect(typeof analyticsService.getUserTrends).toBe('function');
    });

    test('should export getPlatformDAU method', () => {
      expect(analyticsService.getPlatformDAU).toBeDefined();
      expect(typeof analyticsService.getPlatformDAU).toBe('function');
    });

    test('should export formatChartData method', () => {
      expect(analyticsService.formatChartData).toBeDefined();
      expect(typeof analyticsService.formatChartData).toBe('function');
    });

    test('should export calculateGrowth method', () => {
      expect(analyticsService.calculateGrowth).toBeDefined();
      expect(typeof analyticsService.calculateGrowth).toBe('function');
    });

    test('should export getPeriodDisplayText method', () => {
      expect(analyticsService.getPeriodDisplayText).toBeDefined();
      expect(typeof analyticsService.getPeriodDisplayText).toBe('function');
    });
  });

  describe('Data transformation consistency', () => {
    test('formatChartData should maintain original object properties', () => {
      const input = [{ date: '2024-01-01', count: 100, extra: 'data' }];
      const result = formatChartData(input);

      expect(result[0]).toHaveProperty('extra', 'data');
    });

    test('calculateGrowth output should be a string', () => {
      const result = calculateGrowth(150, 100);
      expect(typeof result).toBe('string');
    });

    test('getPeriodDisplayText should handle all period types', () => {
      const periods = ['daily', 'weekly', 'monthly'];
      const displayTexts = periods.map(getPeriodDisplayText);

      expect(displayTexts).toEqual(['Daily', 'Weekly', 'Monthly']);
    });
  });

  describe('Analytics Service - API calls (axios instance)', () => {
    let axiosInstance;
    let mod; // re-imported analyticsservice module with mocked axios

    const setupAxiosMockAndImport = () => {
      jest.resetModules();
      jest.isolateModules(() => {
        jest.doMock('axios', () => {
          const instance = {
            get: jest.fn(),
            interceptors: {
              request: { use: jest.fn() },
              response: { use: jest.fn() },
            },
          };
          instance.interceptors.request.use.mockImplementation((succ) => {
            globalThis.__axiosReqSucc_Analytics = succ;
          });
          instance.interceptors.response.use.mockImplementation((succ, err) => {
            globalThis.__axiosRespSucc_Analytics = succ;
            globalThis.__axiosRespErr_Analytics = err;
          });
          const create = jest.fn(() => instance);
          globalThis.__axiosMockAnalytics = { instance, create };
          return { __esModule: true, default: { create }, create };
        });
        // re-require after mocking axios
        // eslint-disable-next-line global-require
        mod = require('./analyticsservice');
      });
      axiosInstance = globalThis.__axiosMockAnalytics.instance;
    };

    beforeEach(() => {
      jest.clearAllMocks();
      localStorage.clear();
      setupAxiosMockAndImport();
    });

    describe('getAnalyticsSummary', () => {
      test('returns success on code 200 and forwards period param', async () => {
        axiosInstance.get.mockResolvedValueOnce({
          data: { code: 200, data: { a: 1 }, timestamp: 't' },
        });
        const res = await mod.getAnalyticsSummary('weekly');
        expect(res.success).toBe(true);
        expect(res.data).toEqual({ a: 1 });
        const [url, cfg] = axiosInstance.get.mock.calls[0];
        expect(url).toBe('/admin/analytics/summary');
        expect(cfg.params).toEqual({ period: 'weekly' });
      });

      test('returns success=false with error message on non-200', async () => {
        axiosInstance.get.mockResolvedValueOnce({
          data: { code: 400, message: 'bad' },
        });
        const res = await mod.getAnalyticsSummary('daily');
        expect(res.success).toBe(false);
        expect(res.error).toMatch(/bad|Failed to fetch analytics summary/i);
      });

      test('returns success=false on network error', async () => {
        axiosInstance.get.mockRejectedValueOnce(new Error('net'));
        const res = await mod.getAnalyticsSummary();
        expect(res.success).toBe(false);
        expect(res.error).toMatch(/net|Failed to fetch analytics summary/i);
      });
    });

    describe('getUserTrends', () => {
      test('returns success and forwards params', async () => {
        axiosInstance.get.mockResolvedValueOnce({
          data: { code: 200, data: [{ x: 1 }], timestamp: 't' },
        });
        const res = await mod.getUserTrends({
          period: 'monthly',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        });
        expect(res.success).toBe(true);
        expect(res.data).toEqual([{ x: 1 }]);
        const [url, cfg] = axiosInstance.get.mock.calls[0];
        expect(url).toBe('/admin/analytics/users/trends');
        expect(cfg.params).toEqual({
          period: 'monthly',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        });
      });

      test('returns success=false on non-200', async () => {
        axiosInstance.get.mockResolvedValueOnce({
          data: { code: 500, message: 'fail' },
        });
        const res = await mod.getUserTrends();
        expect(res.success).toBe(false);
        expect(res.error).toMatch(/fail|Failed to fetch user trends/i);
      });

      test('returns success=false on network error', async () => {
        axiosInstance.get.mockRejectedValueOnce(new Error('boom'));
        const res = await mod.getUserTrends();
        expect(res.success).toBe(false);
        expect(res.error).toMatch(/boom|Failed to fetch user trends/i);
      });
    });

    describe('getPlatformDAU', () => {
      test('returns success and forwards date param', async () => {
        axiosInstance.get.mockResolvedValueOnce({
          data: { code: 200, data: { dau: [] } },
        });
        const res = await mod.getPlatformDAU('2024-03-01');
        expect(res.success).toBe(true);
        const [url, cfg] = axiosInstance.get.mock.calls[0];
        expect(url).toBe('/admin/analytics/platform/dau');
        expect(cfg.params).toEqual({ date: '2024-03-01' });
      });

      test('returns success=false on non-200', async () => {
        axiosInstance.get.mockResolvedValueOnce({
          data: { code: 400, message: 'no' },
        });
        const res = await mod.getPlatformDAU();
        expect(res.success).toBe(false);
        expect(res.error).toMatch(/no|Failed to fetch DAU data/i);
      });

      test('returns success=false on network error', async () => {
        axiosInstance.get.mockRejectedValueOnce(new Error('err'));
        const res = await mod.getPlatformDAU();
        expect(res.success).toBe(false);
        expect(res.error).toMatch(/err|Failed to fetch DAU data/i);
      });
    });

    describe('interceptors', () => {
      test('request interceptor attaches Authorization header from localStorage', async () => {
        localStorage.setItem('accessToken', 'tok-xyz');
        const succ = globalThis.__axiosReqSucc_Analytics;
        const cfg = await succ({ headers: {} });
        expect(cfg.headers.Authorization).toBe('Bearer tok-xyz');
      });

      test('response interceptor 401 clears tokens and redirects to /admin/login', async () => {
        localStorage.setItem('accessToken', 'a');
        localStorage.setItem('refreshToken', 'r');
        localStorage.setItem('tokenType', 'Bearer');
        localStorage.setItem('expiresIn', '3600');

        const originalLocation = window.location;
        // @ts-ignore
        delete window.location;
        // @ts-ignore
        window.location = { href: '' };

        const errHandler = globalThis.__axiosRespErr_Analytics;
        await expect(
          errHandler({ response: { status: 401 } })
        ).rejects.toBeDefined();

        expect(localStorage.getItem('accessToken')).toBeNull();
        expect(localStorage.getItem('refreshToken')).toBeNull();
        expect(localStorage.getItem('tokenType')).toBeNull();
        expect(localStorage.getItem('expiresIn')).toBeNull();
        expect(window.location.href).toBe('/admin/login');

        window.location = originalLocation;
      });

      test('response interceptor non-401 rejects and does not clear tokens', async () => {
        localStorage.setItem('accessToken', 'keep');
        const errHandler = globalThis.__axiosRespErr_Analytics;
        await expect(
          errHandler({ response: { status: 500 } })
        ).rejects.toBeDefined();
        expect(localStorage.getItem('accessToken')).toBe('keep');
      });
    });
  });
});
