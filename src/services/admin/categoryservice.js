import api from './api';
import { logApiError } from '../../utils/admin/errorReporting';

// Mock categories data
const generateMockCategories = () => {
  return [
    {
      id: 1,
      name: 'Fantasy',
      slug: 'fantasy',
      description: 'Epic tales of magic, dragons, and mythical creatures',
      parentId: null,
      level: 0,
      order: 1,
      isActive: true,
      novelCount: 856,
      icon: 'crown',
      color: '#722ed1',
      seoTitle: 'Fantasy Novels - Yushan',
      seoDescription:
        'Discover amazing fantasy novels with magic, adventure, and mythical creatures.',
      createdAt: '2023-01-15T00:00:00.000Z',
      updatedAt: '2024-10-01T00:00:00.000Z',
      children: [
        {
          id: 11,
          name: 'Epic Fantasy',
          slug: 'epic-fantasy',
          description: 'Grand adventures in vast fantasy worlds',
          parentId: 1,
          level: 1,
          order: 1,
          isActive: true,
          novelCount: 234,
          createdAt: '2023-02-01T00:00:00.000Z',
          updatedAt: '2024-09-15T00:00:00.000Z',
        },
        {
          id: 12,
          name: 'Urban Fantasy',
          slug: 'urban-fantasy',
          description: 'Magic in modern city settings',
          parentId: 1,
          level: 1,
          order: 2,
          isActive: true,
          novelCount: 187,
          createdAt: '2023-02-01T00:00:00.000Z',
          updatedAt: '2024-09-20T00:00:00.000Z',
        },
        {
          id: 13,
          name: 'Dark Fantasy',
          slug: 'dark-fantasy',
          description: 'Fantasy with horror and dark themes',
          parentId: 1,
          level: 1,
          order: 3,
          isActive: true,
          novelCount: 145,
          createdAt: '2023-02-01T00:00:00.000Z',
          updatedAt: '2024-09-10T00:00:00.000Z',
        },
      ],
    },
    {
      id: 2,
      name: 'Romance',
      slug: 'romance',
      description: 'Love stories that touch the heart',
      parentId: null,
      level: 0,
      order: 2,
      isActive: true,
      novelCount: 623,
      icon: 'heart',
      color: '#eb2f96',
      seoTitle: 'Romance Novels - Yushan',
      seoDescription: 'Read heartwarming romance novels and love stories.',
      createdAt: '2023-01-15T00:00:00.000Z',
      updatedAt: '2024-10-01T00:00:00.000Z',
      children: [
        {
          id: 21,
          name: 'Contemporary Romance',
          slug: 'contemporary-romance',
          description: 'Modern day love stories',
          parentId: 2,
          level: 1,
          order: 1,
          isActive: true,
          novelCount: 198,
          createdAt: '2023-02-01T00:00:00.000Z',
          updatedAt: '2024-09-25T00:00:00.000Z',
        },
        {
          id: 22,
          name: 'Historical Romance',
          slug: 'historical-romance',
          description: 'Romance set in historical periods',
          parentId: 2,
          level: 1,
          order: 2,
          isActive: true,
          novelCount: 176,
          createdAt: '2023-02-01T00:00:00.000Z',
          updatedAt: '2024-09-18T00:00:00.000Z',
        },
        {
          id: 23,
          name: 'Paranormal Romance',
          slug: 'paranormal-romance',
          description: 'Romance with supernatural elements',
          parentId: 2,
          level: 1,
          order: 3,
          isActive: true,
          novelCount: 134,
          createdAt: '2023-02-01T00:00:00.000Z',
          updatedAt: '2024-09-12T00:00:00.000Z',
        },
      ],
    },
    {
      id: 3,
      name: 'Action',
      slug: 'action',
      description: 'Fast-paced adventures and thrilling battles',
      parentId: null,
      level: 0,
      order: 3,
      isActive: true,
      novelCount: 445,
      icon: 'fire',
      color: '#fa541c',
      seoTitle: 'Action Novels - Yushan',
      seoDescription: 'Experience thrilling action and adventure novels.',
      createdAt: '2023-01-15T00:00:00.000Z',
      updatedAt: '2024-10-01T00:00:00.000Z',
      children: [
        {
          id: 31,
          name: 'Military Action',
          slug: 'military-action',
          description: 'Military combat and warfare stories',
          parentId: 3,
          level: 1,
          order: 1,
          isActive: true,
          novelCount: 123,
          createdAt: '2023-02-01T00:00:00.000Z',
          updatedAt: '2024-09-08T00:00:00.000Z',
        },
        {
          id: 32,
          name: 'Martial Arts',
          slug: 'martial-arts',
          description: 'Stories focused on martial arts mastery',
          parentId: 3,
          level: 1,
          order: 2,
          isActive: true,
          novelCount: 167,
          createdAt: '2023-02-01T00:00:00.000Z',
          updatedAt: '2024-09-22T00:00:00.000Z',
        },
      ],
    },
    {
      id: 4,
      name: 'Sci-Fi',
      slug: 'sci-fi',
      description: 'Science fiction and futuristic adventures',
      parentId: null,
      level: 0,
      order: 4,
      isActive: true,
      novelCount: 234,
      icon: 'rocket',
      color: '#1890ff',
      seoTitle: 'Science Fiction Novels - Yushan',
      seoDescription: 'Explore futuristic worlds and advanced technology.',
      createdAt: '2023-01-15T00:00:00.000Z',
      updatedAt: '2024-10-01T00:00:00.000Z',
      children: [
        {
          id: 41,
          name: 'Space Opera',
          slug: 'space-opera',
          description: 'Epic space adventures',
          parentId: 4,
          level: 1,
          order: 1,
          isActive: true,
          novelCount: 87,
          createdAt: '2023-02-01T00:00:00.000Z',
          updatedAt: '2024-09-14T00:00:00.000Z',
        },
        {
          id: 42,
          name: 'Cyberpunk',
          slug: 'cyberpunk',
          description: 'High-tech, low-life futures',
          parentId: 4,
          level: 1,
          order: 2,
          isActive: true,
          novelCount: 56,
          createdAt: '2023-02-01T00:00:00.000Z',
          updatedAt: '2024-09-05T00:00:00.000Z',
        },
      ],
    },
    {
      id: 5,
      name: 'Mystery',
      slug: 'mystery',
      description: 'Puzzles, detectives, and suspenseful investigations',
      parentId: null,
      level: 0,
      order: 5,
      isActive: true,
      novelCount: 183,
      icon: 'search',
      color: '#52c41a',
      seoTitle: 'Mystery Novels - Yushan',
      seoDescription: 'Solve mysteries and follow detective stories.',
      createdAt: '2023-01-15T00:00:00.000Z',
      updatedAt: '2024-10-01T00:00:00.000Z',
      children: [
        {
          id: 51,
          name: 'Detective Fiction',
          slug: 'detective-fiction',
          description: 'Classic detective stories',
          parentId: 5,
          level: 1,
          order: 1,
          isActive: true,
          novelCount: 89,
          createdAt: '2023-02-01T00:00:00.000Z',
          updatedAt: '2024-09-11T00:00:00.000Z',
        },
        {
          id: 52,
          name: 'Psychological Thriller',
          slug: 'psychological-thriller',
          description: 'Mind-bending psychological mysteries',
          parentId: 5,
          level: 1,
          order: 2,
          isActive: true,
          novelCount: 67,
          createdAt: '2023-02-01T00:00:00.000Z',
          updatedAt: '2024-09-07T00:00:00.000Z',
        },
      ],
    },
    {
      id: 6,
      name: 'Horror',
      slug: 'horror',
      description: 'Scary stories and supernatural terror',
      parentId: null,
      level: 0,
      order: 6,
      isActive: true,
      novelCount: 97,
      icon: 'ghost',
      color: '#f5222d',
      seoTitle: 'Horror Novels - Yushan',
      seoDescription: 'Experience spine-chilling horror stories.',
      createdAt: '2023-01-15T00:00:00.000Z',
      updatedAt: '2024-10-01T00:00:00.000Z',
      children: [],
    },
    {
      id: 7,
      name: 'Drama',
      slug: 'drama',
      description: 'Emotional and character-driven stories',
      parentId: null,
      level: 0,
      order: 7,
      isActive: false,
      novelCount: 45,
      icon: 'mask',
      color: '#faad14',
      seoTitle: 'Drama Novels - Yushan',
      seoDescription: 'Read emotional drama and character stories.',
      createdAt: '2023-01-15T00:00:00.000Z',
      updatedAt: '2024-10-01T00:00:00.000Z',
      children: [],
    },
  ];
};

