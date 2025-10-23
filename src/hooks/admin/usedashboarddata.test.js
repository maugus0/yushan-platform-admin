import { renderHook, act, waitFor } from '@testing-library/react';
import { useDashboardData } from './usedashboarddata';

// Mock fetch globally
const mockFetch = jest.fn();
Object.defineProperty(window, 'fetch', {
  writable: true,
  value: mockFetch,
});

describe('useDashboardData Hook', () => {
  const mockDashboardData = {
    stats: {
      totalUsers: 1500,
      totalNovels: 300,
      totalRevenue: 25000,
      activeUsers: 1200,
    },
    charts: {
      userGrowth: [{ month: 'Jan', users: 100 }],
      revenueChart: [{ month: 'Jan', revenue: 5000 }],
    },
    recentActivity: [
      {
        id: 1,
        type: 'user_signup',
        message: 'New user registered',
        timestamp: new Date(),
      },
    ],
    notifications: [
      {
        id: 1,
        type: 'warning',
        message: 'System maintenance scheduled',
        read: false,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
  });

  describe('Initial State', () => {
    test('initializes with correct default values', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDashboardData),
      });

      const { result } = renderHook(() =>
        useDashboardData({ enableRealTime: false })
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(result.current.error).toBe(null);
    });

    test('initializes with custom config', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDashboardData),
      });

      const customConfig = {
        refreshInterval: 60000,
        enableRealTime: false,
        cacheTimeout: 600000,
      };

      const { result } = renderHook(() => useDashboardData(customConfig));

      await waitFor(() => {
        expect(result.current.config).toEqual({
          refreshInterval: 60000,
          enableRealTime: false,
          cacheTimeout: 600000,
        });
      });
    });
  });

  describe('Data Fetching', () => {
    test('successfully fetches dashboard data', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDashboardData),
      });

      const { result } = renderHook(() =>
        useDashboardData({ enableRealTime: false })
      );

      let fetchResult;
      await act(async () => {
        fetchResult = await result.current.fetchData();
      });

      expect(fetchResult.success).toBe(true);
      expect(fetchResult.data).toEqual(mockDashboardData);
    });

    test('handles fetch error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() =>
        useDashboardData({ enableRealTime: false })
      );

      let fetchResult;
      await act(async () => {
        fetchResult = await result.current.fetchData();
      });

      expect(fetchResult.success).toBe(false);
      expect(fetchResult.error).toBe('Network error');
    });

    test('handles HTTP error response', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() =>
        useDashboardData({ enableRealTime: false })
      );

      let fetchResult;
      await act(async () => {
        fetchResult = await result.current.fetchData();
      });

      expect(fetchResult.success).toBe(false);
      expect(fetchResult.error).toBe('HTTP error! status: 500');
    });

    test('refreshData forces refresh', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDashboardData),
      });

      const { result } = renderHook(() =>
        useDashboardData({ enableRealTime: false })
      );

      let refreshResult;
      await act(async () => {
        refreshResult = await result.current.refreshData();
      });

      expect(refreshResult.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith('/api/admin/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });
    });
  });

  describe('Data Updates', () => {
    test('updateDataSection updates specific section', () => {
      const { result } = renderHook(() =>
        useDashboardData({ enableRealTime: false })
      );

      act(() => {
        result.current.updateDataSection('stats', { totalUsers: 2000 });
      });

      expect(result.current.stats).toEqual({ totalUsers: 2000 });
    });

    test('addActivity adds new activity item', () => {
      const { result } = renderHook(() =>
        useDashboardData({ enableRealTime: false })
      );

      const newActivity = {
        id: 2,
        type: 'novel_published',
        message: 'New novel published',
        timestamp: new Date(),
      };

      act(() => {
        result.current.addActivity(newActivity);
      });

      expect(result.current.recentActivity).toContain(newActivity);
    });

    test('addActivity limits to 50 items', () => {
      const { result } = renderHook(() =>
        useDashboardData({ enableRealTime: false })
      );

      // Add 51 activities
      act(() => {
        for (let i = 0; i < 51; i++) {
          result.current.addActivity({
            id: i,
            type: 'test',
            message: `Activity ${i}`,
            timestamp: new Date(),
          });
        }
      });

      expect(result.current.recentActivity).toHaveLength(50);
    });

    test('addNotification adds new notification', () => {
      const { result } = renderHook(() =>
        useDashboardData({ enableRealTime: false })
      );

      const newNotification = {
        id: 2,
        type: 'info',
        message: 'System update available',
        read: false,
      };

      act(() => {
        result.current.addNotification(newNotification);
      });

      expect(result.current.notifications).toContain(newNotification);
    });

    test('addNotification limits to 20 items', () => {
      const { result } = renderHook(() =>
        useDashboardData({ enableRealTime: false })
      );

      // Add 21 notifications
      act(() => {
        for (let i = 0; i < 21; i++) {
          result.current.addNotification({
            id: i,
            type: 'test',
            message: `Notification ${i}`,
            read: false,
          });
        }
      });

      expect(result.current.notifications).toHaveLength(20);
    });
  });

  describe('Notification Management', () => {
    beforeEach(() => {
      const { result } = renderHook(() =>
        useDashboardData({ enableRealTime: false })
      );

      act(() => {
        result.current.addNotification({
          id: 1,
          type: 'warning',
          message: 'Test notification 1',
          read: false,
        });
        result.current.addNotification({
          id: 2,
          type: 'info',
          message: 'Test notification 2',
          read: false,
        });
        result.current.addNotification({
          id: 3,
          type: 'error',
          message: 'Test notification 3',
          read: true,
        });
      });
    });

    test('markNotificationAsRead marks specific notification as read', () => {
      const { result } = renderHook(() =>
        useDashboardData({ enableRealTime: false })
      );

      act(() => {
        result.current.addNotification({
          id: 1,
          type: 'warning',
          message: 'Test notification',
          read: false,
        });
        result.current.markNotificationAsRead(1);
      });

      const notification = result.current.notifications.find((n) => n.id === 1);
      expect(notification.read).toBe(true);
    });

    test('markAllNotificationsAsRead marks all notifications as read', () => {
      const { result } = renderHook(() =>
        useDashboardData({ enableRealTime: false })
      );

      act(() => {
        result.current.addNotification({
          id: 1,
          type: 'warning',
          message: 'Test notification 1',
          read: false,
        });
        result.current.addNotification({
          id: 2,
          type: 'info',
          message: 'Test notification 2',
          read: false,
        });
        result.current.markAllNotificationsAsRead();
      });

      result.current.notifications.forEach((notification) => {
        expect(notification.read).toBe(true);
      });
    });

    test('clearNotifications removes all notifications', () => {
      const { result } = renderHook(() =>
        useDashboardData({ enableRealTime: false })
      );

      act(() => {
        result.current.addNotification({
          id: 1,
          type: 'warning',
          message: 'Test notification',
          read: false,
        });
        result.current.clearNotifications();
      });

      expect(result.current.notifications).toHaveLength(0);
    });

    test('getUnreadNotificationCount returns correct count', () => {
      const { result } = renderHook(() =>
        useDashboardData({ enableRealTime: false })
      );

      act(() => {
        result.current.addNotification({
          id: 1,
          type: 'warning',
          message: 'Test notification 1',
          read: false,
        });
        result.current.addNotification({
          id: 2,
          type: 'info',
          message: 'Test notification 2',
          read: true,
        });
        result.current.addNotification({
          id: 3,
          type: 'error',
          message: 'Test notification 3',
          read: false,
        });
      });

      expect(result.current.getUnreadNotificationCount()).toBe(2);
    });
  });

  describe('Configuration Management', () => {
    test('updateConfig updates configuration', () => {
      const { result } = renderHook(() =>
        useDashboardData({ enableRealTime: false })
      );

      act(() => {
        result.current.updateConfig({
          refreshInterval: 60000,
          enableRealTime: false,
        });
      });

      expect(result.current.config.refreshInterval).toBe(60000);
      expect(result.current.config.enableRealTime).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    test('clearError clears error state', async () => {
      fetch.mockRejectedValueOnce(new Error('Test error'));

      const { result } = renderHook(() =>
        useDashboardData({ enableRealTime: false })
      );

      await act(async () => {
        await result.current.fetchData();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Test error');
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });

    test('resetData resets all data', () => {
      const { result } = renderHook(() =>
        useDashboardData({ enableRealTime: false })
      );

      act(() => {
        result.current.updateDataSection('stats', { totalUsers: 1000 });
        result.current.addActivity({ id: 1, type: 'test', message: 'test' });
        result.current.addNotification({
          id: 1,
          type: 'test',
          message: 'test',
        });
        result.current.resetData();
      });

      expect(result.current.data).toEqual({
        stats: {},
        charts: {},
        recentActivity: [],
        notifications: [],
      });
      expect(result.current.error).toBe(null);
      expect(result.current.lastUpdated).toBe(null);
    });
  });

  describe('Auto-refresh', () => {
    test('auto-refresh configuration is set correctly', () => {
      const { result } = renderHook(() =>
        useDashboardData({
          enableRealTime: true,
          refreshInterval: 1000,
        })
      );

      expect(result.current.config.enableRealTime).toBe(true);
      expect(result.current.config.refreshInterval).toBe(1000);
    });
  });

  describe('Loading State', () => {
    test('isLoading is true during fetch', async () => {
      fetch.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() =>
        useDashboardData({ enableRealTime: false })
      );

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.fetchData();
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      expect(result.current.isLoading).toBe(false);
    });
  });
});
