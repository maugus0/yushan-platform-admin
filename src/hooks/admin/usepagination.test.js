import { renderHook, act } from '@testing-library/react';
import { usePagination } from './usepagination';

describe('usePagination Hook', () => {
  const mockData = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
  }));

  describe('Initial State', () => {
    test('initializes with correct default values', () => {
      const { result } = renderHook(() => usePagination(25, 10, 1));

      expect(result.current.currentPage).toBe(1);
      expect(result.current.pageSize).toBe(10);
      expect(result.current.totalPages).toBe(3);
      expect(result.current.totalItems).toBe(25);
      expect(result.current.canGoNext).toBe(true);
      expect(result.current.canGoPrevious).toBe(false);
    });

    test('initializes with custom values', () => {
      const { result } = renderHook(() => usePagination(100, 20, 2));

      expect(result.current.currentPage).toBe(2);
      expect(result.current.pageSize).toBe(20);
      expect(result.current.totalPages).toBe(5);
      expect(result.current.totalItems).toBe(100);
    });
  });

  describe('Page Navigation', () => {
    test('goes to specific page', () => {
      const { result } = renderHook(() => usePagination(25, 10, 1));

      act(() => {
        result.current.goToPage(2);
      });

      expect(result.current.currentPage).toBe(2);
    });

    test('goes to next page', () => {
      const { result } = renderHook(() => usePagination(25, 10, 1));

      act(() => {
        result.current.goToNextPage();
      });

      expect(result.current.currentPage).toBe(2);
    });

    test('goes to previous page', () => {
      const { result } = renderHook(() => usePagination(25, 10, 2));

      act(() => {
        result.current.goToPreviousPage();
      });

      expect(result.current.currentPage).toBe(1);
    });

    test('goes to first page', () => {
      const { result } = renderHook(() => usePagination(25, 10, 3));

      act(() => {
        result.current.goToFirstPage();
      });

      expect(result.current.currentPage).toBe(1);
    });

    test('goes to last page', () => {
      const { result } = renderHook(() => usePagination(25, 10, 1));

      act(() => {
        result.current.goToLastPage();
      });

      expect(result.current.currentPage).toBe(3);
    });

    test('does not go to invalid page', () => {
      const { result } = renderHook(() => usePagination(25, 10, 1));

      act(() => {
        result.current.goToPage(0); // Invalid
      });

      expect(result.current.currentPage).toBe(1);

      act(() => {
        result.current.goToPage(10); // Invalid
      });

      expect(result.current.currentPage).toBe(1);
    });

    test('does not go beyond boundaries', () => {
      const { result } = renderHook(() => usePagination(25, 10, 3));

      act(() => {
        result.current.goToNextPage();
      });

      expect(result.current.currentPage).toBe(3); // Should not change

      act(() => {
        result.current.goToPreviousPage();
      });

      expect(result.current.currentPage).toBe(2);
    });
  });

  describe('Page Size Changes', () => {
    test('changes page size', () => {
      const { result } = renderHook(() => usePagination(25, 10, 1));

      act(() => {
        result.current.changePageSize(5);
      });

      expect(result.current.pageSize).toBe(5);
      expect(result.current.totalPages).toBe(5);
    });

    test('adjusts current page when page size changes', () => {
      const { result } = renderHook(() => usePagination(25, 10, 3));

      act(() => {
        result.current.changePageSize(20);
      });

      expect(result.current.currentPage).toBe(2); // Adjusted to valid page
    });

    test('handles invalid page size', () => {
      const { result } = renderHook(() => usePagination(25, 10, 1));

      act(() => {
        result.current.changePageSize(0);
      });

      expect(result.current.pageSize).toBe(1); // Should be at least 1
    });
  });

  describe('Page Indices', () => {
    test('calculates correct page indices', () => {
      const { result } = renderHook(() => usePagination(25, 10, 2));

      expect(result.current.pageIndices.startIndex).toBe(10);
      expect(result.current.pageIndices.endIndex).toBe(20);
    });

    test('handles last page correctly', () => {
      const { result } = renderHook(() => usePagination(25, 10, 3));

      expect(result.current.pageIndices.startIndex).toBe(20);
      expect(result.current.pageIndices.endIndex).toBe(25);
    });
  });

  describe('Page Range', () => {
    test('calculates page range for small number of pages', () => {
      const { result } = renderHook(() => usePagination(15, 5, 1));

      expect(result.current.pageRange).toEqual([1, 2, 3]);
    });

    test('calculates page range with ellipsis', () => {
      const { result } = renderHook(() => usePagination(100, 5, 5));

      const pageRange = result.current.pageRange;
      expect(pageRange).toContain(1);
      expect(pageRange).toContain('...');
      expect(pageRange).toContain(20);
    });
  });

  describe('Pagination Info', () => {
    test('provides correct pagination info', () => {
      const { result } = renderHook(() => usePagination(25, 10, 2));

      const info = result.current.getPaginationInfo();

      expect(info).toEqual({
        currentPage: 2,
        totalPages: 3,
        pageSize: 10,
        totalItems: 25,
        startIndex: 11,
        endIndex: 20,
        hasNextPage: true,
        hasPreviousPage: true,
        isFirstPage: false,
        isLastPage: false,
      });
    });

    test('handles empty data', () => {
      const { result } = renderHook(() => usePagination(0, 10, 1));

      const info = result.current.getPaginationInfo();

      expect(info.startIndex).toBe(0);
      expect(info.endIndex).toBe(0);
      expect(info.totalPages).toBe(0);
    });
  });

  describe('Page Data', () => {
    test('returns correct page data', () => {
      const { result } = renderHook(() => usePagination(25, 10, 2));

      const pageData = result.current.getPageData(mockData);

      expect(pageData).toHaveLength(10);
      expect(pageData[0].id).toBe(11);
      expect(pageData[9].id).toBe(20);
    });

    test('handles empty data', () => {
      const { result } = renderHook(() => usePagination(25, 10, 1));

      const pageData = result.current.getPageData([]);

      expect(pageData).toEqual([]);
    });
  });

  describe('Jump Functions', () => {
    test('jumps to page by percentage', () => {
      const { result } = renderHook(() => usePagination(100, 10, 1));

      act(() => {
        result.current.jumpToPercentage(50);
      });

      expect(result.current.currentPage).toBe(5); // 50% of 10 pages
    });

    test('jumps to page by item index', () => {
      const { result } = renderHook(() => usePagination(100, 10, 1));

      act(() => {
        result.current.jumpToItem(25); // Item at index 25
      });

      expect(result.current.currentPage).toBe(3); // Page 3 (0-indexed)
    });
  });

  describe('Page Numbers', () => {
    test('returns page numbers for display', () => {
      const { result } = renderHook(() => usePagination(50, 5, 3));

      const pageNumbers = result.current.getPageNumbers(5);

      expect(pageNumbers).toContain(1);
      expect(pageNumbers).toContain(2);
      expect(pageNumbers).toContain(3);
      expect(pageNumbers).toContain(4);
      expect(pageNumbers).toContain(5);
    });

    test('handles large number of pages', () => {
      const { result } = renderHook(() => usePagination(1000, 10, 50));

      const pageNumbers = result.current.getPageNumbers(5);

      expect(pageNumbers).toContain(1);
      expect(pageNumbers).toContain('...');
      expect(pageNumbers).toContain(100);
    });
  });

  describe('Reset Function', () => {
    test('resets pagination to initial state', () => {
      const { result } = renderHook(() => usePagination(25, 10, 1));

      act(() => {
        result.current.goToPage(3);
        result.current.changePageSize(5);
        result.current.resetPagination();
      });

      expect(result.current.currentPage).toBe(1);
      expect(result.current.pageSize).toBe(10);
    });
  });

  describe('Edge Cases', () => {
    test('handles zero total items', () => {
      const { result } = renderHook(() => usePagination(0, 10, 1));

      expect(result.current.totalPages).toBe(0);
      expect(result.current.canGoNext).toBe(false);
      expect(result.current.canGoPrevious).toBe(false);
    });

    test('handles single page', () => {
      const { result } = renderHook(() => usePagination(5, 10, 1));

      expect(result.current.totalPages).toBe(1);
      expect(result.current.canGoNext).toBe(false);
      expect(result.current.canGoPrevious).toBe(false);
    });

    test('handles very large page numbers', () => {
      const { result } = renderHook(() => usePagination(1000000, 10, 1));

      act(() => {
        result.current.goToPage(50000);
      });

      expect(result.current.currentPage).toBe(50000);
    });
  });
});
