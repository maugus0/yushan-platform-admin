// Mock ./api with controllable get()
jest.mock('./api', () => {
  const get = jest.fn();
  return { __esModule: true, default: { get } };
});

import rankingService from './rankingservice';

const api = require('./api').default;

describe('rankingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserRankings', () => {
    test('returns success on 200 and forwards params', async () => {
      api.get.mockResolvedValueOnce({
        data: { code: 200, data: [{ id: 'u1', points: 10 }], message: 'ok' },
      });

      const res = await rankingService.getUserRankings({
        page: 2,
        size: 25,
        timeRange: 'weekly',
        sortBy: 'points',
      });

      expect(api.get).toHaveBeenCalledWith('/ranking/user', {
        params: { page: 2, size: 25, timeRange: 'weekly', sortBy: 'points' },
      });
      expect(res.success).toBe(true);
      expect(res.data).toEqual([{ id: 'u1', points: 10 }]);
      expect(res.message).toBe('ok');
    });

    test('throws when code != 200', async () => {
      api.get.mockResolvedValueOnce({
        data: { code: 500, message: 'fail users' },
      });
      await expect(rankingService.getUserRankings({})).rejects.toThrow(
        /fail users|Failed to fetch user rankings/i
      );
    });

    test('throws on network error', async () => {
      api.get.mockRejectedValueOnce(new Error('net'));
      await expect(rankingService.getUserRankings({})).rejects.toThrow(/net/i);
    });
  });

  describe('getNovelRankings', () => {
    test('returns success on 200 and forwards params', async () => {
      api.get.mockResolvedValueOnce({
        data: {
          code: 200,
          data: [{ id: 'n1', votes: 100 }],
          message: 'ok',
        },
      });

      const res = await rankingService.getNovelRankings({
        page: 1,
        size: 50,
        sortType: 'vote',
        timeRange: 'monthly',
      });

      expect(api.get).toHaveBeenCalledWith('/ranking/novel', {
        params: { page: 1, size: 50, sortType: 'vote', timeRange: 'monthly' },
      });
      expect(res.success).toBe(true);
      expect(res.data).toEqual([{ id: 'n1', votes: 100 }]);
    });

    test('throws when code != 200', async () => {
      api.get.mockResolvedValueOnce({
        data: { code: 400, message: 'bad novels' },
      });
      await expect(rankingService.getNovelRankings({})).rejects.toThrow(
        /bad novels|Failed to fetch novel rankings/i
      );
    });

    test('throws on network error', async () => {
      api.get.mockRejectedValueOnce(new Error('boom'));
      await expect(rankingService.getNovelRankings({})).rejects.toThrow(
        /boom/i
      );
    });
  });

  describe('getAuthorRankings', () => {
    test('returns success on 200 and forwards params', async () => {
      api.get.mockResolvedValueOnce({
        data: {
          code: 200,
          data: [{ id: 'a1', votes: 77 }],
          message: 'ok',
        },
      });

      const res = await rankingService.getAuthorRankings({
        page: 3,
        size: 10,
        sortType: 'vote',
        timeRange: 'overall',
      });

      expect(api.get).toHaveBeenCalledWith('/ranking/author', {
        params: { page: 3, size: 10, sortType: 'vote', timeRange: 'overall' },
      });
      expect(res.success).toBe(true);
      expect(res.data).toEqual([{ id: 'a1', votes: 77 }]);
    });

    test('throws when code != 200', async () => {
      api.get.mockResolvedValueOnce({
        data: { code: 500, message: 'fail authors' },
      });
      await expect(rankingService.getAuthorRankings({})).rejects.toThrow(
        /fail authors|Failed to fetch author rankings/i
      );
    });

    test('throws on network error', async () => {
      api.get.mockRejectedValueOnce(new Error('err'));
      await expect(rankingService.getAuthorRankings({})).rejects.toThrow(
        /err/i
      );
    });
  });

  describe('getNovelRank', () => {
    test('returns success and isInTop100 true when data not null', async () => {
      api.get.mockResolvedValueOnce({
        data: { code: 200, data: 42, message: 'ok' },
      });

      const res = await rankingService.getNovelRank('novel-1');
      expect(api.get).toHaveBeenCalledWith('/ranking/novel/novel-1/rank');
      expect(res.success).toBe(true);
      expect(res.data).toBe(42);
      expect(res.isInTop100).toBe(true);
    });

    test('returns isInTop100 false when data is null', async () => {
      api.get.mockResolvedValueOnce({
        data: { code: 200, data: null, message: 'ok' },
      });

      const res = await rankingService.getNovelRank('novel-2');
      expect(res.success).toBe(true);
      expect(res.isInTop100).toBe(false);
    });

    test('throws when code != 200', async () => {
      api.get.mockResolvedValueOnce({
        data: { code: 404, message: 'not found' },
      });
      await expect(rankingService.getNovelRank('missing')).rejects.toThrow(
        /not found|Failed to fetch novel rank/i
      );
    });

    test('throws on network error', async () => {
      api.get.mockRejectedValueOnce(new Error('net'));
      await expect(rankingService.getNovelRank('id')).rejects.toThrow(/net/i);
    });
  });

  describe('getAllRankings', () => {
    test('dispatches to users', async () => {
      api.get.mockResolvedValueOnce({
        data: { code: 200, data: [{ id: 'u1' }], message: 'ok' },
      });
      const res = await rankingService.getAllRankings({
        type: 'users',
        page: 5,
      });
      expect(api.get).toHaveBeenCalledWith('/ranking/user', {
        params: expect.objectContaining({ page: 5 }),
      });
      expect(res.success).toBe(true);
    });

    test('dispatches to novels', async () => {
      api.get.mockResolvedValueOnce({
        data: { code: 200, data: [{ id: 'n1' }], message: 'ok' },
      });
      const res = await rankingService.getAllRankings({
        type: 'novels',
        sortType: 'vote',
      });
      expect(api.get).toHaveBeenCalledWith('/ranking/novel', {
        params: expect.objectContaining({ sortType: 'vote' }),
      });
      expect(res.success).toBe(true);
    });

    test('dispatches to authors', async () => {
      api.get.mockResolvedValueOnce({
        data: { code: 200, data: [{ id: 'a1' }], message: 'ok' },
      });
      const res = await rankingService.getAllRankings({
        type: 'authors',
        timeRange: 'weekly',
      });
      expect(api.get).toHaveBeenCalledWith('/ranking/author', {
        params: expect.objectContaining({ timeRange: 'weekly' }),
      });
      expect(res.success).toBe(true);
    });

    test('throws on invalid type', async () => {
      await expect(
        rankingService.getAllRankings({ type: 'oops' })
      ).rejects.toThrow(/Invalid ranking type/i);
    });
  });
});
