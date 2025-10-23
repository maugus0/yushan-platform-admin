import api from './api';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  'https://yushan-backend-staging.up.railway.app/api';

export const dashboardService = {
  // Get main dashboard statistics from platform overview
  getDashboardStats: async () => {
    try {
      const response = await api.get(
        `${API_BASE_URL}/admin/analytics/platform/overview`
      );

      if (response.data.code === 200) {
        const data = response.data.data;

        return {
          success: true,
          data: {
            // User statistics
            totalUsers: data.totalUsers,
            newUsersToday: data.newUsersToday,
            activeUsers: data.activeUsers,
            authors: data.authors,
            admins: data.admins,

            // Content statistics
            totalNovels: data.totalNovels,
            publishedNovels: data.publishedNovels,
            completedNovels: data.completedNovels,

            totalChapters: data.totalChapters,
            totalWords: data.totalWords,

            // Engagement statistics
            totalViews: data.totalViews,
            totalComments: data.totalComments,
            totalReviews: data.totalReviews,
            totalVotes: data.totalVotes,
            averageRating: data.averageRating,

            // Growth rates
            userGrowthRate: data.userGrowthRate,
            contentGrowthRate: data.contentGrowthRate,
            engagementGrowthRate: data.engagementGrowthRate,

            // Activity metrics
            dailyActiveUsers: data.dailyActiveUsers,
            weeklyActiveUsers: data.weeklyActiveUsers,
            monthlyActiveUsers: data.monthlyActiveUsers,

            // Last updated
            lastUpdated: data.timestamp,
          },
        };
      }

      throw new Error(
        response.data.message || 'Failed to fetch dashboard statistics'
      );
    } catch (error) {
      console.error('Dashboard stats error:', error);
      throw new Error(error.message || 'Failed to fetch dashboard statistics');
    }
  },

  // Get recent activity feed
  // eslint-disable-next-line no-unused-vars
  getRecentActivity: async (limit = 20) => {
    // Since there's no specific recent activity endpoint, we'll return empty for now
    // This could be implemented later with a dedicated backend endpoint
    return {
      success: true,
      data: [],
    };
  },

  // Get analytics summary
  getAnalyticsSummary: async (period = 'daily') => {
    try {
      const response = await api.get(
        `${API_BASE_URL}/admin/analytics/summary`,
        {
          params: { period },
        }
      );

      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      throw new Error(
        response.data.message || 'Failed to fetch analytics summary'
      );
    } catch (error) {
      console.error('Analytics summary error:', error);
      throw new Error(error.message || 'Failed to fetch analytics summary');
    }
  },

  // Get user trends
  getUserTrends: async (period = 'daily', startDate = null, endDate = null) => {
    try {
      const params = { period };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get(
        `${API_BASE_URL}/admin/analytics/users/trends`,
        {
          params,
        }
      );

      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      throw new Error(response.data.message || 'Failed to fetch user trends');
    } catch (error) {
      console.error('User trends error:', error);
      throw new Error(error.message || 'Failed to fetch user trends');
    }
  },

  // Get novel trends
  getNovelTrends: async (
    period = 'daily',
    startDate = null,
    endDate = null,
    categoryId = null,
    authorId = null,
    status = null
  ) => {
    try {
      const params = { period };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (categoryId) params.categoryId = categoryId;
      if (authorId) params.authorId = authorId;
      if (status !== null) params.status = status;

      const response = await api.get(
        `${API_BASE_URL}/admin/analytics/novels/trends`,
        {
          params,
        }
      );

      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      throw new Error(response.data.message || 'Failed to fetch novel trends');
    } catch (error) {
      console.error('Novel trends error:', error);
      throw new Error(error.message || 'Failed to fetch novel trends');
    }
  },

  // Get reading activity
  getReadingActivity: async (
    period = 'daily',
    startDate = null,
    endDate = null
  ) => {
    try {
      const params = { period };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get(
        `${API_BASE_URL}/admin/analytics/reading/activity`,
        {
          params,
        }
      );

      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      throw new Error(
        response.data.message || 'Failed to fetch reading activity'
      );
    } catch (error) {
      console.error('Reading activity error:', error);
      throw new Error(error.message || 'Failed to fetch reading activity');
    }
  },

  // Get top content
  getTopContent: async (limit = 10) => {
    try {
      const response = await api.get(
        `${API_BASE_URL}/admin/analytics/platform/top-content`,
        {
          params: { limit },
        }
      );

      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      throw new Error(response.data.message || 'Failed to fetch top content');
    } catch (error) {
      console.error('Top content error:', error);
      throw new Error(error.message || 'Failed to fetch top content');
    }
  },

  // Get DAU (Daily Active Users)
  getDailyActiveUsers: async (date = null) => {
    try {
      const params = {};
      if (date) params.date = date;
      else params.date = new Date().toISOString().split('T')[0];

      const response = await api.get(
        `${API_BASE_URL}/admin/analytics/platform/dau`,
        {
          params,
        }
      );

      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      throw new Error(
        response.data.message || 'Failed to fetch daily active users'
      );
    } catch (error) {
      console.error('DAU error:', error);
      throw new Error(error.message || 'Failed to fetch daily active users');
    }
  },
};

export default dashboardService;
