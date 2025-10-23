// Mock api client and error logger
jest.mock('./api', () => {
  const get = jest.fn();
  const post = jest.fn();
  const put = jest.fn();
  const del = jest.fn();
  const delay = jest.fn(() => Promise.resolve());
  return { __esModule: true, default: { get, post, put, delete: del, delay } };
});
jest.mock('../../utils/admin/errorReporting', () => ({
  logApiError: jest.fn(),
}));

import categoryService from './categoryservice';

const api = require('./api').default;
const { logApiError } = require('../../utils/admin/errorReporting');

describe('categoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCategories', () => {
    test('returns categories and total on code 200 (includeInactive true -> /categories)', async () => {
      api.get.mockResolvedValueOnce({
        data: {
          code: 200,
          data: { categories: [{ id: 1 }], totalCount: 1 },
          message: 'ok',
        },
      });

      const res = await categoryService.getAllCategories({
        includeInactive: true,
      });
      expect(api.get).toHaveBeenCalledWith('/categories');
      expect(res.success).toBe(true);
      expect(res.data).toEqual([{ id: 1 }]);
      expect(res.total).toBe(1);
    });

    test('uses /categories/active when includeInactive is false', async () => {
      api.get.mockResolvedValueOnce({
        data: { code: 200, data: { categories: [], totalCount: 0 } },
      });

      await categoryService.getAllCategories({ includeInactive: false });
      expect(api.get).toHaveBeenCalledWith('/categories/active');
    });

    test('throws on non-200 code and logs error', async () => {
      api.get.mockResolvedValueOnce({ data: { code: 500, message: 'fail' } });
      await expect(categoryService.getAllCategories({})).rejects.toThrow(
        /fail|Failed to fetch categories/i
      );
      expect(logApiError).toHaveBeenCalled();
    });

    test('throws on network error with message', async () => {
      api.get.mockRejectedValueOnce(new Error('net'));
      await expect(categoryService.getAllCategories({})).rejects.toThrow(
        /net/i
      );
    });
  });

  describe('getCategoryById', () => {
    test('returns category on code 200', async () => {
      api.get.mockResolvedValueOnce({
        data: { code: 200, data: { id: 9 }, message: 'ok' },
      });
      const res = await categoryService.getCategoryById(9);
      expect(api.get).toHaveBeenCalledWith('/categories/9');
      expect(res.success).toBe(true);
      expect(res.data.id).toBe(9);
    });

    test('throws on non-200 code', async () => {
      api.get.mockResolvedValueOnce({
        data: { code: 404, message: 'not found' },
      });
      await expect(categoryService.getCategoryById(999)).rejects.toThrow(
        /not found|Failed to fetch category/i
      );
      expect(logApiError).toHaveBeenCalled();
    });

    test('throws on network error', async () => {
      api.get.mockRejectedValueOnce(new Error('boom'));
      await expect(categoryService.getCategoryById(1)).rejects.toThrow(/boom/i);
      expect(logApiError).toHaveBeenCalled();
    });
  });

  describe('createCategory', () => {
    test('succeeds on code 200', async () => {
      api.post.mockResolvedValueOnce({
        data: { code: 200, data: { id: 2 }, message: 'ok' },
      });
      const res = await categoryService.createCategory({ name: 'New' });
      expect(api.post).toHaveBeenCalledWith('/categories', { name: 'New' });
      expect(res.success).toBe(true);
      expect(res.data.id).toBe(2);
    });

    test('succeeds on code 201', async () => {
      api.post.mockResolvedValueOnce({
        data: { code: 201, data: { id: 3 }, message: 'created' },
      });
      const res = await categoryService.createCategory({ name: 'Created' });
      expect(res.success).toBe(true);
      expect(res.data.id).toBe(3);
    });

    test('throws on non-200/201', async () => {
      api.post.mockResolvedValueOnce({ data: { code: 400, message: 'bad' } });
      await expect(categoryService.createCategory({})).rejects.toThrow(
        /bad|Failed to create category/i
      );
      expect(logApiError).toHaveBeenCalled();
    });

    test('throws on network error', async () => {
      api.post.mockRejectedValueOnce(new Error('err'));
      await expect(categoryService.createCategory({})).rejects.toThrow(/err/i);
      expect(logApiError).toHaveBeenCalled();
    });
  });

  describe('updateCategory', () => {
    test('returns updated category on code 200', async () => {
      api.put.mockResolvedValueOnce({
        data: { code: 200, data: { id: 5, name: 'U' } },
      });
      const res = await categoryService.updateCategory(5, { name: 'U' });
      expect(api.put).toHaveBeenCalledWith('/categories/5', { name: 'U' });
      expect(res.success).toBe(true);
      expect(res.data.name).toBe('U');
    });

    test('throws on non-200', async () => {
      api.put.mockResolvedValueOnce({ data: { code: 500, message: 'fail' } });
      await expect(categoryService.updateCategory(5, {})).rejects.toThrow(
        /fail|Failed to update category/i
      );
      expect(logApiError).toHaveBeenCalled();
    });

    test('throws on network error', async () => {
      api.put.mockRejectedValueOnce(new Error('boom'));
      await expect(categoryService.updateCategory(5, {})).rejects.toThrow(
        /boom/i
      );
      expect(logApiError).toHaveBeenCalled();
    });
  });

  describe('deleteCategory', () => {
    test('soft delete calls /categories/:id and succeeds', async () => {
      api.delete.mockResolvedValueOnce({
        data: { code: 200, message: 'deleted' },
      });
      const res = await categoryService.deleteCategory(7, false);
      expect(api.delete).toHaveBeenCalledWith('/categories/7');
      expect(res.success).toBe(true);
      expect(res.message).toMatch(/deleted/i);
    });

    test('hard delete calls /categories/:id/hard', async () => {
      api.delete.mockResolvedValueOnce({
        data: { code: 200, message: 'hard deleted' },
      });
      const res = await categoryService.deleteCategory(8, true);
      expect(api.delete).toHaveBeenCalledWith('/categories/8/hard');
      expect(res.success).toBe(true);
    });

    test('throws on non-200', async () => {
      api.delete.mockResolvedValueOnce({ data: { code: 400, message: 'bad' } });
      await expect(categoryService.deleteCategory(9)).rejects.toThrow(
        /bad|Failed to delete category/i
      );
      expect(logApiError).toHaveBeenCalled();
    });
  });

  describe('getActiveCategories', () => {
    test('returns active categories on code 200', async () => {
      api.get.mockResolvedValueOnce({
        data: {
          code: 200,
          data: { categories: [{ id: 1 }], totalCount: 1 },
          message: 'ok',
        },
      });
      const res = await categoryService.getActiveCategories();
      expect(api.get).toHaveBeenCalledWith('/categories/active');
      expect(res.success).toBe(true);
      expect(res.data).toEqual([{ id: 1 }]);
    });

    test('throws on non-200', async () => {
      api.get.mockResolvedValueOnce({ data: { code: 500, message: 'x' } });
      await expect(categoryService.getActiveCategories()).rejects.toThrow(
        /x|Failed to fetch active categories/i
      );
      expect(logApiError).toHaveBeenCalled();
    });
  });

  describe('getCategoryBySlug', () => {
    test('returns category on code 200', async () => {
      api.get.mockResolvedValueOnce({
        data: { code: 200, data: { slug: 'fantasy' } },
      });
      const res = await categoryService.getCategoryBySlug('fantasy');
      expect(api.get).toHaveBeenCalledWith('/categories/slug/fantasy');
      expect(res.success).toBe(true);
      expect(res.data.slug).toBe('fantasy');
    });

    test('throws on non-200', async () => {
      api.get.mockResolvedValueOnce({ data: { code: 404, message: 'no' } });
      await expect(
        categoryService.getCategoryBySlug('missing')
      ).rejects.toThrow(/no|Failed to fetch category by slug/i);
      expect(logApiError).toHaveBeenCalled();
    });
  });

  describe('toggleCategoryStatus', () => {
    test('returns success on code 200', async () => {
      api.put.mockResolvedValueOnce({
        data: { code: 200, data: { id: 3, isActive: false } },
      });
      const res = await categoryService.toggleCategoryStatus(3, false);
      expect(api.put).toHaveBeenCalledWith('/categories/3', {
        isActive: false,
      });
      expect(res.success).toBe(true);
      expect(res.data.isActive).toBe(false);
    });

    test('throws on non-200', async () => {
      api.put.mockResolvedValueOnce({ data: { code: 500, message: 'fail' } });
      await expect(
        categoryService.toggleCategoryStatus(3, true)
      ).rejects.toThrow(/fail|Failed to toggle category status/i);
      expect(logApiError).toHaveBeenCalled();
    });
  });

  describe('getCategoryNovelCount', () => {
    test('returns count from novels endpoint (code 200)', async () => {
      api.get.mockResolvedValueOnce({
        data: { code: 200, data: { totalElements: 42 } },
      });
      const res = await categoryService.getCategoryNovelCount(11);
      expect(api.get).toHaveBeenCalledWith('/novels', {
        params: { page: 0, size: 1, category: 11, status: 'published' },
      });
      expect(res.success).toBe(true);
      expect(res.count).toBe(42);
    });

    test('returns {success:false, count:0} on network error (no throw)', async () => {
      api.get.mockRejectedValueOnce(new Error('net'));
      const res = await categoryService.getCategoryNovelCount(12);
      expect(res.success).toBe(false);
      expect(res.count).toBe(0);
      expect(logApiError).toHaveBeenCalled();
    });
  });

  describe('getCategoryNovelCounts', () => {
    test('aggregates counts for multiple categories', async () => {
      const spy = jest
        .spyOn(categoryService, 'getCategoryNovelCount')
        .mockResolvedValueOnce({ success: true, count: 5 })
        .mockResolvedValueOnce({ success: true, count: 0 })
        .mockResolvedValueOnce({ success: true, count: 9 });

      const res = await categoryService.getCategoryNovelCounts([1, 2, 3]);
      expect(res.success).toBe(true);
      expect(res.counts).toEqual({ 1: 5, 2: 0, 3: 9 });
      spy.mockRestore();
    });

    test('returns {success:false, counts:{}} if a request rejects (Promise.all catch)', async () => {
      const spy = jest
        .spyOn(categoryService, 'getCategoryNovelCount')
        .mockResolvedValueOnce({ success: true, count: 5 })
        .mockRejectedValueOnce(new Error('boom'))
        .mockResolvedValueOnce({ success: true, count: 1 });

      const res = await categoryService.getCategoryNovelCounts([1, 2, 3]);
      expect(res.success).toBe(false);
      expect(res.counts).toEqual({});
      spy.mockRestore();
    });
  });
});
