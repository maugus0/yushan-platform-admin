import { useState, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';

/**
 * Custom hook for managing search functionality
 * Handles search input, debouncing, and search results
 */
export const useSearch = (options = {}) => {
  const {
    initialQuery = '',
    debounceMs = 300,
    minLength = 1,
    caseSensitive = false,
    enableHistory = true,
    maxHistoryItems = 10,
  } = options;

  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);

  // Add query to search history
  const addToHistory = useCallback(
    (searchQuery) => {
      const trimmedQuery = searchQuery.trim();
      if (!trimmedQuery) return;

      setSearchHistory((prev) => {
        const newHistory = [
          trimmedQuery,
          ...prev.filter((item) => item !== trimmedQuery),
        ];
        return newHistory.slice(0, maxHistoryItems);
      });

      setRecentSearches((prev) => {
        const newRecent = [
          trimmedQuery,
          ...prev.filter((item) => item !== trimmedQuery),
        ];
        return newRecent.slice(0, 5); // Keep only 5 recent searches
      });
    },
    [maxHistoryItems]
  );

  // Debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce((searchQuery, searchFunction) => {
        if (searchQuery.length >= minLength) {
          setIsSearching(true);
          setError(null);

          try {
            const results = searchFunction(searchQuery);
            return results;
          } catch (err) {
            setError(err.message || 'Search failed');
            return [];
          } finally {
            setIsSearching(false);
          }
        }
        return [];
      }, debounceMs),
    [debounceMs, minLength]
  );

  // Search function
  const search = useCallback(
    async (searchQuery, searchFunction) => {
      if (!searchFunction || typeof searchFunction !== 'function') {
        throw new Error('Search function is required');
      }

      if (searchQuery.length < minLength) {
        return [];
      }

      setIsSearching(true);
      setError(null);

      try {
        const results = await searchFunction(searchQuery);

        // Add to history if enabled
        if (enableHistory && searchQuery.trim()) {
          addToHistory(searchQuery);
        }

        return results;
      } catch (err) {
        const errorMessage = err.message || 'Search failed';
        setError(errorMessage);
        throw err;
      } finally {
        setIsSearching(false);
      }
    },
    [minLength, enableHistory, addToHistory]
  );

  // Clear search history
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    setRecentSearches([]);
  }, []);

  // Remove item from history
  const removeFromHistory = useCallback((item) => {
    setSearchHistory((prev) =>
      prev.filter((historyItem) => historyItem !== item)
    );
    setRecentSearches((prev) =>
      prev.filter((historyItem) => historyItem !== item)
    );
  }, []);

  // Set search query
  const setSearchQuery = useCallback((newQuery) => {
    setQuery(newQuery);
    setError(null);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setError(null);
  }, []);

  // Update suggestions
  const updateSuggestions = useCallback((newSuggestions) => {
    setSuggestions(newSuggestions);
  }, []);

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  // Get search suggestions
  const getSuggestions = useCallback(
    (data, searchFields = [], maxSuggestions = 5) => {
      if (!query || query.length < minLength || !data || data.length === 0) {
        return [];
      }

      const searchTerm = caseSensitive ? query : query.toLowerCase();
      const suggestions = [];

      data.forEach((item) => {
        searchFields.forEach((field) => {
          const fieldValue = item[field];
          if (fieldValue && typeof fieldValue === 'string') {
            const value = caseSensitive ? fieldValue : fieldValue.toLowerCase();
            if (value.includes(searchTerm)) {
              suggestions.push({
                text: fieldValue,
                field,
                item,
              });
            }
          }
        });
      });

      // Remove duplicates and limit results
      const uniqueSuggestions = suggestions
        .filter(
          (suggestion, index, self) =>
            index === self.findIndex((s) => s.text === suggestion.text)
        )
        .slice(0, maxSuggestions);

      return uniqueSuggestions;
    },
    [query, minLength, caseSensitive]
  );

  // Highlight search terms in text
  const highlightSearchTerm = useCallback(
    (text, searchTerm) => {
      if (!searchTerm || !text) return text;

      const regex = new RegExp(`(${searchTerm})`, caseSensitive ? 'g' : 'gi');
      return text.replace(regex, '<mark>$1</mark>');
    },
    [caseSensitive]
  );

  // Filter data based on search query
  const filterData = useCallback(
    (data, searchFields = []) => {
      if (!query || query.length < minLength || !data || data.length === 0) {
        return data;
      }

      const searchTerm = caseSensitive ? query : query.toLowerCase();

      return data.filter((item) => {
        if (searchFields.length === 0) {
          // Search all string fields
          return Object.values(item).some((value) => {
            if (typeof value === 'string') {
              const fieldValue = caseSensitive ? value : value.toLowerCase();
              return fieldValue.includes(searchTerm);
            }
            return false;
          });
        }

        // Search specific fields
        return searchFields.some((field) => {
          const fieldValue = item[field];
          if (typeof fieldValue === 'string') {
            const value = caseSensitive ? fieldValue : fieldValue.toLowerCase();
            return value.includes(searchTerm);
          }
          return false;
        });
      });
    },
    [query, minLength, caseSensitive]
  );

  // Get search statistics
  const getSearchStats = useCallback(() => {
    return {
      query,
      queryLength: query.length,
      isValidQuery: query.length >= minLength,
      historyCount: searchHistory.length,
      recentCount: recentSearches.length,
      suggestionsCount: suggestions.length,
      isSearching,
      hasError: !!error,
    };
  }, [
    query,
    minLength,
    searchHistory.length,
    recentSearches.length,
    suggestions.length,
    isSearching,
    error,
  ]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset search state
  const resetSearch = useCallback(() => {
    setQuery(initialQuery);
    setIsSearching(false);
    setSuggestions([]);
    setError(null);
  }, [initialQuery]);

  return {
    // State
    query,
    isSearching,
    searchHistory,
    recentSearches,
    suggestions,
    error,

    // Actions
    search,
    setSearchQuery,
    clearSearch,
    updateSuggestions,
    clearSuggestions,
    addToHistory,
    clearHistory,
    removeFromHistory,

    // Utilities
    getSuggestions,
    highlightSearchTerm,
    filterData,
    getSearchStats,
    clearError,
    resetSearch,

    // Debounced search
    debouncedSearch,
  };
};

export default useSearch;
