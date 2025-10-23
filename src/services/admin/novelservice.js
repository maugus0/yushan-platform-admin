import api from './api';

// Generate mock novels data
const generateMockNovels = () => {
  const statuses = [
    'published',
    'draft',
    'reviewing',
    'suspended',
    'completed',
  ];
  const categories = [
    'Fantasy',
    'Romance',
    'Action',
    'Sci-Fi',
    'Mystery',
    'Horror',
  ];
  const languages = ['English', 'Chinese', 'Japanese', 'Korean', 'Spanish'];

  const authors = [
    'Sarah Connor',
    'Michael Zhang',
    'Elena Rodriguez',
    'James Park',
    'Luna Kim',
    'Alex Chen',
    'Grace Li',
    'David Kim',
    'Maria Santos',
    'Lisa Wang',
    'Robert Johnson',
    'Amy Wu',
    'Kevin Lee',
    'Sophie Chen',
    'Daniel Liu',
  ];

  const novelTitles = [
    'Dragon Realm Chronicles',
    'Mystic Sword Master',
    'Love in Ancient Times',
    'Cyber Ninja Academy',
    'Eternal Phoenix',
    'Shadow Hunter Guild',
    'Moonlight Serenade',
    'Quantum Legends',
    'Sacred Beast Tamer',
    'Imperial Court Romance',
    'Starfall Warriors',
    'Crystal Heart Saga',
    "Demon King's Bride",
    'Azure Sky Pavilion',
    'Crimson Blade Dance',
    'Heavenly Immortal Path',
    'Dark Moon Rising',
    'Golden Phoenix Empire',
    'Silver Wolf Chronicles',
    'Jade Mountain Secrets',
    "Thunder God's Legacy",
    'Frozen Heart Kingdom',
    'Burning Soul Technique',
    'Wind Spirit Master',
    'Earth Shaking Fist',
    'Water Dragon King',
    'Fire Phoenix Goddess',
    'Lightning Sword Saint',
    "Ice Queen's Domain",
    "Steel Warrior's Path",
  ];

  return Array.from({ length: 150 }, (_, i) => {
    const createdDate = new Date(
      2023,
      Math.floor(Math.random() * 24),
      Math.floor(Math.random() * 28) + 1
    );
    const updatedDate = new Date(
      createdDate.getTime() +
        Math.random() * (Date.now() - createdDate.getTime())
    );
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      id: i + 1,
      title:
        novelTitles[i % novelTitles.length] +
        (i >= novelTitles.length
          ? ` ${Math.floor(i / novelTitles.length) + 1}`
          : ''),
      slug: (
        novelTitles[i % novelTitles.length] +
        (i >= novelTitles.length
          ? ` ${Math.floor(i / novelTitles.length) + 1}`
          : '')
      )
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-'),
      author: authors[Math.floor(Math.random() * authors.length)],
      authorId: Math.floor(Math.random() * authors.length) + 1,
      status,
      category: categories[Math.floor(Math.random() * categories.length)],
      categoryId: Math.floor(Math.random() * 6) + 1,
      language: languages[Math.floor(Math.random() * languages.length)],

      // Content stats
      chaptersCount: Math.floor(Math.random() * 500) + 1,
      totalWords: Math.floor(Math.random() * 500000) + 10000,
      averageWordsPerChapter: Math.floor(Math.random() * 2000) + 1000,

      // Engagement stats
      views: Math.floor(Math.random() * 1000000) + 1000,
      uniqueViews: Math.floor(Math.random() * 800000) + 800,
      likes: Math.floor(Math.random() * 50000) + 100,
      bookmarks: Math.floor(Math.random() * 20000) + 50,
      comments: Math.floor(Math.random() * 5000) + 10,
      reviews: Math.floor(Math.random() * 1000) + 5,
      rating: (Math.random() * 2 + 3).toFixed(1),
      ratingCount: Math.floor(Math.random() * 2000) + 50,

      // Publication info
      isOriginal: Math.random() > 0.3,
      originalLanguage: languages[Math.floor(Math.random() * languages.length)],
      translatedBy:
        Math.random() > 0.7
          ? authors[Math.floor(Math.random() * authors.length)]
          : null,

      // Metadata
      description: `An epic tale of adventure, romance, and mystery that will keep you on the edge of your seat. Follow the journey of heroes as they navigate through challenges and discover their true destiny.`,
      tags: ['Adventure', 'Magic', 'Romance', 'Action'].slice(
        0,
        Math.floor(Math.random() * 4) + 1
      ),
      ageRating: ['General', 'Teen', 'Mature'][Math.floor(Math.random() * 3)],
      isCompleted: status === 'completed',
      isPremium: Math.random() > 0.7,
      isExclusive: Math.random() > 0.9,
      isFeatured: Math.random() > 0.8,

      // SEO
      seoTitle: null,
      seoDescription: null,
      seoKeywords: [],

      // Publishing
      publishedAt:
        status === 'published' || status === 'completed'
          ? createdDate.toISOString()
          : null,
      lastChapterAt:
        status === 'published' || status === 'completed'
          ? updatedDate.toISOString()
          : null,
      scheduledAt: null,

      // Revenue (for premium novels)
      revenue:
        Math.random() > 0.7 ? Math.floor(Math.random() * 10000) + 500 : 0,

      // Timestamps
      createdAt: createdDate.toISOString(),
      updatedAt: updatedDate.toISOString(),

      // Cover and assets
      coverImage: `https://picsum.photos/300/400?random=${i + 1}`,
      bannerImage: `https://picsum.photos/800/300?random=${i + 100}`,

      // Analytics
      trending: Math.random() > 0.8,
      trendingRank:
        Math.random() > 0.8 ? Math.floor(Math.random() * 100) + 1 : null,
      weeklyViews: Math.floor(Math.random() * 50000) + 1000,
      monthlyViews: Math.floor(Math.random() * 200000) + 5000,

      // Moderation
      reportCount: Math.floor(Math.random() * 10),
      isReported: Math.random() > 0.95,
      moderationNotes: Math.random() > 0.9 ? 'Reviewed and approved' : null,
    };
  });
};