// Keep mock data generator for reference/fallback if needed
const mockCategories = generateMockCategories();

// Real API-based category service
export const categoryService = {
  // Get all categories
  getAllCategories: async (params = {}) => {
    try {
      const { includeInactive = true } = params;

      // Use active endpoint if we don't want inactive categories
      const endpoint = includeInactive ? '/categories' : '/categories/active';
      const response = await api.get(endpoint);

      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.data.categories,
          total: response.data.data.totalCount,
          message: response.data.message,
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch categories');
      }
    } catch (error) {
      logApiError(error, '/categories', params);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch categories'
      );
    }
  },

  // Get category by ID
  getCategoryById: async (id) => {
    try {
      const response = await api.get(`/categories/${id}`);

      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch category');
      }
    } catch (error) {
      logApiError(error, `/categories/${id}`, { categoryId: id });
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch category'
      );
    }
  },

  // Create new category
  createCategory: async (categoryData) => {
    try {
      const response = await api.post('/categories', categoryData);

      if (response.data.code === 200 || response.data.code === 201) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      } else {
        throw new Error(response.data.message || 'Failed to create category');
      }
    } catch (error) {
      logApiError(error, '/categories', { requestData: categoryData });
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to create category'
      );
    }
  },

  // Update category
  updateCategory: async (id, updateData) => {
    try {
      const response = await api.put(`/categories/${id}`, updateData);

      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      } else {
        throw new Error(response.data.message || 'Failed to update category');
      }
    } catch (error) {
      logApiError(error, `/categories/${id}`, {
        categoryId: id,
        requestData: updateData,
      });
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to update category'
      );
    }
  },

  // Delete category (soft delete)
  deleteCategory: async (id, hard = false) => {
    try {
      const endpoint = hard ? `/categories/${id}/hard` : `/categories/${id}`;
      const response = await api.delete(endpoint);

      if (response.data.code === 200) {
        return {
          success: true,
          message: response.data.message,
        };
      } else {
        throw new Error(response.data.message || 'Failed to delete category');
      }
    } catch (error) {
      logApiError(error, `/categories/${id}${hard ? '/hard' : ''}`, {
        categoryId: id,
        hardDelete: hard,
      });
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to delete category'
      );
    }
  },

  // Get active categories
  getActiveCategories: async () => {
    try {
      const response = await api.get('/categories/active');

      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.data.categories,
          total: response.data.data.totalCount,
          message: response.data.message,
        };
      } else {
        throw new Error(
          response.data.message || 'Failed to fetch active categories'
        );
      }
    } catch (error) {
      logApiError(error, '/categories/active', {});
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch active categories'
      );
    }
  },

  // Get category by slug
  getCategoryBySlug: async (slug) => {
    try {
      const response = await api.get(`/categories/slug/${slug}`);

      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      } else {
        throw new Error(
          response.data.message || 'Failed to fetch category by slug'
        );
      }
    } catch (error) {
      logApiError(error, `/categories/slug/${slug}`, { slug });
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch category by slug'
      );
    }
  },

  // Toggle category status
  toggleCategoryStatus: async (id, isActive) => {
    try {
      const response = await api.put(`/categories/${id}`, { isActive });

      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      } else {
        throw new Error(
          response.data.message || 'Failed to toggle category status'
        );
      }
    } catch (error) {
      logApiError(error, `/categories/${id}`, {
        categoryId: id,
        isActive,
      });
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to toggle category status'
      );
    }
  },

  // Get novel count for a category
  getCategoryNovelCount: async (categoryId) => {
    try {
      // Fetch novels filtered by category with minimal data (just need totalElements)
      const response = await api.get('/novels', {
        params: {
          page: 0,
          size: 1, // Minimal size since we only need the count
          category: categoryId,
          status: 'published', // Only count published novels
        },
      });

      if (response.data.code === 200) {
        return {
          success: true,
          count: response.data.data.totalElements || 0,
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch novel count');
      }
    } catch (error) {
      logApiError(error, `/novels?category=${categoryId}`, {
        categoryId,
      });
      // Return 0 if there's an error instead of throwing
      return {
        success: false,
        count: 0,
      };
    }
  },

  // Get novel counts for multiple categories (batch request)
  getCategoryNovelCounts: async (categoryIds) => {
    try {
      // Fetch counts for all categories in parallel
      const countPromises = categoryIds.map((id) =>
        categoryService.getCategoryNovelCount(id)
      );

      const results = await Promise.all(countPromises);

      // Create a map of categoryId -> count
      const countsMap = {};
      categoryIds.forEach((id, index) => {
        countsMap[id] = results[index].count;
      });

      return {
        success: true,
        counts: countsMap,
      };
    } catch (error) {
      logApiError(error, '/novels (batch counts)', {
        categoryIds,
      });
      // Return empty counts map if there's an error
      return {
        success: false,
        counts: {},
      };
    }
  },
};

