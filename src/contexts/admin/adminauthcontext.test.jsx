import { render, screen, waitFor, act } from '@testing-library/react';
import { message } from 'antd';
import { AdminAuthProvider, useAdminAuth } from './adminauthcontext';
import authService from '../../services/admin/authservice';

// Mock dependencies
jest.mock('../../services/admin/authservice');
jest.mock('../../services/admin/userservice');
jest.mock('antd', () => ({
  message: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test component to consume context
const TestComponent = () => {
  const { admin, loading, login, logout, refreshUserProfile, isAuthenticated } =
    useAdminAuth();

  return (
    <div>
      <div data-testid="admin">{admin ? JSON.stringify(admin) : 'null'}</div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div>
      <button
        data-testid="login-btn"
        onClick={() => login({ username: 'test', password: 'pass' })}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
      <button data-testid="refresh-btn" onClick={refreshUserProfile}>
        Refresh
      </button>
    </div>
  );
};

describe('AdminAuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Provider rendering', () => {
    test('renders children correctly', () => {
      render(
        <AdminAuthProvider>
          <div>Test Child</div>
        </AdminAuthProvider>
      );

      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    test('initializes with loading state', () => {
      render(
        <AdminAuthProvider>
          <TestComponent />
        </AdminAuthProvider>
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('true');
      expect(screen.getByTestId('admin')).toHaveTextContent('null');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });
  });

  describe('useAdminAuth hook', () => {
    test('throws error when used outside provider', () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => render(<TestComponent />)).toThrow(
        'useAdminAuth must be used within an AdminAuthProvider'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Authentication initialization', () => {
    test('initializes with authenticated user', async () => {
      const mockUser = { id: 1, username: 'admin', isAdmin: true };
      const mockInitializeAuth = jest.fn().mockResolvedValue(true);
      const mockGetCurrentUser = jest.fn().mockReturnValue(mockUser);

      authService.initializeAuth = mockInitializeAuth;
      authService.getCurrentUser = mockGetCurrentUser;

      render(
        <AdminAuthProvider>
          <TestComponent />
        </AdminAuthProvider>
      );

      await waitFor(() => {
        expect(mockInitializeAuth).toHaveBeenCalled();
        expect(mockGetCurrentUser).toHaveBeenCalled();
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('admin')).toHaveTextContent(
          JSON.stringify(mockUser)
        );
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      });
    });

    test('initializes without authenticated user', async () => {
      const mockInitializeAuth = jest.fn().mockResolvedValue(false);

      authService.initializeAuth = mockInitializeAuth;

      render(
        <AdminAuthProvider>
          <TestComponent />
        </AdminAuthProvider>
      );

      await waitFor(() => {
        expect(mockInitializeAuth).toHaveBeenCalled();
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('admin')).toHaveTextContent('null');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent(
          'false'
        );
      });
    });

    test('handles initialization error gracefully', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const mockInitializeAuth = jest
        .fn()
        .mockRejectedValue(new Error('Init failed'));

      authService.initializeAuth = mockInitializeAuth;

      render(
        <AdminAuthProvider>
          <TestComponent />
        </AdminAuthProvider>
      );

      await waitFor(() => {
        expect(mockInitializeAuth).toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(
          'Auth initialization failed:',
          expect.any(Error)
        );
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Login functionality', () => {
    test('successful login sets admin user', async () => {
      const mockUser = { id: 1, username: 'admin', isAdmin: true };
      const mockLogin = jest.fn().mockResolvedValue({
        success: true,
        data: { user: mockUser },
      });

      authService.login = mockLogin;

      render(
        <AdminAuthProvider>
          <TestComponent />
        </AdminAuthProvider>
      );

      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      // Perform login
      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          username: 'test',
          password: 'pass',
        });
        expect(message.success).toHaveBeenCalledWith('Login successful!');
        expect(screen.getByTestId('admin')).toHaveTextContent(
          JSON.stringify(mockUser)
        );
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      });
    });

    test('login failure shows error message', async () => {
      const mockLogin = jest
        .fn()
        .mockRejectedValue(new Error('Invalid credentials'));

      authService.login = mockLogin;

      render(
        <AdminAuthProvider>
          <TestComponent />
        </AdminAuthProvider>
      );

      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      // Perform login
      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          username: 'test',
          password: 'pass',
        });
        expect(message.error).toHaveBeenCalledWith('Invalid credentials');
        expect(screen.getByTestId('admin')).toHaveTextContent('null');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent(
          'false'
        );
      });
    });

    test('login with unsuccessful response', async () => {
      const mockLogin = jest.fn().mockResolvedValue({
        success: false,
      });

      authService.login = mockLogin;

      render(
        <AdminAuthProvider>
          <TestComponent />
        </AdminAuthProvider>
      );

      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      // Perform login
      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          username: 'test',
          password: 'pass',
        });
        expect(message.error).toHaveBeenCalledWith('Login failed');
      });
    });
  });

  describe('Logout functionality', () => {
    test('logout clears admin user and calls authService.logout', async () => {
      const mockUser = { id: 1, username: 'admin', isAdmin: true };
      const mockInitializeAuth = jest.fn().mockResolvedValue(true);
      const mockGetCurrentUser = jest.fn().mockReturnValue(mockUser);
      const mockLogout = jest.fn();

      authService.initializeAuth = mockInitializeAuth;
      authService.getCurrentUser = mockGetCurrentUser;
      authService.logout = mockLogout;

      render(
        <AdminAuthProvider>
          <TestComponent />
        </AdminAuthProvider>
      );

      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByTestId('admin')).toHaveTextContent(
          JSON.stringify(mockUser)
        );
      });

      // Perform logout
      act(() => {
        screen.getByTestId('logout-btn').click();
      });

      expect(mockLogout).toHaveBeenCalled();
      expect(screen.getByTestId('admin')).toHaveTextContent('null');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });
  });

  describe('Refresh user profile', () => {
    test('refreshUserProfile updates admin data', async () => {
      const mockUser = { id: 1, username: 'admin', isAdmin: true };
      const mockInitializeAuth = jest.fn().mockResolvedValue(true);
      const mockGetCurrentUser = jest.fn().mockReturnValue(mockUser);

      authService.initializeAuth = mockInitializeAuth;
      authService.getCurrentUser = mockGetCurrentUser;

      // Mock the dynamic import
      const mockGetCurrentUserProfile = jest.fn().mockResolvedValue({
        success: true,
        data: {
          avatar: 'new-avatar.jpg',
          username: 'updated-admin',
          email: 'admin@example.com',
          profile: { isAdmin: true, isAuthor: true, level: 5 },
          status: 'active',
        },
      });

      jest.doMock('../../services/admin/userservice', () => ({
        getCurrentUserProfile: mockGetCurrentUserProfile,
      }));

      render(
        <AdminAuthProvider>
          <TestComponent />
        </AdminAuthProvider>
      );

      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByTestId('admin')).toHaveTextContent(
          JSON.stringify(mockUser)
        );
      });

      // Perform refresh
      await act(async () => {
        screen.getByTestId('refresh-btn').click();
      });

      await waitFor(() => {
        const updatedAdmin = JSON.parse(
          screen.getByTestId('admin').textContent
        );
        expect(updatedAdmin.avatar).toBe('new-avatar.jpg');
        expect(updatedAdmin.username).toBe('updated-admin');
        expect(updatedAdmin.email).toBe('admin@example.com');
        expect(updatedAdmin.isAdmin).toBe(true);
        expect(updatedAdmin.isAuthor).toBe(true);
        expect(updatedAdmin.level).toBe(5);
        expect(updatedAdmin.status).toBe('active');
      });
    });

    test('refreshUserProfile does nothing when no admin', async () => {
      const mockInitializeAuth = jest.fn().mockResolvedValue(false);

      authService.initializeAuth = mockInitializeAuth;

      render(
        <AdminAuthProvider>
          <TestComponent />
        </AdminAuthProvider>
      );

      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      // Mock the dynamic import
      const mockGetCurrentUserProfile = jest.fn();

      jest.doMock('../../services/admin/userservice', () => ({
        getCurrentUserProfile: mockGetCurrentUserProfile,
      }));

      // Perform refresh
      await act(async () => {
        screen.getByTestId('refresh-btn').click();
      });

      expect(mockGetCurrentUserProfile).not.toHaveBeenCalled();
    });

    test('refreshUserProfile handles errors gracefully', async () => {
      const mockUser = { id: 1, username: 'admin', isAdmin: true };
      const mockInitializeAuth = jest.fn().mockResolvedValue(true);
      const mockGetCurrentUser = jest.fn().mockReturnValue(mockUser);
      const consoleSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      authService.initializeAuth = mockInitializeAuth;
      authService.getCurrentUser = mockGetCurrentUser;

      // Mock the dynamic import with error
      const mockGetCurrentUserProfile = jest
        .fn()
        .mockRejectedValue(new Error('API error'));

      jest.doMock('../../services/admin/userservice', () => ({
        getCurrentUserProfile: mockGetCurrentUserProfile,
      }));

      render(
        <AdminAuthProvider>
          <TestComponent />
        </AdminAuthProvider>
      );

      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByTestId('admin')).toHaveTextContent(
          JSON.stringify(mockUser)
        );
      });

      // Perform refresh
      await act(async () => {
        screen.getByTestId('refresh-btn').click();
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to refresh user profile:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Context value', () => {
    test('provides all required values', async () => {
      const mockUser = { id: 1, username: 'admin', isAdmin: true };
      const mockInitializeAuth = jest.fn().mockResolvedValue(true);
      const mockGetCurrentUser = jest.fn().mockReturnValue(mockUser);

      authService.initializeAuth = mockInitializeAuth;
      authService.getCurrentUser = mockGetCurrentUser;

      let contextValue;
      const ContextConsumer = () => {
        contextValue = useAdminAuth();
        return null;
      };

      render(
        <AdminAuthProvider>
          <ContextConsumer />
        </AdminAuthProvider>
      );

      await waitFor(() => {
        expect(contextValue).toHaveProperty('admin');
        expect(contextValue).toHaveProperty('loading');
        expect(contextValue).toHaveProperty('login');
        expect(contextValue).toHaveProperty('logout');
        expect(contextValue).toHaveProperty('refreshUserProfile');
        expect(contextValue).toHaveProperty('isAuthenticated');
        expect(typeof contextValue.login).toBe('function');
        expect(typeof contextValue.logout).toBe('function');
        expect(typeof contextValue.refreshUserProfile).toBe('function');
      });
    });
  });
});
