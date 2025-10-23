import axios from 'axios';

// Configure axios with base URL and interceptors
// In development, this will use the proxy configured in package.json
// In production, it will use the full URL
const isDevelopment =
  !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
const API_BASE_URL = isDevelopment
  ? '/api'
  : 'https://yushan-backend-staging.up.railway.app/api';

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
      window.location.href = '/yushan-admin/login';
    }
    return Promise.reject(error);
  }
);

// Helper function to format report data from API
const formatReportData = (apiData) => {
  return {
    id: apiData.id,
    uuid: apiData.uuid,
    reporterId: apiData.reporterId,
    reporterUsername: apiData.reporterUsername,
    reportType: apiData.reportType,
    reason: apiData.reason,
    status: apiData.status,
    adminNotes: apiData.adminNotes,
    resolvedBy: apiData.resolvedBy,
    resolvedByUsername: apiData.resolvedByUsername,
    createdAt: apiData.createdAt,
    updatedAt: apiData.updatedAt,
    contentType: apiData.contentType,
    contentId: apiData.contentId,
    novelId: apiData.novelId,
    novelTitle: apiData.novelTitle,
    commentId: apiData.commentId,
    commentContent: apiData.commentContent,
  };
};

export const reportService = {
  // Get all reports with filtering and pagination
  getAllReports: async (params = {}) => {
    try {
      const {
        page = 0,
        pageSize = 10,
        sort = 'createdAt',
        order = 'desc',
        status = null,
      } = params;

      // Build query parameters
      const queryParams = {
        page,
        size: pageSize,
        sort,
        order,
      };

      // Add optional filter
      if (status) queryParams.status = status;

      const response = await apiClient.get('/reports/admin', {
        params: queryParams,
      });

      // Handle the specific API response format
      if (response.data && response.data.code === 200) {
        const data = response.data.data;
        return {
          success: true,
          data: (data.content || []).map(formatReportData),
          total: data.totalElements,
          totalPages: data.totalPages,
          currentPage: data.currentPage,
          pageSize: data.size,
        };
      } else {
        throw new Error(response.data?.message || 'Failed to fetch reports');
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch reports',
        data: [],
        total: 0,
      };
    }
  },

  // Get report details by ID
  getReportById: async (reportId) => {
    try {
      const response = await apiClient.get(`/reports/admin/${reportId}`);

      if (response.data && response.data.code === 200) {
        return {
          success: true,
          data: formatReportData(response.data.data),
        };
      } else {
        throw new Error(
          response.data?.message || 'Failed to fetch report details'
        );
      }
    } catch (error) {
      console.error('Failed to fetch report details:', error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch report details',
      };
    }
  },

  // Resolve report
  resolveReport: async (reportId, action, adminNotes = '') => {
    try {
      const response = await apiClient.put(
        `/reports/admin/${reportId}/resolve`,
        {
          action,
          adminNotes,
        }
      );

      if (response.data && response.data.code === 200) {
        return {
          success: true,
          data: formatReportData(response.data.data),
          message: response.data.message || 'Report resolved successfully',
        };
      } else {
        throw new Error(response.data?.message || 'Failed to resolve report');
      }
    } catch (error) {
      console.error('Failed to resolve report:', error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to resolve report',
      };
    }
  },
};

export default reportService;
