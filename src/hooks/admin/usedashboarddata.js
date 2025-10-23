import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing dashboard data
 * Handles data fetching, caching, and real-time updates
 */
export const useDashboardData = (initialConfig = {}) => {
  const [data, setData] = useState({
    stats: {},
    charts: {},
    recentActivity: [],
    notifications: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [config, setConfig] = useState({
    refreshInterval: 30000, // 30 seconds
    enableRealTime: true,
    cacheTimeout: 300000, // 5 minutes
    ...initialConfig,
  });

  // Fetch dashboard data
  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (isLoading && !forceRefresh) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/admin/dashboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': forceRefresh ? 'no-cache' : 'max-age=300',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        setData(result);
        setLastUpdated(new Date());

        return { success: true, data: result };
      } catch (err) {
        const errorMessage = err.message || 'Failed to fetch dashboard data';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  // Refresh data
  const refreshData = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Update specific data section
  const updateDataSection = useCallback((section, newData) => {
    setData((prev) => ({
      ...prev,
      [section]: newData,
    }));
  }, []);

  // Add new activity item
  const addActivity = useCallback((activity) => {
    setData((prev) => ({
      ...prev,
      recentActivity: [activity, ...prev.recentActivity].slice(0, 50), // Keep last 50
    }));
  }, []);

  // Add new notification
  const addNotification = useCallback((notification) => {
    setData((prev) => ({
      ...prev,
      notifications: [notification, ...prev.notifications].slice(0, 20), // Keep last 20
    }));
  }, []);

  // Mark notification as read
  const markNotificationAsRead = useCallback((notificationId) => {
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      ),
    }));
  }, []);

  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(() => {
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    }));
  }, []);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setData((prev) => ({
      ...prev,
      notifications: [],
    }));
  }, []);

  // Get unread notification count
  const getUnreadNotificationCount = useCallback(() => {
    return data.notifications.filter((notification) => !notification.read)
      .length;
  }, [data.notifications]);

  // Update configuration
  const updateConfig = useCallback((newConfig) => {
    setConfig((prev) => ({
      ...prev,
      ...newConfig,
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset data
  const resetData = useCallback(() => {
    setData({
      stats: {},
      charts: {},
      recentActivity: [],
      notifications: [],
    });
    setError(null);
    setLastUpdated(null);
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (!config.enableRealTime || config.refreshInterval <= 0) return;

    const interval = setInterval(() => {
      fetchData();
    }, config.refreshInterval);

    return () => clearInterval(interval);
  }, [config.enableRealTime, config.refreshInterval, fetchData]);

  // Initial data fetch - only if not in test environment
  useEffect(() => {
    if (process.env.NODE_ENV !== 'test') {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // Data
    data,
    stats: data.stats,
    charts: data.charts,
    recentActivity: data.recentActivity,
    notifications: data.notifications,

    // State
    isLoading,
    error,
    lastUpdated,
    config,

    // Actions
    fetchData,
    refreshData,
    updateDataSection,
    addActivity,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    updateConfig,
    clearError,
    resetData,

    // Utilities
    getUnreadNotificationCount,
  };
};

export default useDashboardData;
