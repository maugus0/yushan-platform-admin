import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Reviews from './index';
import reviewService from '../../../services/admin/reviewservice';

// Mock antd components
jest.mock('antd', () => {
  const antd = jest.requireActual('antd');
  return {
    ...antd,
    Table: ({
      columns,
      dataSource,
      onChange,
      pagination,
      loading,
      ...props
    }) => {
      return (
        <div data-testid="table" {...props}>
          {loading && <div data-testid="table-loading">Loading...</div>}
          <div data-testid="table-body">
            {dataSource?.map((item, index) => (
              <div key={item.id || index} data-testid={`table-row-${index}`}>
                {columns?.map((col, colIndex) => (
                  <div
                    key={colIndex}
                    data-testid={`table-cell-${index}-${colIndex}`}
                  >
                    {col.render
                      ? col.render(item[col.dataIndex], item, index)
                      : item[col.dataIndex]}
                  </div>
                ))}
              </div>
            ))}
          </div>
          {pagination && (
            <div data-testid="table-pagination">
              <button
                data-testid="prev-page"
                onClick={() =>
                  onChange &&
                  onChange(
                    { ...pagination, current: pagination.current - 1 },
                    {},
                    {},
                    { action: 'paginate', currentDataSource: dataSource }
                  )
                }
                disabled={pagination.current <= 1}
              >
                Previous
              </button>
              <span data-testid="current-page">{pagination.current}</span>
              <button
                data-testid="next-page"
                onClick={() =>
                  onChange &&
                  onChange(
                    { ...pagination, current: pagination.current + 1 },
                    {},
                    {},
                    { action: 'paginate', currentDataSource: dataSource }
                  )
                }
                disabled={
                  pagination.current >=
                  Math.ceil(pagination.total / pagination.pageSize)
                }
              >
                Next
              </button>
            </div>
          )}
        </div>
      );
    },
    Modal: Object.assign(
      ({ children, visible, title, onOk, onCancel, ...props }) => {
        if (!visible) return null;
        return (
          <div data-testid="modal" {...props}>
            {title && <div data-testid="modal-title">{title}</div>}
            <div data-testid="modal-content">{children}</div>
            <button data-testid="modal-ok" onClick={onOk}>
              OK
            </button>
            <button data-testid="modal-cancel" onClick={onCancel}>
              Cancel
            </button>
          </div>
        );
      },
      { confirm: jest.fn() }
    ),
    Button: ({ children, onClick, loading, disabled, ...props }) => (
      <button
        data-testid="button"
        onClick={onClick}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? 'Loading...' : children}
      </button>
    ),
    Card: ({ children, title, ...props }) => (
      <div data-testid="card" {...props}>
        {title && <div data-testid="card-title">{title}</div>}
        <div data-testid="card-content">{children}</div>
      </div>
    ),
    Space: ({ children, ...props }) => (
      <div data-testid="space" {...props}>
        {children}
      </div>
    ),
    Rate: ({ value, disabled, ...props }) => (
      <div
        data-testid="rate"
        data-value={value}
        data-disabled={disabled}
        {...props}
      >
        {'★'.repeat(value || 0)}
      </div>
    ),
    message: {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
    },
    confirm: jest.fn(),
  };
});

// Mock Grid useBreakpoint
jest.mock('antd/lib/grid', () => ({
  useBreakpoint: () => ({ md: true }), // Mock as desktop view
}));

// Mock custom components
jest.mock('../../../components/admin/common', () => ({
  PageHeader: ({ title, subtitle, breadcrumbs, actions }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <div data-testid="breadcrumbs">
        {breadcrumbs?.map((crumb, index) => (
          <span key={index}>{crumb.title}</span>
        ))}
      </div>
      <div data-testid="page-actions">{actions}</div>
    </div>
  ),
  SearchBar: ({
    onSearch,
    placeholder,
    onClear,
    searchValue,
    _showFilter,
    _loading,
  }) => (
    <div data-testid="search-bar">
      <input
        data-testid="search-input"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => onSearch(e.target.value)}
      />
      <button data-testid="search-clear" onClick={onClear}>
        Clear
      </button>
    </div>
  ),
  FilterPanel: ({ _filters, onFilter, onClear, _collapsed, _showToggle }) => (
    <div data-testid="filter-panel">
      <select
        data-testid="rating-filter"
        onChange={(e) => onFilter({ rating: e.target.value })}
      >
        <option value="">All Ratings</option>
        <option value="1">1 Star</option>
        <option value="2">2 Stars</option>
        <option value="3">3 Stars</option>
        <option value="4">4 Stars</option>
        <option value="5">5 Stars</option>
      </select>
      <select
        data-testid="spoiler-filter"
        onChange={(e) => onFilter({ isSpoiler: e.target.value === 'true' })}
      >
        <option value="">All Spoiler Status</option>
        <option value="true">Spoiler</option>
        <option value="false">Not Spoiler</option>
      </select>
      <button data-testid="clear-filters" onClick={onClear}>
        Clear Filters
      </button>
    </div>
  ),
  StatusBadge: ({ status, children }) => (
    <span data-testid={`status-badge-${status}`}>{children}</span>
  ),
  LoadingSpinner: ({ tip }) => (
    <div data-testid="loading-spinner">{tip || 'Loading...'}</div>
  ),
  EmptyState: ({ title, description, actions }) => (
    <div data-testid="empty-state">
      <div>{title}</div>
      <div>{description}</div>
      <div data-testid="empty-state-actions">
        {actions?.map((action, index) => (
          <button key={index} onClick={action.onClick}>
            {action.children}
          </button>
        ))}
      </div>
    </div>
  ),
}));

