import axios from 'axios';

// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // If environment variable is set, use it
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }

  // Default to staging backend for all environments
  return 'https://yushan.duckdns.org/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

// Configure axios defaults
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await authService.refreshToken();
          if (response.success) {
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          authService.logout();
          window.location.href = '/admin/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

const authService = {
  // Login
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email: credentials.username, // Assuming username is email
        password: credentials.password,
      });

      if (response.data?.code === 200) {
        const userData = response.data.data;

        // Check if user is admin
        if (!userData.isAdmin) {
          throw new Error('Access denied. Admin privileges required.');
        }

        // Store tokens and user data
        localStorage.setItem('accessToken', userData.accessToken);
        localStorage.setItem('refreshToken', userData.refreshToken);
        localStorage.setItem('tokenType', userData.tokenType);

        // Store user info (excluding sensitive data)
        const adminUser = {
          uuid: userData.uuid,
          email: userData.email,
          username: userData.username,
          avatar: userData.avatarUrl,
          avatarUrl: userData.avatarUrl,
          role: userData.isAdmin ? 'admin' : 'user',
          isAdmin: userData.isAdmin,
          isAuthor: userData.isAuthor,
          status: userData.status,
          lastActive: userData.lastActive,
          createTime: userData.createTime,
          permissions: userData.isAdmin
            ? [
                'read',
                'write',
                'delete',
                'manage_users',
                'manage_content',
                'manage_settings',
                'view_analytics',
              ]
            : [],
        };

        localStorage.setItem('admin_user', JSON.stringify(adminUser));

        // Set up token refresh timer
        authService.setupTokenRefresh(userData.expiresIn);

        return {
          success: true,
          data: {
            user: adminUser,
            token: userData.accessToken,
            expiresIn: userData.expiresIn,
          },
        };
      } else {
        throw new Error(response.data?.message || 'Login failed');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Login failed. Please check your credentials.');
      }
    }
  },

  // Logout
  logout: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await apiClient.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    }

    // Clear all stored auth data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_remember');

    // Clear token refresh timer
    if (authService.refreshTimer) {
      clearTimeout(authService.refreshTimer);
      authService.refreshTimer = null;
    }

    return { success: true };
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('/auth/refresh', {
        refreshToken: refreshToken,
      });

      if (response.data?.code === 200) {
        const tokenData = response.data.data;

        // Update stored tokens
        localStorage.setItem('accessToken', tokenData.accessToken);
        localStorage.setItem('refreshToken', tokenData.refreshToken);

        // Set up next refresh
        authService.setupTokenRefresh(tokenData.expiresIn);

        return {
          success: true,
          data: {
            accessToken: tokenData.accessToken,
            refreshToken: tokenData.refreshToken,
            expiresIn: tokenData.expiresIn,
          },
        };
      } else {
        throw new Error(response.data?.message || 'Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  },

  // Set up automatic token refresh
  setupTokenRefresh: (_expiresIn) => {
    // Clear existing timer
    if (authService.refreshTimer) {
      clearTimeout(authService.refreshTimer);
    }

    // Refresh every 15 minutes (900000 ms)
    const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes in milliseconds

    authService.refreshTimer = setTimeout(async () => {
      try {
        await authService.refreshToken();
      } catch (error) {
        console.error('Automatic token refresh failed:', error);
        // Force logout on refresh failure
        authService.logout();
        window.location.href = '/admin/login';
      }
    }, REFRESH_INTERVAL);
  },

  // Get current user from storage
  getCurrentUser: () => {
    try {
      const userData = localStorage.getItem('admin_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    const user = authService.getCurrentUser();
    return !!(token && user && user.isAdmin);
  },

  // Initialize auth state on app start
  initializeAuth: async () => {
    const token = localStorage.getItem('accessToken');
    const user = authService.getCurrentUser();

    if (token && user) {
      // Token exists and user is authenticated, set up refresh timer
      // Refresh interval is handled by setupTokenRefresh (every 15 minutes)
      authService.setupTokenRefresh(0); // expiresIn parameter is ignored now
      return true;
    }

    return false;
  },

  refreshTimer: null,
};

export default authService;
