import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ReviewNovels from './review';

// Mock services
jest.mock('../../../services/admin/novelservice', () => ({
  novelService: {
    getAllNovels: jest.fn(),
    approveNovel: jest.fn(),
    rejectNovel: jest.fn(),
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
            {columns?.map((col) => {
              if (col.render) {
                return (
                  <div key={col.key || col.dataIndex}>
                    {col.render(item[col.dataIndex], item)}
                  </div>
                );
              }
              return (
                <div key={col.key || col.dataIndex}>{item[col.dataIndex]}</div>
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
  Button: ({
    children,
    type,
    icon,
    loading,
    disabled,
    size,
    danger,
    onClick,
  }) => (
    <button
      data-testid="button"
      data-type={type}
      data-danger={danger}
      data-loading={loading}
      data-disabled={disabled}
      data-size={size}
      onClick={onClick}
    >
      {icon}
      {children}
    </button>
  ),
  Popconfirm: ({
    children,
    title,
    description,
    onConfirm,
    okText,
    cancelText,
  }) => (
    <div data-testid="popconfirm">
      <div data-testid="popconfirm-title">{title}</div>
      <div data-testid="popconfirm-description">{description}</div>
      <button data-testid="popconfirm-confirm" onClick={onConfirm}>
        {okText || 'OK'}
      </button>
      <button data-testid="popconfirm-cancel">{cancelText || 'Cancel'}</button>
      {children}
    </div>
  ),
  message: {
    error: jest.fn(),
    success: jest.fn(),
  },
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
  SearchBar: ({ onSearch, onClear: _onClear, searchValue }) => (
    <div data-testid="search-bar">
      <input
        data-testid="search-input"
        value={searchValue}
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  ),
  EmptyState: ({ title, description }) => (
    <div data-testid="empty-state">
      <div data-testid="empty-title">{title}</div>
      <div data-testid="empty-description">{description}</div>
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
  CheckOutlined: () => <span data-testid="check-icon" />,
  CloseOutlined: () => <span data-testid="close-icon" />,
  UserOutlined: () => <span data-testid="user-icon" />,
  EyeOutlined: () => <span data-testid="eye-icon" />,
  FileTextOutlined: () => <span data-testid="file-icon" />,
  TagsOutlined: () => <span data-testid="tags-icon" />,
}));

import { novelService } from '../../../services/admin/novelservice';

const mockGetAllNovels = novelService.getAllNovels;
const mockApproveNovel = novelService.approveNovel;
const mockRejectNovel = novelService.rejectNovel;

const mockReviewNovelsData = {
  data: [
    {
      id: '1',
      title: 'Test Novel Under Review',
      authorUsername: 'author1',
      authorId: 'auth1',
      status: 'UNDER_REVIEW',
      categoryName: 'Fantasy',
      chapterCnt: 15,
      viewCnt: 800,
      wordCnt: 30000,
      avgRating: 4.2,
      voteCnt: 80,
      reviewCnt: 12,
      isCompleted: false,
      yuanCnt: 5.5,
      synopsis: 'An epic fantasy tale...',
      uuid: 'uuid-12345',
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-15T00:00:00Z',
      publishTime: null,
      coverImgUrl: 'data:image/png;base64,test',
    },
    {
      id: '2',
      title: 'Another Novel Under Review',
      authorUsername: 'author2',
      authorId: 'auth2',
      status: 'UNDER_REVIEW',
      categoryName: 'Romance',
      chapterCnt: 8,
      viewCnt: 300,
      wordCnt: 15000,
      avgRating: 3.9,
      voteCnt: 35,
      reviewCnt: 6,
      isCompleted: false,
      yuanCnt: 0,
      synopsis: 'A romantic story...',
      uuid: 'uuid-67890',
      createTime: '2024-01-10T00:00:00Z',
      updateTime: '2024-01-12T00:00:00Z',
      coverImgUrl: 'data:image/png;base64,test2',
    },
  ],
  page: 1,
  total: 2,
  pageSize: 10,
};

// Test wrapper component to provide routing context
const TestWrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;

describe('ReviewNovels Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockGetAllNovels.mockResolvedValue(mockReviewNovelsData);
    mockApproveNovel.mockResolvedValue({
      message: 'Novel approved and published successfully',
    });
    mockRejectNovel.mockResolvedValue({
      message: 'Novel rejected successfully',
    });
  });

  test('renders page header with correct title and breadcrumbs', async () => {
    render(
      <TestWrapper>
        <ReviewNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent(
        'Review Novels'
      );
      expect(screen.getByTestId('page-subtitle')).toHaveTextContent(
        'Review and approve novels submitted by authors'
      );
      expect(screen.getByTestId('page-breadcrumbs')).toBeInTheDocument();
    });
  });

  test('renders search bar component', async () => {
    render(
      <TestWrapper>
        <ReviewNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('search-bar')).toBeInTheDocument();
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });
  });

  test('renders table with novels under review', async () => {
    render(
      <TestWrapper>
        <ReviewNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockGetAllNovels).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId('table')).toBeInTheDocument();
      expect(screen.getByTestId('table-data-count')).toHaveTextContent('2');
      expect(screen.getByText('Test Novel Under Review')).toBeInTheDocument();
      expect(
        screen.getByText('Another Novel Under Review')
      ).toBeInTheDocument();
    });
  });

  test('shows loading state initially', () => {
    mockGetAllNovels.mockImplementation(() => new Promise(() => {}));

    render(
      <TestWrapper>
        <ReviewNovels />
      </TestWrapper>
    );

    expect(
      screen.getByText('Loading novels under review...')
    ).toBeInTheDocument();
  });

  test('displays empty state when no novels under review', async () => {
    mockGetAllNovels.mockResolvedValue({
      data: [],
      page: 1,
      total: 0,
      pageSize: 10,
    });

    render(
      <TestWrapper>
        <ReviewNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('empty-title')).toHaveTextContent(
        'No Novels Under Review'
      );
    });
  });

  test('handles search input', async () => {
    render(
      <TestWrapper>
        <ReviewNovels />
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

  test('handles table pagination', async () => {
    render(
      <TestWrapper>
        <ReviewNovels />
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

  test('calls getAllNovels with UNDER_REVIEW status filter', async () => {
    render(
      <TestWrapper>
        <ReviewNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockGetAllNovels).toHaveBeenCalledWith({
        page: 0,
        size: 10,
        search: '',
        sort: 'createTime',
        order: 'desc',
        status: 'UNDER_REVIEW',
      });
    });
  });

  test('handles API error gracefully', async () => {
    mockGetAllNovels.mockRejectedValue(new Error('API Error'));

    render(
      <TestWrapper>
        <ReviewNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockGetAllNovels).toHaveBeenCalled();
    });
  });

  test('displays ratings correctly', async () => {
    render(
      <TestWrapper>
        <ReviewNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      const rates = screen.getAllByTestId('rate');
      expect(rates).toHaveLength(2);
    });
  });

  test('displays category tags correctly', async () => {
    render(
      <TestWrapper>
        <ReviewNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      const tags = screen.getAllByTestId('tag');
      expect(tags.length).toBeGreaterThan(0);
    });
  });

  test('displays premium badges for paid novels', async () => {
    render(
      <TestWrapper>
        <ReviewNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      const badges = screen.getAllByTestId('badge');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  test('renders approve and reject buttons for each novel', async () => {
    render(
      <TestWrapper>
        <ReviewNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      const buttons = screen.getAllByTestId('button');
      expect(buttons.length).toBeGreaterThan(0);
      // Should have approve and reject buttons for each novel
      const approveButtons = buttons.filter((btn) =>
        btn.textContent.includes('Approve')
      );
      const rejectButtons = buttons.filter((btn) =>
        btn.textContent.includes('Reject')
      );
      expect(approveButtons.length).toBeGreaterThan(0);
      expect(rejectButtons.length).toBeGreaterThan(0);
    });
  });

  test('handles approve novel action', async () => {
    render(
      <TestWrapper>
        <ReviewNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      const confirmButtons = screen.getAllByTestId('popconfirm-confirm');
      // First confirm button should be for approve action
      fireEvent.click(confirmButtons[0]);
    });

    await waitFor(() => {
      expect(mockApproveNovel).toHaveBeenCalledWith('1');
    });
  });

  test('handles reject novel action', async () => {
    render(
      <TestWrapper>
        <ReviewNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      const confirmButtons = screen.getAllByTestId('popconfirm-confirm');
      // Second confirm button should be for reject action
      fireEvent.click(confirmButtons[1]);
    });

    await waitFor(() => {
      expect(mockRejectNovel).toHaveBeenCalledWith('1');
    });
  });

  test('displays novel UUID correctly', async () => {
    render(
      <TestWrapper>
        <ReviewNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('uuid-123...')).toBeInTheDocument();
      expect(screen.getByText('uuid-678...')).toBeInTheDocument();
    });
  });

  test('displays synopsis correctly', async () => {
    render(
      <TestWrapper>
        <ReviewNovels />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('An epic fantasy tale...')).toBeInTheDocument();
      expect(screen.getByText('A romantic story...')).toBeInTheDocument();
    });
  });
});
