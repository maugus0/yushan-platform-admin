import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, useLocation } from 'react-router-dom';
import Categories from './index';
import { categoryService } from '../../../services/admin/categoryservice';

// Mock the services
jest.mock('../../../services/admin/categoryservice', () => ({
  categoryService: {
    getAllCategories: jest.fn(),
    getCategoryNovelCounts: jest.fn(),
    deleteCategory: jest.fn(),
    toggleCategoryStatus: jest.fn(),
  },
}));

// Mock antd Grid useBreakpoint to return desktop breakpoints for testing
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  Grid: {
    ...jest.requireActual('antd').Grid,
    useBreakpoint: () => ({
      xs: false,
      sm: false,
      md: true, // Desktop view
      lg: true,
      xl: true,
      xxl: true,
    }),
  },
  message: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the CategoryForm component
jest.mock('./categoryform', () => {
  return function MockCategoryForm({ onSuccess, onCancel }) {
    return (
      <div data-testid="category-form">
        <button data-testid="form-success" onClick={onSuccess}>
          Success
        </button>
        <button data-testid="form-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    );
  };
});

// Mock common components
jest.mock('../../../components/admin/common', () => ({
  PageHeader: ({ title, subtitle, actions }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
      {actions && <div data-testid="page-actions">{actions}</div>}
    </div>
  ),
  SearchBar: ({
    placeholder,
    onSearch,
    onClear,
    searchValue,
    _showFilter,
    _loading,
  }) => (
    <div data-testid="search-bar">
      <input
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => onSearch(e.target.value)}
        data-testid="search-input"
      />
      <button onClick={onClear} data-testid="clear-search">
        Clear
      </button>
    </div>
  ),
  FilterPanel: ({ onFilter, onClear, _collapsed }) => (
    <div data-testid="filter-panel">
      <button
        onClick={() => onFilter({ status: 'active' })}
        data-testid="apply-filter"
      >
        Apply Filter
      </button>
      <button onClick={onClear} data-testid="clear-filters">
        Clear Filters
      </button>
    </div>
  ),
  StatusBadge: ({ status }) => (
    <span data-testid={`status-${status}`}>{status}</span>
  ),
  ActionButtons: ({ record, onView, onEdit, onDelete, customActions }) => (
    <div data-testid={`actions-${record.id}`}>
      <button onClick={() => onView(record)} data-testid={`view-${record.id}`}>
        View
      </button>
      <button onClick={() => onEdit(record)} data-testid={`edit-${record.id}`}>
        Edit
      </button>
      <button
        onClick={() => onDelete(record)}
        data-testid={`delete-${record.id}`}
      >
        Delete
      </button>
      {customActions &&
        customActions.map((action) => (
          <button
            key={action.key}
            onClick={() => action.onClick(record)}
            data-testid={`${action.key}-${record.id}`}
          >
            {action.label}
          </button>
        ))}
    </div>
  ),
  EmptyState: ({
    title,
    description,
    onDefaultAction,
    defaultActionText,
    actions,
  }) => (
    <div data-testid="empty-state">
      <h2>{title}</h2>
      <p>{description}</p>
      {onDefaultAction && (
        <button onClick={onDefaultAction} data-testid="empty-action">
          {defaultActionText}
        </button>
      )}
      {actions &&
        actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            data-testid={`empty-action-${index}`}
          >
            {action.children}
          </button>
        ))}
    </div>
  ),
  LoadingSpinner: ({ tip }) => <div data-testid="loading-spinner">{tip}</div>,
}));

const mockCategories = [
  {
    id: 1,
    name: 'Fantasy',
    description: 'Stories with magical elements',
    isActive: true,
    createTime: '2024-01-15T10:30:00Z',
    updateTime: '2024-09-20T14:20:00Z',
    slug: 'fantasy',
    color: '#13c2c2',
  },
  {
    id: 2,
    name: 'Romance',
    description: 'Love stories and romantic relationships',
    isActive: false,
    createTime: '2024-01-16T10:30:00Z',
    updateTime: '2024-09-18T09:15:00Z',
    slug: 'romance',
    color: '#722ed1',
  },
];

const renderCategories = () => {
  return render(
    <BrowserRouter>
      <Categories />
    </BrowserRouter>
  );
};

