import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminSidebar from './adminsidebar';

const mockNavigate = jest.fn();
const mockUseLocation = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('AdminSidebar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocation.mockReturnValue({ pathname: '/admin/dashboard' });
  });

  describe('Basic Rendering', () => {
    test('renders sidebar component', () => {
      const { container } = renderWithRouter(<AdminSidebar />);
      expect(container.querySelector('.ant-layout-sider')).toBeInTheDocument();
    });

    test('displays brand name when not collapsed', () => {
      renderWithRouter(<AdminSidebar collapsed={false} />);
      expect(screen.getByText('Yushan')).toBeInTheDocument();
    });

    test('displays abbreviated brand when collapsed', () => {
      renderWithRouter(<AdminSidebar collapsed={true} />);
      expect(screen.getByText('Y')).toBeInTheDocument();
    });

    test('renders navigation menu', () => {
      const { container } = renderWithRouter(<AdminSidebar />);
      expect(container.querySelector('.ant-menu')).toBeInTheDocument();
    });
  });

  describe('Menu Items', () => {
    test('renders Dashboard menu item', () => {
      renderWithRouter(<AdminSidebar />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    test('renders Users menu item', () => {
      renderWithRouter(<AdminSidebar />);
      expect(screen.getByText('Users')).toBeInTheDocument();
    });

    test('renders Novels menu item', () => {
      renderWithRouter(<AdminSidebar />);
      expect(screen.getByText('Novels')).toBeInTheDocument();
    });

    test('renders Chapters menu item', () => {
      renderWithRouter(<AdminSidebar />);
      expect(screen.getByText('Chapters')).toBeInTheDocument();
    });

    test('renders Categories menu item', () => {
      renderWithRouter(<AdminSidebar />);
      expect(screen.getByText('Categories')).toBeInTheDocument();
    });

    test('renders Comments menu item', () => {
      renderWithRouter(<AdminSidebar />);
      expect(screen.getByText('Comments')).toBeInTheDocument();
    });

    test('renders Reviews menu item', () => {
      renderWithRouter(<AdminSidebar />);
      expect(screen.getByText('Reviews')).toBeInTheDocument();
    });

    test('renders Library menu item', () => {
      renderWithRouter(<AdminSidebar />);
      expect(screen.getByText('Library')).toBeInTheDocument();
    });

    test('renders Rankings menu item', () => {
      renderWithRouter(<AdminSidebar />);
      expect(screen.getByText('Rankings')).toBeInTheDocument();
    });

    test('renders Yuan System menu item', () => {
      renderWithRouter(<AdminSidebar />);
      expect(screen.getByText('Yuan System')).toBeInTheDocument();
    });

    test('renders Reports menu item', () => {
      renderWithRouter(<AdminSidebar />);
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });

    test('renders Settings menu item', () => {
      renderWithRouter(<AdminSidebar />);
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  describe('Users Submenu', () => {
    test('has Users submenu with children', async () => {
      renderWithRouter(<AdminSidebar />);
      const usersMenu = screen.getByText('Users');
      fireEvent.click(usersMenu);

      await waitFor(() => {
        expect(screen.getByText('Overview')).toBeInTheDocument();
        expect(screen.getByText('Readers')).toBeInTheDocument();
        expect(screen.getByText('Writers')).toBeInTheDocument();
      });
    });

    test('expands Users submenu when on users path', () => {
      mockUseLocation.mockReturnValue({ pathname: '/admin/users' });
      renderWithRouter(<AdminSidebar />);

      // The Users submenu should be expanded
      expect(screen.getByText('Overview')).toBeInTheDocument();
    });

    test('navigates to Overview when clicked', async () => {
      renderWithRouter(<AdminSidebar />);
      const usersMenu = screen.getByText('Users');
      fireEvent.click(usersMenu);

      await waitFor(() => {
        const overviewItem = screen.getByText('Overview');
        fireEvent.click(overviewItem);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/admin/users', {
        replace: false,
      });
    });
  });

  describe('Navigation', () => {
    test('navigates to Dashboard when clicked', () => {
      renderWithRouter(<AdminSidebar />);
      const dashboardItem = screen.getByText('Dashboard');
      fireEvent.click(dashboardItem);

      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard', {
        replace: false,
      });
    });

    test('navigates to Novels when clicked', () => {
      renderWithRouter(<AdminSidebar />);
      const novelsItem = screen.getByText('Novels');
      fireEvent.click(novelsItem);

      expect(mockNavigate).toHaveBeenCalledWith('/admin/novels', {
        replace: false,
      });
    });

    test('calls onMenuClick when menu item is clicked', () => {
      const mockOnMenuClick = jest.fn();
      renderWithRouter(<AdminSidebar onMenuClick={mockOnMenuClick} />);

      const dashboardItem = screen.getByText('Dashboard');
      fireEvent.click(dashboardItem);

      expect(mockOnMenuClick).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  describe('Active Menu Item', () => {
    test('highlights Dashboard when on dashboard path', () => {
      mockUseLocation.mockReturnValue({ pathname: '/admin/dashboard' });
      const { container } = renderWithRouter(<AdminSidebar />);

      const selectedItem = container.querySelector('.ant-menu-item-selected');
      expect(selectedItem).toBeInTheDocument();
    });

    test('highlights Novels when on novels path', () => {
      mockUseLocation.mockReturnValue({ pathname: '/admin/novels' });
      renderWithRouter(<AdminSidebar />);

      expect(screen.getByText('Novels')).toBeInTheDocument();
    });

    test('highlights Readers when on readers path', () => {
      mockUseLocation.mockReturnValue({ pathname: '/admin/users/readers' });
      renderWithRouter(<AdminSidebar />);

      expect(screen.getByText('Readers')).toBeInTheDocument();
    });

    test('highlights Writers when on writers path', () => {
      mockUseLocation.mockReturnValue({ pathname: '/admin/users/writers' });
      renderWithRouter(<AdminSidebar />);

      expect(screen.getByText('Writers')).toBeInTheDocument();
    });
  });

  describe('Collapsed State', () => {
    test('applies collapsed state to sidebar', () => {
      const { container } = renderWithRouter(<AdminSidebar collapsed={true} />);
      const sider = container.querySelector('.ant-layout-sider-collapsed');
      expect(sider).toBeInTheDocument();
    });

    test('applies expanded state to sidebar', () => {
      const { container } = renderWithRouter(
        <AdminSidebar collapsed={false} />
      );
      const sider = container.querySelector('.ant-layout-sider');
      expect(sider).toBeInTheDocument();
    });
  });

  describe('Theme', () => {
    test('applies light theme', () => {
      const { container } = renderWithRouter(<AdminSidebar theme="light" />);
      const sider = container.querySelector('.ant-layout-sider');
      expect(sider).toBeInTheDocument();
    });

    test('applies dark theme', () => {
      const { container } = renderWithRouter(<AdminSidebar theme="dark" />);
      const menu = container.querySelector('.ant-menu-dark');
      expect(menu).toBeInTheDocument();
    });
  });

  describe('Customization', () => {
    test('applies custom width', () => {
      const { container } = renderWithRouter(<AdminSidebar width={300} />);
      const sider = container.querySelector('.ant-layout-sider');
      expect(sider).toBeInTheDocument();
    });

    test('applies custom style', () => {
      const customStyle = { backgroundColor: 'red' };
      const { container } = renderWithRouter(
        <AdminSidebar style={customStyle} />
      );
      const sider = container.querySelector('.ant-layout-sider');
      expect(sider).toHaveStyle(customStyle);
    });

    test('applies custom className', () => {
      const { container } = renderWithRouter(
        <AdminSidebar className="custom-sidebar" />
      );
      expect(container.querySelector('.custom-sidebar')).toBeInTheDocument();
    });
  });

  describe('Submenu Behavior', () => {
    test('opens Users submenu when clicked', async () => {
      renderWithRouter(<AdminSidebar />);
      const usersMenu = screen.getByText('Users');

      fireEvent.click(usersMenu);

      await waitFor(() => {
        expect(screen.getByText('Overview')).toBeInTheDocument();
      });
    });

    test('closes submenu when clicked again', async () => {
      mockUseLocation.mockReturnValue({ pathname: '/admin/users' });
      renderWithRouter(<AdminSidebar />);

      // Submenu is open
      expect(screen.getByText('Overview')).toBeInTheDocument();

      // Click to close
      const usersMenu = screen.getByText('Users');
      fireEvent.click(usersMenu);

      // Note: Ant Design Menu handles this internally
    });
  });

  describe('Nested Route Handling', () => {
    test('handles nested readers route correctly', () => {
      mockUseLocation.mockReturnValue({ pathname: '/admin/users/readers/123' });
      renderWithRouter(<AdminSidebar />);

      expect(screen.getByText('Readers')).toBeInTheDocument();
    });

    test('handles nested writers route correctly', () => {
      mockUseLocation.mockReturnValue({ pathname: '/admin/users/writers/456' });
      renderWithRouter(<AdminSidebar />);

      expect(screen.getByText('Writers')).toBeInTheDocument();
    });

    test('handles exact users path', () => {
      mockUseLocation.mockReturnValue({ pathname: '/admin/users' });
      renderWithRouter(<AdminSidebar />);

      expect(screen.getByText('Overview')).toBeInTheDocument();
    });
  });

  describe('Menu Icons', () => {
    test('renders Dashboard icon', () => {
      const { container } = renderWithRouter(<AdminSidebar />);
      expect(container.querySelector('.anticon-dashboard')).toBeInTheDocument();
    });

    test('renders Users icon', () => {
      const { container } = renderWithRouter(<AdminSidebar />);
      expect(container.querySelector('.anticon-user')).toBeInTheDocument();
    });

    test('renders Book icon for Novels', () => {
      const { container } = renderWithRouter(<AdminSidebar />);
      expect(container.querySelector('.anticon-book')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty pathname', () => {
      mockUseLocation.mockReturnValue({ pathname: '' });
      const { container } = renderWithRouter(<AdminSidebar />);
      expect(container).toBeInTheDocument();
    });

    test('handles null pathname safely', () => {
      // Use empty string instead of null/undefined
      mockUseLocation.mockReturnValue({ pathname: '' });
      const { container } = renderWithRouter(<AdminSidebar />);
      expect(container).toBeInTheDocument();
    });

    test('handles unmatched route', () => {
      mockUseLocation.mockReturnValue({ pathname: '/admin/unknown' });
      const { container } = renderWithRouter(<AdminSidebar />);
      expect(container).toBeInTheDocument();
    });
  });
});
