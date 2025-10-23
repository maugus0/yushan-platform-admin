import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// ... other imports and mocks

// Mock AdminAuthProvider to a passthrough provider (avoid context side-effects)
jest.mock('./contexts/admin/adminauthcontext', () => ({
  AdminAuthProvider: ({ children }) => children,
}));

// Mock AdminLayout to render an Outlet container
jest.mock('./pages/admin/adminlayout', () => {
  const { Outlet } = require('react-router-dom');
  const Layout = () => (
    <div>
      <Outlet />
    </div>
  );
  Layout.displayName = 'MockAdminLayout';
  return Layout;
});

// Corrected page mocks
jest.mock('./pages/admin/login', () => {
  const MockLogin = () => <div>Admin Login</div>;
  MockLogin.displayName = 'MockAdminLogin'; // Optional: for better debug output
  return MockLogin;
});
jest.mock('./pages/admin/dashboard', () => {
  const MockDashboard = () => <div>Dashboard</div>;
  MockDashboard.displayName = 'MockDashboard';
  return MockDashboard;
});
jest.mock('./pages/admin/profile', () => {
  const MockProfile = () => <div>Admin Profile</div>;
  MockProfile.displayName = 'MockAdminProfile';
  return MockProfile;
});

// User Management Mocks
jest.mock('./pages/admin/users/index', () => {
  const MockUsersOverview = () => <div>Users Overview</div>;
  MockUsersOverview.displayName = 'MockUsersOverview';
  return MockUsersOverview;
});
jest.mock('./pages/admin/users/readers', () => {
  const MockReaders = () => <div>Readers</div>;
  MockReaders.displayName = 'MockReaders';
  return MockReaders;
});
jest.mock('./pages/admin/users/writers', () => {
  const MockWriters = () => <div>Writers</div>;
  MockWriters.displayName = 'MockWriters';
  return MockWriters;
});
jest.mock('./pages/admin/users/changestatus', () => {
  const MockChangeStatus = () => <div>Change Status</div>;
  MockChangeStatus.displayName = 'MockChangeStatus';
  return MockChangeStatus;
});
jest.mock('./pages/admin/users/promotetoadmin', () => {
  const MockPromote = () => <div>Promote To Admin</div>;
  MockPromote.displayName = 'MockPromote';
  return MockPromote;
});

// Novel Management Mocks
jest.mock('./pages/admin/novels', () => {
  const MockNovels = () => <div>Novels</div>;
  MockNovels.displayName = 'MockNovels';
  return MockNovels;
});
jest.mock('./pages/admin/novels/review', () => {
  const MockReviewNovels = () => <div>Review Novels</div>;
  MockReviewNovels.displayName = 'MockReviewNovels';
  return MockReviewNovels;
});
jest.mock('./pages/admin/novels/moderate', () => {
  const MockModerateNovels = () => <div>Moderate Novels</div>;
  MockModerateNovels.displayName = 'MockModerateNovels';
  return MockModerateNovels;
});

// Yuan Management Mocks
jest.mock('./pages/admin/yuan', () => {
  const MockYuan = () => <div>Yuan</div>;
  MockYuan.displayName = 'MockYuan';
  return MockYuan;
});
jest.mock('./pages/admin/yuan/yuanstatistics', () => {
  const MockYuanStats = () => <div>Yuan Statistics</div>;
  MockYuanStats.displayName = 'MockYuanStats';
  return MockYuanStats;
});

// Other pages Mocks
jest.mock('./pages/admin/categories', () => {
  const MockCategories = () => <div>Categories</div>;
  MockCategories.displayName = 'MockCategories';
  return MockCategories;
});
jest.mock('./pages/admin/chapters', () => {
  const MockChapters = () => <div>Chapters</div>;
  MockChapters.displayName = 'MockChapters';
  return MockChapters;
});
jest.mock('./pages/admin/comments', () => {
  const MockComments = () => <div>Comments</div>;
  MockComments.displayName = 'MockComments';
  return MockComments;
});
jest.mock('./pages/admin/reviews', () => {
  const MockReviews = () => <div>Reviews</div>;
  MockReviews.displayName = 'MockReviews';
  return MockReviews;
});
jest.mock('./pages/admin/rankings', () => {
  const MockRankings = () => <div>Rankings</div>;
  MockRankings.displayName = 'MockRankings';
  return MockRankings;
});
jest.mock('./pages/admin/reports', () => {
  const MockReports = () => <div>Reports</div>;
  MockReports.displayName = 'MockReports';
  return MockReports;
});
jest.mock('./pages/admin/library', () => {
  const MockLibrary = () => <div>Library</div>;
  MockLibrary.displayName = 'MockLibrary';
  return MockLibrary;
});
jest.mock('./pages/admin/settings', () => {
  const MockSettings = () => <div>Settings</div>;
  MockSettings.displayName = 'MockSettings';
  return MockSettings;
});

// Import App after mocks
import App from './App';

describe('App routing', () => {
  test('redirects from "/" to "/admin/login" and renders login', async () => {
    window.history.pushState({}, '', '/');
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Admin Login')).toBeInTheDocument();
    });
    expect(window.location.pathname).toBe('/admin/login');
  });

  test('renders dashboard route', async () => {
    window.history.pushState({}, '', '/admin/dashboard');
    render(<App />);

    // Wait for dashboard content directly
    await screen.findByText('Dashboard');
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  // Apply the same pattern (wait for content) to other routes
  test('renders readers page route', async () => {
    window.history.pushState({}, '', '/admin/users/readers');
    render(<App />);

    await screen.findByText('Readers');
    expect(screen.getByText('Readers')).toBeInTheDocument();
  });

  test('renders multiple nested routes correctly', async () => {
    // Categories
    window.history.pushState({}, '', '/admin/categories');
    render(<App />);
    await screen.findByText('Categories');

    // Navigate to settings
    window.history.pushState({}, '', '/admin/settings');
    render(<App />);
    await screen.findByText('Settings');

    // Navigate to library
    window.history.pushState({}, '', '/admin/library');
    render(<App />);
    await screen.findByText('Library');
  });
});
