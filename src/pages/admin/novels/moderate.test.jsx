import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ModerateNovels from './moderate';

// Mock services
jest.mock('../../../services/admin/novelservice', () => ({
  novelService: {
    getAllNovels: jest.fn(),
    hideNovel: jest.fn(),
    unhideNovel: jest.fn(),
    archiveNovel: jest.fn(),
  },
}));

jest.mock('../../../services/admin/categoryservice', () => ({
  categoryService: {
    getAllCategories: jest.fn(),
  },
}));

// Mock React Router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }) => <div>{children}</div>,
  useNavigate: () => mockNavigate,
}));

// Mock antd components
jest.mock('antd', () => ({
  Space: ({ children, direction, size, style }) => (
    <div
      data-testid="space"
      data-direction={direction}
      data-size={size}
      style={style}
    >
      {children}
    </div>
  ),
  Table: ({
    columns,
    dataSource,
    loading,
    pagination,
    onChange,
    rowKey: _rowKey,
    scroll: _scroll,
  }) => (
    <div data-testid="table">
      <div data-testid="table-loading">{loading ? 'true' : 'false'}</div>
      <div data-testid="table-data-count">{dataSource?.length || 0}</div>
      <div data-testid="table-columns">
        {columns?.map((col) => (
          <div key={col.key || col.dataIndex}>{col.title}</div>
        ))}
      </div>

      <div data-testid="table-rows">
        {dataSource?.map((item) => (
          <div data-testid={`row-${item.id}`} key={item.id}>
            {columns?.map((col) => {
              const key = col.key || col.dataIndex;
              const value = col.dataIndex ? item[col.dataIndex] : undefined;
              return (
                <div data-testid={`cell-${key}`} key={key}>
                  {col.render ? col.render(value, item) : value}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div data-testid="table-pagination">
        {pagination?.showTotal
          ? pagination.showTotal(pagination.total, [
              1,
              Math.min(pagination.pageSize, pagination.total),
            ])
          : ''}
      </div>
      <button
        data-testid="table-change"
        onClick={() =>
          onChange(
            { current: 2, pageSize: 10 },
            {},
            { field: 'createTime', order: 'descend' }
          )
        }
      >
        Change Table
      </button>
    </div>
  ),
  Badge: ({ color, text, style }) => (
    <span data-testid="badge" data-color={color} style={style}>
      {text}
    </span>
  ),
  Rate: ({ value, disabled, size }) => (
    <div
      data-testid="rate"
      data-value={value}
      data-disabled={disabled}
      data-size={size}
    >
      {value}
    </div>
  ),
  Tag: ({ children, color }) => (
    <span data-testid="tag" data-color={color}>
      {children}
    </span>
  ),
  message: {
    error: jest.fn(),
    success: jest.fn(),
  },
  Button: ({
    children,
    onClick,
    type,
    icon,
    key,
    danger,
    size,
    loading,
    disabled,
    block,
  }) => (
    <button
      data-testid="button"
      data-type={type}
      data-danger={danger}
      data-size={size}
      data-loading={loading ? 'true' : 'false'}
      data-disabled={disabled ? 'true' : 'false'}
      data-block={block ? 'true' : 'false'}
      key={key}
      onClick={onClick}
    >
      {icon}
      {children}
    </button>
  ),
  Popconfirm: ({ children, onConfirm }) => (
    <div data-testid="popconfirm">
      <div data-testid="popconfirm-trigger">{children}</div>
      <button data-testid="popconfirm-confirm" onClick={onConfirm}>
        Confirm
      </button>
    </div>
  ),
}));

// Mock custom components
jest.mock('../../../components/admin/common', () => ({
  PageHeader: ({ title, subtitle, breadcrumbs }) => (
    <div data-testid="page-header">
      <div data-testid="page-title">{title}</div>
      <div data-testid="page-subtitle">{subtitle}</div>
      <div data-testid="page-breadcrumbs">
        {breadcrumbs?.map((crumb) => (
          <span key={crumb.title}>{crumb.title}</span>
        ))}
      </div>
    </div>
  ),
  SearchBar: ({ onSearch, onCategoryChange, selectedCategory, categories }) => (
    <div data-testid="search-bar">
      <input
        data-testid="search-input"
        onChange={(e) => onSearch(e.target.value)}
      />
      <select
        data-testid="category-select"
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        {categories?.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>
    </div>
  ),
  FilterPanel: ({ onFilter, onClear }) => (
    <div data-testid="filter-panel">
      <button
        data-testid="apply-filters"
        onClick={() => onFilter({ status: 'PUBLISHED' })}
      >
        Apply Filters
      </button>
      <button data-testid="clear-filters" onClick={onClear}>
        Clear Filters
      </button>
    </div>
  ),
  StatusBadge: ({ status }) => (
    <span data-testid="status-badge" data-status={status}>
      {status}
    </span>
  ),
  EmptyState: ({ title }) => (
    <div data-testid="empty-state">
      <div data-testid="empty-title">{title}</div>
    </div>
  ),
  LoadingSpinner: ({ tip }) => (
    <div data-testid="loading-spinner">{tip || 'Loading...'}</div>
  ),
}));

// Mock default novel image
jest.mock(
  '../../../assets/images/novel_default.png',
  () => 'mock-novel-image.png'
);

// Mock icons
jest.mock('@ant-design/icons', () => ({
  EyeInvisibleOutlined: () => <span data-testid="eye-invisible-icon" />,
  EyeOutlined: () => <span data-testid="eye-icon" />,
  InboxOutlined: () => <span data-testid="inbox-icon" />,
  UserOutlined: () => <span data-testid="user-icon" />,
  FileTextOutlined: () => <span data-testid="file-icon" />,
  TagsOutlined: () => <span data-testid="tags-icon" />,
}));

import { novelService } from '../../../services/admin/novelservice';
import { categoryService } from '../../../services/admin/categoryservice';

const mockGetAllNovels = novelService.getAllNovels;
const mockHideNovel = novelService.hideNovel;
const mockUnhideNovel = novelService.unhideNovel;
const mockArchiveNovel = novelService.archiveNovel;
const mockGetAllCategories = categoryService.getAllCategories;

const mockNovelsData = {
  data: [
    {
      id: '1',
      title: 'Test Novel 1',
      authorUsername: 'author1',
      authorId: 'auth1',
      status: 'PUBLISHED',
      categoryName: 'Fantasy',
      chapterCnt: 25,
      viewCnt: 1500,
      wordCnt: 50000,
      avgRating: 4.5,
      voteCnt: 120,
      reviewCnt: 15,
      isCompleted: true,
      yuanCnt: 10.5,
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-15T00:00:00Z',
      coverImgUrl: 'data:image/png;base64,test',
    },
    {
      id: '2',
      title: 'Test Novel 2',
      authorUsername: 'author2',
      authorId: 'auth2',
      status: 'DRAFT',
      categoryName: 'Romance',
      chapterCnt: 10,
      viewCnt: 500,
      wordCnt: 25000,
      avgRating: 3.8,
      voteCnt: 45,
      reviewCnt: 8,
      isCompleted: false,
      yuanCnt: 0,
      createTime: '2024-01-10T00:00:00Z',
      updateTime: '2024-01-12T00:00:00Z',
    },
  ],
  page: 1,
  total: 2,
  pageSize: 10,
};

const mockCategoriesData = {
  success: true,
  data: [
    { id: 'cat1', name: 'Fantasy' },
    { id: 'cat2', name: 'Romance' },
  ],
};

// Test wrapper component to provide routing context
const TestWrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;

describe('ModerateNovels Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockGetAllNovels.mockResolvedValue(mockNovelsData);
    mockGetAllCategories.mockResolvedValue(mockCategoriesData);
    mockHideNovel.mockResolvedValue({ message: 'Novel hidden successfully' });
    mockUnhideNovel.mockResolvedValue({
      message: 'Novel unhidden successfully',
    });
    mockArchiveNovel.mockResolvedValue({
      message: 'Novel archived successfully',
    });
  });

  test('renders page header with correct title and breadcrumbs', async () => {
    render(
      <TestWrapper>
        <ModerateNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent(
        'Moderate Novels'
      );
      expect(screen.getByTestId('page-subtitle')).toHaveTextContent(
        'Review and moderate all novels on the platform'
      );
      expect(screen.getByTestId('page-breadcrumbs')).toBeInTheDocument();
    });
  });

  test('loads categories on mount', async () => {
    render(
      <TestWrapper>
        <ModerateNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockGetAllCategories).toHaveBeenCalledWith({
        includeInactive: false,
      });
    });
  });

  test('renders search and filter components', async () => {
    render(
      <TestWrapper>
        <ModerateNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('search-bar')).toBeInTheDocument();
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
      expect(screen.getByTestId('category-select')).toBeInTheDocument();
    });
  });

  test('renders table with novels data', async () => {
    render(
      <TestWrapper>
        <ModerateNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockGetAllNovels).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId('table')).toBeInTheDocument();
      expect(screen.getByTestId('table-data-count')).toHaveTextContent('2');
      expect(screen.getByText('Test Novel 1')).toBeInTheDocument();
      expect(screen.getByText('Test Novel 2')).toBeInTheDocument();
    });
  });

  test('shows loading state initially', () => {
    mockGetAllNovels.mockImplementation(() => new Promise(() => {}));

    render(
      <TestWrapper>
        <ModerateNovels />
      </TestWrapper>
    );

    expect(screen.getByText('Loading novels...')).toBeInTheDocument();
  });

  test('displays empty state when no novels', async () => {
    mockGetAllNovels.mockResolvedValue({
      data: [],
      page: 1,
      total: 0,
      pageSize: 10,
    });

    render(
      <TestWrapper>
        <ModerateNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });
  });

  test('handles search input', async () => {
    render(
      <TestWrapper>
        <ModerateNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'test novel' } });
    });

    await waitFor(() => {
      expect(mockGetAllNovels).toHaveBeenCalled();
    });
  });

  test('handles category filter change', async () => {
    render(
      <TestWrapper>
        <ModerateNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      const categorySelect = screen.getByTestId('category-select');
      fireEvent.change(categorySelect, { target: { value: 'cat1' } });
    });

    await waitFor(() => {
      expect(mockGetAllNovels).toHaveBeenCalled();
    });
  });

  test('handles filter application', async () => {
    render(
      <TestWrapper>
        <ModerateNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      const applyButton = screen.getByTestId('apply-filters');
      fireEvent.click(applyButton);
    });

    await waitFor(() => {
      expect(mockGetAllNovels).toHaveBeenCalled();
    });
  });

  test('handles filter clearing', async () => {
    render(
      <TestWrapper>
        <ModerateNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      const clearButton = screen.getByTestId('clear-filters');
      fireEvent.click(clearButton);
    });

    await waitFor(() => {
      expect(mockGetAllNovels).toHaveBeenCalled();
    });
  });

  test('handles table pagination', async () => {
    render(
      <TestWrapper>
        <ModerateNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      const changeButton = screen.getByTestId('table-change');
      fireEvent.click(changeButton);
    });

    await waitFor(() => {
      expect(mockGetAllNovels).toHaveBeenCalled();
    });
  });

  test('calls getAllNovels with correct parameters on mount', async () => {
    render(
      <TestWrapper>
        <ModerateNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockGetAllNovels).toHaveBeenCalledWith({
        page: 0,
        size: 10,
        search: '',
        sort: 'createTime',
        order: 'desc',
        category: '',
        status: '',
        authorName: '',
        authorId: '',
      });
    });
  });

  test('handles API error gracefully', async () => {
    mockGetAllNovels.mockRejectedValue(new Error('API Error'));

    render(
      <TestWrapper>
        <ModerateNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(novelService.getAllNovels).toHaveBeenCalled();
    });
  });

  test('displays status badges correctly', async () => {
    render(
      <TestWrapper>
        <ModerateNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      const badges = screen.getAllByTestId('status-badge');
      expect(badges).toHaveLength(2);
    });
  });

  test('displays ratings correctly', async () => {
    render(
      <TestWrapper>
        <ModerateNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      const rates = screen.getAllByTestId('rate');
      expect(rates).toHaveLength(2);
    });
  });

  test('displays premium badges for paid novels', async () => {
    render(
      <TestWrapper>
        <ModerateNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      const badges = screen.getAllByTestId('badge');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  test('displays category tags correctly', async () => {
    render(
      <TestWrapper>
        <ModerateNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      const tags = screen.getAllByTestId('tag');
      expect(tags.length).toBeGreaterThan(0);
    });
  });
});

