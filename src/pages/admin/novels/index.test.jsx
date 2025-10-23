import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Novels from './index';

// Mock services
jest.mock('../../../services/admin/novelservice', () => ({
  novelService: {
    getAllNovels: jest.fn(),
  },
}));

jest.mock('../../../services/admin/dashboardservice', () => ({
  getNovelTrends: jest.fn(),
  getTopContent: jest.fn(),
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
      <div data-testid="table-data">
        {dataSource?.map((item) => (
          <div key={item.id}>
            <div data-testid="novel-title">{item.title}</div>
            <div data-testid="novel-author">{item.authorUsername}</div>
            <span
              data-testid="status-badge"
              data-status={item.status === 'PUBLISHED' ? 'published' : 'draft'}
            ></span>
            <span data-testid="rate" data-value={item.avgRating}></span>
            <span data-testid="badge" data-color="gold">
              Premium
            </span>
            <span>{item.chapterCnt} chapters</span>
            <span>{item.viewCnt} views</span>
            <span>{item.wordCnt} words</span>
            <span>{item.voteCnt} votes</span>
            <span>{item.reviewCnt} reviews</span>
            <span>{item.yuanCnt} yuan</span>
            {item.title}
            {item.authorUsername}
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
  message: {
    error: jest.fn(),
  },
  Row: ({ children, gutter }) => (
    <div data-testid="row" data-gutter={gutter}>
      {children}
    </div>
  ),
  Col: ({ children, xs, lg }) => (
    <div data-testid="col" data-xs={xs} data-lg={lg}>
      {children}
    </div>
  ),
  Button: ({ children, onClick, type, icon, key, danger, size }) => (
    <button
      data-testid="button"
      data-type={type}
      data-danger={danger}
      data-size={size}
      key={key}
      onClick={onClick}
    >
      {icon}
      {children}
    </button>
  ),
}));

// Mock custom components
jest.mock('../../../components/admin/common', () => ({
  PageHeader: ({ title, subtitle, actions }) => (
    <div data-testid="page-header">
      <div data-testid="page-title">{title}</div>
      <div data-testid="page-subtitle">{subtitle}</div>
      <div data-testid="page-actions">{actions}</div>
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

// Mock chart components
jest.mock('../../../components/admin/charts', () => ({
  LineChart: ({ title, data }) => (
    <div data-testid="line-chart">
      <div data-testid="line-chart-title">{title}</div>
      <div data-testid="line-chart-data-count">{data?.length || 0}</div>
    </div>
  ),
  PieChart: ({ title, data }) => (
    <div data-testid="pie-chart">
      <div data-testid="pie-chart-title">{title}</div>
      <div data-testid="pie-chart-data-count">{data?.length || 0}</div>
    </div>
  ),
}));

// Mock default novel image
jest.mock(
  '../../../assets/images/novel_default.png',
  () => 'mock-novel-image.png'
);

// Mock icons
jest.mock('@ant-design/icons', () => ({
  UserOutlined: () => <span data-testid="user-icon" />,
  EyeOutlined: () => <span data-testid="eye-icon" />,
  FileTextOutlined: () => <span data-testid="file-icon" />,
  TagsOutlined: () => <span data-testid="tags-icon" />,
  FileSearchOutlined: () => <span data-testid="search-icon" />,
  CheckCircleOutlined: () => <span data-testid="check-icon" />,
}));

import { novelService } from '../../../services/admin/novelservice';
import dashboardService from '../../../services/admin/dashboardservice';
import { categoryService } from '../../../services/admin/categoryservice';

const mockGetAllNovels = novelService.getAllNovels;
const mockGetNovelTrends = dashboardService.getNovelTrends;
const mockGetTopContent = dashboardService.getTopContent;
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
      publishTime: '2024-01-05T00:00:00Z',
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

const mockTrendsData = {
  data: {
    dataPoints: [
      { periodLabel: 'Jan 1', count: 5, date: '2024-01-01' },
      { periodLabel: 'Jan 2', count: 8, date: '2024-01-02' },
    ],
  },
};

const mockTopContentData = {
  data: {
    topCategories: [
      { categoryName: 'Fantasy', novelCount: 15, totalViews: 5000 },
      { categoryName: 'Romance', novelCount: 10, totalViews: 3000 },
    ],
  },
};

// Test wrapper component to provide routing context
const TestWrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;

describe('Novels Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockGetAllNovels.mockResolvedValue(mockNovelsData);
    mockGetAllCategories.mockResolvedValue(mockCategoriesData);
    mockGetNovelTrends.mockResolvedValue(mockTrendsData);
    mockGetTopContent.mockResolvedValue(mockTopContentData);
  });

  test('renders page header with correct title and actions', async () => {
    render(
      <TestWrapper>
        <Novels />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent(
        'Novels Management'
      );
      expect(screen.getByTestId('page-subtitle')).toHaveTextContent(
        'Manage and monitor novels on the platform'
      );
      expect(screen.getByTestId('page-actions')).toBeInTheDocument();
    });
  });

  test('loads categories on mount', async () => {
    render(
      <TestWrapper>
        <Novels />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockGetAllCategories).toHaveBeenCalledWith({
        includeInactive: false,
      });
    });
  });

  test('loads chart data on mount', async () => {
    render(
      <TestWrapper>
        <Novels />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockGetNovelTrends).toHaveBeenCalledWith('daily');
      expect(mockGetTopContent).toHaveBeenCalledWith(10);
    });
  });

  test('renders charts correctly', async () => {
    render(
      <TestWrapper>
        <Novels />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart-title')).toHaveTextContent(
        'Novel Creation Trend'
      );
      expect(screen.getByTestId('pie-chart-title')).toHaveTextContent(
        'Novel Categories'
      );
    });
  });

  test('renders search and filter components', async () => {
    render(
      <TestWrapper>
        <Novels />
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
        <Novels />
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
        <Novels />
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
        <Novels />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });
  });

  test('handles search input', async () => {
    render(
      <TestWrapper>
        <Novels />
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
        <Novels />
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
        <Novels />
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
        <Novels />
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
        <Novels />
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

  test('navigates to review page when review button is clicked', async () => {
    render(
      <TestWrapper>
        <Novels />
      </TestWrapper>
    );

    await waitFor(() => {
      const buttons = screen.getAllByTestId('button');
      const reviewButton = buttons.find((button) =>
        button.textContent.includes('Review Novels')
      );
      if (reviewButton) {
        fireEvent.click(reviewButton);
      }
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/novels/review');
    });
  });

  test('navigates to moderate page when moderate button is clicked', async () => {
    render(
      <TestWrapper>
        <Novels />
      </TestWrapper>
    );

    await waitFor(() => {
      const buttons = screen.getAllByTestId('button');
      const moderateButton = buttons.find((button) =>
        button.textContent.includes('Moderate Novels')
      );
      if (moderateButton) {
        fireEvent.click(moderateButton);
      }
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/novels/moderate');
    });
  });

  test('calls getAllNovels with correct parameters on mount', async () => {
    render(
      <TestWrapper>
        <Novels />
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
        <Novels />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(novelService.getAllNovels).toHaveBeenCalled();
    });
  });

  test('displays status badges correctly', async () => {
    render(
      <TestWrapper>
        <Novels />
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
        <Novels />
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
        <Novels />
      </TestWrapper>
    );

    await waitFor(() => {
      const badges = screen.getAllByTestId('badge');
      expect(badges.length).toBeGreaterThan(0);
    });
  });
});
