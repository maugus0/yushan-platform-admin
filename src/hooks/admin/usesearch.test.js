import { renderHook, act } from '@testing-library/react';
import { useSearch } from './usesearch';

// Mock lodash debounce - must be at the top level
jest.mock('lodash', () => ({
  debounce: jest.fn((fn, _delay) => {
    // Return a function that calls the original function immediately
    const debouncedFn = (...args) => fn(...args);
    debouncedFn.cancel = jest.fn();
    debouncedFn.flush = jest.fn();
    return debouncedFn;
  }),
}));

describe('useSearch Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    test('initializes with correct default values', () => {
      const { result } = renderHook(() => useSearch());

      expect(result.current.query).toBe('');
      expect(result.current.isSearching).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('Basic Functionality', () => {
    test('sets search query', () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.setSearchQuery('John');
      });

      expect(result.current.query).toBe('John');
    });

    test('clears search', () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.setSearchQuery('John');
      });

      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.query).toBe('');
    });
  });

  describe('search flow', () => {
    test('search below minLength returns empty and does not toggle isSearching', async () => {
      const { result } = renderHook(() => useSearch({ minLength: 5 }));
      const mockSearch = jest.fn();

      let res;
      await act(async () => {
        res = await result.current.search('abc', mockSearch);
      });

      expect(res).toEqual([]);
      expect(mockSearch).not.toHaveBeenCalled();
      expect(result.current.isSearching).toBe(false);
    });
  });

  describe('history management', () => {
    test('addToHistory trims and de-duplicates, clearHistory empties', async () => {
      const { result } = renderHook(() => useSearch({ enableHistory: true }));
      act(() => {
        result.current.addToHistory(' apple ');
        result.current.addToHistory('banana');
        result.current.addToHistory('apple'); // duplicate -> moves to front
      });

      expect(result.current.searchHistory[0]).toBe('apple');
      expect(result.current.searchHistory[1]).toBe('banana');
      expect(result.current.recentSearches[0]).toBe('apple');

      act(() => {
        result.current.clearHistory();
      });
      expect(result.current.searchHistory).toEqual([]);
      expect(result.current.recentSearches).toEqual([]);
    });

    test('removeFromHistory removes specific item', () => {
      const { result } = renderHook(() => useSearch({ enableHistory: true }));
      act(() => {
        result.current.addToHistory('a');
        result.current.addToHistory('b');
        result.current.addToHistory('c');
      });
      act(() => {
        result.current.removeFromHistory('b');
      });
      expect(result.current.searchHistory).toEqual(['c', 'a']);
    });
  });

  describe('suggestions utilities', () => {
    test('getSuggestions respects minLength and fields, deduplicates, limits', () => {
      const { result } = renderHook(() => useSearch({ minLength: 2 }));
      act(() => result.current.setSearchQuery('al'));
      const data = [
        { name: 'Alice', role: 'admin' },
        { name: 'ALICE', role: 'user' },
        { name: 'Alan', role: 'author' },
        { name: 'Bob', role: 'user' },
      ];
      const suggestions = result.current.getSuggestions(data, ['name'], 3);
      const texts = suggestions.map((s) => s.text);
      expect(texts).toEqual(expect.arrayContaining(['Alice', 'ALICE', 'Alan']));
      // deduplication by text keeps unique strings
      expect(new Set(texts).size).toBe(texts.length);
    });

    test('getSuggestions with caseSensitive=true differentiates case', () => {
      const { result } = renderHook(() =>
        useSearch({ minLength: 1, caseSensitive: true })
      );
      act(() => result.current.setSearchQuery('AL'));
      const data = [{ name: 'Alice' }, { name: 'ALICE' }];
      const suggestions = result.current.getSuggestions(data, ['name'], 10);
      const texts = suggestions.map((s) => s.text);
      expect(texts).toEqual(['ALICE']);
    });

    test('updateSuggestions and clearSuggestions mutate state', () => {
      const { result } = renderHook(() => useSearch());
      act(() => {
        result.current.updateSuggestions([{ text: 'x' }]);
      });
      expect(result.current.suggestions).toEqual([{ text: 'x' }]);
      act(() => {
        result.current.clearSuggestions();
      });
      expect(result.current.suggestions).toEqual([]);
    });
  });

  describe('highlighting and filtering', () => {
    test('highlightSearchTerm wraps matches with <mark>', () => {
      const { result } = renderHook(() => useSearch());
      const out = result.current.highlightSearchTerm('Hello Alice', 'Al');
      expect(out).toContain('<mark>Al</mark>');
    });

    test('filterData searches all string fields when fields empty', () => {
      const { result } = renderHook(() => useSearch({ minLength: 1 }));
      act(() => result.current.setSearchQuery('nov'));
      const data = [
        { title: 'Novel A', author: 'Alice' },
        { title: 'Story B', author: 'Bob' },
      ];
      const filtered = result.current.filterData(data);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Novel A');
    });

    test('filterData with fields restricts scope', () => {
      const { result } = renderHook(() => useSearch({ minLength: 1 }));
      act(() => result.current.setSearchQuery('ali'));
      const data = [
        { title: 'X', author: 'Alice' },
        { title: 'Alice in Title', author: 'Y' },
      ];
      const filtered = result.current.filterData(data, ['author']);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].author).toBe('Alice');
    });

    test('filterData respects caseSensitive option', () => {
      const { result } = renderHook(() => useSearch({ caseSensitive: true }));
      act(() => result.current.setSearchQuery('AL'));
      const data = [{ name: 'Alice' }, { name: 'ALICE' }];
      const filtered = result.current.filterData(data, ['name']);
      expect(filtered).toEqual([{ name: 'ALICE' }]);
    });
  });

  describe('stats and reset', () => {
    test('getSearchStats returns accurate snapshot', () => {
      const { result } = renderHook(() =>
        useSearch({ initialQuery: 'ab', minLength: 2 })
      );
      act(() => {
        result.current.updateSuggestions([{ t: 1 }, { t: 2 }]);
      });
      const stats = result.current.getSearchStats();
      expect(stats.query).toBe('ab');
      expect(stats.queryLength).toBe(2);
      expect(stats.isValidQuery).toBe(true);
      expect(stats.suggestionsCount).toBe(2);
      expect(stats.hasError).toBe(false);
    });

    test('resetSearch restores initial state', () => {
      const { result } = renderHook(() =>
        useSearch({ initialQuery: 'init', minLength: 1 })
      );
      act(() => {
        result.current.setSearchQuery('changed');
        result.current.updateSuggestions([{ s: 'x' }]);
      });
      act(() => {
        result.current.resetSearch();
      });
      expect(result.current.query).toBe('init');
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.isSearching).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });
});