// Mock review service
jest.mock('../../../services/admin/reviewservice', () => ({
  getAllReviews: jest.fn(),
  deleteReviewAdmin: jest.fn(),
}));

const mockReviews = [
  {
    id: 1,
    title: 'Great story!',
    content: 'This novel was amazing from start to finish.',
    rating: 5,
    username: 'reader1',
    novelTitle: 'The Lost Kingdom',
    novelId: 123,
    chapterId: null,
    isSpoiler: false,
    likes: 15,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 2,
    title: 'Not bad',
    content: 'Decent read, but could be better.',
    rating: 3,
    username: 'reader2',
    novelTitle: 'Mystic Adventures',
    novelId: 456,
    chapterId: 789,
    isSpoiler: true,
    likes: 8,
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
  },
];

describe('Reviews Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    reviewService.getAllReviews.mockResolvedValue({
      success: true,
      data: mockReviews,
      total: 25,
      totalPages: 3,
    });
    reviewService.deleteReviewAdmin.mockResolvedValue({
      success: true,
    });
  });

  describe('Initial Rendering', () => {
    test('renders loading state initially', () => {
      render(<Reviews />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    test('renders page header with correct title and breadcrumbs', async () => {
      render(<Reviews />);
      await waitFor(() => {
        expect(screen.getByTestId('page-header')).toBeInTheDocument();
        expect(screen.getByText('Reviews Management')).toBeInTheDocument();
        expect(
          screen.getByText('Moderate and manage user reviews')
        ).toBeInTheDocument();
      });
    });

    test('loads reviews data on mount', async () => {
      render(<Reviews />);
      await waitFor(() => {
        expect(reviewService.getAllReviews).toHaveBeenCalledWith({
          page: 0,
          pageSize: 10,
          sort: 'createTime',
          order: 'desc',
          search: '',
        });
      });
    });

    test('renders reviews table with data', async () => {
      render(<Reviews />);
      await waitFor(() => {
        expect(screen.getByTestId('table')).toBeInTheDocument();
        expect(screen.getAllByTestId(/^table-row-/)).toHaveLength(2);
      });
    });
  });

  describe('Data Fetching', () => {
    test('handles API error gracefully', async () => {
      reviewService.getAllReviews.mockRejectedValue(new Error('API Error'));
      render(<Reviews />);
      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      });
    });

    test('displays empty state when no reviews', async () => {
      reviewService.getAllReviews.mockResolvedValue({
        success: true,
        data: [],
        total: 0,
        totalPages: 0,
      });
      render(<Reviews />);
      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
        expect(screen.getByText('No Reviews Found')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    test('searches reviews by text', async () => {
      render(<Reviews />);
      await waitFor(() => {
        expect(screen.getByTestId('search-bar')).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'amazing' } });

      await waitFor(() => {
        expect(reviewService.getAllReviews).toHaveBeenCalledWith({
          page: 0,
          pageSize: 10,
          sort: 'createTime',
          order: 'desc',
          search: 'amazing',
        });
      });
    });

    test('clears search', async () => {
      render(<Reviews />);
      await waitFor(() => {
        expect(screen.getByTestId('search-bar')).toBeInTheDocument();
      });

      const clearButton = screen.getByTestId('search-clear');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(reviewService.getAllReviews).toHaveBeenCalledWith({
          page: 0,
          pageSize: 10,
          sort: 'createTime',
          order: 'desc',
          search: '',
        });
      });
    });
  });

  describe('Filtering', () => {
    test('filters reviews by rating', async () => {
      render(<Reviews />);
      await waitFor(() => {
        expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
      });

      const ratingFilter = screen.getByTestId('rating-filter');
      fireEvent.change(ratingFilter, { target: { value: '5' } });

      await waitFor(() => {
        expect(reviewService.getAllReviews).toHaveBeenCalledWith({
          page: 0,
          pageSize: 10,
          sort: 'createTime',
          order: 'desc',
          search: '',
          rating: 5,
        });
      });
    });

    test('filters reviews by spoiler status', async () => {
      render(<Reviews />);
      await waitFor(() => {
        expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
      });

      const spoilerFilter = screen.getByTestId('spoiler-filter');
      fireEvent.change(spoilerFilter, { target: { value: 'true' } });

      await waitFor(() => {
        expect(reviewService.getAllReviews).toHaveBeenCalledWith({
          page: 0,
          pageSize: 10,
          sort: 'createTime',
          order: 'desc',
          search: '',
          isSpoiler: true,
        });
      });
    });

    test('clears filters', async () => {
      render(<Reviews />);
      await waitFor(() => {
        expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
      });

      const clearButton = screen.getByTestId('clear-filters');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(reviewService.getAllReviews).toHaveBeenCalledWith({
          page: 0,
          pageSize: 10,
          sort: 'createTime',
          order: 'desc',
          search: '',
        });
      });
    });
  });

  describe('Pagination', () => {
    test('handles page changes', async () => {
      render(<Reviews />);
      await waitFor(() => {
        expect(screen.getByTestId('table-pagination')).toBeInTheDocument();
      });

      const nextPageButton = screen.getByTestId('next-page');
      fireEvent.click(nextPageButton);

      await waitFor(() => {
        expect(reviewService.getAllReviews).toHaveBeenCalledWith({
          page: 1,
          pageSize: 10,
          sort: 'createTime',
          order: 'desc',
          search: '',
        });
      });
    });

    test('disables previous button on first page', async () => {
      render(<Reviews />);
      await waitFor(() => {
        const prevButton = screen.getByTestId('prev-page');
        expect(prevButton).toBeDisabled();
      });
    });
  });

  describe('Delete Functionality', () => {
    test('opens delete confirmation modal when delete button is clicked', async () => {
      render(<Reviews />);
      await waitFor(() => {
        expect(screen.getAllByTestId(/^table-row-/)).toHaveLength(2);
      });

      const deleteButtons = screen.getAllByTestId('button');
      const deleteButton = deleteButtons.find((button) =>
        button.textContent?.includes('Delete')
      );
      expect(deleteButton).toBeInTheDocument();

      fireEvent.click(deleteButton);

      expect(require('antd').Modal.confirm).toHaveBeenCalledWith({
        title: 'Delete Review',
        content:
          'Are you sure you want to delete this review? This action cannot be undone.',
        okText: 'Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: expect.any(Function),
      });
    });

    test('deletes review successfully', async () => {
      // Mock confirm to call onOk
      const mockConfirm = require('antd').Modal.confirm;
      mockConfirm.mockImplementation(({ onOk }) => {
        onOk();
      });

      render(<Reviews />);
      await waitFor(() => {
        expect(screen.getAllByTestId(/^table-row-/)).toHaveLength(2);
      });

      const deleteButtons = screen.getAllByTestId('button');
      const deleteButton = deleteButtons.find((button) =>
        button.textContent?.includes('Delete')
      );

      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(reviewService.deleteReviewAdmin).toHaveBeenCalledWith(1);
      });
    });

    test('handles delete error', async () => {
      const mockConfirm = require('antd').Modal.confirm;
      mockConfirm.mockImplementation(({ onOk }) => {
        onOk();
      });

      reviewService.deleteReviewAdmin.mockRejectedValue(
        new Error('Delete failed')
      );

      render(<Reviews />);
      await waitFor(() => {
        expect(screen.getAllByTestId(/^table-row-/)).toHaveLength(2);
      });

      const deleteButtons = screen.getAllByTestId('button');
      const deleteButton = deleteButtons.find((button) =>
        button.textContent?.includes('Delete')
      );

      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(reviewService.deleteReviewAdmin).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('Responsive Design', () => {
    test('renders in desktop view (table)', async () => {
      render(<Reviews />);
      await waitFor(() => {
        expect(screen.getByTestId('table')).toBeInTheDocument();
        expect(screen.queryByTestId('card')).not.toBeInTheDocument();
      });
    });
  });

  describe('Table Columns', () => {
    test('renders correct columns', async () => {
      render(<Reviews />);
      await waitFor(() => {
        expect(screen.getByTestId('table')).toBeInTheDocument();
      });

      // Check if ratings are rendered
      expect(screen.getAllByTestId('rate')).toHaveLength(2);
      // Check if status badges are rendered
      expect(screen.getByTestId('status-badge-approved')).toBeInTheDocument();
      expect(screen.getByTestId('status-badge-flagged')).toBeInTheDocument();
    });

    test('renders action buttons', async () => {
      render(<Reviews />);
      await waitFor(() => {
        const buttons = screen.getAllByTestId('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling', () => {
    test('handles network errors during data fetch', async () => {
      reviewService.getAllReviews.mockRejectedValue(new Error('Network error'));
      render(<Reviews />);

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      });
    });
  });
});
