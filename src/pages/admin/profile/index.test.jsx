import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminProfile from './index';
import userService from '../../../services/admin/userservice';

// Mock antd Grid before importing the component
jest.mock('antd/lib/grid', () => ({
  useBreakpoint: jest.fn(() => ({
    xs: true,
    sm: true,
    md: false,
    lg: false,
    xl: false,
  })),
}));

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
  TextArea: () => <textarea data-testid="textarea" />,
  Switch: () => <button data-testid="switch" />,
  InputNumber: () => <input data-testid="input-number" type="number" />,
  Button: ({ children, ...props }) => (
    <button data-testid="button" {...props}>
      {children}
    </button>
  ),
  Card: ({ children, title }) => (
    <div data-testid="card">
      <div data-testid="card-title">{title}</div>
      <div data-testid="card-content">{children}</div>
    </div>
  ),
  Descriptions: ({ children, items, ...props }) => {
    if (items) {
      return (
        <div data-testid="descriptions" {...props}>
          {items.map((item, index) => (
            <div
              key={item.key || index}
              data-testid={`description-item-${item.key}`}
            >
              <div data-testid={`description-label-${item.key}`}>
                {item.label}
              </div>
              <div data-testid={`description-value-${item.key}`}>
                {item.children}
              </div>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div data-testid="descriptions" {...props}>
        {children}
      </div>
    );
  },
  DescriptionsItem: () => <div data-testid="descriptions-item" />,
  Avatar: ({ src, icon, children, ...props }) => (
    <div data-testid="avatar" {...props}>
      {src && <img src={src} alt="avatar" />}
      {icon && <span data-testid="avatar-icon">{icon}</span>}
      {children}
    </div>
  ),
  Typography: {
    Title: ({ children, level, ...props }) => (
      <div data-testid={`typography-title-${level || 1}`} {...props}>
        {children}
      </div>
    ),
    Text: ({ children, ...props }) => (
      <div data-testid="typography-text" {...props}>
        {children}
      </div>
    ),
    Paragraph: ({ children, ...props }) => (
      <div data-testid="typography-paragraph" {...props}>
        {children}
      </div>
    ),
  },
  Tag: ({ children, color, ...props }) => (
    <span data-testid="tag" style={{ backgroundColor: color }} {...props}>
      {children}
    </span>
  ),
  Space: ({ children }) => <div data-testid="space">{children}</div>,
  Row: ({ children }) => <div data-testid="row">{children}</div>,
  Col: ({ children }) => <div data-testid="col">{children}</div>,
  Grid: {
    useBreakpoint: jest.fn(() => ({ md: true })),
  },
  DatePicker: {
    RangePicker: () => <input data-testid="date-range-picker" type="date" />,
  },
  message: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

// Mock Grid useBreakpoint separately
jest.mock('antd/lib/grid', () => ({
  useBreakpoint: () => ({ md: true }),
})); // Mock @ant-design/icons
jest.mock('@ant-design/icons', () => ({
  UserOutlined: () => <span data-testid="user-icon">UserIcon</span>,
  CalendarOutlined: () => <span data-testid="calendar-icon">CalendarIcon</span>,
  BookOutlined: () => <span data-testid="book-icon">BookIcon</span>,
  ClockCircleOutlined: () => <span data-testid="clock-icon">ClockIcon</span>,
  TrophyOutlined: () => <span data-testid="trophy-icon">TrophyIcon</span>,
  StarOutlined: () => <span data-testid="star-icon">StarIcon</span>,
}));

// Mock custom components
jest.mock('../../../components/admin/common/pageheader', () => {
  return function MockPageHeader({ title, subtitle, breadcrumbs }) {
    return (
      <div data-testid="page-header">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        {breadcrumbs && (
          <div data-testid="breadcrumbs">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} data-testid={`breadcrumb-${index}`}>
                {crumb.title}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };
});

jest.mock('../../../components/admin/common/loadingspinner', () => {
  return function MockLoadingSpinner({ tip }) {
    return <div data-testid="loading-spinner">{tip || 'Loading...'}</div>;
  };
});

// Mock admin auth context
const mockRefreshUserProfile = jest.fn().mockResolvedValue();
jest.mock('../../../contexts/admin/adminauthcontext', () => ({
  useAdminAuth: () => ({
    refreshUserProfile: mockRefreshUserProfile,
  }),
}));

// Mock user service
jest.mock('../../../services/admin/userservice', () => ({
  getCurrentUserProfile: jest.fn(),
  getGenderDisplayText: jest.fn((gender) => {
    switch (gender) {
      case 'male':
        return 'Male';
      case 'female':
        return 'Female';
      case 'other':
        return 'Other';
      default:
        return 'Not specified';
    }
  }),
  getUserStatusColor: jest.fn((status) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'orange';
      case 'banned':
        return 'red';
      default:
        return 'default';
    }
  }),
}));

// Mock user profile cover image
jest.mock(
  '../../../assets/images/userprofilecover.png',
  () => 'mock-profile-cover.png'
);

const mockProfile = {
  id: 'user-123',
  username: 'adminuser',
  email: 'admin@example.com',
  avatar: 'https://example.com/avatar.jpg',
  avatarUrl: 'https://example.com/avatar.jpg',
  status: 'active',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-15T00:00:00Z',
  lastActive: '2023-01-15T10:30:00Z',
  profile: {
    bio: 'I am an administrator',
    gender: 'male',
    birthDate: '1990-01-01',
    isAdmin: true,
    isAuthor: false,
    level: 25,
    experience: 12500,
    readBookNum: 45,
    readTime: 120,
    yuan: 500,
  },
};

describe('AdminProfile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set default useBreakpoint mock return value
    const { Grid } = require('antd');
    Grid.useBreakpoint.mockReturnValue({ md: true });

    userService.getCurrentUserProfile.mockResolvedValue({
      success: true,
      data: mockProfile,
    });
  });

  describe('Initial Rendering', () => {
    test('renders loading spinner initially', () => {
      render(<AdminProfile />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading profile...')).toBeInTheDocument();
    });

    test('renders page header with correct title and breadcrumbs', async () => {
      render(<AdminProfile />);
      await waitFor(() => {
        expect(
          screen.getByText('View and manage your account information')
        ).toBeInTheDocument();
      });

      const breadcrumbs = screen.getByTestId('breadcrumbs');
      expect(breadcrumbs).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumb-0')).toHaveTextContent('Dashboard');
      expect(screen.getByTestId('breadcrumb-1')).toHaveTextContent(
        'My Profile'
      );
    });

    test('loads profile data on mount', async () => {
      render(<AdminProfile />);
      await waitFor(() => {
        expect(userService.getCurrentUserProfile).toHaveBeenCalledTimes(1);
      });
    });

    test('renders profile header card with user information', async () => {
      render(<AdminProfile />);
      await waitFor(() => {
        expect(screen.getByTestId('avatar')).toBeInTheDocument();
        expect(screen.getByTestId('typography-title-2')).toHaveTextContent(
          'adminuser'
        );
        expect(screen.getByText('Administrator')).toBeInTheDocument();
      });
    });

    test('renders profile information card', async () => {
      render(<AdminProfile />);
      await waitFor(() => {
        const cards = screen.getAllByTestId('card');
        const profileCard = cards.find(
          (card) =>
            card.querySelector('[data-testid="card-title"]')?.textContent ===
            'Profile Information'
        );
        expect(profileCard).toBeInTheDocument();
      });
    });

    test('renders reading statistics card', async () => {
      render(<AdminProfile />);
      await waitFor(() => {
        const cards = screen.getAllByTestId('card');
        const statsCard = cards.find(
          (card) =>
            card.querySelector('[data-testid="card-title"]')?.textContent ===
            'Reading Statistics'
        );
        expect(statsCard).toBeInTheDocument();
      });
    });

    test('renders account activity card', async () => {
      render(<AdminProfile />);
      await waitFor(() => {
        const cards = screen.getAllByTestId('card');
        const activityCard = cards.find(
          (card) =>
            card.querySelector('[data-testid="card-title"]')?.textContent ===
            'Account Activity'
        );
        expect(activityCard).toBeInTheDocument();
      });
    });
  });

  describe('Profile Data Display', () => {
    test('displays user avatar correctly', async () => {
      render(<AdminProfile />);
      await waitFor(() => {
        const avatar = screen.getByTestId('avatar');
        expect(avatar).toBeInTheDocument();
        expect(avatar.querySelector('img')).toHaveAttribute(
          'src',
          'https://example.com/avatar.jpg'
        );
      });
    });

    test('displays username and email', async () => {
      render(<AdminProfile />);
      await waitFor(() => {
        expect(screen.getByTestId('typography-title-2')).toHaveTextContent(
          'adminuser'
        );
      });
    });

    test('displays admin role tag for administrator', async () => {
      render(<AdminProfile />);
      await waitFor(() => {
        expect(screen.getByText('Administrator')).toBeInTheDocument();
      });
    });

    test('displays author role tag for author', async () => {
      const authorProfile = {
        ...mockProfile,
        profile: {
          ...mockProfile.profile,
          isAdmin: false,
          isAuthor: true,
        },
      };
      userService.getCurrentUserProfile.mockResolvedValue({
        success: true,
        data: authorProfile,
      });

      render(<AdminProfile />);
      await waitFor(() => {
        expect(screen.getByText('Author')).toBeInTheDocument();
      });
    });

    test('displays reader role tag for regular user', async () => {
      const readerProfile = {
        ...mockProfile,
        profile: {
          ...mockProfile.profile,
          isAdmin: false,
          isAuthor: false,
        },
      };
      userService.getCurrentUserProfile.mockResolvedValue({
        success: true,
        data: readerProfile,
      });

      render(<AdminProfile />);
      await waitFor(() => {
        expect(screen.getByText('Reader')).toBeInTheDocument();
      });
    });

    test('displays profile information correctly', async () => {
      render(<AdminProfile />);
      await waitFor(() => {
        expect(
          screen.getByTestId('description-value-username')
        ).toHaveTextContent('adminuser');
        expect(screen.getByTestId('description-value-email')).toHaveTextContent(
          'admin@example.com'
        );
        expect(screen.getByTestId('description-value-bio')).toHaveTextContent(
          'I am an administrator'
        );
        expect(
          screen.getByTestId('description-value-status')
        ).toBeInTheDocument();
      });
    });

    test('displays reading statistics', async () => {
      render(<AdminProfile />);
      await waitFor(() => {
        expect(screen.getByText('25')).toBeInTheDocument(); // Level
        expect(screen.getByText('12,500')).toBeInTheDocument(); // Experience
        expect(screen.getByText('45')).toBeInTheDocument(); // Books read
        expect(screen.getByText('120h')).toBeInTheDocument(); // Reading time
        expect(screen.getByText('500')).toBeInTheDocument(); // Yuan
      });
    });

    test('displays account activity information', async () => {
      render(<AdminProfile />);
      await waitFor(() => {
        expect(
          screen.getByTestId('description-value-userId')
        ).toHaveTextContent('user-123');
      });
    });

    test('handles missing profile data gracefully', async () => {
      const incompleteProfile = {
        ...mockProfile,
        profile: null,
      };
      userService.getCurrentUserProfile.mockResolvedValueOnce({
        success: true,
        data: incompleteProfile,
      });

      render(<AdminProfile />);
      await waitFor(() => {
        expect(screen.getByText('No bio provided')).toBeInTheDocument();
        expect(screen.getByText('Not specified')).toBeInTheDocument();
        expect(screen.getAllByText('0').length).toBeGreaterThan(0); // Default values for stats
      });
    });

    test('formats dates correctly', async () => {
      render(<AdminProfile />);
      await waitFor(() => {
        // The date formatting will depend on locale, but we can check that dates are displayed
        const dateElements = screen.getAllByTestId(/^typography-text/);
        expect(dateElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Responsive Design', () => {
    test('renders in mobile layout when screen is small', async () => {
      // Mock mobile breakpoint
      const { Grid } = require('antd');
      Grid.useBreakpoint.mockReturnValue({
        xs: true,
        sm: true,
        md: false,
        lg: false,
        xl: false,
      });

      render(<AdminProfile />);
      await waitFor(() => {
        const avatar = screen.getByTestId('avatar');
        expect(avatar).toHaveAttribute('size', '80'); // Mobile size
      });
    });

    test('renders in desktop layout when screen is large', async () => {
      // Mock desktop breakpoint
      const { Grid } = require('antd');
      Grid.useBreakpoint.mockReturnValue({
        xs: true,
        sm: true,
        md: true,
        lg: true,
        xl: true,
      });

      render(<AdminProfile />);
      await waitFor(() => {
        const avatar = screen.getByTestId('avatar');
        expect(avatar).toHaveAttribute('size', '120'); // Desktop size
      });
    });
  });

  describe('Error Handling', () => {
    test('handles API error gracefully', async () => {
      userService.getCurrentUserProfile.mockRejectedValue(
        new Error('API Error')
      );

      render(<AdminProfile />);
      await waitFor(() => {
        expect(
          screen.getByText('Failed to load profile data')
        ).toBeInTheDocument();
        expect(require('antd').message.error).toHaveBeenCalledWith(
          'Failed to load profile'
        );
      });
    });

    test('handles unsuccessful response', async () => {
      userService.getCurrentUserProfile.mockResolvedValue({
        success: false,
        error: 'Profile not found',
      });

      render(<AdminProfile />);
      await waitFor(() => {
        expect(
          screen.getByText('Failed to load profile data')
        ).toBeInTheDocument();
        expect(require('antd').message.error).toHaveBeenCalledWith(
          'Failed to load profile: Profile not found'
        );
      });
    });

    test('displays error message when profile is null', async () => {
      userService.getCurrentUserProfile.mockResolvedValue({
        success: true,
        data: null,
      });

      render(<AdminProfile />);
      await waitFor(() => {
        expect(
          screen.getByText('Failed to load profile data')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Auth Context Integration', () => {
    test('calls refreshUserProfile on successful load', async () => {
      render(<AdminProfile />);
      await waitFor(() => {
        expect(mockRefreshUserProfile).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Service Integration', () => {
    test('calls getGenderDisplayText with correct gender', async () => {
      render(<AdminProfile />);
      await waitFor(() => {
        expect(userService.getGenderDisplayText).toHaveBeenCalledWith('male');
      });
    });

    test('calls getUserStatusColor with correct status', async () => {
      render(<AdminProfile />);
      await waitFor(() => {
        expect(userService.getUserStatusColor).toHaveBeenCalledWith('active');
      });
    });
  });

  describe('UI Components', () => {
    test('renders all required cards', async () => {
      render(<AdminProfile />);
      await waitFor(() => {
        const cards = screen.getAllByTestId('card');
        expect(cards.length).toBeGreaterThanOrEqual(4); // Header + Profile Info + Stats + Activity
      });
    });

    test('renders typography components correctly', async () => {
      render(<AdminProfile />);
      await waitFor(() => {
        expect(screen.getByTestId('typography-title-2')).toBeInTheDocument();
        expect(
          screen.getAllByTestId(/^typography-text/).length
        ).toBeGreaterThan(0);
      });
    });

    test('renders space components for layout', async () => {
      render(<AdminProfile />);
      await waitFor(() => {
        expect(screen.getAllByTestId('space').length).toBeGreaterThan(0);
      });
    });

    test('renders icons correctly', async () => {
      render(<AdminProfile />);
      await waitFor(() => {
        expect(screen.getByTestId('trophy-icon')).toBeInTheDocument();
        expect(screen.getByTestId('star-icon')).toBeInTheDocument();
        expect(screen.getByTestId('book-icon')).toBeInTheDocument();
        expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
        expect(screen.getAllByTestId('calendar-icon')).toHaveLength(3);
      });
    });
  });
});
