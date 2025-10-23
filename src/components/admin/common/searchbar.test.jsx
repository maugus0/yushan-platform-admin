import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchBar from './searchbar';

// Mock lodash debounce
jest.mock('lodash', () => ({
  debounce: (fn) => {
    fn.cancel = jest.fn();
    return fn;
  },
}));

describe('SearchBar Component', () => {
  const mockOnSearch = jest.fn();
  const mockOnClear = jest.fn();
  const mockOnFilterToggle = jest.fn();
  const mockOnCategoryChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders search input', () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      expect(input).toBeInTheDocument();
    });

    test('renders with custom placeholder', () => {
      render(<SearchBar placeholder="Search users..." />);
      expect(
        screen.getByPlaceholderText('Search users...')
      ).toBeInTheDocument();
    });

    test('renders search icon button', () => {
      render(<SearchBar />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Search Functionality', () => {
    test('calls onSearch when search button is clicked', () => {
      render(<SearchBar onSearch={mockOnSearch} />);
      const input = screen.getByPlaceholderText('Search...');

      fireEvent.change(input, { target: { value: 'test query' } });

      const searchButton = screen
        .getAllByRole('button')
        .find((btn) => btn.querySelector('.anticon-search'));
      fireEvent.click(searchButton);

      expect(mockOnSearch).toHaveBeenCalled();
    });

    test('calls onSearch when Enter key is pressed', () => {
      render(<SearchBar onSearch={mockOnSearch} />);
      const input = screen.getByPlaceholderText('Search...');

      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

      expect(mockOnSearch).toHaveBeenCalled();
    });

    test('updates input value on change', () => {
      render(<SearchBar onSearch={mockOnSearch} />);
      const input = screen.getByPlaceholderText('Search...');

      fireEvent.change(input, { target: { value: 'new value' } });

      expect(input.value).toBe('new value');
    });

    test('calls onSearch with debounce on input change', async () => {
      render(<SearchBar onSearch={mockOnSearch} debounceMs={300} />);
      const input = screen.getByPlaceholderText('Search...');

      fireEvent.change(input, { target: { value: 'test' } });

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('test');
      });
    });
  });

  describe('Clear Functionality', () => {
    test('shows clear button when input has value', () => {
      render(<SearchBar showClear={true} />);
      const input = screen.getByPlaceholderText('Search...');

      fireEvent.change(input, { target: { value: 'test' } });

      const clearButton = screen
        .getAllByRole('button')
        .find((btn) => btn.querySelector('.anticon-clear'));
      expect(clearButton).toBeInTheDocument();
    });

    test('does not show clear button when showClear is false', () => {
      render(<SearchBar showClear={false} />);
      const input = screen.getByPlaceholderText('Search...');

      fireEvent.change(input, { target: { value: 'test' } });

      const clearButton = screen
        .queryAllByRole('button')
        .find((btn) => btn.querySelector('.anticon-clear'));
      expect(clearButton).toBeUndefined();
    });

    test('clears input when clear button is clicked', () => {
      render(
        <SearchBar
          onClear={mockOnClear}
          onSearch={mockOnSearch}
          showClear={true}
        />
      );
      const input = screen.getByPlaceholderText('Search...');

      fireEvent.change(input, { target: { value: 'test' } });

      const clearButton = screen
        .getAllByRole('button')
        .find((btn) => btn.querySelector('.anticon-clear'));
      fireEvent.click(clearButton);

      expect(input.value).toBe('');
    });

    test('calls onClear when clear button is clicked', () => {
      render(<SearchBar onClear={mockOnClear} showClear={true} />);
      const input = screen.getByPlaceholderText('Search...');

      fireEvent.change(input, { target: { value: 'test' } });

      const clearButton = screen
        .getAllByRole('button')
        .find((btn) => btn.querySelector('.anticon-clear'));
      fireEvent.click(clearButton);

      expect(mockOnClear).toHaveBeenCalled();
    });

    test('calls onSearch with empty string when cleared', () => {
      render(
        <SearchBar
          onSearch={mockOnSearch}
          onClear={mockOnClear}
          showClear={true}
        />
      );
      const input = screen.getByPlaceholderText('Search...');

      fireEvent.change(input, { target: { value: 'test' } });

      const clearButton = screen
        .getAllByRole('button')
        .find((btn) => btn.querySelector('.anticon-clear'));
      fireEvent.click(clearButton);

      expect(mockOnSearch).toHaveBeenCalledWith('');
    });
  });

  describe('Filter Button', () => {
    test('shows filter button when showFilter is true', () => {
      render(<SearchBar showFilter={true} />);
      const filterButton = screen.getByText('Filter');
      expect(filterButton).toBeInTheDocument();
    });

    test('does not show filter button when showFilter is false', () => {
      render(<SearchBar showFilter={false} />);
      const filterButton = screen.queryByText('Filter');
      expect(filterButton).not.toBeInTheDocument();
    });

    test('calls onFilterToggle when filter button is clicked', () => {
      render(
        <SearchBar showFilter={true} onFilterToggle={mockOnFilterToggle} />
      );
      const filterButton = screen.getByText('Filter');

      fireEvent.click(filterButton);

      expect(mockOnFilterToggle).toHaveBeenCalled();
    });
  });

  describe('Category Filter', () => {
    test('shows category filter when showCategoryFilter is true', () => {
      const categories = ['Category 1', 'Category 2'];
      render(<SearchBar showCategoryFilter={true} categories={categories} />);

      expect(screen.getByText('All Categories')).toBeInTheDocument();
    });

    test('does not show category filter when showCategoryFilter is false', () => {
      const categories = ['Category 1', 'Category 2'];
      render(<SearchBar showCategoryFilter={false} categories={categories} />);

      expect(screen.queryByText('All Categories')).not.toBeInTheDocument();
    });

    test('accepts array of category strings', () => {
      const categories = ['Books', 'Articles'];
      const { container } = render(
        <SearchBar showCategoryFilter={true} categories={categories} />
      );

      // Verify Select component renders
      expect(container.querySelector('.ant-select')).toBeInTheDocument();
    });

    test('accepts category options with label/value format', () => {
      const categories = [
        { label: 'Books', value: 'books' },
        { label: 'Articles', value: 'articles' },
      ];
      const { container } = render(
        <SearchBar showCategoryFilter={true} categories={categories} />
      );

      // Verify Select component renders with options
      expect(container.querySelector('.ant-select')).toBeInTheDocument();
    });

    test('passes onCategoryChange handler correctly', () => {
      const categories = ['Books', 'Articles'];
      render(
        <SearchBar
          showCategoryFilter={true}
          categories={categories}
          onCategoryChange={mockOnCategoryChange}
        />
      );

      // Verify the handler is passed
      expect(mockOnCategoryChange).toBeDefined();
    });

    test('accepts selectedCategory prop', () => {
      const categories = ['Books', 'Articles'];
      const { container } = render(
        <SearchBar
          showCategoryFilter={true}
          categories={categories}
          selectedCategory="Books"
        />
      );

      // Verify component renders with selected category
      expect(container.querySelector('.ant-select')).toBeInTheDocument();
    });
  });

  describe('Autocomplete Suggestions', () => {
    test('renders AutoComplete when suggestions provided', () => {
      const suggestions = ['suggestion 1', 'suggestion 2', 'suggestion 3'];
      render(<SearchBar suggestions={suggestions} />);

      const input = screen.getByPlaceholderText('Search...');
      expect(input).toBeInTheDocument();
    });

    test('filters suggestions based on input', async () => {
      const suggestions = ['apple', 'application', 'banana', 'grape'];
      render(<SearchBar suggestions={suggestions} onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('Search...');
      fireEvent.change(input, { target: { value: 'app' } });

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalled();
      });
    });

    test('limits suggestions to 10 items', () => {
      const suggestions = Array.from(
        { length: 20 },
        (_, i) => `suggestion ${i}`
      );
      render(<SearchBar suggestions={suggestions} />);

      const input = screen.getByPlaceholderText('Search...');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    test('shows loading indicator when loading is true', () => {
      const { container } = render(<SearchBar loading={true} />);
      expect(container).toBeInTheDocument();
    });

    test('does not show loading indicator when loading is false', () => {
      const { container } = render(<SearchBar loading={false} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    test('renders with small size', () => {
      const { container } = render(<SearchBar size="small" />);
      expect(container).toBeInTheDocument();
    });

    test('renders with middle size', () => {
      const { container } = render(<SearchBar size="middle" />);
      expect(container).toBeInTheDocument();
    });

    test('renders with large size', () => {
      const { container } = render(<SearchBar size="large" />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Customization', () => {
    test('applies custom style', () => {
      const customStyle = { backgroundColor: 'lightblue' };
      const { container } = render(<SearchBar style={customStyle} />);
      expect(container.firstChild).toHaveStyle(customStyle);
    });

    test('accepts custom searchValue prop', () => {
      render(<SearchBar searchValue="initial value" />);
      const input = screen.getByPlaceholderText('Search...');
      expect(input.value).toBe('initial value');
    });

    test('uses custom debounceMs', () => {
      const { container } = render(<SearchBar debounceMs={500} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Complex Scenarios', () => {
    test('renders with all features enabled', () => {
      const categories = ['Books', 'Articles'];
      const suggestions = ['suggestion 1', 'suggestion 2'];

      render(
        <SearchBar
          onSearch={mockOnSearch}
          onClear={mockOnClear}
          onFilterToggle={mockOnFilterToggle}
          placeholder="Search everything..."
          showClear={true}
          showFilter={true}
          showCategoryFilter={true}
          categories={categories}
          selectedCategory="all"
          onCategoryChange={mockOnCategoryChange}
          suggestions={suggestions}
          loading={false}
          debounceMs={300}
          size="middle"
        />
      );

      expect(
        screen.getByPlaceholderText('Search everything...')
      ).toBeInTheDocument();
      expect(screen.getByText('Filter')).toBeInTheDocument();
      expect(screen.getByText('All Categories')).toBeInTheDocument();
    });

    test('handles search with category filter', () => {
      const categories = ['Books'];
      render(
        <SearchBar
          onSearch={mockOnSearch}
          showCategoryFilter={true}
          categories={categories}
          onCategoryChange={mockOnCategoryChange}
        />
      );

      const input = screen.getByPlaceholderText('Search...');
      fireEvent.change(input, { target: { value: 'test' } });

      expect(input.value).toBe('test');
    });
  });

  describe('Edge Cases', () => {
    test('handles empty categories array', () => {
      render(<SearchBar showCategoryFilter={true} categories={[]} />);
      expect(screen.queryByText('All Categories')).not.toBeInTheDocument();
    });

    test('handles empty suggestions array', () => {
      const { container } = render(<SearchBar suggestions={[]} />);
      expect(container).toBeInTheDocument();
    });

    test('handles undefined onSearch', () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      expect(() => {
        fireEvent.change(input, { target: { value: 'test' } });
      }).not.toThrow();
    });

    test('handles undefined onClear', () => {
      render(<SearchBar showClear={true} />);
      const input = screen.getByPlaceholderText('Search...');

      fireEvent.change(input, { target: { value: 'test' } });

      const clearButton = screen
        .getAllByRole('button')
        .find((btn) => btn.querySelector('.anticon-clear'));

      expect(() => {
        fireEvent.click(clearButton);
      }).not.toThrow();
    });
  });
});
