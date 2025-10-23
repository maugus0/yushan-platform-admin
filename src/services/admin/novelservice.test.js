// Mock ./api with controllable methods
jest.mock('./api', () => {
  const get = jest.fn();
  const post = jest.fn();
  const delay = jest.fn(() => Promise.resolve());
  return { __esModule: true, default: { get, post, delay } };
});

let novelService;
let api;

describe('novelService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    // re-import service and api to reset internal mockNovels
    // eslint-disable-next-line global-require
    novelService = require('./novelservice').default;
    // eslint-disable-next-line global-require
    api = require('./api').default;
  });

  describe('getAllNovels', () => {
    test('maps params to query string and formats response on code 200', async () => {
      api.get.mockResolvedValueOnce({
        data: {
          code: 200,
          data: {
            content: [{ id: 10, title: 'A' }],
            totalElements: 1,
            currentPage: 0,
            size: 10,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false,
          },
        },
      });

      const res = await novelService.getAllNovels({
        page: 1,
        size: 10,
        sort: 'createTime',
        order: 'desc',
        category: 'Fantasy',
        status: 'published',
        search: 'dragon',
        authorName: 'Alice',
        authorId: '7',
      });

      const [url] = api.get.mock.calls[0];
      expect(url.startsWith('/novels/admin/all?')).toBe(true);
      const qs = new URLSearchParams(url.split('?')[1]);
      expect(qs.get('page')).toBe('1');
      expect(qs.get('size')).toBe('10');
      expect(qs.get('sort')).toBe('createTime');
      expect(qs.get('order')).toBe('desc');
      expect(qs.get('category')).toBe('Fantasy');
      expect(qs.get('status')).toBe('published');
      expect(qs.get('search')).toBe('dragon');
      expect(qs.get('authorName')).toBe('Alice');
      expect(qs.get('authorId')).toBe('7');

      expect(res.success).toBe(true);
      expect(res.data).toHaveLength(1);
      expect(res.total).toBe(1);
      expect(res.page).toBe(1);
      expect(res.pageSize).toBe(10);
      expect(res.totalPages).toBe(1);
    });

    test('throws on non-200 code', async () => {
      api.get.mockResolvedValueOnce({ data: { code: 500, message: 'fail' } });
      await expect(novelService.getAllNovels({})).rejects.toThrow(
        /Failed to fetch novels/i
      );
    });

    test('throws on network error', async () => {
      api.get.mockRejectedValueOnce(new Error('net'));
      await expect(novelService.getAllNovels({})).rejects.toThrow(
        /Failed to fetch novels/i
      );
    });
  });

  describe('getNovelById', () => {
    test('returns success for existing id', async () => {
      const res = await novelService.getNovelById(1);
      expect(res.success).toBe(true);
      expect(res.data).toHaveProperty('id', 1);
      expect(res.data).toHaveProperty('title');
    });

    test('throws for non-existing id', async () => {
      await expect(novelService.getNovelById(999999)).rejects.toThrow(
        /Novel not found/i
      );
    });
  });

  describe('create/update/delete novel', () => {
    test('creates then updates (sets publishedAt), then deletes', async () => {
      const created = await novelService.createNovel({
        title: 'New Book',
        status: 'draft',
        authorId: 321,
      });
      expect(created.success).toBe(true);
      expect(created.data.id).toBeDefined();
      expect(created.data.slug).toMatch(/new-book/);
      expect(created.data.publishedAt).toBeNull();

      const updated = await novelService.updateNovel(created.data.id, {
        title: 'Updated Title',
        status: 'published',
      });
      expect(updated.success).toBe(true);
      expect(updated.data.title).toBe('Updated Title');
      expect(updated.data.status).toBe('published');
      expect(updated.data.publishedAt).toBeTruthy();

      const deleted = await novelService.deleteNovel(created.data.id);
      expect(deleted.success).toBe(true);
      expect(deleted.data.id).toBe(created.data.id);

      await expect(novelService.deleteNovel(created.data.id)).rejects.toThrow(
        /Novel not found/i
      );
    });

    test('update non-existing throws', async () => {
      await expect(
        novelService.updateNovel(99999, { title: 'X' })
      ).rejects.toThrow(/Novel not found/i);
    });
  });

  describe('analytics and stats', () => {
    test('getNovelStats returns daily stats and totals', async () => {
      const base = await novelService.getNovelById(1);
      const stats = await novelService.getNovelStats(base.data.id);
      expect(stats.success).toBe(true);
      expect(stats.data.dailyStats).toHaveLength(30);
      expect(stats.data.totalStats).toHaveProperty('views');
      expect(stats.data.title).toBeTruthy();
    });
  });

  describe('bulk operations and trending', () => {
    test('bulkUpdateNovels updates multiple novels', async () => {
      const a = await novelService.createNovel({ title: 'A' });
      const b = await novelService.createNovel({ title: 'B' });
      const res = await novelService.bulkUpdateNovels([a.data.id, b.data.id], {
        status: 'suspended',
      });
      expect(res.success).toBe(true);
      expect(res.data).toHaveLength(2);
      expect(res.data.every((n) => n.status === 'suspended')).toBe(true);
      expect(res.message).toMatch(/novels updated successfully/i);
    });

    test('getTrendingNovels returns array up to limit', async () => {
      const res = await novelService.getTrendingNovels('7d', 5);
      expect(res.success).toBe(true);
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('feature toggle and author filter', () => {
    test('toggleFeatureNovel flips isFeatured flag', async () => {
      const base = await novelService.getNovelById(1);
      const before = base.data.isFeatured;
      const toggled = await novelService.toggleFeatureNovel(base.data.id);
      expect(toggled.success).toBe(true);
      expect(toggled.data.isFeatured).toBe(!before);
    });

    test('getNovelsByAuthor filters by author and paginates', async () => {
      const created = await novelService.createNovel({
        title: 'ByAuthor',
        authorId: 777,
        status: 'published',
      });
      const page1 = await novelService.getNovelsByAuthor(777, {
        page: 1,
        pageSize: 10,
      });
      expect(page1.success).toBe(true);
      expect(page1.data.find((n) => n.id === created.data.id)).toBeTruthy();

      const filtered = await novelService.getNovelsByAuthor(777, {
        page: 1,
        pageSize: 10,
        status: 'published',
      });
      expect(filtered.total).toBeGreaterThan(0);
      expect(filtered.page).toBe(1);
      expect(filtered.pageSize).toBe(10);
    });
  });

  describe('admin actions (approve/reject/hide/unhide/archive)', () => {
    test('approveNovel success and failure', async () => {
      api.post.mockResolvedValueOnce({
        data: { code: 200, data: { id: 2 }, message: 'ok' },
      });
      const ok = await novelService.approveNovel(2);
      expect(ok.success).toBe(true);
      expect(ok.message).toMatch(/approved|ok/i);

      api.post.mockResolvedValueOnce({ data: { code: 500, message: 'bad' } });
      await expect(novelService.approveNovel(3)).rejects.toThrow(
        /bad|Failed to approve/i
      );
    });

    test('rejectNovel success and failure', async () => {
      api.post.mockResolvedValueOnce({
        data: { code: 200, data: { id: 3 }, message: 'rejected' },
      });
      const ok = await novelService.rejectNovel(3);
      expect(ok.success).toBe(true);
      expect(ok.message).toMatch(/rejected/i);

      api.post.mockResolvedValueOnce({ data: { code: 400, message: 'err' } });
      await expect(novelService.rejectNovel(9)).rejects.toThrow(
        /err|Failed to reject/i
      );
    });

    test('hide/unhide/archive success', async () => {
      api.post.mockResolvedValueOnce({
        data: { code: 200, data: { id: 11 }, message: 'hidden' },
      });
      const h = await novelService.hideNovel(11);
      expect(h.success).toBe(true);
      expect(h.message).toMatch(/hidden/i);

      api.post.mockResolvedValueOnce({
        data: { code: 200, data: { id: 11 }, message: 'unhidden' },
      });
      const u = await novelService.unhideNovel(11);
      expect(u.success).toBe(true);
      expect(u.message).toMatch(/unhidden/i);

      api.post.mockResolvedValueOnce({
        data: { code: 200, data: { id: 12 }, message: 'archived' },
      });
      const a = await novelService.archiveNovel(12);
      expect(a.success).toBe(true);
      expect(a.message).toMatch(/archived/i);
    });

    test('hideNovel failure throws', async () => {
      api.post.mockResolvedValueOnce({ data: { code: 500, message: 'nope' } });
      await expect(novelService.hideNovel(7)).rejects.toThrow(
        /nope|Failed to hide/i
      );
    });
  });
});
