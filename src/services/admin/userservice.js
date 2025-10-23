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

// Real API functions for profile
const getCurrentUserProfile = async () => {
  try {
    const response = await apiClient.get('/users/me');
    // Handle the specific API response format
    if (response.data && response.data.code === 200) {
      return {
        success: true,
        data: formatUserDataFromAPI(response.data.data),
      };
    } else {
      throw new Error(response.data?.message || 'Failed to fetch profile');
    }
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch profile',
    };
  }
};

const getUserProfile = async (userId) => {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    return formatUserData(response.data);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

const getUserProfileByUsername = async (username) => {
  try {
    // Try UUID lookup first
    if (isValidUUID(username)) {
      return await getUserProfile(username);
    }

    // Search by username
    const response = await apiClient.get('/search/users', {
      params: { username: username, limit: 1 },
    });

    if (response.data && response.data.length > 0) {
      return formatUserData(response.data[0]);
    }

    throw new Error('User not found');
  } catch (error) {
    console.error('Error fetching user profile by username:', error);
    throw error;
  }
};

// Helper functions
const isValidUUID = (str) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

const formatUserData = (userData) => {
  return {
    id: userData.id || userData._id,
    username: userData.username || userData.name,
    email: userData.email,
    avatar: userData.avatar || userData.profilePicture,
    status: userData.status || 'active',
    userType: userData.userType || userData.role || 'reader',
    joinDate: userData.createdAt || userData.joinDate,
    lastActive: userData.lastActiveAt || userData.lastActive,
    profile: {
      bio: userData.bio || userData.profile?.bio,
      location: userData.location || userData.profile?.location,
      gender: userData.gender || userData.profile?.gender,
      birthDate: userData.birthDate || userData.profile?.birthDate,
      preferences: userData.preferences || userData.profile?.preferences,
    },
    stats: userData.stats || userData.profile?.stats,
    ...userData,
  };
};

// New formatter specifically for the Yushan API response format
const formatUserDataFromAPI = (apiData) => {
  return {
    id: apiData.uuid,
    uuid: apiData.uuid,
    username: apiData.username,
    email: apiData.email,
    avatar: apiData.avatarUrl,
    status: mapApiStatusToLocal(apiData.status),
    userType: determineUserType(apiData),
    joinDate: apiData.createTime,
    lastActive: apiData.lastActive,
    createdAt: apiData.createTime,
    updatedAt: apiData.updateTime,
    profile: {
      bio: apiData.profileDetail,
      gender: mapApiGenderToLocal(apiData.gender),
      birthDate: apiData.birthday,
      level: apiData.level,
      experience: apiData.exp,
      yuan: apiData.yuan,
      readTime: apiData.readTime,
      readBookNum: apiData.readBookNum,
      isAuthor: apiData.isAuthor,
      isAdmin: apiData.isAdmin,
    },
    stats: {
      level: apiData.level,
      experience: apiData.exp,
      yuan: apiData.yuan || 0,
      readTime: apiData.readTime || 0,
      booksRead: apiData.readBookNum || 0,
    },
    // Raw API data for any other needs
    rawApiData: apiData,
  };
};

// Helper function to map API status to local status
const mapApiStatusToLocal = (apiStatus) => {
  const statusMap = {
    NORMAL: 'active',
    SUSPENDED: 'suspended',
    BANNED: 'banned',
  };
  return statusMap[apiStatus] || 'active';
};

// Helper function to map API gender to local gender
const mapApiGenderToLocal = (apiGender) => {
  const genderMap = {
    MALE: 'male',
    FEMALE: 'female',
    UNKNOWN: 'prefer-not-to-say',
    OTHER: 'other',
  };
  return genderMap[apiGender] || 'prefer-not-to-say';
};

// Helper function to determine user type
const determineUserType = (apiData) => {
  if (apiData.isAdmin) return 'admin';
  if (apiData.isAuthor) return 'writer';
  return 'reader';
};

const getUserStatusColor = (status) => {
  const statusColors = {
    active: '#52c41a',
    inactive: '#faad14',
    suspended: '#fa8c16',
    banned: '#f5222d',
    pending: '#1890ff',
  };
  return statusColors[status] || '#d9d9d9';
};

const getGenderDisplayText = (gender) => {
  const genderMap = {
    male: 'Male',
    female: 'Female',
    other: 'Other',
    'prefer-not-to-say': 'Prefer not to say',
    MALE: 'Male',
    FEMALE: 'Female',
    UNKNOWN: 'Prefer not to say',
    OTHER: 'Other',
    '': 'Not specified',
    null: 'Not specified',
    undefined: 'Not specified',
  };
  return genderMap[gender] || 'Not specified';
};

// Mock data for development
const generateMockReaders = () => {
  const readers = [];
  const statuses = ['active', 'inactive', 'suspended'];
  const names = [
    'Alice Johnson',
    'Bob Smith',
    'Carol Davis',
    'David Wilson',
    'Emma Brown',
    'Frank Miller',
    'Grace Lee',
    'Henry Taylor',
    'Iris Chen',
    'Jack Anderson',
    'Kate Thompson',
    'Leo Garcia',
    'Mia Rodriguez',
    'Noah Martinez',
    'Olivia White',
  ];

  for (let i = 0; i < 15; i++) {
    const joinDate = new Date(
      2023,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    );
    const lastActive = new Date(
      2024,
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 28) + 1
    );

    readers.push({
      id: `reader_${i + 1}`,
      username: names[i],
      email: `${names[i].toLowerCase().replace(' ', '.')}@example.com`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      joinDate: joinDate.toISOString(),
      lastActive: lastActive.toISOString(),
      userType: 'reader',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${names[i]}`,
      profile: {
        bio: `Avid reader who loves ${['fantasy', 'romance', 'sci-fi', 'mystery', 'thriller'][Math.floor(Math.random() * 5)]} novels.`,
        location: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][
          Math.floor(Math.random() * 5)
        ],
        favoriteGenres: ['Fantasy', 'Romance', 'Sci-Fi'].slice(
          0,
          Math.floor(Math.random() * 3) + 1
        ),
        readingStats: {
          booksRead: Math.floor(Math.random() * 100) + 10,
          chaptersRead: Math.floor(Math.random() * 1000) + 100,
          timeSpent: Math.floor(Math.random() * 500) + 50, // hours
          favoriteAuthors: Math.floor(Math.random() * 10) + 1,
        },
      },
      preferences: {
        notifications: Math.random() > 0.5,
        newsletter: Math.random() > 0.3,
        publicProfile: Math.random() > 0.7,
      },
    });
  }
  return readers;
};

const generateMockWriters = () => {
  const writers = [];
  const statuses = ['active', 'inactive', 'suspended', 'pending'];
  const names = [
    'Sarah Connor',
    'Michael Scott',
    'Elena Vasquez',
    'James Park',
    'Luna Rivera',
  ];

  for (let i = 0; i < 5; i++) {
    const joinDate = new Date(
      2023,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    );
    const lastActive = new Date(
      2024,
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 28) + 1
    );

    writers.push({
      id: `writer_${i + 1}`,
      username: names[i],
      email: `${names[i].toLowerCase().replace(' ', '.')}@example.com`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      joinDate: joinDate.toISOString(),
      lastActive: lastActive.toISOString(),
      userType: 'writer',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${names[i]}`,
      profile: {
        bio: `Professional writer specializing in ${['fantasy', 'romance', 'sci-fi', 'mystery', 'thriller'][Math.floor(Math.random() * 5)]} novels.`,
        location: ['Seattle', 'Austin', 'Denver', 'Portland', 'San Francisco'][
          Math.floor(Math.random() * 5)
        ],
        genres: ['Fantasy', 'Romance', 'Sci-Fi'].slice(
          0,
          Math.floor(Math.random() * 3) + 1
        ),
        writingStats: {
          novelsPublished: Math.floor(Math.random() * 10) + 1,
          chaptersWritten: Math.floor(Math.random() * 200) + 50,
          wordsWritten: Math.floor(Math.random() * 500000) + 100000,
          followers: Math.floor(Math.random() * 5000) + 100,
        },
      },
      verification: {
        verified: Math.random() > 0.3,
        verifiedAt: Math.random() > 0.3 ? new Date().toISOString() : null,
        documents: ['ID Card', 'Author Bio'].filter(() => Math.random() > 0.5),
      },
      earnings: {
        totalEarned: Math.floor(Math.random() * 10000) + 1000,
        thisMonth: Math.floor(Math.random() * 1000) + 100,
        currency: 'USD',
      },
    });
  }
  return writers;
};

