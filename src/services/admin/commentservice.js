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

// Helper function to format comment data from API
const formatCommentData = (apiData) => {
  return {
    id: apiData.id,
    userId: apiData.userId,
    username: apiData.username,
    content: apiData.content,
    novelId: apiData.novelId,
    chapterId: apiData.chapterId,
    chapterTitle: apiData.chapterTitle,
    likes: apiData.likeCnt || 0,
    isSpoiler: apiData.isSpoiler,
    createdAt: apiData.createTime,
    updatedAt: apiData.updateTime,
  };
};

export const commentService = {
  // Get all comments with filtering and pagination
  getAllComments: async (params = {}) => {
    try {
      const {
        page = 0,
        pageSize = 10,
        sort = 'createTime',
        order = 'desc',
        chapterId = null,
        novelId = null,
        userId = null,
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
      if (chapterId) queryParams.chapterId = chapterId;
      if (novelId) queryParams.novelId = novelId;
      if (userId) queryParams.userId = userId;
      if (isSpoiler !== null && isSpoiler !== undefined)
        queryParams.isSpoiler = isSpoiler;
      if (search) queryParams.search = search;

      const response = await apiClient.get('/comments/admin/all', {
        params: queryParams,
      });

      // Handle the specific API response format
      if (response.data && response.data.code === 200) {
        const data = response.data.data;
        return {
          success: true,
          data: (data.comments || []).map(formatCommentData),
          total: data.totalCount,
          totalPages: data.totalPages,
          currentPage: data.currentPage,
          pageSize: data.pageSize,
        };
      } else {
        throw new Error(response.data?.message || 'Failed to fetch comments');
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch comments',
        data: [],
        total: 0,
      };
    }
  },

  // Get comments by novel or chapter
  getCommentsByTarget: async (targetType, targetId, params = {}) => {
    try {
      const {
        page = 0,
        pageSize = 20,
        sort = 'createTime',
        order = 'desc',
      } = params;

      // Build query parameters
      const queryParams = {
        page,
        size: pageSize,
        sort,
        order,
      };

      if (targetType === 'novel') {
        queryParams.novelId = targetId;
      } else if (targetType === 'chapter') {
        queryParams.chapterId = targetId;
      }

      const response = await apiClient.get('/comments/admin/all', {
        params: queryParams,
      });

      if (response.data && response.data.code === 200) {
        const data = response.data.data;
        return {
          success: true,
          data: (data.comments || []).map(formatCommentData),
          total: data.totalCount,
          totalPages: data.totalPages,
          currentPage: data.currentPage,
          pageSize: data.pageSize,
        };
      } else {
        throw new Error(response.data?.message || 'Failed to fetch comments');
      }
    } catch (error) {
      console.error('Failed to fetch comments by target:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: [],
        total: 0,
      };
    }
  },

  // Get comment by ID
  getCommentById: async (id) => {
    try {
      const response = await apiClient.get(`/comments/${id}`);

      if (response.data && response.data.code === 200) {
        return {
          success: true,
          data: formatCommentData(response.data.data),
        };
      } else {
        throw new Error(response.data?.message || 'Comment not found');
      }
    } catch (error) {
      console.error('Failed to fetch comment by ID:', error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch comment',
      };
    }
  },

  // Create new comment (if API supports it)
  createComment: async (commentData) => {
    try {
      const response = await apiClient.post('/comments', commentData);

      if (response.data && response.data.code === 200) {
        return {
          success: true,
          data: formatCommentData(response.data.data),
        };
      } else {
        throw new Error(response.data?.message || 'Failed to create comment');
      }
    } catch (error) {
      console.error('Failed to create comment:', error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to create comment',
      };
    }
  },

  // Update comment (if API supports it)
  updateComment: async (id, updateData) => {
    try {
      const response = await apiClient.put(`/comments/${id}`, updateData);

      if (response.data && response.data.code === 200) {
        return {
          success: true,
          data: formatCommentData(response.data.data),
        };
      } else {
        throw new Error(response.data?.message || 'Failed to update comment');
      }
    } catch (error) {
      console.error('Failed to update comment:', error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to update comment',
      };
    }
  },

  // Delete comment (if API supports it)
  deleteComment: async (id) => {
    try {
      const response = await apiClient.delete(`/comments/${id}`);

      if (response.data && response.data.code === 200) {
        return {
          success: true,
          data: response.data.data,
          message: `Comment deleted successfully`,
        };
      } else {
        throw new Error(response.data?.message || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to delete comment',
      };
    }
  },

  // Get recent comments
  getRecentComments: async (limit = 20) => {
    try {
      const response = await apiClient.get('/comments/admin/all', {
        params: {
          page: 0,
          size: limit,
          sort: 'createTime',
          order: 'desc',
        },
      });

      if (response.data && response.data.code === 200) {
        const data = response.data.data;
        return {
          success: true,
          data: (data.comments || []).map(formatCommentData),
          total: data.totalCount,
        };
      } else {
        throw new Error(
          response.data?.message || 'Failed to fetch recent comments'
        );
      }
    } catch (error) {
      console.error('Failed to fetch recent comments:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: [],
      };
    }
  },

  // Get comment statistics for a chapter
  getCommentStatistics: async (chapterId) => {
    try {
      const response = await apiClient.get(
        `/comments/chapter/${chapterId}/statistics`
      );

      if (response.data && response.data.code === 200) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        throw new Error(
          response.data?.message || 'Failed to fetch comment statistics'
        );
      }
    } catch (error) {
      console.error('Failed to fetch comment statistics:', error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch comment statistics',
      };
    }
  },

  // Delete comment (admin)
  deleteCommentAdmin: async (commentId) => {
    try {
      const response = await apiClient.delete(`/comments/admin/${commentId}`);

      if (response.data && response.data.code === 200) {
        return {
          success: true,
          message: response.data.message || 'Comment deleted successfully',
        };
      } else {
        throw new Error(response.data?.message || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to delete comment',
      };
    }
  },
};

export default commentService;
