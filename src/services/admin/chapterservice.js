// Helper to get auth token (customize as needed)
const getAuthToken = () => {
  // You may want to get this from localStorage, context, or pass as param
  return localStorage.getItem('accessToken');
};

export const chapterService = {
  // Get chapters by novel ID (real API)
  getChaptersByNovel: async (novelId, params = {}) => {
    try {
      const token = getAuthToken();
      const { page = 1, pageSize = 20, publishedOnly = true } = params;

      const url = `https://yushan-backend-staging.up.railway.app/api/chapters/novel/${novelId}?page=${page}&pageSize=${pageSize}&publishedOnly=${publishedOnly}`;
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
      const chapters = (result.data.chapters || []).map((ch) => ({
        id: ch.chapterId,
        uuid: ch.uuid,
        chapterNumber: ch.chapterNumber,
        title: ch.title,
        contentPreview: ch.contentPreview,
        wordCount: ch.wordCnt,
        isPremium: ch.isPremium,
        yuanCost: ch.yuanCost,
        views: ch.viewCnt,
        publishedAt: ch.publishTime,
      }));

      return {
        success: true,
        data: chapters,
        total: result.data.totalCount,
        page: result.data.currentPage,
        pageSize: result.data.pageSize,
        totalPages: result.data.totalPages,
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch chapters by novel');
    }
  },

  // Delete chapter by UUID (real API)
  deleteChapter: async (uuid) => {
    try {
      const token = getAuthToken();
      const url = `https://yushan-backend-staging.up.railway.app/api/chapters/admin/${uuid}`;
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
      const url = `https://yushan-backend-staging.up.railway.app/api/chapters/admin/novel/${novelId}`;
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
