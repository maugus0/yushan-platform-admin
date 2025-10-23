import axios from 'axios';

// Configure axios with base URL and interceptors
const API_BASE_URL = 'https://yushan-backend-staging.up.railway.app/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenType');
      localStorage.removeItem('expiresIn');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Get analytics summary data
 * @param {string} period - Time period filter: 'daily', 'weekly', or 'monthly'
 * @returns {Promise<Object>} Analytics summary data
 */
export const getAnalyticsSummary = async (period = 'daily') => {
  try {
    const response = await apiClient.get('/admin/analytics/summary', {
      params: { period },
    });

    if (response.data && response.data.code === 200) {
      return {
        success: true,
        data: response.data.data,
        timestamp: response.data.timestamp,
      };
    } else {
      throw new Error(
        response.data?.message || 'Failed to fetch analytics summary'
      );
    }
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch analytics summary',
    };
  }
};

/**
 * Get user trends data over time
 * @param {Object} params - Query parameters
 * @param {string} params.period - Time period: 'daily', 'weekly', or 'monthly'
 * @param {string} params.startDate - Start date in YYYY-MM-DD format
 * @param {string} params.endDate - End date in YYYY-MM-DD format
 * @returns {Promise<Object>} User trends data
 */
export const getUserTrends = async (params = {}) => {
  try {
    const queryParams = {
      period: params.period || 'daily',
      startDate: params.startDate,
      endDate: params.endDate,
    };

    const response = await apiClient.get('/admin/analytics/users/trends', {
      params: queryParams,
    });

    if (response.data && response.data.code === 200) {
      return {
        success: true,
        data: response.data.data,
        timestamp: response.data.timestamp,
      };
    } else {
      throw new Error(response.data?.message || 'Failed to fetch user trends');
    }
  } catch (error) {
    console.error('Error fetching user trends:', error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch user trends',
    };
  }
};

/**
 * Get Daily/Weekly/Monthly Active Users data
 * @param {string} date - Date in YYYY-MM-DD format (optional, defaults to today)
 * @returns {Promise<Object>} DAU/WAU/MAU data with hourly breakdown
 */
export const getPlatformDAU = async (date = null) => {
  try {
    const queryParams = {};
    if (date) {
      queryParams.date = date;
    }

    const response = await apiClient.get('/admin/analytics/platform/dau', {
      params: queryParams,
    });

    if (response.data && response.data.code === 200) {
      return {
        success: true,
        data: response.data.data,
        timestamp: response.data.timestamp,
      };
    } else {
      throw new Error(response.data?.message || 'Failed to fetch DAU data');
    }
  } catch (error) {
    console.error('Error fetching DAU data:', error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch DAU data',
    };
  }
};

/**
 * Format analytics data for charts
 * @param {Array} data - Raw analytics data
 * @returns {Array} Formatted data for charts
 */
export const formatChartData = (data) => {
  if (!Array.isArray(data)) return [];

  return data.map((item) => ({
    ...item,
    date: item.date || item.timestamp,
    value: item.count || item.value || 0,
  }));
};

/**
 * Calculate growth percentage
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} Growth percentage
 */
export const calculateGrowth = (current, previous) => {
  if (!previous || previous === 0) return 100;
  return (((current - previous) / previous) * 100).toFixed(2);
};

/**
 * Get period display text
 * @param {string} period - Period code
 * @returns {string} Display text
 */
export const getPeriodDisplayText = (period) => {
  const periodMap = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
  };
  return periodMap[period] || period;
};

const analyticsService = {
  getAnalyticsSummary,
  getUserTrends,
  getPlatformDAU,
  formatChartData,
  calculateGrowth,
  getPeriodDisplayText,
};

export default analyticsService;
