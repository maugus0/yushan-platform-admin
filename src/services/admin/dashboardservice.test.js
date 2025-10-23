jest.mock('axios');
// Mock ./api with controllable get()
jest.mock('./api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

import dashboardService from './dashboardservice';

const api = require('./api').default;

describe('dashboardService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    test('returns mapped stats on code 200', async () => {
      const payload = {
        totalUsers: 100,
        newUsersToday: 5,
        activeUsers: 80,
        authors: 10,
        admins: 2,
        totalNovels: 50,
        publishedNovels: 40,
        completedNovels: 20,
        totalChapters: 500,
        totalWords: 1000000,
        totalViews: 200000,
        totalComments: 3000,
        totalReviews: 800,
        totalVotes: 1200,
        averageRating: 4.2,
        userGrowthRate: 3.1,
        contentGrowthRate: 2.4,
        engagementGrowthRate: 5.6,
        dailyActiveUsers: 70,
        weeklyActiveUsers: 200,
        monthlyActiveUsers: 500,
        timestamp: '2025-01-01T00:00:00Z',
      };
      api.get.mockResolvedValueOnce({ data: { code: 200, data: payload } });

      const res = await dashboardService.getDashboardStats();
      expect(res.success).toBe(true);
      expect(res.data.totalUsers).toBe(100);
      expect(res.data.totalNovels).toBe(50);
      expect(res.data.totalViews).toBe(200000);
      expect(res.data.lastUpdated).toBe(payload.timestamp);

      const [url] = api.get.mock.calls[0];
      expect(url).toEqual(
        expect.stringContaining('/admin/analytics/platform/overview')
      );
    });

    test('throws on non-200 code', async () => {
      api.get.mockResolvedValueOnce({ data: { code: 500, message: 'fail' } });
      await expect(dashboardService.getDashboardStats()).rejects.toThrow(
        /fail|Failed to fetch dashboard statistics/i
      );
    });

    test('throws on network error', async () => {
      api.get.mockRejectedValueOnce(new Error('net'));
      await expect(dashboardService.getDashboardStats()).rejects.toThrow(
        /net|Failed to fetch dashboard statistics/i
      );
    });
  });

  describe('getRecentActivity', () => {
    test('returns empty array (placeholder implementation)', async () => {
      const res = await dashboardService.getRecentActivity();
      expect(res.success).toBe(true);
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data).toHaveLength(0);
      expect(api.get).not.toHaveBeenCalled();
    });
  });

  describe('getAnalyticsSummary', () => {
    test('returns data on code 200 and forwards period param', async () => {
      api.get.mockResolvedValueOnce({ data: { code: 200, data: { a: 1 } } });
      const res = await dashboardService.getAnalyticsSummary('weekly');
      expect(res.success).toBe(true);
      expect(res.data).toEqual({ a: 1 });

      const [url, cfg] = api.get.mock.calls[0];
      expect(url).toEqual(expect.stringContaining('/admin/analytics/summary'));
      expect(cfg.params).toEqual({ period: 'weekly' });
    });

    test('throws on non-200 code', async () => {
      api.get.mockResolvedValueOnce({ data: { code: 400, message: 'bad' } });
      await expect(
        dashboardService.getAnalyticsSummary('daily')
      ).rejects.toThrow(/bad|Failed to fetch analytics summary/i);
    });
  });

  describe('getUserTrends', () => {
    test('returns data and forwards params', async () => {
      api.get.mockResolvedValueOnce({ data: { code: 200, data: [1, 2] } });
      const res = await dashboardService.getUserTrends(
        'monthly',
        '2024-01-01',
        '2024-01-31'
      );
      expect(res.success).toBe(true);
      expect(res.data).toEqual([1, 2]);

      const [url, cfg] = api.get.mock.calls[0];
      expect(url).toEqual(
        expect.stringContaining('/admin/analytics/users/trends')
      );
      expect(cfg.params).toEqual({
        period: 'monthly',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });
    });

    test('throws on error', async () => {
      api.get.mockResolvedValueOnce({ data: { code: 500, message: 'x' } });
      await expect(dashboardService.getUserTrends()).rejects.toThrow(
        /x|Failed to fetch user trends/i
      );
    });
  });

  describe('getNovelTrends', () => {
    test('returns data and forwards extended params', async () => {
      api.get.mockResolvedValueOnce({ data: { code: 200, data: [{ id: 1 }] } });
      const res = await dashboardService.getNovelTrends(
        'daily',
        '2024-01-01',
        '2024-01-31',
        'cat1',
        'auth9',
        1
      );
      expect(res.success).toBe(true);
      expect(res.data).toEqual([{ id: 1 }]);

      const [url, cfg] = api.get.mock.calls[0];
      expect(url).toEqual(
        expect.stringContaining('/admin/analytics/novels/trends')
      );
      expect(cfg.params).toEqual({
        period: 'daily',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        categoryId: 'cat1',
        authorId: 'auth9',
        status: 1,
      });
    });

    test('throws on non-200 code', async () => {
      api.get.mockResolvedValueOnce({ data: { code: 400, message: 'bad' } });
      await expect(dashboardService.getNovelTrends()).rejects.toThrow(
        /bad|Failed to fetch novel trends/i
      );
    });
  });

  describe('getReadingActivity', () => {
    test('returns data and forwards params', async () => {
      api.get.mockResolvedValueOnce({
        data: { code: 200, data: { hours: [] } },
      });
      const res = await dashboardService.getReadingActivity(
        'weekly',
        '2024-02-01',
        '2024-02-28'
      );
      expect(res.success).toBe(true);
      expect(res.data).toEqual({ hours: [] });

      const [url, cfg] = api.get.mock.calls[0];
      expect(url).toEqual(
        expect.stringContaining('/admin/analytics/reading/activity')
      );
      expect(cfg.params).toEqual({
        period: 'weekly',
        startDate: '2024-02-01',
        endDate: '2024-02-28',
      });
    });

    test('throws on non-200 code', async () => {
      api.get.mockResolvedValueOnce({ data: { code: 500, message: 'err' } });
      await expect(dashboardService.getReadingActivity()).rejects.toThrow(
        /err|Failed to fetch reading activity/i
      );
    });
  });

  describe('getTopContent', () => {
    test('returns data and forwards limit param', async () => {
      api.get.mockResolvedValueOnce({ data: { code: 200, data: ['a'] } });
      const res = await dashboardService.getTopContent(7);
      expect(res.success).toBe(true);
      expect(res.data).toEqual(['a']);

      const [url, cfg] = api.get.mock.calls[0];
      expect(url).toEqual(
        expect.stringContaining('/admin/analytics/platform/top-content')
      );
      expect(cfg.params).toEqual({ limit: 7 });
    });

    test('throws on non-200 code', async () => {
      api.get.mockResolvedValueOnce({ data: { code: 400, message: 'no' } });
      await expect(dashboardService.getTopContent()).rejects.toThrow(
        /no|Failed to fetch top content/i
      );
    });
  });

  describe('getDailyActiveUsers', () => {
    test('default date is set (YYYY-MM-DD)', async () => {
      api.get.mockResolvedValueOnce({ data: { code: 200, data: { dau: [] } } });
      const res = await dashboardService.getDailyActiveUsers();
      expect(res.success).toBe(true);

      const [url, cfg] = api.get.mock.calls[0];
      expect(url).toEqual(
        expect.stringContaining('/admin/analytics/platform/dau')
      );
      expect(cfg.params.date).toEqual(
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/)
      );
    });

    test('forwards provided date param', async () => {
      api.get.mockResolvedValueOnce({ data: { code: 200, data: { dau: [] } } });
      await dashboardService.getDailyActiveUsers('2024-03-01');

      const [, cfg] = api.get.mock.calls[0];
      expect(cfg.params.date).toBe('2024-03-01');
    });

    test('throws on non-200 code', async () => {
      api.get.mockResolvedValueOnce({ data: { code: 500, message: 'bad' } });
      await expect(
        dashboardService.getDailyActiveUsers('2024-03-02')
      ).rejects.toThrow(/bad|Failed to fetch daily active users/i);
    });
  });
});
