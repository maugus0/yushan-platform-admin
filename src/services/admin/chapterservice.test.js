import chapterService from './chapterservice';

describe('chapterService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // mock fetch
    globalThis.fetch = jest.fn();
    // token for Authorization header
    localStorage.setItem('accessToken', 'tok-xyz');
  });

  afterEach(() => {
    delete globalThis.fetch;
    localStorage.clear();
  });

  describe('getChaptersByNovel', () => {
    test('maps params, builds URL correctly and formats response (code 200)', async () => {
      const payload = {
        code: 200,
        data: {
          chapters: [
            {
              chapterId: 'ch-1',
              uuid: 'uuid-1',
              chapterNumber: 1,
              title: 'Chapter One',
              contentPreview: 'Once upon a time...',
              wordCnt: 1234,
              isPremium: false,
              yuanCost: 0,
              viewCnt: 456,
              publishTime: '2024-01-01T00:00:00Z',
            },
          ],
          totalCount: 1,
          currentPage: 2,
          pageSize: 5,
          totalPages: 1,
        },
      };
      globalThis.fetch.mockResolvedValueOnce({
        json: async () => payload,
      });

      const res = await chapterService.getChaptersByNovel('nov-1', {
        page: 2,
        pageSize: 5,
        publishedOnly: false,
      });

      expect(res.success).toBe(true);
      expect(res.total).toBe(1);
      expect(res.page).toBe(2);
      expect(res.pageSize).toBe(5);
      expect(res.totalPages).toBe(1);
      expect(res.data[0]).toEqual(
        expect.objectContaining({
          id: 'ch-1',
          uuid: 'uuid-1',
          chapterNumber: 1,
          title: 'Chapter One',
          contentPreview: 'Once upon a time...',
          wordCount: 1234,
          isPremium: false,
          yuanCost: 0,
          views: 456,
          publishedAt: '2024-01-01T00:00:00Z',
        })
      );

      // verify fetch call URL and headers
      const [url, opts] = globalThis.fetch.mock.calls[0];
      expect(url).toBe(
        'https://yushan-backend-staging.up.railway.app/api/chapters/novel/nov-1?page=2&pageSize=5&publishedOnly=false'
      );
      expect(opts.method).toBe('GET');
      expect(opts.headers.accept).toBe('*/*');
      expect(opts.headers.Authorization).toBe('Bearer tok-xyz');
    });

    test('uses default params when not provided', async () => {
      globalThis.fetch.mockResolvedValueOnce({
        json: async () => ({
          code: 200,
          data: {
            chapters: [],
            totalCount: 0,
            currentPage: 1,
            pageSize: 20,
            totalPages: 0,
          },
        }),
      });

      await chapterService.getChaptersByNovel('nov-2');

      const [url] = globalThis.fetch.mock.calls[0];
      expect(url).toBe(
        'https://yushan-backend-staging.up.railway.app/api/chapters/novel/nov-2?page=1&pageSize=20&publishedOnly=true'
      );
    });

    test('throws on non-200 code', async () => {
      globalThis.fetch.mockResolvedValueOnce({
        json: async () => ({ code: 500, message: 'fail' }),
      });
      await expect(
        chapterService.getChaptersByNovel('nov-x', { page: 1 })
      ).rejects.toThrow(/fail|Failed to fetch chapters/i);
    });

    test('throws on network error', async () => {
      globalThis.fetch.mockRejectedValueOnce(new Error('net'));
      await expect(chapterService.getChaptersByNovel('nov-y')).rejects.toThrow(
        /net/i
      );
    });
  });

  describe('deleteChapter', () => {
    test('deletes by UUID and returns success (code 200)', async () => {
      globalThis.fetch.mockResolvedValueOnce({
        json: async () => ({ code: 200, message: 'deleted' }),
      });

      const res = await chapterService.deleteChapter('uuid-9');
      expect(res.success).toBe(true);
      expect(res.message).toMatch(/deleted/i);

      const [url, opts] = globalThis.fetch.mock.calls[0];
      expect(url).toBe(
        'https://yushan-backend-staging.up.railway.app/api/chapters/admin/uuid-9'
      );
      expect(opts.method).toBe('DELETE');
      expect(opts.headers.Authorization).toBe('Bearer tok-xyz');
      expect(opts.headers.accept).toBe('*/*');
    });

    test('throws on non-200 code', async () => {
      globalThis.fetch.mockResolvedValueOnce({
        json: async () => ({ code: 400, message: 'bad' }),
      });
      await expect(chapterService.deleteChapter('uuid-bad')).rejects.toThrow(
        /bad|Failed to delete chapter/i
      );
    });

    test('throws on network error', async () => {
      globalThis.fetch.mockRejectedValueOnce(new Error('boom'));
      await expect(chapterService.deleteChapter('uuid-err')).rejects.toThrow(
        /boom/i
      );
    });
  });

  describe('deleteChaptersByNovel', () => {
    test('deletes all chapters for a novel and returns success (code 200)', async () => {
      globalThis.fetch.mockResolvedValueOnce({
        json: async () => ({ code: 200, message: 'all deleted' }),
      });

      const res = await chapterService.deleteChaptersByNovel('nov-7');
      expect(res.success).toBe(true);
      expect(res.message).toMatch(/deleted/i);

      const [url, opts] = globalThis.fetch.mock.calls[0];
      expect(url).toBe(
        'https://yushan-backend-staging.up.railway.app/api/chapters/admin/novel/nov-7'
      );
      expect(opts.method).toBe('DELETE');
      expect(opts.headers.Authorization).toBe('Bearer tok-xyz');
    });

    test('throws on non-200 code', async () => {
      globalThis.fetch.mockResolvedValueOnce({
        json: async () => ({ code: 500, message: 'server' }),
      });
      await expect(
        chapterService.deleteChaptersByNovel('nov-x')
      ).rejects.toThrow(/server|Failed to delete chapters for novel/i);
    });

    test('throws on network error', async () => {
      globalThis.fetch.mockRejectedValueOnce(new Error('err'));
      await expect(
        chapterService.deleteChaptersByNovel('nov-y')
      ).rejects.toThrow(/err/i);
    });
  });
});
