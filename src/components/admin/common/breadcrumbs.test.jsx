import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Breadcrumbs from './breadcrumbs';
import { HomeOutlined } from '@ant-design/icons';

const mockNavigate = jest.fn();
const mockUseLocation = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
}));

describe('Breadcrumbs Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocation.mockReturnValue({ pathname: '/admin/dashboard' });
  });

  const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe('Basic Rendering', () => {
    test('renders with items prop', () => {
      const items = [{ title: 'Home' }, { title: 'Dashboard' }];
      const { container } = renderWithRouter(<Breadcrumbs items={items} />);
      expect(container).toBeInTheDocument();
    });

    test('renders null when no items and autoGenerate is false', () => {
      const { container } = renderWithRouter(
        <Breadcrumbs items={[]} autoGenerate={false} />
      );
      expect(container.firstChild).toBeNull();
    });

    test('displays breadcrumb items correctly', () => {
      const items = [
        { title: 'Home' },
        { title: 'Products' },
        { title: 'Details' },
      ];
      renderWithRouter(<Breadcrumbs items={items} />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Details')).toBeInTheDocument();
    });
  });

  describe('Home Breadcrumb', () => {
    test('shows home breadcrumb when showHome is true', () => {
      const items = [{ title: 'Current Page' }];
      renderWithRouter(<Breadcrumbs items={items} showHome={true} />);

      const breadcrumbs = screen.getByRole('navigation');
      expect(breadcrumbs).toBeInTheDocument();
    });

    test('does not show home breadcrumb when showHome is false', () => {
      const items = [{ title: 'Current Page' }];
      renderWithRouter(<Breadcrumbs items={items} showHome={false} />);

      expect(screen.getByText('Current Page')).toBeInTheDocument();
    });

    test('uses custom home title', () => {
      mockUseLocation.mockReturnValue({ pathname: '/admin/page' });
      renderWithRouter(
        <Breadcrumbs autoGenerate={true} showHome={true} homeTitle="Home" />
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    test('uses custom home icon', () => {
      mockUseLocation.mockReturnValue({ pathname: '/admin/page' });
      const customIcon = <HomeOutlined data-testid="custom-home-icon" />;
      const { container } = renderWithRouter(
        <Breadcrumbs
          autoGenerate={true}
          showHome={true}
          homeIcon={customIcon}
        />
      );

      expect(
        container.querySelector('[data-testid="custom-home-icon"]')
      ).toBeInTheDocument();
    });
  });

  describe('Auto-Generate Functionality', () => {
    test('auto-generates breadcrumbs from path when autoGenerate is true', () => {
      mockUseLocation.mockReturnValue({ pathname: '/admin/users/profile' });
      renderWithRouter(<Breadcrumbs autoGenerate={true} showHome={true} />);

      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    test('capitalizes path segments correctly', () => {
      mockUseLocation.mockReturnValue({ pathname: '/admin/user-management' });
      renderWithRouter(<Breadcrumbs autoGenerate={true} showHome={false} />);

      expect(screen.getByText('User management')).toBeInTheDocument();
    });

    test('skips admin segment in auto-generated breadcrumbs', () => {
      mockUseLocation.mockReturnValue({ pathname: '/admin/dashboard' });
      renderWithRouter(<Breadcrumbs autoGenerate={true} showHome={false} />);

      const adminText = screen.queryByText('Admin');
      expect(adminText).not.toBeInTheDocument();
    });

    test('handles empty path segments correctly', () => {
      mockUseLocation.mockReturnValue({ pathname: '///admin///users///' });
      renderWithRouter(<Breadcrumbs autoGenerate={true} showHome={false} />);

      expect(screen.getByText('Users')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    test('navigates to home path when home breadcrumb is clicked', () => {
      mockUseLocation.mockReturnValue({ pathname: '/admin/page' });
      renderWithRouter(
        <Breadcrumbs
          autoGenerate={true}
          showHome={true}
          homePath="/admin/home"
        />
      );

      const homeLink = screen.getByText('Dashboard');
      fireEvent.click(homeLink);

      expect(mockNavigate).toHaveBeenCalledWith('/admin/home');
    });

    test('processes items with href and navigates correctly', () => {
      const items = [
        { title: 'Home', href: '/admin' },
        { title: 'Users', href: '/admin/users' },
      ];
      renderWithRouter(<Breadcrumbs items={items} showHome={false} />);

      const homeLink = screen.getByText('Home');
      fireEvent.click(homeLink);

      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });

    test('handles string items correctly', () => {
      const items = ['Home', 'Dashboard', 'Profile'];
      renderWithRouter(<Breadcrumbs items={items} />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });
  });

  describe('Customization', () => {
    test('applies custom separator', () => {
      const items = [{ title: 'Home' }, { title: 'Page' }];
      const { container } = renderWithRouter(
        <Breadcrumbs items={items} separator=">" />
      );
      expect(container).toBeInTheDocument();
    });

    test('applies custom style', () => {
      const items = [{ title: 'Home' }];
      const customStyle = { backgroundColor: 'red' };
      const { container } = renderWithRouter(
        <Breadcrumbs items={items} style={customStyle} />
      );
      expect(container).toBeInTheDocument();
    });

    test('applies custom className', () => {
      const items = [{ title: 'Home' }];
      const { container } = renderWithRouter(
        <Breadcrumbs items={items} className="custom-breadcrumb" />
      );
      expect(container.querySelector('.custom-breadcrumb')).toBeInTheDocument();
    });
  });

  describe('Complex Path Scenarios', () => {
    test('handles multi-level nested paths', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/admin/users/profile/settings/security',
      });
      renderWithRouter(<Breadcrumbs autoGenerate={true} showHome={false} />);

      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Security')).toBeInTheDocument();
    });

    test('handles paths with underscores', () => {
      mockUseLocation.mockReturnValue({ pathname: '/admin/user_management' });
      renderWithRouter(<Breadcrumbs autoGenerate={true} showHome={false} />);

      expect(screen.getByText('User management')).toBeInTheDocument();
    });

    test('handles paths with hyphens', () => {
      mockUseLocation.mockReturnValue({ pathname: '/admin/user-profile' });
      renderWithRouter(<Breadcrumbs autoGenerate={true} showHome={false} />);

      expect(screen.getByText('User profile')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty items array', () => {
      const { container } = renderWithRouter(<Breadcrumbs items={[]} />);
      expect(container.firstChild).toBeNull();
    });

    test('handles items with onClick handlers', () => {
      const mockOnClick = jest.fn();
      const items = [
        { title: 'Home', onClick: mockOnClick },
        { title: 'Page' },
      ];
      renderWithRouter(<Breadcrumbs items={items} />);

      const homeLink = screen.getByText('Home');
      fireEvent.click(homeLink);

      expect(mockOnClick).toHaveBeenCalled();
    });

    test('handles items with title as JSX element', () => {
      const items = [
        { title: <span data-testid="custom-title">Custom Title</span> },
      ];
      renderWithRouter(<Breadcrumbs items={items} />);

      expect(screen.getByTestId('custom-title')).toBeInTheDocument();
    });
  });
});