const mockReaders = generateMockReaders();
const mockWriters = generateMockWriters();
const mockUsers = [...mockReaders, ...mockWriters];

// Helper function to map local status to API status
const mapLocalStatusToApi = (localStatus) => {
  const statusMap = {
    active: 'NORMAL',
    suspended: 'SUSPENDED',
    banned: 'BANNED',
  };
  return statusMap[localStatus] || 'NORMAL';
};

export const userService = {
  // Get all users with real API
  getAllUsers: async (params = {}) => {
    try {
      const queryParams = {
        page: params.page ? params.page - 1 : 0, // Convert to 0-based index
        size: params.pageSize || 10,
        sortBy: params.sortBy || 'createTime',
        sortOrder: params.sortOrder || 'desc',
      };

      // Add status filter if provided
      if (params.status) {
        queryParams.status = mapLocalStatusToApi(params.status);
      }

      // Add userType filter using isAuthor and isAdmin
      if (params.userType === 'reader') {
        queryParams.isAuthor = false;
      } else if (params.userType === 'writer') {
        queryParams.isAuthor = true;
      } else if (params.userType === 'admin') {
        queryParams.isAdmin = true;
      }

      // Add direct filters if provided
      if (params.isAuthor !== undefined) {
        queryParams.isAuthor = params.isAuthor;
      }
      if (params.isAdmin !== undefined) {
        queryParams.isAdmin = params.isAdmin;
      }

      const response = await apiClient.get('/admin/users', {
        params: queryParams,
      });

      // Handle the API response format
      if (response.data && response.data.code === 200) {
        const apiData = response.data.data;
        return {
          data: apiData.content.map(formatUserDataFromAPI),
          total: apiData.totalElements,
          page: apiData.currentPage + 1, // Convert back to 1-based index
          pageSize: apiData.size,
          totalPages: apiData.totalPages,
          hasNext: apiData.hasNext,
          hasPrevious: apiData.hasPrevious,
        };
      } else {
        throw new Error(response.data?.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get readers only
  getReaders: async (params = {}) => {
    try {
      const allParams = { ...params, isAuthor: false };
      return await userService.getAllUsers(allParams);
    } catch (error) {
      console.error('Error fetching readers:', error);
      throw error;
    }
  },

  // Get writers only
  getWriters: async (params = {}) => {
    try {
      const allParams = { ...params, isAuthor: true };
      return await userService.getAllUsers(allParams);
    } catch (error) {
      console.error('Error fetching writers:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await apiClient.get(`/admin/users/${id}`);

      if (response.data && response.data.code === 200) {
        return { data: formatUserDataFromAPI(response.data.data) };
      } else {
        throw new Error(response.data?.message || 'User not found');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Create user
  createUser: async (userData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const newUser = {
        id: `${userData.userType}_${Date.now()}`,
        ...userData,
        joinDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };
      mockUsers.push(newUser);
      return { data: newUser };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const userIndex = mockUsers.findIndex((u) => u.id === id);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };
      return { data: mockUsers[userIndex] };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const userIndex = mockUsers.findIndex((u) => u.id === id);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      const deletedUser = mockUsers.splice(userIndex, 1)[0];
      return { data: deletedUser };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Suspend user
  suspendUser: async (id, suspensionData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const userIndex = mockUsers.findIndex((u) => u.id === id);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      mockUsers[userIndex].status = 'suspended';
      mockUsers[userIndex].suspension = {
        ...suspensionData,
        suspendedAt: new Date().toISOString(),
      };
      return { data: mockUsers[userIndex] };
    } catch (error) {
      console.error('Error suspending user:', error);
      throw error;
    }
  },

  // Ban user
  banUser: async (id, banData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const userIndex = mockUsers.findIndex((u) => u.id === id);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      mockUsers[userIndex].status = 'banned';
      mockUsers[userIndex].ban = {
        ...banData,
        bannedAt: new Date().toISOString(),
      };
      return { data: mockUsers[userIndex] };
    } catch (error) {
      console.error('Error banning user:', error);
      throw error;
    }
  },

  // Bulk actions
  bulkUpdateUsers: async (ids, updateData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const updatedUsers = [];
      ids.forEach((id) => {
        const userIndex = mockUsers.findIndex((u) => u.id === id);
        if (userIndex !== -1) {
          mockUsers[userIndex] = { ...mockUsers[userIndex], ...updateData };
          updatedUsers.push(mockUsers[userIndex]);
        }
      });
      return { data: updatedUsers };
    } catch (error) {
      console.error('Error bulk updating users:', error);
      throw error;
    }
  },

  bulkDeleteUsers: async (ids) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const deletedUsers = [];
      ids.forEach((id) => {
        const userIndex = mockUsers.findIndex((u) => u.id === id);
        if (userIndex !== -1) {
          deletedUsers.push(...mockUsers.splice(userIndex, 1));
        }
      });
      return { data: deletedUsers };
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      throw error;
    }
  },

  // Promote user to admin
  promoteToAdmin: async (email) => {
    try {
      const response = await apiClient.post('/admin/promote-to-admin', {
        email: email,
      });

      if (response.data && response.data.code === 200) {
        return {
          success: true,
          message:
            response.data.message || 'User promoted to admin successfully',
          data: response.data.data,
        };
      } else {
        throw new Error(
          response.data?.message || 'Failed to promote user to admin'
        );
      }
    } catch (error) {
      console.error('Error promoting user to admin:', error);
      throw error;
    }
  },

  // Update user status
  updateUserStatus: async (userId, status) => {
    try {
      // Map local status to API status
      const statusMap = {
        active: 'NORMAL',
        suspended: 'SUSPENDED',
        banned: 'BANNED',
      };
      const apiStatus = statusMap[status.toLowerCase()] || status.toUpperCase();

      const response = await apiClient.put(`/admin/users/${userId}/status`, {
        status: apiStatus,
      });

      if (response.data && response.data.code === 200) {
        return {
          success: true,
          message: response.data.message || 'User status updated successfully',
          data: response.data.data,
        };
      } else {
        throw new Error(
          response.data?.message || 'Failed to update user status'
        );
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },
};

// Add real API functions to userService for backward compatibility
userService.getCurrentUserProfile = getCurrentUserProfile;
userService.getUserProfile = getUserProfile;
userService.getUserProfileByUsername = getUserProfileByUsername;
userService.getUserStatusColor = getUserStatusColor;
userService.getGenderDisplayText = getGenderDisplayText;

// Export all functions
export {
  getCurrentUserProfile,
  getUserProfile,
  getUserProfileByUsername,
  getUserStatusColor,
  getGenderDisplayText,
};

export default userService;
