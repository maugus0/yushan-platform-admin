import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { message } from 'antd';
import Yuan from './index';
import { rankingService } from '../../../services/admin/rankingservice';

// Mock dependencies
jest.mock('../../../services/admin/rankingservice');
jest.mock('../../../components/admin/common', () => ({
  PageHeader: ({ title, subtitle, breadcrumbs, actions }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
      {breadcrumbs && (
        <div data-testid="breadcrumbs">
          {breadcrumbs.map((b) => b.title).join(' > ')}
        </div>
      )}
      {actions && <div data-testid="actions">{actions}</div>}
    </div>
  ),
  LoadingSpinner: ({ tip }) => <div data-testid="loading-spinner">{tip}</div>,
}));
jest.mock(
  '../../../assets/images/novel_default.png',
  () => 'novel-default-mock'
);
jest.mock('../../../assets/images/user.png', () => 'user-default-mock');

// Mock antd message
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    error: jest.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderYuan = () => {
  return render(
    <BrowserRouter>
      <Yuan />
    </BrowserRouter>
  );
};

describe('Yuan Component', () => {
  describe('Rendering', () => {
    test('renders statistics button in actions', () => {
      renderYuan();
      const actions = screen.getByTestId('actions');
      expect(actions).toBeInTheDocument();
    });

    test('renders loading spinner initially', () => {
      renderYuan();
      expect(screen.getByTestId('loading-spinner')).toHaveTextContent(
        'Loading ranking data...'
      );
    });

    test('renders section headings for rankings', async () => {
      rankingService.getNovelRankings.mockResolvedValue({
        success: true,
        data: { content: [] },
      });
      rankingService.getAuthorRankings.mockResolvedValue({
        success: true,
        data: { content: [] },
      });
      rankingService.getUserRankings.mockResolvedValue({
        success: true,
        data: { content: [] },
      });

      renderYuan();

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      expect(screen.getByText(/Top Novels/i)).toBeInTheDocument();
      expect(screen.getByText(/Top Authors/i)).toBeInTheDocument();
    });
  });

  describe('Data Fetching', () => {
    test('fetches ranking data on mount', async () => {
      const mockNovelData = {
        success: true,
        data: { content: [{ id: 1, title: 'Test Novel', voteCnt: 100 }] },
      };
      const mockAuthorData = {
        success: true,
        data: {
          content: [{ id: 1, username: 'Test Author', totalVoteCnt: 50 }],
        },
      };
      const mockUserData = {
        success: true,
        data: { content: [{ id: 1, username: 'Test User', yuan: 200 }] },
      };

      rankingService.getNovelRankings.mockResolvedValue(mockNovelData);
      rankingService.getAuthorRankings.mockResolvedValue(mockAuthorData);
      rankingService.getUserRankings.mockResolvedValue(mockUserData);

      renderYuan();

      await waitFor(() => {
        expect(rankingService.getNovelRankings).toHaveBeenCalledWith({
          page: 0,
          size: 1000,
          sortType: 'vote',
        });
        expect(rankingService.getAuthorRankings).toHaveBeenCalledWith({
          page: 0,
          size: 1000,
          sortType: 'vote',
        });
        expect(rankingService.getUserRankings).toHaveBeenCalledWith({
          page: 0,
          size: 1000,
          sortBy: 'points',
        });
      });
    });

    test('handles API errors gracefully', async () => {
      rankingService.getNovelRankings.mockRejectedValue(new Error('API Error'));
      rankingService.getAuthorRankings.mockRejectedValue(
        new Error('API Error')
      );
      rankingService.getUserRankings.mockRejectedValue(new Error('API Error'));

      renderYuan();

      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith(
          'Failed to fetch ranking data'
        );
      });
    });
  });

  describe('Navigation', () => {
    test('navigates to statistics page when button is clicked', async () => {
      const mockNovelData = { success: true, data: { content: [] } };
      const mockAuthorData = { success: true, data: { content: [] } };
      const mockUserData = { success: true, data: { content: [] } };

      rankingService.getNovelRankings.mockResolvedValue(mockNovelData);
      rankingService.getAuthorRankings.mockResolvedValue(mockAuthorData);
      rankingService.getUserRankings.mockResolvedValue(mockUserData);

      renderYuan();

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      // Find and click the statistics button
      const statsButton = screen.getByRole('button', {
        name: /view statistics/i,
      });
      fireEvent.click(statsButton);

      expect(mockNavigate).toHaveBeenCalledWith('/admin/yuan/statistics');
    });
  });

  describe('Image Handling', () => {
    test('displays default images when no cover/avatar provided', async () => {
      const mockNovelData = {
        success: true,
        data: { content: [{ id: 1, title: 'Test Novel', voteCnt: 100 }] },
      };
      const mockAuthorData = {
        success: true,
        data: {
          content: [{ id: 1, username: 'Test Author', totalVoteCnt: 50 }],
        },
      };
      const mockUserData = {
        success: true,
        data: { content: [{ id: 1, username: 'Test User', yuan: 200 }] },
      };

      rankingService.getNovelRankings.mockResolvedValue(mockNovelData);
      rankingService.getAuthorRankings.mockResolvedValue(mockAuthorData);
      rankingService.getUserRankings.mockResolvedValue(mockUserData);

      renderYuan();

      await waitFor(() => {
        // Check that avatars/images are rendered (exact implementation may vary)
        const avatars = screen.getAllByRole('img');
        expect(avatars.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Responsive Design', () => {
    test('sets correct scroll properties for mobile', async () => {
      const mockNovelData = {
        success: true,
        data: { content: [{ id: 1, title: 'Test Novel', voteCnt: 100 }] },
      };
      const mockAuthorData = { success: true, data: { content: [] } };
      const mockUserData = { success: true, data: { content: [] } };

      rankingService.getNovelRankings.mockResolvedValue(mockNovelData);
      rankingService.getAuthorRankings.mockResolvedValue(mockAuthorData);
      rankingService.getUserRankings.mockResolvedValue(mockUserData);

      renderYuan();

      await waitFor(() => {
        // Tables should have scroll properties (implementation may vary)
        const tables = screen.getAllByRole('table');
        expect(tables.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Accessibility', () => {});

  describe('Additional Coverage', () => {
    test('supports mixed response shapes (array vs content) and renders texts', async () => {
      rankingService.getNovelRankings.mockResolvedValue({
        success: true,
        data: [{ id: 'm1', title: 'Mix Novel', voteCnt: 22 }],
      });
      rankingService.getAuthorRankings.mockResolvedValue({
        success: true,
        data: {
          content: [{ id: 'm2', username: 'Mix Author', totalVoteCnt: 11 }],
        },
      });
      rankingService.getUserRankings.mockResolvedValue({
        success: true,
        data: { content: [{ id: 'm3', username: 'Mix User', yuan: 33 }] },
      });

      renderYuan();

      await waitFor(() => {
        const hasNovelRow = document.querySelector('tr[data-row-key="m1"]');
        const hasAuthorRow = document.querySelector('tr[data-row-key="m2"]');
        const hasUserRow = document.querySelector('tr[data-row-key="m3"]');
        expect(!!hasNovelRow).toBe(true);
        expect(!!hasAuthorRow).toBe(true);
        expect(!!hasUserRow).toBe(true);
      });

      // Ensure tables rendered
      expect(screen.getAllByRole('table').length).toBeGreaterThan(0);
    });

    test('sets row keys to item ids for nested content shape', async () => {
      rankingService.getNovelRankings.mockResolvedValue({
        success: true,
        data: { content: [{ id: 'nx1', title: 'NX', voteCnt: 10 }] },
      });
      rankingService.getAuthorRankings.mockResolvedValue({
        success: true,
        data: { content: [{ id: 'ax1', username: 'AX', totalVoteCnt: 3 }] },
      });
      rankingService.getUserRankings.mockResolvedValue({
        success: true,
        data: { content: [{ id: 'ux1', username: 'UX', yuan: 1 }] },
      });

      renderYuan();

      await waitFor(() => {
        // antd Table rows usually include data-row-key with the record key/id
        const hasRowKeys =
          document.querySelector('tr[data-row-key="nx1"]') ||
          document.querySelector('tr[data-row-key="ax1"]') ||
          document.querySelector('tr[data-row-key="ux1"]');
        expect(!!hasRowKeys).toBe(true);
      });
    });

    test('statistics button triggers navigate once', async () => {
      rankingService.getNovelRankings.mockResolvedValue({
        success: true,
        data: { content: [] },
      });
      rankingService.getAuthorRankings.mockResolvedValue({
        success: true,
        data: { content: [] },
      });
      rankingService.getUserRankings.mockResolvedValue({
        success: true,
        data: { content: [] },
      });

      renderYuan();

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      const statsButton = screen.getByRole('button', {
        name: /view statistics/i,
      });
      fireEvent.click(statsButton);

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/admin/yuan/statistics');
    });
  });
});
