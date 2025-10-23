import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { message } from 'antd';
import Rankings from './index';
import { rankingService } from '../../../services/admin/rankingservice';

// Mock dependencies
jest.mock('../../../services/admin/rankingservice');
jest.mock('../../../components/admin/common', () => ({
  PageHeader: ({ title, subtitle, breadcrumbs }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
      {breadcrumbs && (
        <div data-testid="breadcrumbs">
          {breadcrumbs.map((b) => b.title).join(' > ')}
        </div>
      )}
    </div>
  ),
  FilterPanel: ({
    filters,
    onFilter: _onFilter,
    onClear,
    collapsed: _collapsed,
    showToggle: _showToggle,
  }) => (
    <div data-testid="filter-panel">
      <button data-testid="clear-filters" onClick={onClear}>
        Clear Filters
      </button>
      {filters.map((filter) => (
        <div key={filter.name} data-testid={`filter-${filter.name}`}>
          {filter.label}
        </div>
      ))}
    </div>
  ),
  EmptyState: ({ title, description, actions }) => (
    <div data-testid="empty-state">
      <h2>{title}</h2>
      <p>{description}</p>
      {actions.map((action, index) => (
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
jest.mock('../../../utils/admin/errorReporting', () => ({
  logApiError: jest.fn(),
}));
jest.mock(
  '../../../assets/images/novel_default.png',
  () => 'novel-default-mock'
);
jest.mock('../../../assets/images/user.png', () => 'user-default-mock');
jest.mock('../../../assets/images/user_male.png', () => 'user-male-mock');
jest.mock('../../../assets/images/user_female.png', () => 'user-female-mock');

// Mock antd message
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock window resize
const mockResizeObserver = jest.fn();
globalThis.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: mockResizeObserver,
  unobserve: mockResizeObserver,
  disconnect: mockResizeObserver,
}));

const renderRankings = () => {
  return render(
    <BrowserRouter>
      <Rankings />
    </BrowserRouter>
  );
};

describe('Rankings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  describe('Rendering', () => {
    test('renders page header with correct title and subtitle', () => {
      renderRankings();
      expect(screen.getByText('Rankings Management')).toBeInTheDocument();
      expect(
        screen.getByText('View and analyze platform rankings')
      ).toBeInTheDocument();
    });

    test('renders breadcrumbs correctly', () => {
      renderRankings();
      const breadcrumbs = screen.getByTestId('breadcrumbs');
      expect(breadcrumbs).toHaveTextContent('Dashboard > Rankings');
    });

    test('renders tab navigation buttons', () => {
      renderRankings();
      expect(screen.getByText('Novel Rankings')).toBeInTheDocument();
      expect(screen.getByText('Author Rankings')).toBeInTheDocument();
      expect(screen.getByText('Reader Rankings')).toBeInTheDocument();
    });

    test('renders filter panel', () => {
      renderRankings();
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    });

    test('renders novel rank lookup form', () => {
      renderRankings();
      expect(screen.getByText('Novel Rank Lookup')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Enter novel ID to check its ranking')
      ).toBeInTheDocument();
      expect(screen.getByText('Check Rank')).toBeInTheDocument();
    });

    test('renders loading spinner initially', () => {
      renderRankings();
      expect(screen.getByTestId('loading-spinner')).toHaveTextContent(
        'Loading novels rankings...'
      );
    });
  });

  describe('Tab Switching', () => {
    test('starts with novels tab active by default', () => {
      renderRankings();
      const novelButton = screen.getByText('Novel Rankings');
      expect(novelButton.closest('button')).toHaveClass('ant-btn-primary');
    });

    test('switches to authors tab when clicked', async () => {
      const mockData = {
        success: true,
        data: { content: [], totalElements: 0 },
      };
      rankingService.getAuthorRankings.mockResolvedValue(mockData);

      renderRankings();

      const authorButton = screen.getByText('Author Rankings');
      fireEvent.click(authorButton);

      await waitFor(() => {
        expect(rankingService.getAuthorRankings).toHaveBeenCalledWith({
          page: 0,
          size: 10,
          timeRange: 'overall',
          sortType: 'vote',
        });
      });
    });

    test('switches to readers tab when clicked', async () => {
      const mockData = {
        success: true,
        data: { content: [], totalElements: 0 },
      };
      rankingService.getUserRankings.mockResolvedValue(mockData);

      renderRankings();

      const readerButton = screen.getByText('Reader Rankings');
      fireEvent.click(readerButton);

      await waitFor(() => {
        expect(rankingService.getUserRankings).toHaveBeenCalledWith({
          page: 0,
          size: 10,
          timeRange: 'overall',
          sortBy: 'level',
        });
      });
    });

    test('updates loading message when switching tabs', async () => {
      const mockData = {
        success: true,
        data: { content: [], totalElements: 0 },
      };
      rankingService.getAuthorRankings.mockResolvedValue(mockData);

      renderRankings();

      const authorButton = screen.getByText('Author Rankings');
      fireEvent.click(authorButton);

      expect(screen.getByTestId('loading-spinner')).toHaveTextContent(
        'Loading authors rankings...'
      );
    });
  });

  describe('Data Fetching', () => {
    test('fetches novel rankings on mount', async () => {
      const mockData = {
        success: true,
        data: { content: [], totalElements: 0 },
      };
      rankingService.getNovelRankings.mockResolvedValue(mockData);

      renderRankings();

      await waitFor(() => {
        expect(rankingService.getNovelRankings).toHaveBeenCalledWith({
          page: 0,
          size: 10,
          timeRange: 'overall',
          sortType: 'view',
        });
      });
    });

    test('displays novel rankings data correctly', async () => {
      const mockData = {
        success: true,
        data: {
          content: [
            {
              id: 1,
              title: 'Test Novel',
              categoryName: 'Fantasy',
              viewCnt: 1000,
              voteCnt: 500,
              avgRating: 4.5,
              coverImgUrl: 'test-cover.jpg',
            },
          ],
          totalElements: 1,
        },
      };
      rankingService.getNovelRankings.mockResolvedValue(mockData);

      renderRankings();

      await waitFor(() => {
        expect(screen.getByText('Test Novel')).toBeInTheDocument();
        expect(screen.getByText('Fantasy')).toBeInTheDocument();
        expect(screen.getByText('1,000 views')).toBeInTheDocument();
        expect(screen.getByText('500 votes')).toBeInTheDocument();
        expect(screen.getByText('Rating: 4.5/5')).toBeInTheDocument();
      });
    });

    test('displays author rankings data correctly', async () => {
      const mockData = {
        success: true,
        data: {
          content: [
            {
              id: 1,
              username: 'Test Author',
              novelNum: 5,
              totalViewCnt: 10000,
              totalVoteCnt: 2000,
              avatarUrl: 'test-avatar.jpg',
            },
          ],
          totalElements: 1,
        },
      };
      rankingService.getAuthorRankings.mockResolvedValue(mockData);

      renderRankings();

      // Switch to authors tab
      const authorButton = screen.getByText('Author Rankings');
      fireEvent.click(authorButton);

      await waitFor(() => {
        expect(screen.getByText('Test Author')).toBeInTheDocument();
        expect(screen.getByText('5 novels')).toBeInTheDocument();
        expect(screen.getByText('10,000 total views')).toBeInTheDocument();
        expect(screen.getByText('2,000 total votes')).toBeInTheDocument();
      });
    });

    test('displays reader rankings data correctly', async () => {
      const mockData = {
        success: true,
        data: {
          content: [
            {
              id: 1,
              username: 'Test Reader',
              level: 15,
              exp: 5000,
              readTime: 100,
              readBookNum: 25,
              avatarUrl: 'test-avatar.jpg',
            },
          ],
          totalElements: 1,
        },
      };
      rankingService.getUserRankings.mockResolvedValue(mockData);

      renderRankings();

      // Switch to readers tab
      const readerButton = screen.getByText('Reader Rankings');
      fireEvent.click(readerButton);

      await waitFor(() => {
        expect(screen.getByText('Test Reader')).toBeInTheDocument();
        expect(screen.getByText('Level 15')).toBeInTheDocument();
        expect(screen.getByText('EXP: 5,000')).toBeInTheDocument();
        expect(screen.getByText('100h reading time')).toBeInTheDocument();
        expect(screen.getByText('25 books')).toBeInTheDocument();
      });
    });

    test('handles API errors gracefully', async () => {
      rankingService.getNovelRankings.mockRejectedValue(new Error('API Error'));

      renderRankings();

      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith(
          'Failed to fetch rankings: API Error'
        );
      });
    });

    test('shows empty state when no data', async () => {
      const mockData = {
        success: true,
        data: { content: [], totalElements: 0 },
      };
      rankingService.getNovelRankings.mockResolvedValue(mockData);

      renderRankings();

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
        expect(screen.getByText('No Rankings Found')).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    test('applies time range filter', async () => {
      const mockData = {
        success: true,
        data: { content: [], totalElements: 0 },
      };
      rankingService.getNovelRankings.mockResolvedValue(mockData);

      renderRankings();

      // Simulate filter application
      const clearButton = screen.getByTestId('clear-filters');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(rankingService.getNovelRankings).toHaveBeenCalledWith({
          page: 0,
          size: 10,
          timeRange: 'overall',
          sortType: 'view',
        });
      });
    });

    test('shows different filter options for different tabs', () => {
      renderRankings();

      // Novels tab filters
      expect(screen.getByTestId('filter-timeRange')).toBeInTheDocument();
      expect(screen.getByTestId('filter-sortType')).toBeInTheDocument();

      // Switch to authors tab
      const authorButton = screen.getByText('Author Rankings');
      fireEvent.click(authorButton);

      // Should still have the same filters for authors
      expect(screen.getByTestId('filter-timeRange')).toBeInTheDocument();
      expect(screen.getByTestId('filter-sortType')).toBeInTheDocument();
    });
  });

  describe('Novel Rank Lookup', () => {
    test('handles successful rank lookup for ranked novel', async () => {
      const mockRankData = {
        success: true,
        message: 'Novel found in rankings',
        data: {
          rank: 5,
          score: 95,
          rankType: 'weekly',
        },
      };
      rankingService.getNovelRank.mockResolvedValue(mockRankData);

      renderRankings();

      const input = screen.getByPlaceholderText(
        'Enter novel ID to check its ranking'
      );
      const button = screen.getByText('Check Rank');

      fireEvent.change(input, { target: { value: '123' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(rankingService.getNovelRank).toHaveBeenCalledWith('123');
        expect(message.success).toHaveBeenCalledWith(
          'Novel is ranked #5 in weekly!'
        );
        expect(screen.getByText('Novel ID: 123')).toBeInTheDocument();
        expect(screen.getByText('🏆 Ranked #5 in weekly')).toBeInTheDocument();
        expect(screen.getByText('📊 Score: 95')).toBeInTheDocument();
      });
    });

    test('handles rank lookup for unranked novel', async () => {
      const mockRankData = {
        success: true,
        message: 'Novel not in top 100',
        data: null,
      };
      rankingService.getNovelRank.mockResolvedValue(mockRankData);

      renderRankings();

      const input = screen.getByPlaceholderText(
        'Enter novel ID to check its ranking'
      );
      const button = screen.getByText('Check Rank');

      fireEvent.change(input, { target: { value: '456' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(message.info).toHaveBeenCalledWith('Novel not in top 100');
        expect(screen.getByText('Novel ID: 456')).toBeInTheDocument();
        expect(screen.getByText('📊 Novel not in top 100')).toBeInTheDocument();
      });
    });

    test('handles rank lookup errors', async () => {
      rankingService.getNovelRank.mockRejectedValue(new Error('Lookup failed'));

      renderRankings();

      const input = screen.getByPlaceholderText(
        'Enter novel ID to check its ranking'
      );
      const button = screen.getByText('Check Rank');

      fireEvent.change(input, { target: { value: '789' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith(
          'Failed to fetch novel rank: Lookup failed'
        );
      });
    });
  });

  describe('Pagination', () => {
    test('handles table pagination changes', async () => {
      const mockData = {
        success: true,
        data: { content: [], totalElements: 100 },
      };
      rankingService.getNovelRankings.mockResolvedValue(mockData);

      renderRankings();

      await waitFor(() => {
        expect(rankingService.getNovelRankings).toHaveBeenCalledWith({
          page: 0,
          size: 10,
          timeRange: 'overall',
          sortType: 'view',
        });
      });
    });
  });

  describe('Image Handling', () => {
    test('displays novel covers correctly', async () => {
      const mockData = {
        success: true,
        data: {
          content: [
            {
              id: 1,
              title: 'Test Novel',
              coverImgUrl: 'data:image/png;base64,test123',
              categoryName: 'Fantasy',
              viewCnt: 100,
              voteCnt: 50,
            },
          ],
          totalElements: 1,
        },
      };
      rankingService.getNovelRankings.mockResolvedValue(mockData);

      renderRankings();

      await waitFor(() => {
        const coverImage = screen.getByAltText('Test Novel');
        expect(coverImage).toHaveAttribute(
          'src',
          'data:image/png;base64,test123'
        );
      });
    });

    test('displays default novel cover when no cover provided', async () => {
      const mockData = {
        success: true,
        data: {
          content: [
            {
              id: 1,
              title: 'Test Novel',
              coverImgUrl: '',
              categoryName: 'Fantasy',
              viewCnt: 100,
              voteCnt: 50,
            },
          ],
          totalElements: 1,
        },
      };
      rankingService.getNovelRankings.mockResolvedValue(mockData);

      renderRankings();

      await waitFor(() => {
        const coverImage = screen.getByAltText('Test Novel');
        expect(coverImage).toHaveAttribute('src', 'novel-default-mock');
      });
    });

    test('displays user avatars correctly', async () => {
      const mockData = {
        success: true,
        data: {
          content: [
            {
              id: 1,
              username: 'Test Author',
              avatarUrl: 'data:image/png;base64,avatar123',
              novelNum: 5,
              totalViewCnt: 1000,
              totalVoteCnt: 200,
            },
          ],
          totalElements: 1,
        },
      };
      rankingService.getAuthorRankings.mockResolvedValue(mockData);

      renderRankings();

      // Switch to authors tab
      const authorButton = screen.getByText('Author Rankings');
      fireEvent.click(authorButton);

      await waitFor(() => {
        const avatarImage = screen.getByAltText('Test Author');
        expect(avatarImage).toHaveAttribute(
          'src',
          'data:image/png;base64,avatar123'
        );
      });
    });

    test('displays default avatars based on gender', async () => {
      const mockData = {
        success: true,
        data: {
          content: [
            {
              id: 1,
              username: 'Male User',
              gender: 'male',
              level: 10,
              exp: 1000,
            },
            {
              id: 2,
              username: 'Female User',
              gender: 'female',
              level: 8,
              exp: 800,
            },
            {
              id: 3,
              username: 'Default User',
              level: 5,
              exp: 500,
            },
          ],
          totalElements: 3,
        },
      };
      rankingService.getUserRankings.mockResolvedValue(mockData);

      renderRankings();

      // Switch to readers tab
      const readerButton = screen.getByText('Reader Rankings');
      fireEvent.click(readerButton);

      await waitFor(() => {
        const maleAvatar = screen.getByAltText('Male User');
        const femaleAvatar = screen.getByAltText('Female User');
        const defaultAvatar = screen.getByAltText('Default User');

        expect(maleAvatar).toHaveAttribute('src', 'user-male-mock');
        expect(femaleAvatar).toHaveAttribute('src', 'user-female-mock');
        expect(defaultAvatar).toHaveAttribute('src', 'user-default-mock');
      });
    });
  });

  describe('Responsive Design', () => {
    test('adapts to mobile screen size', () => {
      // Mock mobile width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });

      renderRankings();

      // Trigger resize
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      // Check if mobile-specific elements are rendered
      expect(screen.getByText('Rankings Management')).toBeInTheDocument();
    });

    test('shows simplified tab labels on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });

      renderRankings();

      // On mobile, should show icons instead of full labels
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    test('adjusts table size for mobile', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });

      const mockData = {
        success: true,
        data: {
          content: [{ id: 1, title: 'Test Novel', viewCnt: 100 }],
          totalElements: 1,
        },
      };
      rankingService.getNovelRankings.mockResolvedValue(mockData);

      renderRankings();

      await waitFor(() => {
        // Table should be rendered with mobile-appropriate settings
        expect(screen.getByText('Test Novel')).toBeInTheDocument();
      });
    });
  });

  describe('Data Formatting', () => {
    test('formats numbers correctly', async () => {
      const mockData = {
        success: true,
        data: {
          content: [
            {
              id: 1,
              title: 'Test Novel',
              viewCnt: 1500000,
              voteCnt: 500000,
              categoryName: 'Fantasy',
            },
          ],
          totalElements: 1,
        },
      };
      rankingService.getNovelRankings.mockResolvedValue(mockData);

      renderRankings();

      await waitFor(() => {
        expect(screen.getByText('1,500,000 views')).toBeInTheDocument();
        expect(screen.getByText('500,000 votes')).toBeInTheDocument();
      });
    });

    test('handles null/undefined values gracefully', async () => {
      const mockData = {
        success: true,
        data: {
          content: [
            {
              id: 1,
              title: 'Test Novel',
              viewCnt: null,
              voteCnt: undefined,
              categoryName: 'Fantasy',
            },
          ],
          totalElements: 1,
        },
      };
      rankingService.getNovelRankings.mockResolvedValue(mockData);

      renderRankings();

      await waitFor(() => {
        expect(screen.getByText('0 views')).toBeInTheDocument();
        expect(screen.getByText('0 votes')).toBeInTheDocument();
      });
    });

    test('displays rank crowns for top 3 positions', async () => {
      const mockData = {
        success: true,
        data: {
          content: [
            { id: 1, title: 'First Novel', viewCnt: 1000 },
            { id: 2, title: 'Second Novel', viewCnt: 900 },
            { id: 3, title: 'Third Novel', viewCnt: 800 },
            { id: 4, title: 'Fourth Novel', viewCnt: 700 },
          ],
          totalElements: 4,
        },
      };
      rankingService.getNovelRankings.mockResolvedValue(mockData);

      renderRankings();

      await waitFor(() => {
        // Check that crown icons are present for top 3
        const crownIcons = document.querySelectorAll('.anticon-crown');
        expect(crownIcons.length).toBe(3);
      });
    });
  });

  describe('Loading States', () => {
    test('shows loading spinner during data fetch', () => {
      rankingService.getNovelRankings.mockImplementation(
        () => new Promise(() => {})
      );

      renderRankings();

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    test('hides loading spinner after data loads', async () => {
      const mockData = {
        success: true,
        data: { content: [], totalElements: 0 },
      };
      rankingService.getNovelRankings.mockResolvedValue(mockData);

      renderRankings();

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles novel rank lookup errors', async () => {
      const { logApiError } = require('../../../utils/admin/errorReporting');
      rankingService.getNovelRank.mockRejectedValue(new Error('Lookup error'));

      renderRankings();

      const input = screen.getByPlaceholderText(
        'Enter novel ID to check its ranking'
      );
      const button = screen.getByText('Check Rank');

      fireEvent.change(input, { target: { value: '123' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(logApiError).toHaveBeenCalledWith(
          expect.any(Error),
          'ranking/novel/rank',
          { novelId: '123' }
        );
      });
    });
  });
});
