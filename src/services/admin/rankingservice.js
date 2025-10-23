import api from './api';

// Real ranking service using actual API endpoints
export const rankingService = {
  // Get user rankings
  getUserRankings: async (params = {}) => {
    try {
      const {
        page = 0,
        size = 50,
        timeRange = 'overall',
        sortBy = 'points',
      } = params;

      const response = await api.get('/ranking/user', {
        params: { page, size, timeRange, sortBy },
      });

      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      } else {
        throw new Error(
          response.data.message || 'Failed to fetch user rankings'
        );
      }
    } catch (error) {
      console.error('Error fetching user rankings:', error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch user rankings'
      );
    }
  },

  // Get novel rankings
  getNovelRankings: async (params = {}) => {
    try {
      const {
        page = 0,
        size = 50,
        sortType = 'vote',
        timeRange = 'overall',
      } = params;

      const response = await api.get('/ranking/novel', {
        params: { page, size, sortType, timeRange },
      });

      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      } else {
        throw new Error(
          response.data.message || 'Failed to fetch novel rankings'
        );
      }
    } catch (error) {
      console.error('Error fetching novel rankings:', error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch novel rankings'
      );
    }
  },

  // Get author rankings
  getAuthorRankings: async (params = {}) => {
    try {
      const {
        page = 0,
        size = 50,
        sortType = 'vote',
        timeRange = 'overall',
      } = params;

      const response = await api.get('/ranking/author', {
        params: { page, size, sortType, timeRange },
      });

      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      } else {
        throw new Error(
          response.data.message || 'Failed to fetch author rankings'
        );
      }
    } catch (error) {
      console.error('Error fetching author rankings:', error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch author rankings'
      );
    }
  },

  // Get specific novel rank
  getNovelRank: async (novelId) => {
    try {
      const response = await api.get(`/ranking/novel/${novelId}/rank`);

      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
          isInTop100: response.data.data !== null,
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch novel rank');
      }
    } catch (error) {
      console.error('Error fetching novel rank:', error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch novel rank'
      );
    }
  },

  // Get all rankings (combined helper method)
  getAllRankings: async (params = {}) => {
    const { type = 'novels', ...otherParams } = params;

    switch (type) {
      case 'users':
        return await rankingService.getUserRankings(otherParams);
      case 'novels':
        return await rankingService.getNovelRankings(otherParams);
      case 'authors':
        return await rankingService.getAuthorRankings(otherParams);
      default:
        throw new Error('Invalid ranking type');
    }
  },
};

export default rankingService;
