import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Custom hook for managing data table state and operations
 * Handles sorting, filtering, pagination, and data management
 */
export const useDataTable = (initialData = [], options = {}) => {
  const {
    pageSize: initialPageSize = 10,
    sortBy: initialSortBy = null,
    sortDirection: initialSortDirection = 'asc',
    enablePagination = true,
    enableSorting = true,
    // enableFiltering = true, // Unused variable
  } = options;

  const [data, setData] = useState(initialData);
  const [filteredData, setFilteredData] = useState(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Paginated data
  const paginatedData = useMemo(() => {
    if (!enablePagination) return filteredData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize, enablePagination]);

  // Total pages
  const totalPages = useMemo(() => {
    if (!enablePagination) return 1;
    return Math.ceil(filteredData.length / pageSize);
  }, [filteredData.length, pageSize, enablePagination]);

  // Total items
  const totalItems = filteredData.length;

  // Apply filters and search
  const applyFilters = useCallback(
    (dataToFilter) => {
      if (!dataToFilter || !Array.isArray(dataToFilter)) {
        return [];
      }
      let filtered = [...dataToFilter];

      // Apply search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter((item) =>
          Object.values(item).some((value) =>
            String(value).toLowerCase().includes(term)
          )
        );
      }

      // Apply column filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          filtered = filtered.filter((item) => {
            const itemValue = item[key];
            if (typeof itemValue === 'string') {
              return itemValue
                .toLowerCase()
                .includes(String(value).toLowerCase());
            }
            return itemValue === value;
          });
        }
      });

      return filtered;
    },
    [searchTerm, filters]
  );

  // Apply sorting
  const applySorting = useCallback(
    (dataToSort) => {
      if (!sortBy || !enableSorting) return dataToSort;

      return [...dataToSort].sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }

        if (aValue instanceof Date && bValue instanceof Date) {
          return sortDirection === 'asc'
            ? aValue.getTime() - bValue.getTime()
            : bValue.getTime() - aValue.getTime();
        }

        return 0;
      });
    },
    [sortBy, sortDirection, enableSorting]
  );

  // Update filtered data when dependencies change
  useEffect(() => {
    const filtered = applyFilters(data);
    const sorted = applySorting(filtered);
    setFilteredData(sorted);
  }, [
    data,
    searchTerm,
    filters,
    sortBy,
    sortDirection,
    enableSorting,
    applyFilters,
    applySorting,
  ]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // Set data
  const setTableData = useCallback((newData) => {
    setData(newData);
    setError(null);
  }, []);

  // Add new item
  const addItem = useCallback((item) => {
    setData((prev) => [...prev, { ...item, id: Date.now() }]);
  }, []);

  // Update item
  const updateItem = useCallback((id, updates) => {
    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  // Delete item
  const deleteItem = useCallback((id) => {
    setData((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Delete multiple items
  const deleteItems = useCallback((ids) => {
    setData((prev) => prev.filter((item) => !ids.includes(item.id)));
  }, []);

  // Sort by column
  const sortByColumn = useCallback(
    (column) => {
      if (!enableSorting) return;

      if (sortBy === column) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(column);
        setSortDirection('asc');
      }
    },
    [sortBy, enableSorting]
  );

  // Set filter
  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Clear filter
  const clearFilter = useCallback((key) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
  }, []);

  // Set search term
  const setSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  // Pagination
  const goToPage = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
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
  const changePageSize = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  }, []);

  // Refresh data
  const refreshData = useCallback(async (fetchFunction) => {
    if (!fetchFunction) return;

    setIsLoading(true);
    setError(null);

    try {
      const newData = await fetchFunction();
      setData(newData);
    } catch (err) {
      setError(err.message || 'Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset table
  const resetTable = useCallback(() => {
    setData(initialData);
    setCurrentPage(1);
    setSortBy(initialSortBy);
    setSortDirection(initialSortDirection);
    setFilters({});
    setSearchTerm('');
    setError(null);
  }, [initialData, initialSortBy, initialSortDirection]);

  // Get column values for filter dropdowns
  const getColumnValues = useCallback(
    (column) => {
      const values = [...new Set(data.map((item) => item[column]))];
      return values.filter((value) => value !== null && value !== undefined);
    },
    [data]
  );

  // Export data
  const exportData = useCallback(
    (format = 'json') => {
      const dataToExport = enablePagination ? filteredData : data;

      switch (format) {
        case 'json':
          return JSON.stringify(dataToExport, null, 2);
        case 'csv': {
          if (dataToExport.length === 0) return '';
          const headers = Object.keys(dataToExport[0]);
          const csvContent = [
            headers.join(','),
            ...dataToExport.map((row) =>
              headers.map((header) => `"${row[header] || ''}"`).join(',')
            ),
          ].join('\n');
          return csvContent;
        }
        default:
          return dataToExport;
      }
    },
    [data, filteredData, enablePagination]
  );

  return {
    // Data
    data,
    filteredData,
    paginatedData,

    // Pagination
    currentPage,
    pageSize,
    totalPages,
    totalItems,

    // Sorting
    sortBy,
    sortDirection,

    // Filtering
    filters,
    searchTerm,

    // State
    isLoading,
    error,

    // Actions
    setTableData,
    addItem,
    updateItem,
    deleteItem,
    deleteItems,
    sortByColumn,
    setFilter,
    clearFilter,
    clearAllFilters,
    setSearch,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    changePageSize,
    refreshData,
    clearError,
    resetTable,
    getColumnValues,
    exportData,
  };
};

export default useDataTable;
