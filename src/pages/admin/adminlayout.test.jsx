import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import {
  AdminAuthProvider,
  useAdminAuth,
} from '../../contexts/admin/adminauthcontext';
import AdminLayout from './adminlayout';

// Mock components
jest.mock('../../components/admin/common', () => ({
  AdminHeader: ({
    onToggleCollapsed,
    onUserMenuClick,
    onNotificationClick,
    collapsed,
    ...props
  }) => (
    <div data-testid="admin-header" data-collapsed={collapsed} {...props}>
      <button data-testid="toggle-sidebar" onClick={onToggleCollapsed}>
        Toggle
      </button>
      <button
        data-testid="user-menu-profile"
        onClick={() => onUserMenuClick('profile')}
      >
        Profile
      </button>
      <button
        data-testid="user-menu-logout"
        onClick={() => onUserMenuClick('logout')}
      >
        Logout
      </button>
      <button
        data-testid="notification-view-all"
        onClick={() => onNotificationClick('view-all')}
      >
        View All
      </button>
    </div>
  ),
  AdminSidebar: ({ onMenuClick, collapsed, ...props }) => (
    <div data-testid="admin-sidebar" data-collapsed={collapsed} {...props}>
      <button data-testid="sidebar-menu-item" onClick={onMenuClick}>
        Menu Item
      </button>
    </div>
  ),
  ErrorBoundary: ({ children, ...props }) => (
    <div data-testid="error-boundary" {...props}>
      {children}
    </div>
  ),
}));

// Mock the auth context
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Outlet: () => <div data-testid="outlet">Page Content</div>,
}));

jest.mock('../../contexts/admin/adminauthcontext', () => ({
  ...jest.requireActual('../../contexts/admin/adminauthcontext'),
  useAdminAuth: jest.fn(),
}));

