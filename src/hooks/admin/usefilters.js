import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for managing data filters
 * Handles multiple filter types and filter state management
 */
export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);
  const [isFiltered, setIsFiltered] = useState(false);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (value) =>
        value !== null &&
        value !== undefined &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0)
    );
  }, [filters]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(
      (value) =>
        value !== null &&
        value !== undefined &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0)
    ).length;
  }, [filters]);

  // Set a single filter
  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setIsFiltered(true);
  }, []);

  // Set multiple filters at once
  const setMultipleFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
    setIsFiltered(true);
  }, []);

  // Clear a specific filter
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
    setIsFiltered(false);
  }, []);

  // Reset filters to initial state
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setIsFiltered(false);
  }, [initialFilters]);

  // Get filter value
  const getFilter = useCallback(
    (key) => {
      return filters[key];
    },
    [filters]
  );

  // Check if a filter is active
  const isFilterActive = useCallback(
    (key) => {
      const value = filters[key];
      return (
        value !== null &&
        value !== undefined &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0)
      );
    },
    [filters]
  );

  // Apply filters to data
  const applyFilters = useCallback(
    (data, customFilterFn = null, filtersToApply = null) => {
      if (!data || data.length === 0) return data;

      let filteredData = [...data];
      const filtersToUse = filtersToApply || filters;

      // Apply custom filter function if provided
      if (customFilterFn && typeof customFilterFn === 'function') {
        filteredData = customFilterFn(filteredData, filtersToUse);
      } else {
        // Apply default filters
        Object.entries(filtersToUse).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            filteredData = filteredData.filter((item) => {
              const itemValue = item[key];

              // Handle different filter types
              if (Array.isArray(value)) {
                // Array filter (e.g., multiple selections)
                return value.includes(itemValue);
              } else if (typeof value === 'object' && value.min !== undefined) {
                // Range filter
                if (value.max !== undefined) {
                  return itemValue >= value.min && itemValue <= value.max;
                }
                return itemValue >= value.min;
              } else if (typeof value === 'object' && value.max !== undefined) {
                // Max value filter
                return itemValue <= value.max;
              } else if (typeof value === 'string') {
                // String contains filter
                return String(itemValue)
                  .toLowerCase()
                  .includes(value.toLowerCase());
              } else {
                // Exact match filter
                return itemValue === value;
              }
            });
          }
        });
      }

      return filteredData;
    },
    [filters]
  );

  // Get filter summary
  const getFilterSummary = useCallback(() => {
    const activeFilters = Object.entries(filters)
      .filter(
        ([_key, value]) =>
          value !== null &&
          value !== undefined &&
          value !== '' &&
          !(Array.isArray(value) && value.length === 0)
      )
      .map(([key, value]) => ({
        key,
        value,
        displayValue: Array.isArray(value) ? value.join(', ') : String(value),
      }));

    return {
      activeFilters,
      count: activeFilters.length,
      hasActive: activeFilters.length > 0,
    };
  }, [filters]);

  // Set date range filter
  const setDateRangeFilter = useCallback(
    (key, startDate, endDate) => {
      setFilter(key, {
        start: startDate,
        end: endDate,
      });
    },
    [setFilter]
  );

  // Set number range filter
  const setNumberRangeFilter = useCallback(
    (key, min, max) => {
      setFilter(key, {
        min,
        max,
      });
    },
    [setFilter]
  );

  // Set multi-select filter
  const setMultiSelectFilter = useCallback(
    (key, values) => {
      setFilter(key, values);
    },
    [setFilter]
  );

  // Toggle filter value (useful for boolean filters)
  const toggleFilter = useCallback(
    (key, value) => {
      const currentValue = filters[key];
      if (currentValue === value) {
        clearFilter(key);
      } else {
        setFilter(key, value);
      }
    },
    [filters, setFilter, clearFilter]
  );

  // Set search filter
  const setSearchFilter = useCallback(
    (key, searchTerm) => {
      if (searchTerm.trim() === '') {
        clearFilter(key);
      } else {
        setFilter(key, searchTerm.trim());
      }
    },
    [setFilter, clearFilter]
  );

  // Get filter options for dropdowns
  const getFilterOptions = useCallback((data, _fieldKey, options = {}) => {
    const { unique = true, sort = true, transform = null } = options;

    if (!data || data.length === 0) return [];

    let values = data.map((item) => item[_fieldKey]);

    if (transform && typeof transform === 'function') {
      values = values.map(transform);
    }

    if (unique) {
      values = [...new Set(values)];
    }

    if (sort) {
      values.sort((a, b) => {
        if (typeof a === 'string' && typeof b === 'string') {
          return a.localeCompare(b);
        }
        return a - b;
      });
    }

    return values.filter(
      (value) => value !== null && value !== undefined && value !== ''
    );
  }, []);

  // Validate filter value
  const validateFilter = useCallback((key, value, validationRules = {}) => {
    const {
      required = false,
      minLength = 0,
      maxLength = Infinity,
      min = -Infinity,
      max = Infinity,
      pattern = null,
    } = validationRules;

    if (required && (value === null || value === undefined || value === '')) {
      return { isValid: false, error: `${key} is required` };
    }

    if (typeof value === 'string') {
      if (value.length < minLength) {
        return {
          isValid: false,
          error: `${key} must be at least ${minLength} characters`,
        };
      }
      if (value.length > maxLength) {
        return {
          isValid: false,
          error: `${key} must be no more than ${maxLength} characters`,
        };
      }
      if (pattern && !pattern.test(value)) {
        return { isValid: false, error: `${key} format is invalid` };
      }
    }

    if (typeof value === 'number') {
      if (value < min) {
        return { isValid: false, error: `${key} must be at least ${min}` };
      }
      if (value > max) {
        return { isValid: false, error: `${key} must be no more than ${max}` };
      }
    }

    return { isValid: true };
  }, []);

  return {
    // State
    filters,
    isFiltered,
    hasActiveFilters,
    activeFilterCount,

    // Actions
    setFilter,
    setMultipleFilters,
    clearFilter,
    clearAllFilters,
    resetFilters,

    // Getters
    getFilter,
    isFilterActive,
    getFilterSummary,

    // Specialized setters
    setDateRangeFilter,
    setNumberRangeFilter,
    setMultiSelectFilter,
    toggleFilter,
    setSearchFilter,

    // Utilities
    applyFilters,
    getFilterOptions,
    validateFilter,
  };
};

export default useFilters;