describe('ModerateNovels actions coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllNovels.mockResolvedValue(mockNovelsData);
    mockGetAllCategories.mockResolvedValue(mockCategoriesData);
    mockHideNovel.mockResolvedValue({ message: 'Novel hidden successfully' });
    mockUnhideNovel.mockResolvedValue({
      message: 'Novel unhidden successfully',
    });
    mockArchiveNovel.mockResolvedValue({
      message: 'Novel archived successfully',
    });
  });

  test('hide/unhide/archive success calls services and shows success message', async () => {
    render(
      <TestWrapper>
        <ModerateNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('row-1')).toBeInTheDocument();
    });

    const row = screen.getByTestId('row-1');
    const confirms = within(row).getAllByTestId('popconfirm-confirm');

    // Hide
    fireEvent.click(confirms[0]);
    await waitFor(() => {
      expect(mockHideNovel).toHaveBeenCalledWith('1');
      expect(require('antd').message.success).toHaveBeenCalled();
    });

    // Unhide
    fireEvent.click(confirms[1]);
    await waitFor(() => {
      expect(mockUnhideNovel).toHaveBeenCalledWith('1');
      expect(require('antd').message.success).toHaveBeenCalled();
    });

    // Archive
    fireEvent.click(confirms[2]);
    await waitFor(() => {
      expect(mockArchiveNovel).toHaveBeenCalledWith('1');
      expect(require('antd').message.success).toHaveBeenCalled();
    });
  });

  test('action loading state toggles during async operation', async () => {
    let resolveHide;
    mockHideNovel.mockReturnValue(new Promise((res) => (resolveHide = res)));

    render(
      <TestWrapper>
        <ModerateNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('row-1')).toBeInTheDocument();
    });

    const row = screen.getByTestId('row-1');
    const confirms = within(row).getAllByTestId('popconfirm-confirm');

    fireEvent.click(confirms[0]);

    const actionsCell = within(row).getByTestId('cell-actions');
    const buttons = within(actionsCell).getAllByTestId('button');
    expect(buttons[0]).toHaveAttribute('data-loading', 'true');

    resolveHide({ message: 'ok' });
    await waitFor(() => {
      expect(buttons[0]).toHaveAttribute('data-loading', 'false');
    });
  });

  test('action failure shows error message', async () => {
    mockHideNovel.mockRejectedValueOnce(new Error('fail hide'));
    mockUnhideNovel.mockRejectedValueOnce(new Error('fail unhide'));
    mockArchiveNovel.mockRejectedValueOnce(new Error('fail archive'));

    render(
      <TestWrapper>
        <ModerateNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('row-1')).toBeInTheDocument();
    });

    const row = screen.getByTestId('row-1');
    const confirms = within(row).getAllByTestId('popconfirm-confirm');

    fireEvent.click(confirms[0]);
    fireEvent.click(confirms[1]);
    fireEvent.click(confirms[2]);

    await waitFor(() => {
      const { message } = require('antd');
      expect(message.error).toHaveBeenCalled();
    });
  });

  test('archived row shows Archived tag and no action buttons', async () => {
    mockGetAllNovels.mockResolvedValueOnce({
      data: [
        {
          ...mockNovelsData.data[0],
          id: '9',
          status: 'ARCHIVED',
        },
      ],
      page: 1,
      total: 1,
      pageSize: 10,
    });

    render(
      <TestWrapper>
        <ModerateNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('row-9')).toBeInTheDocument();
    });

    const row = screen.getByTestId('row-9');
    const actionsCell = within(row).getByTestId('cell-actions');

    expect(within(actionsCell).getByText('Archived')).toBeInTheDocument();

    expect(within(actionsCell).queryByTestId('popconfirm')).toBeNull();
  });

  test('novel cover fallback to default image when not data url', async () => {
    render(
      <TestWrapper>
        <ModerateNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('row-2')).toBeInTheDocument();
    });

    const infoCell = within(screen.getByTestId('row-2')).getByTestId(
      'cell-title'
    );
    const img = within(infoCell).getByRole('img');
    expect(img.getAttribute('src')).toBe('mock-novel-image.png');
  });
});
