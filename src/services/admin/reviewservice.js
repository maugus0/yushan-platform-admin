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

// Helper function to format review data from API
const formatReviewData = (apiData) => {
  return {
    id: apiData.id,
    uuid: apiData.uuid,
    userId: apiData.userId,
    username: apiData.username,
    novelId: apiData.novelId,
    novelTitle: apiData.novelTitle,
    rating: apiData.rating,
    title: apiData.title,
    content: apiData.content,
    likes: apiData.likeCnt || 0,
    isSpoiler: apiData.isSpoiler,
    createdAt: apiData.createTime,
    updatedAt: apiData.updateTime,
  };
};

export const reviewService = {
  // Get all reviews with filtering and pagination
  getAllReviews: async (params = {}) => {
    try {
      const {
        page = 0,
        pageSize = 10,
        sort = 'createTime',
        order = 'desc',
        novelId = null,
        rating = null,
        isSpoiler = null,
        search = '',
      } = params;

      // Build query parameters
      const queryParams = {
        page,
        size: pageSize,
        sort,
        order,
      };

      // Add optional filters
      if (novelId) queryParams.novelId = novelId;
      if (rating) queryParams.rating = rating;
      if (isSpoiler !== null && isSpoiler !== undefined)
        queryParams.isSpoiler = isSpoiler;
      if (search) queryParams.search = search;

      const response = await apiClient.get('/reviews/admin/all', {
        params: queryParams,
      });

      // Handle the specific API response format
      if (response.data && response.data.code === 200) {
        const data = response.data.data;
        return {
          success: true,
          data: (data.content || []).map(formatReviewData),
          total: data.totalElements,
          totalPages: data.totalPages,
          currentPage: data.currentPage,
          pageSize: data.size,
        };
      } else {
        throw new Error(response.data?.message || 'Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch reviews',
        data: [],
        total: 0,
      };
    }
  },

  // Delete review (admin)
  deleteReviewAdmin: async (reviewId) => {
    try {
      const response = await apiClient.delete(`/reviews/admin/${reviewId}`);

      if (response.data && response.data.code === 200) {
        return {
          success: true,
          message: response.data.message || 'Review deleted successfully',
        };
      } else {
        throw new Error(response.data?.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to delete review',
      };
    }
  },
};

export default reviewService;
