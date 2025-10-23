import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for managing pagination state and calculations
 * Handles page navigation, page size changes, and pagination info
 */
export const usePagination = (
  totalItems = 0,
  initialPageSize = 10,
  initialPage = 1
) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize);
  }, [totalItems, pageSize]);

  // Calculate start and end indices for current page
  const pageIndices = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    return { startIndex, endIndex };
  }, [currentPage, pageSize, totalItems]);

  // Calculate page range for pagination display
  const pageRange = useMemo(() => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  }, [currentPage, totalPages]);

  // Navigation functions
  const goToPage = useCallback(
    (page) => {
      if (page < 1 || page > totalPages) {
        return; // Don't navigate to invalid pages
      }
      setCurrentPage(page);
    },
    [totalPages]
  );

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  // Change page size
  const changePageSize = useCallback(
    (newPageSize) => {
      const validPageSize = Math.max(1, newPageSize);
      setPageSize(validPageSize);

      // Adjust current page if it's now out of bounds
      const newTotalPages = Math.ceil(totalItems / validPageSize);
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages || 1);
      }
    },
    [currentPage, totalItems]
  );

  // Reset pagination
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setPageSize(initialPageSize);
  }, [initialPageSize]);

  // Check if navigation is possible
  const canGoNext = currentPage < totalPages;
  const canGoPrevious = currentPage > 1;

  // Get pagination info
  const getPaginationInfo = useCallback(() => {
    const { startIndex, endIndex } = pageIndices;
    return {
      currentPage,
      totalPages,
      pageSize,
      totalItems,
      startIndex: totalItems > 0 ? startIndex + 1 : 0,
      endIndex,
      hasNextPage: canGoNext,
      hasPreviousPage: canGoPrevious,
      isFirstPage: currentPage === 1,
      isLastPage: currentPage === totalPages,
    };
  }, [
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    pageIndices,
    canGoNext,
    canGoPrevious,
  ]);

  // Get page data (for displaying items)
  const getPageData = useCallback(
    (data) => {
      if (!data || data.length === 0) return [];

      const { startIndex, endIndex } = pageIndices;
      return data.slice(startIndex, endIndex);
    },
    [pageIndices]
  );

  // Jump to page by percentage
  const jumpToPercentage = useCallback(
    (percentage) => {
      const targetPage = Math.ceil((percentage / 100) * totalPages);
      goToPage(targetPage);
    },
    [totalPages, goToPage]
  );

  // Jump to page by item index
  const jumpToItem = useCallback(
    (itemIndex) => {
      const targetPage = Math.ceil((itemIndex + 1) / pageSize);
      goToPage(targetPage);
    },
    [pageSize, goToPage]
  );

  // Get page numbers for display (with ellipsis)
  const getPageNumbers = useCallback(
    (maxVisible = 5) => {
      if (totalPages <= maxVisible) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      const delta = Math.floor(maxVisible / 2);
      let start = Math.max(1, currentPage - delta);
      let end = Math.min(totalPages, currentPage + delta);

      // Adjust if we're near the beginning or end
      if (currentPage <= delta) {
        end = maxVisible;
      }
      if (currentPage + delta >= totalPages) {
        start = totalPages - maxVisible + 1;
      }

      const pages = [];

      // Add first page and ellipsis if needed
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('...');
        }
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis and last page if needed
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }

      return pages;
    },
    [currentPage, totalPages]
  );

  return {
    // State
    currentPage,
    pageSize,
    totalPages,
    totalItems,

    // Calculated values
    pageIndices,
    pageRange,
    canGoNext,
    canGoPrevious,

    // Navigation
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    changePageSize,
    resetPagination,

    // Utilities
    getPaginationInfo,
    getPageData,
    jumpToPercentage,
    jumpToItem,
    getPageNumbers,
  };
};

export default usePagination;
