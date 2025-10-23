// Mock API service for development
// This will be replaced with real API calls later

class MockAPI {
  constructor() {
    this.delay = (ms = 500) =>
      new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Auth endpoints
  async login(credentials) {
    await this.delay();
    if (
      credentials.username === 'admin' &&
      credentials.password === 'admin123'
    ) {
      return {
        success: true,
        data: {
          id: 1,
          username: 'admin',
          email: 'admin@yushan.com',
          role: 'super_admin',
          permissions: [
            'read',
            'write',
            'delete',
            'manage_users',
            'manage_content',
          ],
          token: 'mock-jwt-token',
        },
      };
    }
    throw new Error('Invalid credentials');
  }

  async logout() {
    await this.delay(200);
    return { success: true };
  }

  // Dashboard endpoints
  async getDashboardStats() {
    await this.delay();
    return {
      totalUsers: 15847,
      totalNovels: 2341,
      totalChapters: 45623,
      totalComments: 89234,
      totalReviews: 12456,
      totalViews: 1234567,
      newUsersToday: 45,
      newNovelsToday: 12,
      newChaptersToday: 156,
    };
  }

  async getRecentActivity() {
    await this.delay();
    return [
      {
        id: 1,
        action: 'New user registered',
        user: 'john_reader',
        time: '2 minutes ago',
        type: 'user',
      },
      {
        id: 2,
        action: 'Novel published',
        user: 'author_jane',
        time: '5 minutes ago',
        type: 'novel',
      },
      {
        id: 3,
        action: 'Chapter updated',
        user: 'writer_bob',
        time: '10 minutes ago',
        type: 'chapter',
      },
      {
        id: 4,
        action: 'Review submitted',
        user: 'reviewer_alice',
        time: '15 minutes ago',
        type: 'review',
      },
      {
        id: 5,
        action: 'Comment reported',
        user: 'moderator',
        time: '20 minutes ago',
        type: 'report',
      },
    ];
  }

  // User endpoints
  async getUsers(params = {}) {
    await this.delay();
    const { page = 1, limit = 10, type = 'all', search = '' } = params;

    // Mock user data
    const users = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      username: `user_${i + 1}`,
      email: `user${i + 1}@example.com`,
      type: i % 3 === 0 ? 'writer' : 'reader',
      status: i % 10 === 0 ? 'suspended' : 'active',
      joinDate: new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
      lastActive: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      novelsCount: i % 3 === 0 ? Math.floor(Math.random() * 10) : 0,
      chaptersCount: i % 3 === 0 ? Math.floor(Math.random() * 100) : 0,
    }));

    const filteredUsers = users.filter((user) => {
      if (type !== 'all' && user.type !== type) return false;
      if (search && !user.username.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      data: filteredUsers.slice(startIndex, endIndex),
      total: filteredUsers.length,
      page,
      limit,
    };
  }

  // Novel endpoints
  async getNovels(params = {}) {
    await this.delay();
    const { page = 1, limit = 10, status = 'all', search = '' } = params;

    // Mock novel data
    const novels = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      title: `Novel Title ${i + 1}`,
      author: `author_${Math.floor(Math.random() * 20) + 1}`,
      status: ['published', 'draft', 'reviewing'][i % 3],
      category: ['Fantasy', 'Romance', 'Action', 'Drama'][i % 4],
      chaptersCount: Math.floor(Math.random() * 100) + 1,
      views: Math.floor(Math.random() * 100000),
      rating: (Math.random() * 5).toFixed(1),
      createdAt: new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const filteredNovels = novels.filter((novel) => {
      if (status !== 'all' && novel.status !== status) return false;
      if (search && !novel.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      data: filteredNovels.slice(startIndex, endIndex),
      total: filteredNovels.length,
      page,
      limit,
    };
  }
}

export const mockAPI = new MockAPI();
export default mockAPI;