const mockNovels = generateMockNovels();

export const novelService = {
  // Get all novels with filtering and pagination
  getAllNovels: async (params = {}) => {
    try {
      const {
        page = 0,
        size = 10,
        sort = 'createTime',
        order = 'desc',
        category = '',
        status = '',
        search = '',
        authorName = '',
        authorId = '',
      } = params;

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sort,
        order,
      });

      // Add optional filters
      if (category) queryParams.append('category', category);
      if (status) queryParams.append('status', status);
      if (search) queryParams.append('search', search);
      if (authorName) queryParams.append('authorName', authorName);
      if (authorId) queryParams.append('authorId', authorId);

      const response = await api.get(
        `/novels/admin/all?${queryParams.toString()}`
      );

      if (response.data && response.data.code === 200) {
        const apiData = response.data.data;
        return {
          success: true,
          data: apiData.content || [],
          total: apiData.totalElements || 0,
          page: apiData.currentPage + 1, // Convert to 1-based
          pageSize: apiData.size || size,
          totalPages: apiData.totalPages || 0,
          hasNext: apiData.hasNext || false,
          hasPrevious: apiData.hasPrevious || false,
        };
      } else {
        throw new Error(response.data?.message || 'Failed to fetch novels');
      }
    } catch (error) {
      console.error('Error fetching novels:', error);
      throw new Error('Failed to fetch novels');
    }
  },

  // Get novel by ID
  getNovelById: async (id) => {
    try {
      await api.delay(300);

      const novel = mockNovels.find((n) => n.id === parseInt(id));

      if (!novel) {
        throw new Error('Novel not found');
      }

      return {
        success: true,
        data: novel,
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch novel');
    }
  },

  // Create new novel
  createNovel: async (novelData) => {
    try {
      await api.delay(800);

      const newNovel = {
        id: Math.max(...mockNovels.map((n) => n.id)) + 1,
        ...novelData,
        slug: novelData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        chaptersCount: 0,
        totalWords: 0,
        views: 0,
        uniqueViews: 0,
        likes: 0,
        bookmarks: 0,
        comments: 0,
        reviews: 0,
        rating: '0.0',
        ratingCount: 0,
        revenue: 0,
        reportCount: 0,
        isReported: false,
        trending: false,
        trendingRank: null,
        weeklyViews: 0,
        monthlyViews: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt:
          novelData.status === 'published' ? new Date().toISOString() : null,
        lastChapterAt: null,
        coverImage: `https://picsum.photos/300/400?random=${Date.now()}`,
        bannerImage: `https://picsum.photos/800/300?random=${Date.now() + 1}`,
      };

      mockNovels.push(newNovel);

      return {
        success: true,
        data: newNovel,
      };
    } catch (error) {
      throw new Error('Failed to create novel');
    }
  },

  // Update novel
  updateNovel: async (id, updateData) => {
    try {
      await api.delay(600);

      const novelIndex = mockNovels.findIndex((n) => n.id === parseInt(id));

      if (novelIndex === -1) {
        throw new Error('Novel not found');
      }

      const updatedNovel = {
        ...mockNovels[novelIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      // Update publish date if status changed to published
      if (
        updateData.status === 'published' &&
        mockNovels[novelIndex].status !== 'published'
      ) {
        updatedNovel.publishedAt = new Date().toISOString();
      }

      mockNovels[novelIndex] = updatedNovel;

      return {
        success: true,
        data: updatedNovel,
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to update novel');
    }
  },

  // Delete novel
  deleteNovel: async (id) => {
    try {
      await api.delay(400);

      const novelIndex = mockNovels.findIndex((n) => n.id === parseInt(id));

      if (novelIndex === -1) {
        throw new Error('Novel not found');
      }

      const deletedNovel = mockNovels.splice(novelIndex, 1)[0];

      return {
        success: true,
        data: deletedNovel,
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to delete novel');
    }
  },

  // Get novel statistics
  getNovelStats: async (id) => {
    try {
      await api.delay(400);

      const novel = mockNovels.find((n) => n.id === parseInt(id));

      if (!novel) {
        throw new Error('Novel not found');
      }

      // Generate mock analytics data
      const generateDailyStats = (days = 30) => {
        return Array.from({ length: days }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (days - 1 - i));
          return {
            date: date.toISOString().split('T')[0],
            views: Math.floor(Math.random() * 1000) + 100,
            uniqueViews: Math.floor(Math.random() * 800) + 80,
            likes: Math.floor(Math.random() * 50) + 5,
            comments: Math.floor(Math.random() * 20) + 1,
            bookmarks: Math.floor(Math.random() * 30) + 3,
          };
        });
      };

      return {
        success: true,
        data: {
          id: novel.id,
          title: novel.title,
          dailyStats: generateDailyStats(30),
          totalStats: {
            views: novel.views,
            uniqueViews: novel.uniqueViews,
            likes: novel.likes,
            comments: novel.comments,
            bookmarks: novel.bookmarks,
            reviews: novel.reviews,
            rating: novel.rating,
            ratingCount: novel.ratingCount,
          },
          readerDemographics: {
            ageGroups: [
              { range: '13-17', percentage: 15.2 },
              { range: '18-24', percentage: 34.8 },
              { range: '25-34', percentage: 28.6 },
              { range: '35-44', percentage: 16.4 },
              { range: '45+', percentage: 5.0 },
            ],
            regions: [
              { region: 'North America', percentage: 35.8 },
              { region: 'Europe', percentage: 26.0 },
              { region: 'Asia', percentage: 24.6 },
              { region: 'Others', percentage: 13.6 },
            ],
          },
          engagement: {
            averageReadingTime: '45 minutes',
            completionRate: '68.4%',
            retentionRate: '72.1%',
            shareRate: '8.3%',
          },
        },
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch novel statistics');
    }
  },

  // Bulk update novels
  bulkUpdateNovels: async (ids, updateData) => {
    try {
      await api.delay(800);

      const updatedNovels = [];

      ids.forEach((id) => {
        const novelIndex = mockNovels.findIndex((n) => n.id === parseInt(id));
        if (novelIndex !== -1) {
          mockNovels[novelIndex] = {
            ...mockNovels[novelIndex],
            ...updateData,
            updatedAt: new Date().toISOString(),
          };
          updatedNovels.push(mockNovels[novelIndex]);
        }
      });

      return {
        success: true,
        data: updatedNovels,
        message: `${updatedNovels.length} novels updated successfully`,
      };
    } catch (error) {
      throw new Error('Failed to bulk update novels');
    }
  },

  // Get trending novels
  getTrendingNovels: async (_period = '7d', limit = 20) => {
    try {
      await api.delay(400);

      let novels = mockNovels
        .filter((novel) => novel.trending && novel.status === 'published')
        .sort((a, b) => (a.trendingRank || 999) - (b.trendingRank || 999))
        .slice(0, limit);

      return {
        success: true,
        data: novels,
      };
    } catch (error) {
      throw new Error('Failed to fetch trending novels');
    }
  },

  // Feature/unfeature novel
  toggleFeatureNovel: async (id) => {
    try {
      await api.delay(300);

      const novelIndex = mockNovels.findIndex((n) => n.id === parseInt(id));

      if (novelIndex === -1) {
        throw new Error('Novel not found');
      }

      mockNovels[novelIndex].isFeatured = !mockNovels[novelIndex].isFeatured;
      mockNovels[novelIndex].updatedAt = new Date().toISOString();

      return {
        success: true,
        data: mockNovels[novelIndex],
        message: `Novel ${mockNovels[novelIndex].isFeatured ? 'featured' : 'unfeatured'} successfully`,
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to toggle novel feature status');
    }
  },

  // Get novels by author
  getNovelsByAuthor: async (authorId, params = {}) => {
    try {
      await api.delay(400);

      const { page = 1, pageSize = 20, status = '' } = params;

      let novels = mockNovels.filter(
        (novel) => novel.authorId === parseInt(authorId)
      );

      if (status) {
        novels = novels.filter((novel) => novel.status === status);
      }

      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedNovels = novels.slice(start, end);

      return {
        success: true,
        data: paginatedNovels,
        total: novels.length,
        page,
        pageSize,
      };
    } catch (error) {
      throw new Error('Failed to fetch novels by author');
    }
  },

  // Approve novel (changes status to PUBLISHED)
  approveNovel: async (id) => {
    try {
      const response = await api.post(`/novels/${id}/approve`);

      if (response.data && response.data.code === 200) {
        return {
          success: true,
          data: response.data.data,
          message:
            response.data.message ||
            'Novel approved and published successfully',
        };
      } else {
        throw new Error(response.data?.message || 'Failed to approve novel');
      }
    } catch (error) {
      console.error('Error approving novel:', error);
      throw new Error(error.message || 'Failed to approve novel');
    }
  },

  // Reject novel (changes status to DRAFT)
  rejectNovel: async (id) => {
    try {
      const response = await api.post(`/novels/${id}/reject`);

      if (response.data && response.data.code === 200) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Novel rejected successfully',
        };
      } else {
        throw new Error(response.data?.message || 'Failed to reject novel');
      }
    } catch (error) {
      console.error('Error rejecting novel:', error);
      throw new Error(error.message || 'Failed to reject novel');
    }
  },

  // Hide novel
  hideNovel: async (id) => {
    try {
      const response = await api.post(`/novels/${id}/hide`);

      if (response.data && response.data.code === 200) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Novel hidden successfully',
        };
      } else {
        throw new Error(response.data?.message || 'Failed to hide novel');
      }
    } catch (error) {
      console.error('Error hiding novel:', error);
      throw new Error(error.message || 'Failed to hide novel');
    }
  },

  // Unhide novel
  unhideNovel: async (id) => {
    try {
      const response = await api.post(`/novels/${id}/unhide`);

      if (response.data && response.data.code === 200) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Novel unhidden successfully',
        };
      } else {
        throw new Error(response.data?.message || 'Failed to unhide novel');
      }
    } catch (error) {
      console.error('Error unhiding novel:', error);
      throw new Error(error.message || 'Failed to unhide novel');
    }
  },

  // Archive novel
  archiveNovel: async (id) => {
    try {
      const response = await api.post(`/novels/${id}/archive`);

      if (response.data && response.data.code === 200) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Novel archived successfully',
        };
      } else {
        throw new Error(response.data?.message || 'Failed to archive novel');
      }
    } catch (error) {
      console.error('Error archiving novel:', error);
      throw new Error(error.message || 'Failed to archive novel');
    }
  },
};

export default novelService;
