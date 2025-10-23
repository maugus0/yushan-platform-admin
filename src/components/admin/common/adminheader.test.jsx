import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminHeader from './adminheader';
import { useAdminAuth } from '../../../contexts/admin/adminauthcontext';

// Mock the useAdminAuth hook
jest.mock('../../../contexts/admin/adminauthcontext', () => ({
  useAdminAuth: jest.fn(),
}));

// Mock document fullscreen methods
const mockRequestFullscreen = jest.fn();
const mockExitFullscreen = jest.fn();

Object.defineProperty(document, 'fullscreenElement', {
  writable: true,
  value: null,
});

Object.defineProperty(document.documentElement, 'requestFullscreen', {
  writable: true,
  value: mockRequestFullscreen,
});

Object.defineProperty(document, 'exitFullscreen', {
  writable: true,
  value: mockExitFullscreen,
});

describe('AdminHeader Component', () => {
  const mockLogout = jest.fn();
  const mockAdmin = {
    username: 'Test Admin',
    role: 'super_admin',
    avatar: 'https://example.com/avatar.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAdminAuth.mockReturnValue({
      admin: mockAdmin,
      logout: mockLogout,
    });
    document.fullscreenElement = null;
  });

  describe('Basic Rendering', () => {
    test('renders header component', () => {
      const { container } = render(<AdminHeader />);
      expect(container.querySelector('.ant-layout-header')).toBeInTheDocument();
    });

    test('displays toggle menu button', () => {
      render(<AdminHeader onToggleCollapsed={jest.fn()} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    test('shows menu fold icon when not collapsed', () => {
      const { container } = render(<AdminHeader collapsed={false} />);
      expect(container.querySelector('.anticon-menu-fold')).toBeInTheDocument();
    });

    test('shows menu unfold icon when collapsed', () => {
      const { container } = render(<AdminHeader collapsed={true} />);
      expect(
        container.querySelector('.anticon-menu-unfold')
      ).toBeInTheDocument();
    });
  });

  describe('Menu Toggle', () => {
    test('calls onToggleCollapsed when menu button is clicked', () => {
      const mockToggle = jest.fn();
      render(<AdminHeader onToggleCollapsed={mockToggle} />);

      const toggleButton = screen.getAllByRole('button')[0];
      fireEvent.click(toggleButton);

      expect(mockToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('Search Feature', () => {
    test('shows search button when showSearch is true', () => {
      render(<AdminHeader showSearch={true} />);
      expect(screen.getByText('Search')).toBeInTheDocument();
    });

    test('does not show search button when showSearch is false', () => {
      render(<AdminHeader showSearch={false} />);
      expect(screen.queryByText('Search')).not.toBeInTheDocument();
    });

    test('calls onSearch when search button is clicked', () => {
      const mockOnSearch = jest.fn();
      render(<AdminHeader showSearch={true} onSearch={mockOnSearch} />);

      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);

      expect(mockOnSearch).toHaveBeenCalled();
    });
  });

  describe('Notifications', () => {
    test('shows notifications button when showNotifications is true', () => {
      const { container } = render(<AdminHeader showNotifications={true} />);
      expect(container.querySelector('.anticon-bell')).toBeInTheDocument();
    });

    test('does not show notifications when showNotifications is false', () => {
      const { container } = render(<AdminHeader showNotifications={false} />);
      expect(container.querySelector('.anticon-bell')).not.toBeInTheDocument();
    });

    test('displays notification items in dropdown', async () => {
      const notifications = [
        {
          title: 'Test Notification',
          description: 'Test Description',
          time: '5 min ago',
        },
      ];

      render(
        <AdminHeader showNotifications={true} notifications={notifications} />
      );

      const notificationButton = screen
        .getAllByRole('button')
        .find((btn) => btn.querySelector('.anticon-bell'));
      fireEvent.click(notificationButton);

      await waitFor(() => {
        expect(screen.getByText('Test Notification')).toBeInTheDocument();
      });
    });

    test('shows view all option when more than 5 notifications', async () => {
      const notifications = Array.from({ length: 7 }, (_, i) => ({
        title: `Notification ${i + 1}`,
        description: `Description ${i + 1}`,
        time: `${i + 1} min ago`,
      }));

      render(
        <AdminHeader showNotifications={true} notifications={notifications} />
      );

      const notificationButton = screen
        .getAllByRole('button')
        .find((btn) => btn.querySelector('.anticon-bell'));
      fireEvent.click(notificationButton);

      await waitFor(() => {
        expect(screen.getByText('View All Notifications')).toBeInTheDocument();
      });
    });

    test('calls onNotificationClick when notification is clicked', async () => {
      const mockOnNotificationClick = jest.fn();
      const notifications = [
        {
          title: 'Test Notification',
          description: 'Test Description',
          time: '5 min ago',
        },
      ];

      render(
        <AdminHeader
          showNotifications={true}
          notifications={notifications}
          onNotificationClick={mockOnNotificationClick}
        />
      );

      const notificationButton = screen
        .getAllByRole('button')
        .find((btn) => btn.querySelector('.anticon-bell'));
      fireEvent.click(notificationButton);

      await waitFor(() => {
        const notificationItem = screen.getByText('Test Notification');
        fireEvent.click(notificationItem);
      });

      expect(mockOnNotificationClick).toHaveBeenCalled();
    });
  });

  describe('Fullscreen Feature', () => {
    test('shows fullscreen button when showFullscreen is true', () => {
      const { container } = render(<AdminHeader showFullscreen={true} />);
      expect(
        container.querySelector('.anticon-fullscreen')
      ).toBeInTheDocument();
    });

    test('does not show fullscreen button when showFullscreen is false', () => {
      const { container } = render(<AdminHeader showFullscreen={false} />);
      expect(
        container.querySelector('.anticon-fullscreen')
      ).not.toBeInTheDocument();
    });

    test('requests fullscreen when fullscreen button is clicked', () => {
      render(<AdminHeader showFullscreen={true} />);

      const fullscreenButton = screen
        .getAllByRole('button')
        .find((btn) => btn.querySelector('.anticon-fullscreen'));
      fireEvent.click(fullscreenButton);

      expect(mockRequestFullscreen).toHaveBeenCalled();
    });

    test('exits fullscreen when already in fullscreen mode', () => {
      document.fullscreenElement = document.documentElement;

      render(<AdminHeader showFullscreen={true} />);

      const fullscreenButton = screen
        .getAllByRole('button')
        .find((btn) => btn.querySelector('.anticon-fullscreen-exit'));

      if (fullscreenButton) {
        fireEvent.click(fullscreenButton);
        expect(mockExitFullscreen).toHaveBeenCalled();
      }
    });
  });

  describe('User Menu', () => {
    test('shows user menu when showUserMenu is true and admin exists', () => {
      render(<AdminHeader showUserMenu={true} />);
      expect(screen.getByText('Test Admin')).toBeInTheDocument();
    });

    test('does not show user menu when showUserMenu is false', () => {
      render(<AdminHeader showUserMenu={false} />);
      expect(screen.queryByText('Test Admin')).not.toBeInTheDocument();
    });

    test('displays admin username', () => {
      render(<AdminHeader showUserMenu={true} />);
      expect(screen.getByText('Test Admin')).toBeInTheDocument();
    });

    test('displays admin role', () => {
      render(<AdminHeader showUserMenu={true} />);
      expect(screen.getByText('super admin')).toBeInTheDocument();
    });

    test('displays avatar', () => {
      const { container } = render(<AdminHeader showUserMenu={true} />);
      const avatar = container.querySelector('.ant-avatar');
      expect(avatar).toBeInTheDocument();
    });

    test('shows profile option in dropdown', async () => {
      render(<AdminHeader showUserMenu={true} />);

      const userMenu = screen.getByText('Test Admin');
      fireEvent.click(userMenu);

      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument();
      });
    });

    test('shows logout option in dropdown', async () => {
      render(<AdminHeader showUserMenu={true} />);

      const userMenu = screen.getByText('Test Admin');
      fireEvent.click(userMenu);

      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });
    });

    test('calls logout when logout option is clicked', async () => {
      const mockOnUserMenuClick = jest.fn();
      render(
        <AdminHeader
          showUserMenu={true}
          onUserMenuClick={mockOnUserMenuClick}
        />
      );

      const userMenu = screen.getByText('Test Admin');
      fireEvent.click(userMenu);

      await waitFor(() => {
        const logoutOption = screen.getByText('Logout');
        fireEvent.click(logoutOption);
      });

      expect(mockLogout).toHaveBeenCalled();
      expect(mockOnUserMenuClick).toHaveBeenCalledWith('logout');
    });

    test('calls onUserMenuClick with profile when profile clicked', async () => {
      const mockOnUserMenuClick = jest.fn();
      render(
        <AdminHeader
          showUserMenu={true}
          onUserMenuClick={mockOnUserMenuClick}
        />
      );

      const userMenu = screen.getByText('Test Admin');
      fireEvent.click(userMenu);

      await waitFor(() => {
        const profileOption = screen.getByText('Profile');
        fireEvent.click(profileOption);
      });

      expect(mockOnUserMenuClick).toHaveBeenCalledWith('profile');
    });
  });

  describe('Mobile Layout', () => {
    test('hides username and role on mobile', () => {
      render(<AdminHeader showUserMenu={true} isMobile={true} />);
      expect(screen.queryByText('Test Admin')).not.toBeInTheDocument();
    });

    test('shows avatar on mobile', () => {
      const { container } = render(
        <AdminHeader showUserMenu={true} isMobile={true} />
      );
      const avatar = container.querySelector('.ant-avatar');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('Extra Content', () => {
    test('renders extra content', () => {
      const extra = <div data-testid="extra-content">Extra</div>;
      render(<AdminHeader extra={extra} />);
      expect(screen.getByTestId('extra-content')).toBeInTheDocument();
    });
  });

  describe('Customization', () => {
    test('applies custom style', () => {
      const customStyle = { backgroundColor: 'red' };
      const { container } = render(<AdminHeader style={customStyle} />);
      const header = container.querySelector('.ant-layout-header');
      expect(header).toHaveStyle(customStyle);
    });

    test('applies custom className', () => {
      const { container } = render(<AdminHeader className="custom-header" />);
      const header = container.querySelector('.custom-header');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles missing admin data', () => {
      useAdminAuth.mockReturnValue({
        admin: null,
        logout: mockLogout,
      });

      const { container } = render(<AdminHeader showUserMenu={true} />);
      expect(container).toBeInTheDocument();
    });

    test('handles admin without avatar', () => {
      useAdminAuth.mockReturnValue({
        admin: { ...mockAdmin, avatar: null },
        logout: mockLogout,
      });

      const { container } = render(<AdminHeader showUserMenu={true} />);
      const avatar = container.querySelector('.ant-avatar');
      expect(avatar).toBeInTheDocument();
    });

    test('handles admin without role', () => {
      useAdminAuth.mockReturnValue({
        admin: { ...mockAdmin, role: null },
        logout: mockLogout,
      });

      render(<AdminHeader showUserMenu={true} />);
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    test('handles empty notifications array', () => {
      const { container } = render(
        <AdminHeader showNotifications={true} notifications={[]} />
      );
      expect(container.querySelector('.anticon-bell')).toBeInTheDocument();
    });
  });
});