describe('Categories Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    categoryService.getAllCategories.mockResolvedValue({
      success: true,
      data: mockCategories,
    });

    categoryService.getCategoryNovelCounts.mockResolvedValue({
      counts: { 1: 5, 2: 3 },
    });
  });

  describe('Rendering', () => {
    test('renders page header with correct title and subtitle', async () => {
      renderCategories();

      await waitFor(() => {
        expect(screen.getByTestId('page-header')).toBeInTheDocument();
        expect(screen.getByText('Categories Management')).toBeInTheDocument();
        expect(
          screen.getByText('Manage novel categories and genres')
        ).toBeInTheDocument();
      });
    });

    test('renders search bar', async () => {
      renderCategories();

      await waitFor(() => {
        expect(screen.getByTestId('search-bar')).toBeInTheDocument();
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });
    });

    test('renders filter panel', async () => {
      renderCategories();

      await waitFor(() => {
        expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
      });
    });

    test('renders loading spinner initially', () => {
      renderCategories();

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading categories...')).toBeInTheDocument();
    });

    test('renders categories table after loading', async () => {
      renderCategories();

      await waitFor(() => {
        expect(screen.getByText('Fantasy')).toBeInTheDocument();
        expect(screen.getByText('Romance')).toBeInTheDocument();
      });

      // Check status badges
      expect(screen.getByTestId('status-active')).toBeInTheDocument();
      expect(screen.getByTestId('status-inactive')).toBeInTheDocument();
    });

    test('renders empty state when no categories found', async () => {
      categoryService.getAllCategories.mockResolvedValue({
        success: true,
        data: [],
      });

      renderCategories();

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
        expect(screen.getByText('No Categories Found')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    test('filters categories based on search input', async () => {
      renderCategories();

      await waitFor(() => {
        expect(screen.getByText('Fantasy')).toBeInTheDocument();
        expect(screen.getByText('Romance')).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'Fantasy' } });

      await waitFor(() => {
        expect(screen.getByText('Fantasy')).toBeInTheDocument();
        expect(screen.queryByText('Romance')).not.toBeInTheDocument();
      });
    });

    test('clears search when clear button is clicked', async () => {
      renderCategories();

      await waitFor(() => {
        expect(screen.getByText('Fantasy')).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'Fantasy' } });

      await waitFor(() => {
        expect(screen.queryByText('Romance')).not.toBeInTheDocument();
      });

      const clearButton = screen.getByTestId('clear-search');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText('Fantasy')).toBeInTheDocument();
        expect(screen.getByText('Romance')).toBeInTheDocument();
      });
    });
  });

  describe('Filter Functionality', () => {
    test('applies status filter', async () => {
      renderCategories();

      await waitFor(() => {
        expect(screen.getByText('Fantasy')).toBeInTheDocument();
        expect(screen.getByText('Romance')).toBeInTheDocument();
      });

      const applyFilterButton = screen.getByTestId('apply-filter');
      fireEvent.click(applyFilterButton);

      await waitFor(() => {
        expect(screen.getByText('Fantasy')).toBeInTheDocument();
        expect(screen.queryByText('Romance')).not.toBeInTheDocument();
      });
    });

    test('clears filters', async () => {
      renderCategories();

      await waitFor(() => {
        expect(screen.getByText('Fantasy')).toBeInTheDocument();
      });

      const applyFilterButton = screen.getByTestId('apply-filter');
      fireEvent.click(applyFilterButton);

      await waitFor(() => {
        expect(screen.queryByText('Romance')).not.toBeInTheDocument();
      });

      const clearFiltersButton = screen.getByTestId('clear-filters');
      fireEvent.click(clearFiltersButton);

      await waitFor(() => {
        expect(screen.getByText('Fantasy')).toBeInTheDocument();
        expect(screen.getByText('Romance')).toBeInTheDocument();
      });
    });
  });

  describe('CRUD Operations', () => {
    test('opens create modal when add button is clicked', async () => {
      renderCategories();

      await waitFor(() => {
        expect(screen.getByText('Add Category')).toBeInTheDocument();
      });

      const addButton = screen.getByText('Add Category');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('category-form')).toBeInTheDocument();
      });
    });

    test('opens edit modal when edit action is clicked', async () => {
      renderCategories();

      await waitFor(() => {
        expect(screen.getByTestId('edit-1')).toBeInTheDocument();
      });

      const editButton = screen.getByTestId('edit-1');
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('category-form')).toBeInTheDocument();
      });
    });

    test('opens view modal when view action is clicked', async () => {
      renderCategories();

      await waitFor(() => {
        expect(screen.getByTestId('view-1')).toBeInTheDocument();
      });

      const viewButton = screen.getByTestId('view-1');
      fireEvent.click(viewButton);

      await waitFor(() => {
        expect(screen.getByText('Category Details')).toBeInTheDocument();
        // Look for Fantasy in the modal specifically
        const modal = screen
          .getByText('Category Details')
          .closest('.ant-modal');
        expect(modal).toHaveTextContent('Fantasy');
      });
    });

    test('handles toggle status operation', async () => {
      categoryService.toggleCategoryStatus.mockResolvedValue({ success: true });

      renderCategories();

      await waitFor(() => {
        expect(screen.getByTestId('toggle-1')).toBeInTheDocument();
      });

      const toggleButton = screen.getByTestId('toggle-1');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(categoryService.toggleCategoryStatus).toHaveBeenCalledWith(
          1,
          false
        );
      });
    });
  });

  describe('Modal Interactions', () => {
    test('closes create modal on form success', async () => {
      renderCategories();

      await waitFor(() => {
        expect(screen.getByText('Add Category')).toBeInTheDocument();
      });

      const addButton = screen.getByText('Add Category');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('category-form')).toBeInTheDocument();
      });

      const successButton = screen.getByTestId('form-success');
      fireEvent.click(successButton);

      await waitFor(() => {
        expect(screen.queryByTestId('category-form')).not.toBeInTheDocument();
      });
    });

    test('closes create modal on form cancel', async () => {
      renderCategories();

      await waitFor(() => {
        expect(screen.getByText('Add Category')).toBeInTheDocument();
      });

      const addButton = screen.getByText('Add Category');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('category-form')).toBeInTheDocument();
      });

      const cancelButton = screen.getByTestId('form-cancel');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByTestId('category-form')).not.toBeInTheDocument();
      });
    });
  });

  describe('Data Fetching', () => {
    test('calls getAllCategories on mount', async () => {
      renderCategories();

      await waitFor(() => {
        expect(categoryService.getAllCategories).toHaveBeenCalledWith({
          includeInactive: true,
        });
      });
    });

    test('calls getCategoryNovelCounts with correct IDs', async () => {
      renderCategories();

      await waitFor(() => {
        expect(categoryService.getCategoryNovelCounts).toHaveBeenCalledWith([
          1, 2,
        ]);
      });
    });

    test('handles API errors gracefully', async () => {
      categoryService.getAllCategories.mockRejectedValue(
        new Error('API Error')
      );

      renderCategories();

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    test('displays pagination controls', async () => {
      renderCategories();

      await waitFor(() => {
        // Check for pagination text in table - it should show "1-2 of 2 categories"
        expect(screen.getByText(/1-2 of 2/)).toBeInTheDocument();
      });
    });
  });

  describe('Color Generation', () => {
    test('generates consistent colors for categories', async () => {
      renderCategories();

      await waitFor(() => {
        // Colors should be generated based on category ID using getCategoryColor function
        // Check that code elements with hex colors are present
        const codeElements = document.querySelectorAll('code');
        const hexColors = Array.from(codeElements)
          .map((el) => el.textContent)
          .filter((text) => text.startsWith('#'));

        expect(hexColors.length).toBeGreaterThan(0);
        expect(hexColors).toContain('#eb2f96'); // Color for ID 1 (1 % 10 = 1)
        expect(hexColors).toContain('#fa8c16'); // Color for ID 2 (2 % 10 = 2)
      });
    });
  });

  describe('Custom actions and navigation', () => {
    test('custom action "View Novels" navigates with category query', async () => {
      const LocationDisplay = () => {
        const loc = useLocation();
        return (
          <div data-testid="location-display">
            {loc.pathname}
            {loc.search}
          </div>
        );
      };

      render(
        <MemoryRouter initialEntries={['/admin/categories']}>
          <Categories />
          <LocationDisplay />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Fantasy')).toBeInTheDocument();
      });

      const viewNovelsBtn = screen.getByTestId('novels-1');
      fireEvent.click(viewNovelsBtn);

      await waitFor(() => {
        expect(screen.getByTestId('location-display').textContent).toBe(
          '/admin/novels?category=1&categoryName=Fantasy'
        );
      });
    });

    test('toggle status failure shows error message', async () => {
      categoryService.toggleCategoryStatus.mockRejectedValueOnce(
        new Error('toggle failed')
      );

      render(
        <BrowserRouter>
          <Categories />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('toggle-1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('toggle-1'));

      await waitFor(() => {
        expect(require('antd').message.error).toHaveBeenCalledWith(
          'Failed to toggle category status: toggle failed'
        );
      });
    });
  });
});
