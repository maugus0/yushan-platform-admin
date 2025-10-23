import axios from 'axios';

const API_BASE_URL = 'https://yushan-backend-staging.up.railway.app/api';

// Create an axios instance for external API calls
const externalApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: '*/*',
  },
});

// Add request interceptor to include auth token
externalApi.interceptors.request.use(
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

// Add response interceptor for error handling
externalApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const libraryService = {
  // Get all user libraries with pagination and filtering
  getAllLibraries: async (params = {}) => {
    try {
      const {
        page = 1,
        pageSize = 10,
        search = '',
        sortBy = 'createTime',
        sortOrder = 'DESC',
        minBooks = null,
        maxBooks = null,
      } = params;

      // Build query parameters for the external API
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortBy: sortBy,
        sortOrder: sortOrder,
      });

      // Add search parameter if provided
      if (search) {
        queryParams.append('search', search);
      }

      const response = await externalApi.get(`/search/users?${queryParams}`);

      if (!response.data || !response.data.users) {
        throw new Error('Invalid response format');
      }

      // Transform user data to library format
      const libraries = response.data.users.map((user) => ({
        id: user.username, // Use username as unique identifier
        userId: user.username,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        profileDetail: user.profileDetail,
        birthday: user.birthday,
        isAuthor: user.isAuthor,
        isAdmin: user.isAdmin,
        level: user.level,
        exp: user.exp,
        yuan: user.yuan,
        readTime: user.readTime, // in hours (corrected)
        totalBooks: user.readBookNum, // Use readBookNum as totalBooks
        totalReadingTime: user.readTime, // Already in hours
        booksCompleted: Math.floor(user.readBookNum * 0.7), // Estimate 70% completed
        booksReading: Math.floor(user.readBookNum * 0.2), // Estimate 20% reading
        booksWantToRead: Math.floor(user.readBookNum * 0.1), // Estimate 10% want to read
        createdAt: user.createTime,
        updatedAt: user.updateTime,
        lastActive: user.lastActive,
        status: user.status,
      }));

      // Apply additional filters
      let filteredLibraries = libraries;

      // Filter by book count range
      if (minBooks !== null) {
        filteredLibraries = filteredLibraries.filter(
          (library) => library.totalBooks >= parseInt(minBooks)
        );
      }

      if (maxBooks !== null) {
        filteredLibraries = filteredLibraries.filter(
          (library) => library.totalBooks <= parseInt(maxBooks)
        );
      }

      return {
        success: true,
        data: filteredLibraries,
        total: response.data.userCount || response.data.totalResults,
        page: response.data.currentPage || page,
        pageSize: pageSize,
        totalPages:
          response.data.totalPages ||
          Math.ceil(
            (response.data.userCount || response.data.totalResults) / pageSize
          ),
      };
    } catch (error) {
      console.error('Failed to fetch libraries:', error);
      throw new Error('Failed to fetch user libraries from API');
    }
  },

  // Get user library by user ID (using real API)
  getUserLibrary: async (userId) => {
    try {
      // For detailed user view, we could expand this to call multiple endpoints
      // For now, we'll use the search users endpoint with specific user filter
      const response = await externalApi.get(
        `/search/users?search=${userId}&pageSize=1`
      );

      if (
        !response.data ||
        !response.data.users ||
        response.data.users.length === 0
      ) {
        throw new Error('User library not found');
      }

      const user = response.data.users[0];

      // Transform to library format
      const library = {
        id: user.username,
        userId: user.username,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        profileDetail: user.profileDetail,
        birthday: user.birthday,
        isAuthor: user.isAuthor,
        isAdmin: user.isAdmin,
        level: user.level,
        exp: user.exp,
        yuan: user.yuan,
        readTime: user.readTime,
        totalBooks: user.readBookNum,
        totalReadingTime: user.readTime,
        booksCompleted: Math.floor(user.readBookNum * 0.7),
        booksReading: Math.floor(user.readBookNum * 0.2),
        booksWantToRead: Math.floor(user.readBookNum * 0.1),
        createdAt: user.createTime,
        updatedAt: user.updateTime,
        lastActive: user.lastActive,
        status: user.status,
      };

      return {
        success: true,
        data: library,
      };
    } catch (error) {
      console.error('Failed to fetch user library:', error);
      throw new Error(error.message || 'Failed to fetch user library');
    }
  },

  // Note: Other functions for bookmarks, collections, etc. would be implemented
  // as needed using similar API calls to the staging backend

  // Get library statistics (would integrate with backend analytics endpoints)
  getLibraryStats: async () => {
    try {
      // This would call a dedicated analytics endpoint when available
      const response = await externalApi.get(`/search/users?pageSize=1`);

      return {
        success: true,
        data: {
          totalUsers: response.data?.userCount || 0,
          // Additional analytics would be fetched from dedicated endpoints
        },
      };
    } catch (error) {
      console.error('Failed to fetch library statistics:', error);
      throw new Error('Failed to fetch library statistics');
    }
  },
};

export default libraryService;
