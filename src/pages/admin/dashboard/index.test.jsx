import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from './index';
import dashboardService from '../../../services/admin/dashboardservice';
import analyticsService from '../../../services/admin/analyticsservice';

// Mock antd components with minimal implementations
jest.mock('antd', () => ({
  Layout: {
    Header: ({ children, ...props }) => (
      <div data-testid="layout-header" {...props}>
        {children}
      </div>
    ),
  },
  Collapse: {
    Panel: ({ children, header, ...props }) => (
      <div data-testid="collapse-panel" {...props}>
        <div data-testid="collapse-header">{header}</div>
        <div data-testid="collapse-content">{children}</div>
      </div>
    ),
  },
  Select: {
    Option: ({ children, ...props }) => (
      <option data-testid="select-option" {...props}>
        {children}
      </option>
    ),
  },
  DatePicker: {
    RangePicker: () => <input data-testid="date-range-picker" type="date" />,
  },
  Form: Object.assign(() => <form data-testid="form" />, {
    useForm: () => [
      {
        setFieldsValue: jest.fn(),
        validateFields: jest.fn(),
        getFieldsValue: jest.fn(),
        resetFields: jest.fn(),
      },
      jest.fn(),
    ],
    Item: () => <div data-testid="form-item" />,
  }),
  Input: () => <input data-testid="input" />,
  InputNumber: () => <input data-testid="input-number" type="number" />,
  Checkbox: {
    Group: () => <div data-testid="checkbox-group" />,
  },
  Radio: Object.assign(
    ({ children, value, ...props }) => (
      <label data-testid="radio" {...props}>
        <input type="radio" value={value} />
        {children}
      </label>
    ),
    {
      Group: ({ children }) => <div data-testid="radio-group">{children}</div>,
    }
  ),
  Slider: () => <input data-testid="slider" type="range" />,
  Divider: () => <hr data-testid="divider" />,
  Grid: {
    useBreakpoint: jest.fn(() => ({
      xs: true,
      sm: true,
      md: false,
      lg: false,
      xl: false,
    })),
  },
  Row: ({ children, gutter: _gutter, ...props }) => (
    <div data-testid="row" {...props}>
      {children}
    </div>
  ),
  Col: ({
    children,
    xs: _xs,
    sm: _sm,
    md: _md,
    lg: _lg,
    xl: _xl,
    ...props
  }) => (
    <div data-testid="col" {...props}>
      {children}
    </div>
  ),
  Card: ({ children, title, bordered: _bordered, bodyStyle, ...props }) => (
    <div data-testid="card" {...props}>
      {title && <div data-testid="card-title">{title}</div>}
      <div data-testid="card-body" style={bodyStyle}>
        {children}
      </div>
    </div>
  ),
  Typography: {
    Title: ({ children, level, style, ...props }) => (
      <div
        data-testid={`typography-title-${level || 1}`}
        style={style}
        {...props}
      >
        {children}
      </div>
    ),
    Text: ({ children, ...props }) => (
      <div data-testid="typography-text" {...props}>
        {children}
      </div>
    ),
  },
  Space: ({ children, direction, _size, ...props }) => (
    <div data-testid="space" data-direction={direction} {...props}>
      {children}
    </div>
  ),
  Button: ({
    children,
    type,
    icon,
    block,
    _size,
    onClick,
    style,
    ...props
  }) => (
    <button
      data-testid="button"
      data-type={type}
      data-block={block}
      data-size={_size}
      onClick={onClick}
      style={style}
      {...props}
    >
      {icon}
      {children}
    </button>
  ),

  message: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

// Mock @ant-design/icons
jest.mock('@ant-design/icons', () => ({
  UserOutlined: () => <span data-testid="user-icon">UserIcon</span>,
  BookOutlined: () => <span data-testid="book-icon">BookIcon</span>,
  StarOutlined: () => <span data-testid="star-icon">StarIcon</span>,
  EyeOutlined: () => <span data-testid="eye-icon">EyeIcon</span>,
  CommentOutlined: () => <span data-testid="comment-icon">CommentIcon</span>,
  TrophyOutlined: () => <span data-testid="trophy-icon">TrophyIcon</span>,
  RiseOutlined: () => <span data-testid="rise-icon">RiseIcon</span>,
}));

// Mock custom chart components
jest.mock('../../../components/admin/charts', () => ({
  StatCard: ({ title, value, prefix, suffix, valueStyle, trend }) => (
    <div data-testid="stat-card">
      <div data-testid="stat-title">{title}</div>
      <div data-testid="stat-value" style={valueStyle}>
        {prefix}
        {value}
        {suffix}
      </div>
      {trend && (
        <div data-testid="stat-trend">
          {trend.value}% {trend.isPositive ? '↑' : '↓'}
        </div>
      )}
    </div>
  ),
  LineChart: ({ title, subtitle, data, lines, height: _height }) => (
    <div data-testid="line-chart">
      <div data-testid="chart-title">{title}</div>
      <div data-testid="chart-subtitle">{subtitle}</div>
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-lines">{JSON.stringify(lines)}</div>
    </div>
  ),
  AreaChart: ({ title, subtitle, data, areas, height: _height }) => (
    <div data-testid="area-chart">
      <div data-testid="chart-title">{title}</div>
      <div data-testid="chart-subtitle">{subtitle}</div>
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-areas">{JSON.stringify(areas)}</div>
    </div>
  ),
  BarChart: ({
    title,
    subtitle,
    data,
    bars,
    layout: _layout,
    height: _height,
  }) => (
    <div data-testid="bar-chart">
      <div data-testid="chart-title">{title}</div>
      <div data-testid="chart-subtitle">{subtitle}</div>
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-bars">{JSON.stringify(bars)}</div>
    </div>
  ),
  PieChart: ({ title, subtitle, data, height: _height }) => (
    <div data-testid="pie-chart">
      <div data-testid="chart-title">{title}</div>
      <div data-testid="chart-subtitle">{subtitle}</div>
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
    </div>
  ),
}));

// Mock LoadingSpinner component
jest.mock('../../../components/admin/common/loadingspinner', () => {
  return function MockLoadingSpinner({ tip }) {
    return <div data-testid="loading-spinner">{tip || 'Loading...'}</div>;
  };
});

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock dashboard service
jest.mock('../../../services/admin/dashboardservice', () => ({
  getDashboardStats: jest.fn(),
  getUserTrends: jest.fn(),
  getNovelTrends: jest.fn(),
  getReadingActivity: jest.fn(),
  getTopContent: jest.fn(),
}));

// Mock analytics service
jest.mock('../../../services/admin/analyticsservice', () => ({
  getPlatformDAU: jest.fn(),
}));

// Mock data
const mockStats = {
  totalUsers: 1250,
  activeUsers: 890,
  totalNovels: 456,
  publishedNovels: 423,
  completedNovels: 234,
  totalChapters: 3456,
  totalWords: 1250000,
  totalViews: 456789,
  totalComments: 12345,
  totalReviews: 6789,
  totalVotes: 23456,
  averageRating: 4.2,
  authors: 89,
  admins: 5,
  dailyActiveUsers: 234,
  weeklyActiveUsers: 1456,
  monthlyActiveUsers: 5678,
  userGrowthRate: 12.5,
  contentGrowthRate: 8.3,
  engagementGrowthRate: 15.7,
};

const mockUserTrends = [
  { periodLabel: 'Jan 1', count: 100, date: '2024-01-01' },
  { periodLabel: 'Jan 2', count: 120, date: '2024-01-02' },
  { periodLabel: 'Jan 3', count: 110, date: '2024-01-03' },
];

const mockNovelTrends = [
  { periodLabel: 'Jan 1', count: 5, date: '2024-01-01' },
  { periodLabel: 'Jan 2', count: 8, date: '2024-01-02' },
  { periodLabel: 'Jan 3', count: 6, date: '2024-01-03' },
];

const mockReadingActivity = [
  {
    periodLabel: 'Jan 1',
    views: 1000,
    comments: 50,
    reviews: 25,
    votes: 100,
    date: '2024-01-01',
  },
  {
    periodLabel: 'Jan 2',
    views: 1200,
    comments: 60,
    reviews: 30,
    votes: 120,
    date: '2024-01-02',
  },
];

const mockTopContent = {
  topNovels: [
    {
      title: 'Amazing Novel Title That Is Very Long',
      viewCount: 5000,
      authorName: 'Author One',
      rating: 4.5,
    },
    {
      title: 'Short Title',
      viewCount: 3000,
      authorName: 'Author Two',
      rating: 4.2,
    },
  ],
  topCategories: [
    {
      categoryName: 'Romance',
      novelCount: 50,
      totalViews: 25000,
      averageRating: 4.3,
      totalVotes: 500,
    },
    {
      categoryName: 'Fantasy',
      novelCount: 45,
      totalViews: 22000,
      averageRating: 4.1,
      totalVotes: 450,
    },
  ],
  topAuthors: [
    {
      authorId: '1',
      authorName: 'Author One',
      novelCount: 10,
      totalViews: 15000,
      averageRating: 4.5,
      totalVotes: 300,
    },
    {
      authorId: '2',
      authorName: 'Author Two',
      novelCount: 8,
      totalViews: 12000,
      averageRating: 4.3,
      totalVotes: 250,
    },
  ],
};

const mockDauData = {
  dau: 234,
  wau: 1456,
  mau: 5678,
  date: '2024-01-15',
  hourlyBreakdown: [
    { hour: '0', activeUsers: 10, newUsers: 2, readingSessions: 8 },
    { hour: '6', activeUsers: 45, newUsers: 5, readingSessions: 35 },
    { hour: '12', activeUsers: 89, newUsers: 8, readingSessions: 67 },
    { hour: '18', activeUsers: 156, newUsers: 12, readingSessions: 98 },
  ],
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock responses
    dashboardService.getDashboardStats.mockResolvedValue({
      success: true,
      data: mockStats,
    });
    dashboardService.getUserTrends.mockResolvedValue({
      success: true,
      data: { dataPoints: mockUserTrends },
    });
    dashboardService.getNovelTrends.mockResolvedValue({
      success: true,
      data: { dataPoints: mockNovelTrends },
    });
    dashboardService.getReadingActivity.mockResolvedValue({
      success: true,
      data: { dataPoints: mockReadingActivity },
    });
    dashboardService.getTopContent.mockResolvedValue({
      success: true,
      data: mockTopContent,
    });
    analyticsService.getPlatformDAU.mockResolvedValue({
      success: true,
      data: mockDauData,
    });
  });

  describe('Initial Rendering', () => {
    test('renders loading spinner initially', () => {
      render(<Dashboard />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    });

    test('renders dashboard overview header after loading', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        expect(screen.getByTestId('typography-title-2')).toHaveTextContent(
          'Dashboard Overview'
        );
        expect(
          screen.getByText(
            "Welcome to Yushan Admin Panel. Here's what's happening on your platform."
          )
        ).toBeInTheDocument();
      });
    });

    test('loads all dashboard data on mount', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        expect(dashboardService.getDashboardStats).toHaveBeenCalledTimes(1);
        expect(dashboardService.getUserTrends).toHaveBeenCalledWith('daily');
        expect(dashboardService.getNovelTrends).toHaveBeenCalledWith('daily');
        expect(dashboardService.getReadingActivity).toHaveBeenCalledWith(
          'daily'
        );
        expect(dashboardService.getTopContent).toHaveBeenCalledWith(10);
        expect(analyticsService.getPlatformDAU).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Statistics Cards Display', () => {
    test('renders all main statistics cards', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        expect(screen.getByText('Total Users')).toBeInTheDocument();
        expect(screen.getByText('Active Users')).toBeInTheDocument();
        expect(screen.getByText('Total Novels')).toBeInTheDocument();
        expect(screen.getByText('Total Chapters')).toBeInTheDocument();
        expect(screen.getByText('Comments')).toBeInTheDocument();
        expect(screen.getByText('Reviews')).toBeInTheDocument();
        expect(screen.getByText('Total Views')).toBeInTheDocument();
        expect(screen.getByText('Total Votes')).toBeInTheDocument();
      });
    });

    test('displays correct statistics values', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        expect(screen.getByText('1250')).toBeInTheDocument(); // Total Users
      });
      expect(screen.getByText('890')).toBeInTheDocument(); // Active Users
      expect(screen.getByText('456')).toBeInTheDocument(); // Total Novels
    });

    test('displays trend indicators correctly', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        const statCards = screen.getAllByTestId('stat-card');
        const userCard = statCards.find(
          (card) =>
            card.querySelector('[data-testid="stat-title"]')?.textContent ===
            'Total Users'
        );
        expect(userCard).toBeInTheDocument();
        expect(
          userCard.querySelector('[data-testid="stat-trend"]')
        ).toHaveTextContent('12.5% ↑');
      });
    });

    test('displays DAU/WAU/MAU cards when DAU data is available', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        expect(screen.getAllByText('Weekly Active Users')).toHaveLength(2);
      });
      expect(screen.getByText('Daily Active Users')).toBeInTheDocument();
      expect(screen.getAllByText('Monthly Active Users')).toHaveLength(2);
    });
  });

  describe('Chart Components', () => {
    test('renders user growth line chart', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        expect(screen.getByText('User Growth Trend')).toBeInTheDocument();
        expect(screen.getByText('New users over time')).toBeInTheDocument();
      });
    });

    test('renders novel growth line chart', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        expect(screen.getByText('Novel Creation Trend')).toBeInTheDocument();
        expect(screen.getByText('New novels over time')).toBeInTheDocument();
      });
    });

    test('renders reading activity area chart', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        expect(
          screen.getByText('Reading Activity Over Time')
        ).toBeInTheDocument();
        expect(
          screen.getByText('Views, comments, reviews and votes')
        ).toBeInTheDocument();
      });
    });

    test('renders category distribution pie chart', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        expect(screen.getByText('Novel Categories')).toBeInTheDocument();
        expect(screen.getByText('Distribution by genre')).toBeInTheDocument();
      });
    });

    test('renders top novels bar chart', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        expect(screen.getByText('Top Novels by Views')).toBeInTheDocument();
        expect(screen.getByText('Most popular novels')).toBeInTheDocument();
      });
    });

    test('renders hourly activity breakdown bar chart when DAU data available', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        expect(
          screen.getByText('Hourly Activity Breakdown')
        ).toBeInTheDocument();
        expect(screen.getByText('Active users by hour')).toBeInTheDocument();
      });
    });
  });

  describe('Top Content Display', () => {
    test('renders top authors section', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        expect(screen.getByText('Top Authors')).toBeInTheDocument();
        expect(screen.getByText('Author One')).toBeInTheDocument();
        expect(screen.getByText('Author Two')).toBeInTheDocument();
      });
    });

    test('renders top categories section', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        expect(screen.getByText('Top Categories')).toBeInTheDocument();
        expect(screen.getByText('Romance')).toBeInTheDocument();
        expect(screen.getByText('Fantasy')).toBeInTheDocument();
      });
    });

    test('displays author statistics correctly', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        expect(screen.getByText('Author One')).toBeInTheDocument();
      });
      expect(screen.getByText('10 novels • 15,000 views')).toBeInTheDocument();
    });

    test('displays category statistics correctly', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        expect(screen.getByText('Romance')).toBeInTheDocument();
      });
      expect(screen.getByText('50 novels • 25,000 views')).toBeInTheDocument();
    });
  });

  describe('Quick Actions and Key Metrics', () => {
    test('renders quick actions card with navigation buttons', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        expect(screen.getByText('Quick Actions')).toBeInTheDocument();
        expect(screen.getByText('Manage Users')).toBeInTheDocument();
        expect(screen.getByText('Manage Novels')).toBeInTheDocument();
        expect(screen.getByText('Review Comments')).toBeInTheDocument();
        expect(screen.getByText('Check Reviews')).toBeInTheDocument();
      });
    });

    test('renders key metrics card', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        expect(screen.getByText('Key Metrics')).toBeInTheDocument();
        expect(screen.getByText('Authors')).toBeInTheDocument();
        expect(screen.getByText('Published Novels')).toBeInTheDocument();
        expect(screen.getByText('Completed Novels')).toBeInTheDocument();
        expect(screen.getByText('Total Words')).toBeInTheDocument();
        expect(screen.getAllByText('Weekly Active Users')).toHaveLength(2); // One in DAU card, one in key metrics
        expect(screen.getAllByText('Monthly Active Users')).toHaveLength(2); // One in DAU card, one in key metrics
      });
    });

    test('displays key metrics values correctly', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        expect(screen.getByText('89')).toBeInTheDocument(); // Authors
      });
      expect(screen.getByText('423')).toBeInTheDocument(); // Published Novels
      expect(screen.getAllByText('234')).toHaveLength(2); // Completed Novels and DAU
    });
  });

  describe('Navigation Functionality', () => {
    test('navigates to users page when Manage Users button is clicked', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        const manageUsersButton = screen.getByText('Manage Users');
        fireEvent.click(manageUsersButton);
        expect(mockNavigate).toHaveBeenCalledWith('/admin/users');
      });
    });

    test('navigates to novels page when Manage Novels button is clicked', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        const manageNovelsButton = screen.getByText('Manage Novels');
        fireEvent.click(manageNovelsButton);
        expect(mockNavigate).toHaveBeenCalledWith('/admin/novels');
      });
    });

    test('navigates to comments page when Review Comments button is clicked', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        const reviewCommentsButton = screen.getByText('Review Comments');
        fireEvent.click(reviewCommentsButton);
        expect(mockNavigate).toHaveBeenCalledWith('/admin/comments');
      });
    });

    test('navigates to reviews page when Check Reviews button is clicked', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        const checkReviewsButton = screen.getByText('Check Reviews');
        fireEvent.click(checkReviewsButton);
        expect(mockNavigate).toHaveBeenCalledWith('/admin/reviews');
      });
    });
  });

  describe('Data Transformation', () => {
    test('transforms user trends data correctly for charts', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        const lineCharts = screen.getAllByTestId('line-chart');
        const userGrowthChart = lineCharts.find(
          (chart) =>
            chart.querySelector('[data-testid="chart-title"]')?.textContent ===
            'User Growth Trend'
        );
        expect(userGrowthChart).toBeInTheDocument();

        const chartData = JSON.parse(
          userGrowthChart.querySelector('[data-testid="chart-data"]')
            .textContent
        );
        expect(chartData).toEqual([
          { name: 'Jan 1', users: 100, date: '2024-01-01' },
          { name: 'Jan 2', users: 120, date: '2024-01-02' },
          { name: 'Jan 3', users: 110, date: '2024-01-03' },
        ]);
      });
    });

    test('transforms novel trends data correctly for charts', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        const lineCharts = screen.getAllByTestId('line-chart');
        const novelGrowthChart = lineCharts.find(
          (chart) =>
            chart.querySelector('[data-testid="chart-title"]')?.textContent ===
            'Novel Creation Trend'
        );
        expect(novelGrowthChart).toBeInTheDocument();

        const chartData = JSON.parse(
          novelGrowthChart.querySelector('[data-testid="chart-data"]')
            .textContent
        );
        expect(chartData).toEqual([
          { name: 'Jan 1', novels: 5, date: '2024-01-01' },
          { name: 'Jan 2', novels: 8, date: '2024-01-02' },
          { name: 'Jan 3', novels: 6, date: '2024-01-03' },
        ]);
      });
    });

    test('transforms reading activity data correctly for area chart', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        const areaChart = screen.getByTestId('area-chart');
        const chartData = JSON.parse(
          areaChart.querySelector('[data-testid="chart-data"]').textContent
        );
        expect(chartData).toEqual([
          { name: 'Jan 1', views: 1000, comments: 50, reviews: 25, votes: 100 },
          { name: 'Jan 2', views: 1200, comments: 60, reviews: 30, votes: 120 },
        ]);
      });
    });

    test('transforms top novels data correctly for bar chart', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        const barCharts = screen.getAllByTestId('bar-chart');
        const topNovelsChart = barCharts.find(
          (chart) =>
            chart.querySelector('[data-testid="chart-title"]')?.textContent ===
            'Top Novels by Views'
        );
        expect(topNovelsChart).toBeInTheDocument();

        const chartData = JSON.parse(
          topNovelsChart.querySelector('[data-testid="chart-data"]').textContent
        );
        expect(chartData[0]).toMatchObject({
          name: 'Amazing Novel Title ...',
          value: 5000,
          fullTitle: 'Amazing Novel Title That Is Very Long',
          author: 'Author One',
          rating: 4.5,
        });
      });
    });

    test('transforms category data correctly for pie chart', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        const pieChart = screen.getByTestId('pie-chart');
        const chartData = JSON.parse(
          pieChart.querySelector('[data-testid="chart-data"]').textContent
        );
        expect(chartData).toEqual([
          { name: 'Romance', value: 50, views: 25000 },
          { name: 'Fantasy', value: 45, views: 22000 },
        ]);
      });
    });
  });

  describe('Error Handling', () => {
    test('handles dashboard stats API error gracefully', async () => {
      dashboardService.getDashboardStats.mockRejectedValue(
        new Error('API Error')
      );

      render(<Dashboard />);
      await waitFor(() => {
        expect(
          screen.getByText('Failed to load dashboard data')
        ).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
        expect(require('antd').message.error).toHaveBeenCalledWith(
          'Failed to load dashboard data'
        );
      });
    });

    test('handles partial API failures gracefully', async () => {
      dashboardService.getUserTrends.mockRejectedValue(
        new Error('Trends API Error')
      );

      render(<Dashboard />);
      await waitFor(() => {
        // Since Promise.all is used, if any service fails, the entire load fails
        expect(
          screen.getByText('Failed to load dashboard data')
        ).toBeInTheDocument();
        expect(require('antd').message.error).toHaveBeenCalledWith(
          'Failed to load dashboard data'
        );
      });
    });

    test('shows retry button when data loading fails', async () => {
      dashboardService.getDashboardStats.mockRejectedValue(
        new Error('API Error')
      );

      render(<Dashboard />);
      await waitFor(() => {
        const retryButton = screen.getByText('Retry');
        expect(retryButton).toBeInTheDocument();

        // Click retry should call services again
        fireEvent.click(retryButton);
        expect(dashboardService.getDashboardStats).toHaveBeenCalledTimes(2);
      });
    });

    test('handles missing DAU data gracefully', async () => {
      analyticsService.getPlatformDAU.mockResolvedValue({
        success: false,
        error: 'DAU API Error',
      });

      render(<Dashboard />);
      await waitFor(() => {
        // Should render without DAU cards
        expect(
          screen.queryByText('Daily Active Users')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText('Hourly Activity Breakdown')
        ).not.toBeInTheDocument();
      });
    });

    test('handles empty top content data gracefully', async () => {
      dashboardService.getTopContent.mockResolvedValue({
        success: true,
        data: { topNovels: [], topCategories: [], topAuthors: [] },
      });

      render(<Dashboard />);
      await waitFor(() => {
        // Should still render the sections but with no content
        expect(screen.getByText('Top Authors')).toBeInTheDocument();
        expect(screen.getByText('Top Categories')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    test('shows loading spinner during data fetch', () => {
      render(<Dashboard />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    test('hides loading spinner after data loads', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });

    test('shows loading spinner during retry', async () => {
      dashboardService.getDashboardStats.mockRejectedValue(
        new Error('API Error')
      );

      render(<Dashboard />);
      await waitFor(() => {
        const retryButton = screen.getByText('Retry');
        fireEvent.click(retryButton);
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      });
    });
  });

  describe('Service Integration', () => {
    test('calls dashboard services with correct parameters', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        expect(dashboardService.getDashboardStats).toHaveBeenCalledWith();
        expect(dashboardService.getUserTrends).toHaveBeenCalledWith('daily');
        expect(dashboardService.getNovelTrends).toHaveBeenCalledWith('daily');
        expect(dashboardService.getReadingActivity).toHaveBeenCalledWith(
          'daily'
        );
        expect(dashboardService.getTopContent).toHaveBeenCalledWith(10);
        expect(analyticsService.getPlatformDAU).toHaveBeenCalledWith();
      });
    });

    test('handles service response data structure correctly', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        // Verify that the component correctly accesses nested data properties
        expect(screen.getByText('Total Users')).toBeInTheDocument(); // From stats
        expect(screen.getByText('Author One')).toBeInTheDocument(); // From topContent.topAuthors
      });
    });
  });

  describe('UI Components Integration', () => {
    test('renders all required antd components', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        expect(screen.getAllByTestId('row').length).toBeGreaterThan(0);
        expect(screen.getAllByTestId('col').length).toBeGreaterThan(0);
        expect(screen.getAllByTestId('card').length).toBeGreaterThan(0);
        expect(screen.getAllByTestId('space').length).toBeGreaterThan(0);
        expect(screen.getAllByTestId('button').length).toBeGreaterThan(0);
      });
    });

    test('renders chart components with correct props', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        expect(screen.getAllByTestId('stat-card').length).toBeGreaterThan(0);
        expect(screen.getAllByTestId('line-chart').length).toBe(2); // User and Novel growth
        expect(screen.getByTestId('area-chart')).toBeInTheDocument();
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
        expect(screen.getAllByTestId('bar-chart').length).toBeGreaterThan(0);
      });
    });

    test('renders icons correctly', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        expect(screen.getAllByTestId('user-icon').length).toBeGreaterThan(0);
        expect(screen.getAllByTestId('book-icon').length).toBeGreaterThan(0);
        expect(screen.getAllByTestId('star-icon').length).toBeGreaterThan(0);
        expect(screen.getAllByTestId('eye-icon').length).toBeGreaterThan(0);
        expect(screen.getAllByTestId('comment-icon').length).toBeGreaterThan(0);
        expect(screen.getAllByTestId('trophy-icon').length).toBeGreaterThan(0);
        expect(screen.getAllByTestId('rise-icon').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Hourly Breakdown Edge Cases', () => {
    test('handles empty hourly breakdown data', async () => {
      const dauDataWithEmptyBreakdown = {
        ...mockDauData,
        hourlyBreakdown: [],
      };
      analyticsService.getPlatformDAU.mockResolvedValue({
        success: true,
        data: dauDataWithEmptyBreakdown,
      });

      render(<Dashboard />);
      await waitFor(() => {
        expect(
          screen.getByText(
            'No hourly breakdown is available for 2024-01-15. Showing an empty 24-hour chart.'
          )
        ).toBeInTheDocument();
      });
    });

    test('handles null hourly breakdown data', async () => {
      const dauDataWithNullBreakdown = {
        ...mockDauData,
        hourlyBreakdown: null,
      };
      analyticsService.getPlatformDAU.mockResolvedValue({
        success: true,
        data: dauDataWithNullBreakdown,
      });

      render(<Dashboard />);
      await waitFor(() => {
        expect(
          screen.getByText(
            'No hourly breakdown is available for 2024-01-15. Showing an empty 24-hour chart.'
          )
        ).toBeInTheDocument();
      });
    });

    test('normalizes different hourly data formats', async () => {
      const dauDataWithObjectBreakdown = {
        ...mockDauData,
        hourlyBreakdown: {
          0: { activeUsers: 10, newUsers: 2, readingSessions: 8 },
          6: { activeUsers: 45, newUsers: 5, readingSessions: 35 },
        },
      };
      analyticsService.getPlatformDAU.mockResolvedValue({
        success: true,
        data: dauDataWithObjectBreakdown,
      });

      render(<Dashboard />);
      await waitFor(() => {
        // Should render the bar chart with normalized data
        expect(
          screen.getByText('Hourly Activity Breakdown')
        ).toBeInTheDocument();
      });
    });
  });
});
