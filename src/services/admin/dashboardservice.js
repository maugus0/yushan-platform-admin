import api from './api';

// Note: Mock data for novel trends is now hardcoded directly in components
// since the endpoint no longer exists

export const dashboardService = {
  // Get main dashboard statistics from platform overview
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/analytics/platform/overview');

      if (response.data.code === 200) {
        const data = response.data.data;

        return {
          success: true,
          data: {
            // User statistics - from new response structure
            dailyActiveUsers: data.dailyActiveUsers || 0,
            weeklyActiveUsers: data.weeklyActiveUsers || 0,
            monthlyActiveUsers: data.monthlyActiveUsers || 0,

            // Content statistics
            totalNovels: data.totalNovels || 0,

            // Engagement statistics
            totalReadingSessions: data.totalReadingSessions || 0,
            totalComments: data.totalComments || 0,
            totalReviews: data.totalReviews || 0,

            // Fallback for old fields that might not exist
            totalUsers: data.totalUsers || 0,
            newUsersToday: data.newUsersToday || 0,
            activeUsers: data.activeUsers || data.dailyActiveUsers || 0,
            authors: data.authors || 0,
            admins: data.admins || 0,
            publishedNovels: data.publishedNovels || data.totalNovels || 0,
            completedNovels: data.completedNovels || 0,
            totalChapters: data.totalChapters || 0,
            totalWords: data.totalWords || 0,
            totalViews: data.totalViews || 0,
            totalVotes: data.totalVotes || 0,
            averageRating: data.averageRating || 0,
            userGrowthRate: data.userGrowthRate || 0,
            contentGrowthRate: data.contentGrowthRate || 0,
            engagementGrowthRate: data.engagementGrowthRate || 0,

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
      const response = await api.get('/admin/analytics/summary', {
        params: { period },
      });

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

      const response = await api.get('/admin/analytics/users/trends', {
        params,
      });

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

  // Note: getNovelTrends removed - endpoint doesn't exist
  // Dashboard uses hardcoded mock data instead

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

      const response = await api.get('/admin/analytics/reading/activity', {
        params,
      });

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
      const response = await api.get('/admin/analytics/platform/top-content', {
        params: { limit },
      });

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

      const response = await api.get('/admin/analytics/platform/dau', {
        params,
      });

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
