// Helper to get auth token (customize as needed)
const getAuthToken = () => {
  // You may want to get this from localStorage, context, or pass as param
  return localStorage.getItem('accessToken');
};

// Get API base URL from environment or use default
const getApiBaseUrl = () => {
  return (
    process.env.REACT_APP_API_BASE_URL || 'https://yushan.duckdns.org/api/v1'
  );
};

export const chapterService = {
  // Get chapters by novel ID (real API)
  getChaptersByNovel: async (novelId, params = {}) => {
    try {
      const token = getAuthToken();
      const { page = 1, pageSize = 20, publishedOnly = true } = params;

      const url = `${getApiBaseUrl()}/chapters/novel/${novelId}?page=${page}&pageSize=${pageSize}&publishedOnly=${publishedOnly}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (result.code !== 200)
        throw new Error(result.message || 'Failed to fetch chapters');

      // Map BE response to FE format
      // Handle both old and new response structures
      const content = result.data.content || result.data.chapters || [];
      const chapters = content.map((ch) => ({
        id: ch.id || ch.chapterId,
        uuid: ch.uuid,
        chapterNumber: ch.chapterNumber,
        title: ch.title,
        contentPreview: ch.preview || ch.contentPreview,
        wordCount: ch.wordCnt,
        isPremium: ch.isPremium,
        yuanCost: ch.yuanCost,
        views: ch.viewCnt,
        publishedAt: ch.publishTime,
        isValid: ch.isValid,
        createTime: ch.createTime,
        updateTime: ch.updateTime,
      }));

      return {
        success: true,
        data: chapters,
        total:
          result.data.totalElements ||
          result.data.totalCount ||
          chapters.length,
        page: result.data.currentPage || page,
        pageSize: result.data.size || result.data.pageSize || pageSize,
        totalPages:
          result.data.totalPages || Math.ceil(chapters.length / pageSize),
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch chapters by novel');
    }
  },

  // Delete chapter by UUID (real API)
  deleteChapter: async (uuid) => {
    try {
      const token = getAuthToken();
      const url = `${getApiBaseUrl()}/chapters/admin/${uuid}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (result.code !== 200)
        throw new Error(result.message || 'Failed to delete chapter');
      return {
        success: true,
        data: null,
        message: result.message,
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to delete chapter');
    }
  },

  // Delete all chapters by novel ID (admin API)
  deleteChaptersByNovel: async (novelId) => {
    try {
      const token = getAuthToken();
      const url = `${getApiBaseUrl()}/chapters/admin/novel/${novelId}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (result.code !== 200)
        throw new Error(
          result.message || 'Failed to delete chapters for novel'
        );
      return {
        success: true,
        data: null,
        message: result.message,
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to delete chapters for novel');
    }
  },

  // ...other methods to be implemented with real API as needed
};

export default chapterService;
