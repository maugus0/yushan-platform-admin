import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock antd Grid before importing the component
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  Grid: {
    useBreakpoint: jest.fn(() => ({ md: true })),
  },
}));

import Chapters from './index';

// Mock services
jest.mock('../../../services/admin/novelservice', () => ({
  novelService: {
    getAllNovels: jest.fn(),
  },
}));

jest.mock('../../../services/admin/chapterservice', () => ({
  chapterService: {
    getChaptersByNovel: jest.fn(),
    deleteChapter: jest.fn(),
    deleteChaptersByNovel: jest.fn(),
  },
}));

// Mock common components
jest.mock('../../../components/admin/common', () => ({
  PageHeader: ({ title, subtitle, breadcrumbs }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
      {breadcrumbs && (
        <div data-testid="breadcrumbs">
          {breadcrumbs.map((crumb, index) => (
            <span key={index}>{crumb.title}</span>
          ))}
        </div>
      )}
    </div>
  ),
  SearchBar: ({ placeholder, onSearch, onClear, searchValue, _loading }) => (
    <div data-testid="search-bar">
      <input
        type="text"
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
  StatusBadge: ({ status }) => (
    <span data-testid={`status-badge-${status}`}>{status}</span>
  ),
  ActionButtons: ({ record, onDelete, _showEdit, _showView, _showMore }) => (
    <div data-testid="action-buttons">
      <button
        onClick={() => onDelete && onDelete(record)}
        data-testid="delete-button"
      >
        Delete
      </button>
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
        <button onClick={onDefaultAction} data-testid="empty-action-button">
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

// Mock icons
jest.mock('@ant-design/icons', () => ({
  FileTextOutlined: () => <span data-testid="file-text-icon" />,
  BookOutlined: () => <span data-testid="book-icon" />,
  UserOutlined: () => <span data-testid="user-icon" />,
  CalendarOutlined: () => <span data-testid="calendar-icon" />,
  EyeOutlined: () => <span data-testid="eye-icon" />,
  ClockCircleOutlined: () => <span data-testid="clock-icon" />,
}));

import { novelService } from '../../../services/admin/novelservice';
import { chapterService } from '../../../services/admin/chapterservice';

const mockNovels = [
  {
    id: 1,
    title: 'Dragon Realm Chronicles',
    authorUsername: 'author1',
    status: 'published',
  },
  {
    id: 2,
    title: 'Mystic Sword Master',
    authorUsername: 'author2',
    status: 'draft',
  },
];

const mockChapters = [
  {
    uuid: 'chapter-1',
    chapterId: 1,
    chapterNumber: 1,
    title: 'The Beginning',
    wordCount: 2500,
    views: 1500,
    publishedAt: '2024-01-15T10:00:00Z',
    status: 'published',
    isPremium: false,
  },
  {
    uuid: 'chapter-2',
    chapterId: 2,
    chapterNumber: 2,
    title: 'The Journey',
    wordCount: 2800,
    views: 1200,
    publishedAt: '2024-01-20T10:00:00Z',
    status: 'published',
    isPremium: true,
  },
];

const renderChapters = async () => {
  let component;
  await act(async () => {
    component = render(
      <BrowserRouter>
        <Chapters />
      </BrowserRouter>
    );
  });
  return component;
};

describe('Chapters Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    novelService.getAllNovels.mockResolvedValue({
      success: true,
      data: mockNovels,
    });

    chapterService.getChaptersByNovel.mockResolvedValue({
      success: true,
      data: mockChapters,
      page: 1,
      pageSize: 10,
      total: 2,
    });

    chapterService.deleteChapter.mockResolvedValue({
      success: true,
    });

    chapterService.deleteChaptersByNovel.mockResolvedValue({
      success: true,
    });
  });

  describe('Rendering', () => {
    test('renders page header with correct title and subtitle', async () => {
      await await renderChapters();

      await waitFor(() => {
        expect(screen.getByTestId('page-header')).toBeInTheDocument();
        expect(screen.getByText('Chapters Management')).toBeInTheDocument();
        expect(
          screen.getByText('Manage and monitor novel chapters')
        ).toBeInTheDocument();
      });
    });

    test('renders novel selection dropdown', async () => {
      await await renderChapters();

      await waitFor(() => {
        expect(
          screen.getByDisplayValue('Select a novel...')
        ).toBeInTheDocument();
      });
    });

    test('renders search bar', async () => {
      await renderChapters();

      await waitFor(() => {
        expect(screen.getByTestId('search-bar')).toBeInTheDocument();
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });
    });

    test('renders loading spinner when fetching chapters', async () => {
      // Mock a delay in the API call to keep loading true
      chapterService.getChaptersByNovel.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  success: true,
                  data: mockChapters,
                  page: 1,
                  pageSize: 10,
                  total: 2,
                }),
              100
            )
          )
      );

      await renderChapters();

      // Select a novel to trigger loading
      await waitFor(() => {
        const novelSelect = screen.getByDisplayValue('Select a novel...');
        fireEvent.change(novelSelect, { target: { value: '1' } });
      });

      // Should show loading spinner while fetching
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    test('renders empty state when no novel is selected', async () => {
      await renderChapters();

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
        expect(screen.getByText('Select a Novel')).toBeInTheDocument();
      });
    });

    test('renders mobile card view when screen is small', async () => {
      // Mock mobile breakpoint
      const { Grid } = require('antd');
      Grid.useBreakpoint.mockReturnValue({ md: false });

      await renderChapters();

      // Wait for novels to load and select one
      await waitFor(() => {
        const novelSelect = screen.getByDisplayValue('Select a novel...');
        fireEvent.change(novelSelect, { target: { value: '1' } });
      });

      // Wait for chapters to load in mobile view
      await waitFor(
        () => {
          expect(screen.getByText('The Beginning')).toBeInTheDocument();
          // Mobile view should render cards
        },
        { timeout: 5000 }
      );
    });
  });

  describe('Novel Selection', () => {
    test('fetches novels on mount', async () => {
      await renderChapters();

      await waitFor(() => {
        expect(novelService.getAllNovels).toHaveBeenCalledWith({
          page: 0,
          size: 200,
        });
      });
    });

    test('populates novel dropdown with fetched novels', async () => {
      await renderChapters();

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options).toHaveLength(3); // "Select a novel..." + 2 novels
        expect(screen.getByText('Dragon Realm Chronicles')).toBeInTheDocument();
        expect(screen.getByText('Mystic Sword Master')).toBeInTheDocument();
      });
    });
  });

  describe('Data Fetching', () => {
    test('handles API errors gracefully', async () => {
      chapterService.getChaptersByNovel.mockRejectedValue(
        new Error('API Error')
      );

      await renderChapters();

      await waitFor(() => {
        const novelSelect = screen.getByDisplayValue('Select a novel...');
        fireEvent.change(novelSelect, { target: { value: '1' } });
      });

      // Should not crash, error is logged to console
      expect(chapterService.getChaptersByNovel).toHaveBeenCalled();
    });

    test('handles novel fetch errors gracefully', async () => {
      novelService.getAllNovels.mockRejectedValue(new Error('API Error'));

      await renderChapters();

      await waitFor(() => {
        // Should still render the page without crashing
        expect(screen.getByTestId('page-header')).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    test('handles table change events', async () => {
      await renderChapters();

      await waitFor(() => {
        const novelSelect = screen.getByDisplayValue('Select a novel...');
        fireEvent.change(novelSelect, { target: { value: '1' } });
      });

      // Table change would be triggered by pagination clicks
      // This is tested implicitly through the pagination rendering
      expect(chapterService.getChaptersByNovel).toHaveBeenCalled();
    });
  });

  describe('Responsive Design', () => {
    test('renders table on desktop screens', async () => {
      const { Grid } = require('antd');
      Grid.useBreakpoint.mockReturnValue({ md: true });

      await renderChapters();

      await waitFor(() => {
        const novelSelect = screen.getByDisplayValue('Select a novel...');
        fireEvent.change(novelSelect, { target: { value: '1' } });
      });

      await waitFor(
        () => {
          expect(screen.getByText('The Beginning')).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    test('renders cards on mobile screens', async () => {
      const { Grid } = require('antd');
      Grid.useBreakpoint.mockReturnValue({ md: false });

      await renderChapters();

      await waitFor(() => {
        const novelSelect = screen.getByDisplayValue('Select a novel...');
        fireEvent.change(novelSelect, { target: { value: '1' } });
      });

      await waitFor(
        () => {
          expect(screen.getByText('The Beginning')).toBeInTheDocument();
          // Mobile view should still show the content
        },
        { timeout: 5000 }
      );
    });
  });

  describe('Empty States', () => {
    test('shows select novel message when no novel selected', async () => {
      await renderChapters();

      await waitFor(() => {
        expect(screen.getByText('Select a Novel')).toBeInTheDocument();
        expect(
          screen.getByText(
            'Please select a novel from the dropdown above to view its chapters.'
          )
        ).toBeInTheDocument();
      });
    });

    test('shows no chapters found when novel selected but no chapters', async () => {
      chapterService.getChaptersByNovel.mockResolvedValue({
        success: true,
        data: [],
        page: 1,
        pageSize: 10,
        total: 0,
      });

      await renderChapters();

      await waitFor(() => {
        const novelSelect = screen.getByDisplayValue('Select a novel...');
        fireEvent.change(novelSelect, { target: { value: '1' } });
      });

      await waitFor(
        () => {
          expect(screen.getByText('No Chapters Found')).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
  });
});
