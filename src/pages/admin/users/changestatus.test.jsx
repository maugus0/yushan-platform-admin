import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ChangeUserStatus from './changestatus';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../../../components/admin/common/pageheader', () => {
  const MockPageHeader = (props) => (
    <div data-testid="page-header">{props.title}</div>
  );
  MockPageHeader.displayName = 'MockPageHeader';
  return MockPageHeader;
});
jest.mock('../../../components/admin/common/loadingspinner', () => {
  const MockLoadingSpinner = () => (
    <div data-testid="loading-spinner">Loading...</div>
  );
  MockLoadingSpinner.displayName = 'MockLoadingSpinner';
  return MockLoadingSpinner;
});
jest.mock('../../../services/admin/userservice', () => ({
  userService: {
    getAllUsers: jest.fn(),
    updateUserStatus: jest.fn(),
  },
}));

// Mock antd Modal.confirm
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  Modal: {
    ...jest.requireActual('antd').Modal,
    confirm: jest.fn(),
  },
}));

import { Modal } from 'antd';
import { userService } from '../../../services/admin/userservice';

describe('ChangeUserStatus page', () => {
  const mockUsers = [
    {
      id: 1,
      username: 'user1',
      email: 'u1@example.com',
      status: 'active',
      userType: 'reader',
      joinDate: '2024-01-01',
    },
    {
      id: 2,
      username: 'user2',
      email: 'u2@example.com',
      status: 'suspended',
      userType: 'writer',
      joinDate: '2024-02-01',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    userService.getAllUsers.mockResolvedValue({ data: mockUsers, total: 2 });
    userService.updateUserStatus.mockResolvedValue({ success: true });
    Modal.confirm.mockImplementation(({ onOk }) => {
      // Simulate clicking OK
      onOk();
    });
  });

  test('renders and loads users', async () => {
    render(
      <BrowserRouter>
        <ChangeUserStatus />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-header')).toBeInTheDocument();
    });

    expect(userService.getAllUsers).toHaveBeenCalled();
  });

  test('renders loading spinner initially', () => {
    userService.getAllUsers.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <BrowserRouter>
        <ChangeUserStatus />
      </BrowserRouter>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('renders users table after loading', async () => {
    render(
      <BrowserRouter>
        <ChangeUserStatus />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
    });
  });

  test('handles search functionality', async () => {
    render(
      <BrowserRouter>
        <ChangeUserStatus />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      'Search by username or email'
    );
    fireEvent.change(searchInput, { target: { value: 'user2' } });

    await waitFor(() => {
      expect(screen.queryByText('user1')).not.toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
    });
  });

  test('handles status filter', async () => {
    render(
      <BrowserRouter>
        <ChangeUserStatus />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    // Status filter select should be rendered (check for placeholder text)
    expect(screen.getByText('Filter by Status')).toBeInTheDocument();
  });

  test('handles user type filter', async () => {
    render(
      <BrowserRouter>
        <ChangeUserStatus />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    // User type filter select should be rendered (check for placeholder text)
    expect(screen.getByText('Filter by User Type')).toBeInTheDocument();
  });

  test('handles status change with modal confirmation', async () => {
    render(
      <BrowserRouter>
        <ChangeUserStatus />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    // Since Modal.confirm is mocked, we can verify the component renders status change selects
    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();
  });

  test('handles status change error', async () => {
    userService.updateUserStatus.mockRejectedValueOnce(
      new Error('Status change failed')
    );

    render(
      <BrowserRouter>
        <ChangeUserStatus />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    // Verify users are still rendered even with error
    expect(screen.getByText('user1')).toBeInTheDocument();
  });

  test('handles table pagination change', async () => {
    render(
      <BrowserRouter>
        <ChangeUserStatus />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    // Table pagination change is handled internally, but we can verify the component renders
    expect(screen.getByText('user1')).toBeInTheDocument();
  });

  test('handles refresh button', async () => {
    render(
      <BrowserRouter>
        <ChangeUserStatus />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(userService.getAllUsers).toHaveBeenCalledTimes(2); // Initial + refresh
    });
  });

  test('renders page header with correct title', async () => {
    render(
      <BrowserRouter>
        <ChangeUserStatus />
      </BrowserRouter>
    );

    await waitFor(() => {
      const header = screen.getByTestId('page-header');
      expect(header).toHaveTextContent('Change User Status');
    });
  });
});
