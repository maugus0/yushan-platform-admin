import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for admin authentication management
 * Handles login, logout, token management, and user session
 */
export const useAdminAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem('adminToken');
        const userData = localStorage.getItem('adminUser');

        if (token && userData) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        }
      } catch (err) {
        setError('Failed to check authentication status');
        console.error('Auth check error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();

      // Store auth data
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));

      setUser(data.user);
      setIsAuthenticated(true);

      return { success: true, user: data.user };
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    try {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');

      setUser(null);
      setIsAuthenticated(false);
      setError(null);

      return { success: true };
    } catch (err) {
      setError('Logout failed');
      return { success: false, error: 'Logout failed' };
    }
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No token to refresh');
      }

      const response = await fetch('/api/admin/refresh', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      localStorage.setItem('adminToken', data.token);

      return { success: true, token: data.token };
    } catch (err) {
      setError('Token refresh failed');
      // Don't call logout() here as it clears the error
      return { success: false, error: err.message };
    }
  }, []);

  // Check if user has specific permission
  const hasPermission = useCallback(
    (permission) => {
      if (!user || !user.permissions) {
        return false;
      }
      return user.permissions.includes(permission);
    },
    [user]
  );

  // Check if user has any of the specified permissions
  const hasAnyPermission = useCallback(
    (permissions) => {
      if (!user || !user.permissions) {
        return false;
      }
      return permissions.some((permission) =>
        user.permissions.includes(permission)
      );
    },
    [user]
  );

  // Check if user has all of the specified permissions
  const hasAllPermissions = useCallback(
    (permissions) => {
      if (!user || !user.permissions) {
        return false;
      }
      return permissions.every((permission) =>
        user.permissions.includes(permission)
      );
    },
    [user]
  );

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshToken,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    clearError,
  };
};

export default useAdminAuth;