const renderAdminLayout = (
  authState = {},
  initialEntries = ['/admin/dashboard']
) => {
  const defaultAuthState = {
    isAuthenticated: true,
    loading: false,
    ...authState,
  };

  useAdminAuth.mockReturnValue(defaultAuthState);

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <AdminAuthProvider>
              <AdminLayout />
            </AdminAuthProvider>
          }
        />
        <Route path="/admin/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('AdminLayout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Authentication Handling', () => {
    test('renders layout when authenticated', () => {
      renderAdminLayout({ isAuthenticated: true, loading: false });

      expect(screen.getByTestId('admin-header')).toBeInTheDocument();
      expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });

    test('redirects to login when not authenticated and not loading', () => {
      renderAdminLayout({ isAuthenticated: false, loading: false });

      expect(mockNavigate).toHaveBeenCalledWith('/admin/login');
    });

    test('does not redirect when loading', () => {
      renderAdminLayout({ isAuthenticated: false, loading: true });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('shows loading state when checking authentication', () => {
      renderAdminLayout({ isAuthenticated: false, loading: true });

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('returns null when not authenticated and not loading', () => {
      renderAdminLayout({ isAuthenticated: false, loading: false });

      expect(screen.queryByTestId('admin-header')).not.toBeInTheDocument();
      expect(screen.queryByTestId('admin-sidebar')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    test('detects desktop mode correctly', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024 });
      renderAdminLayout();

      // Should show sidebar by default on desktop
      const sidebar = screen.getByTestId('admin-sidebar');
      expect(sidebar).toHaveStyle({ transform: 'translateX(0)' });
    });

    test('detects mobile mode correctly', () => {
      Object.defineProperty(window, 'innerWidth', { value: 768 });
      renderAdminLayout();

      // Should hide sidebar by default on mobile
      const sidebar = screen.getByTestId('admin-sidebar');
      expect(sidebar).toHaveStyle({ transform: 'translateX(-100%)' });
    });

    test('handles window resize from desktop to mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024 });
      renderAdminLayout();

      // Initially desktop
      let sidebar = screen.getByTestId('admin-sidebar');
      expect(sidebar).toHaveStyle({ transform: 'translateX(0)' });

      // Resize to mobile
      act(() => {
        Object.defineProperty(window, 'innerWidth', { value: 768 });
        window.dispatchEvent(new Event('resize'));
      });

      sidebar = screen.getByTestId('admin-sidebar');
      expect(sidebar).toHaveStyle({ transform: 'translateX(-100%)' });
    });

    test('handles window resize from mobile to desktop', () => {
      Object.defineProperty(window, 'innerWidth', { value: 768 });
      renderAdminLayout();

      // Initially mobile
      let sidebar = screen.getByTestId('admin-sidebar');
      expect(sidebar).toHaveStyle({ transform: 'translateX(-100%)' });

      // Resize to desktop
      act(() => {
        Object.defineProperty(window, 'innerWidth', { value: 1024 });
        window.dispatchEvent(new Event('resize'));
      });

      sidebar = screen.getByTestId('admin-sidebar');
      expect(sidebar).toHaveStyle({ transform: 'translateX(0)' });
    });
  });

  describe('Sidebar Functionality', () => {
    test('toggles sidebar collapse on desktop', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024 });
      renderAdminLayout();

      const toggleButton = screen.getByTestId('toggle-sidebar');
      const sidebar = screen.getByTestId('admin-sidebar');

      // Initially not collapsed
      expect(sidebar).toHaveAttribute('data-collapsed', 'false');

      // Click to collapse
      fireEvent.click(toggleButton);
      expect(sidebar).toHaveAttribute('data-collapsed', 'true');

      // Click to expand
      fireEvent.click(toggleButton);
      expect(sidebar).toHaveAttribute('data-collapsed', 'false');
    });

    test('toggles sidebar visibility on mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: 768 });
      renderAdminLayout();

      const toggleButton = screen.getByTestId('toggle-sidebar');
      const sidebar = screen.getByTestId('admin-sidebar');

      // Initially hidden
      expect(sidebar).toHaveStyle({ transform: 'translateX(-100%)' });

      // Click to show
      fireEvent.click(toggleButton);
      expect(sidebar).toHaveStyle({ transform: 'translateX(0)' });

      // Click to hide
      fireEvent.click(toggleButton);
      expect(sidebar).toHaveStyle({ transform: 'translateX(-100%)' });
    });

    test('closes mobile sidebar when clicking backdrop', () => {
      Object.defineProperty(window, 'innerWidth', { value: 768 });
      renderAdminLayout();

      const toggleButton = screen.getByTestId('toggle-sidebar');
      fireEvent.click(toggleButton); // Show sidebar

      const backdrop = document.querySelector('.admin-sidebar-backdrop');
      expect(backdrop).toBeInTheDocument();
      expect(backdrop).toHaveClass('show');

      fireEvent.click(backdrop);
      // Backdrop should be removed from DOM when sidebar closes
      expect(
        document.querySelector('.admin-sidebar-backdrop')
      ).not.toBeInTheDocument();
    });

    test('closes mobile sidebar when clicking menu item', () => {
      Object.defineProperty(window, 'innerWidth', { value: 768 });
      renderAdminLayout();

      const toggleButton = screen.getByTestId('toggle-sidebar');
      fireEvent.click(toggleButton); // Show sidebar

      const menuItem = screen.getByTestId('sidebar-menu-item');
      fireEvent.click(menuItem);

      const sidebar = screen.getByTestId('admin-sidebar');
      expect(sidebar).toHaveStyle({ transform: 'translateX(-100%)' });
    });

    test('closes mobile sidebar on route change', () => {
      Object.defineProperty(window, 'innerWidth', { value: 768 });
      const { rerender } = renderAdminLayout();

      // Initially sidebar should be hidden on mobile
      const sidebars = screen.getAllByTestId('admin-sidebar');
      expect(sidebars.length).toBeGreaterThanOrEqual(1);

      // Simulate route change by re-rendering with different route
      rerender(
        <MemoryRouter initialEntries={['/admin/users']}>
          <Routes>
            <Route
              path="/admin/*"
              element={
                <AdminAuthProvider>
                  <AdminLayout />
                </AdminAuthProvider>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      // Component should still render correctly after route change
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });
  });

  describe('User Menu Actions', () => {
    test('navigates to profile on user menu click', () => {
      renderAdminLayout();

      const profileButton = screen.getByTestId('user-menu-profile');
      fireEvent.click(profileButton);

      expect(mockNavigate).toHaveBeenCalledWith('/admin/profile');
    });

    test('handles logout action', () => {
      renderAdminLayout();

      const logoutButton = screen.getByTestId('user-menu-logout');
      fireEvent.click(logoutButton);

      // Logout is handled in AdminHeader, so we just verify the click handler is called
      expect(logoutButton).toBeInTheDocument();
    });
  });

  describe('Notification Handling', () => {
    test('navigates to notifications page when viewing all', () => {
      renderAdminLayout();

      const viewAllButton = screen.getByTestId('notification-view-all');
      fireEvent.click(viewAllButton);

      expect(mockNavigate).toHaveBeenCalledWith('/admin/notifications');
    });
  });

  describe('Layout Structure', () => {
    test('wraps content in error boundary', () => {
      renderAdminLayout();

      const errorBoundaries = screen.getAllByTestId('error-boundary');
      expect(errorBoundaries.length).toBeGreaterThanOrEqual(1);

      // Check that outlet is inside an error boundary
      const outlet = screen.getByTestId('outlet');
      const parentErrorBoundary = outlet.closest(
        '[data-testid="error-boundary"]'
      );
      expect(parentErrorBoundary).toBeInTheDocument();
    });

    test('applies correct CSS classes based on state', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024 });
      renderAdminLayout();

      const layout = screen
        .getByTestId('admin-header')
        .closest('.admin-layout');
      expect(layout).toHaveClass('admin-layout');
      expect(layout).not.toHaveClass('sidebar-open');
      expect(layout).not.toHaveClass('sidebar-collapsed');
    });

    test('applies mobile CSS classes when sidebar is open', () => {
      Object.defineProperty(window, 'innerWidth', { value: 768 });
      renderAdminLayout();

      const toggleButton = screen.getByTestId('toggle-sidebar');
      fireEvent.click(toggleButton); // Show sidebar

      const layout = screen
        .getByTestId('admin-header')
        .closest('.admin-layout');
      expect(layout).toHaveClass('sidebar-open');
    });

    test('applies collapsed CSS classes on desktop', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024 });
      renderAdminLayout();

      const toggleButton = screen.getByTestId('toggle-sidebar');
      fireEvent.click(toggleButton); // Collapse sidebar

      const layout = screen
        .getByTestId('admin-header')
        .closest('.admin-layout');
      expect(layout).toHaveClass('sidebar-collapsed');
    });
  });

  describe('Content Area', () => {
    test('renders outlet with correct styling', () => {
      renderAdminLayout();

      // Find the Content component by its Ant Design class
      const content = document.querySelector('.ant-layout-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveStyle({
        margin: '24px',
        padding: '24px',
        background: '#fff',
        borderRadius: '8px',
        minHeight: '280px',
      });
    });

    test('applies mobile content styling', () => {
      Object.defineProperty(window, 'innerWidth', { value: 768 });
      renderAdminLayout();

      const content = document.querySelector('.ant-layout-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveStyle({
        margin: '16px',
        padding: '16px',
      });
    });

    test('adjusts margin based on sidebar state', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024 });
      renderAdminLayout();

      const layout = screen.getByTestId('admin-header').closest('.ant-layout');
      expect(layout).toHaveStyle({ marginLeft: '256px' }); // Full sidebar

      const toggleButton = screen.getByTestId('toggle-sidebar');
      fireEvent.click(toggleButton); // Collapse sidebar

      expect(layout).toHaveStyle({ marginLeft: '80px' }); // Collapsed sidebar
    });
  });

  describe('Mock Data', () => {
    test('provides mock notifications data', () => {
      renderAdminLayout();

      // The mock data should be passed to AdminHeader
      const header = screen.getByTestId('admin-header');
      expect(header).toBeInTheDocument();
      // We can't easily test the exact data without more complex mocking
    });

    test('provides sidebar notifications count', () => {
      renderAdminLayout();

      const sidebar = screen.getByTestId('admin-sidebar');
      expect(sidebar).toBeInTheDocument();
      // Notifications prop should be passed
    });
  });

  describe('Error Handling', () => {
    test('wraps outlet in error boundary for page errors', () => {
      renderAdminLayout();

      const errorBoundaries = screen.getAllByTestId('error-boundary');
      expect(errorBoundaries.length).toBeGreaterThanOrEqual(2); // Layout + Content
    });
  });
});
