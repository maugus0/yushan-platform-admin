import { renderHook, act, waitFor } from '@testing-library/react';
import { useAdminAuth } from './useadminauth';

// Mock fetch globally
const mockFetch = jest.fn();
Object.defineProperty(window, 'fetch', {
  writable: true,
  value: mockFetch,
});

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

describe('useAdminAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    fetch.mockClear();
  });

  describe('Initial State', () => {
    test('initializes with correct default values', async () => {
      const { result } = renderHook(() => useAdminAuth());

      // Check initial state
      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe(null);

      // Wait for the useEffect to complete and set loading to false
      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 5000 }
      );
    });

    test('checks authentication status on mount with valid token', () => {
      const mockUser = { id: 1, name: 'Admin', permissions: ['read', 'write'] };
      localStorageMock.getItem
        .mockReturnValueOnce('valid-token')
        .mockReturnValueOnce(JSON.stringify(mockUser));

      const { result } = renderHook(() => useAdminAuth());

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    test('handles invalid user data in localStorage', () => {
      localStorageMock.getItem
        .mockReturnValueOnce('valid-token')
        .mockReturnValueOnce('invalid-json');

      const { result } = renderHook(() => useAdminAuth());

      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe(
        'Failed to check authentication status'
      );
    });
  });

  describe('Login Function', () => {
    test('successfully logs in with valid credentials', async () => {
      const mockUser = { id: 1, name: 'Admin', permissions: ['read', 'write'] };
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ token: 'new-token', user: mockUser }),
      };
      fetch.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAdminAuth());

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login({
          email: 'admin@test.com',
          password: 'password',
        });
      });

      expect(loginResult.success).toBe(true);
      expect(loginResult.user).toEqual(mockUser);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'adminToken',
        'new-token'
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'adminUser',
        JSON.stringify(mockUser)
      );
    });

    test('handles login failure', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
      };
      fetch.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAdminAuth());

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login({
          email: 'admin@test.com',
          password: 'wrong',
        });
      });

      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toBe('Login failed');
      expect(result.current.error).toBe('Login failed');
      expect(result.current.isAuthenticated).toBe(false);
    });

    test('handles network error during login', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAdminAuth());

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login({
          email: 'admin@test.com',
          password: 'password',
        });
      });

      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toBe('Network error');
      expect(result.current.error).toBe('Network error');
    });
  });

  describe('Logout Function', () => {
    test('successfully logs out', () => {
      const { result } = renderHook(() => useAdminAuth());

      let logoutResult;
      act(() => {
        logoutResult = result.current.logout();
      });

      expect(logoutResult.success).toBe(true);
      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe(null);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('adminToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('adminUser');
    });

    test('handles logout error', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useAdminAuth());

      let logoutResult;
      act(() => {
        logoutResult = result.current.logout();
      });

      expect(logoutResult.success).toBe(false);
      expect(logoutResult.error).toBe('Logout failed');
      expect(result.current.error).toBe('Logout failed');
    });
  });

  describe('Refresh Token Function', () => {
    test('successfully refreshes token', async () => {
      localStorageMock.getItem.mockReturnValue('old-token');
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ token: 'new-token' }),
      };
      fetch.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAdminAuth());

      let refreshResult;
      await act(async () => {
        refreshResult = await result.current.refreshToken();
      });

      expect(refreshResult.success).toBe(true);
      expect(refreshResult.token).toBe('new-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'adminToken',
        'new-token'
      );
    });

    test('handles refresh token failure', async () => {
      localStorageMock.getItem.mockReturnValue('old-token');
      const mockResponse = {
        ok: false,
        status: 401,
      };
      fetch.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAdminAuth());

      let refreshResult;
      await act(async () => {
        refreshResult = await result.current.refreshToken();
      });

      expect(refreshResult.success).toBe(false);
      expect(refreshResult.error).toBe('Token refresh failed');

      // Wait for the error to be set in the hook's state
      await waitFor(() => {
        expect(result.current.error).toBe('Token refresh failed');
      });
    });

    test('handles refresh token when no token exists', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useAdminAuth());

      let refreshResult;
      await act(async () => {
        refreshResult = await result.current.refreshToken();
      });

      expect(refreshResult.success).toBe(false);
      expect(refreshResult.error).toBe('No token to refresh');
    });
  });

  describe('Permission Functions', () => {
    test('hasPermission returns true for valid permission', () => {
      const mockUser = {
        id: 1,
        name: 'Admin',
        permissions: ['read', 'write', 'delete'],
      };
      localStorageMock.getItem
        .mockReturnValueOnce('valid-token')
        .mockReturnValueOnce(JSON.stringify(mockUser));

      const { result } = renderHook(() => useAdminAuth());

      act(() => {
        expect(result.current.hasPermission('read')).toBe(true);
        expect(result.current.hasPermission('write')).toBe(true);
        expect(result.current.hasPermission('delete')).toBe(true);
      });
    });

    test('hasPermission returns false for invalid permission', () => {
      const mockUser = { id: 1, name: 'Admin', permissions: ['read', 'write'] };
      localStorageMock.getItem
        .mockReturnValueOnce('valid-token')
        .mockReturnValueOnce(JSON.stringify(mockUser));

      const { result } = renderHook(() => useAdminAuth());

      act(() => {
        expect(result.current.hasPermission('admin')).toBe(false);
        expect(result.current.hasPermission('delete')).toBe(false);
      });
    });

    test('hasPermission returns false when no user', () => {
      const { result } = renderHook(() => useAdminAuth());

      act(() => {
        expect(result.current.hasPermission('read')).toBe(false);
      });
    });

    test('hasAnyPermission returns true if user has any permission', () => {
      const mockUser = { id: 1, name: 'Admin', permissions: ['read', 'write'] };
      localStorageMock.getItem
        .mockReturnValueOnce('valid-token')
        .mockReturnValueOnce(JSON.stringify(mockUser));

      const { result } = renderHook(() => useAdminAuth());

      act(() => {
        expect(result.current.hasAnyPermission(['read', 'admin'])).toBe(true);
        expect(result.current.hasAnyPermission(['admin', 'delete'])).toBe(
          false
        );
      });
    });

    test('hasAllPermissions returns true if user has all permissions', () => {
      const mockUser = {
        id: 1,
        name: 'Admin',
        permissions: ['read', 'write', 'delete'],
      };
      localStorageMock.getItem
        .mockReturnValueOnce('valid-token')
        .mockReturnValueOnce(JSON.stringify(mockUser));

      const { result } = renderHook(() => useAdminAuth());

      act(() => {
        expect(result.current.hasAllPermissions(['read', 'write'])).toBe(true);
        expect(
          result.current.hasAllPermissions(['read', 'write', 'admin'])
        ).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    test('clearError removes error state', () => {
      const { result } = renderHook(() => useAdminAuth());

      // Set an error first
      act(() => {
        result.current.login({ email: 'test', password: 'test' });
      });

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('Loading States', () => {
    test('isLoading is true during login', async () => {
      fetch.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() => useAdminAuth());

      expect(result.current.isLoading).toBe(false); // After initial auth check

      act(() => {
        result.current.login({ email: 'admin@test.com', password: 'password' });
      });

      expect(result.current.isLoading).toBe(true);
    });
  });
});