export default categoryService;

// Legacy methods below - kept for reference but not connected to real API
// Remove these if not needed
// eslint-disable-next-line no-unused-vars
const legacyMethods = {
  // Reorder categories (not implemented in API)
  reorderCategories: async (reorderData) => {
    try {
      await api.delay(400);

      const { parentId, categoryIds } = reorderData;

      if (parentId) {
        // Reorder children of a specific parent
        const findAndReorderChildren = (
          categories,
          targetParentId,
          newOrder
        ) => {
          for (const category of categories) {
            if (category.id === targetParentId && category.children) {
              const reorderedChildren = newOrder
                .map((id) => category.children.find((child) => child.id === id))
                .filter(Boolean);

              category.children = reorderedChildren.map((child, index) => ({
                ...child,
                order: index + 1,
                updatedAt: new Date().toISOString(),
              }));

              return true;
            }
            if (
              category.children &&
              findAndReorderChildren(
                category.children,
                targetParentId,
                newOrder
              )
            ) {
              return true;
            }
          }
          return false;
        };

        findAndReorderChildren(mockCategories, parentId, categoryIds);
      } else {
        // Reorder top-level categories
        const reorderedCategories = categoryIds
          .map((id) => mockCategories.find((cat) => cat.id === id))
          .filter(Boolean);

        mockCategories.length = 0;
        mockCategories.push(
          ...reorderedCategories.map((cat, index) => ({
            ...cat,
            order: index + 1,
            updatedAt: new Date().toISOString(),
          }))
        );
      }

      return {
        success: true,
        message: 'Categories reordered successfully',
      };
    } catch (error) {
      throw new Error('Failed to reorder categories');
    }
  },
};
