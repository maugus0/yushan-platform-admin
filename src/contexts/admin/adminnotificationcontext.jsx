import { createContext, useContext, useState, useCallback } from 'react';
import { notification } from 'antd';

const AdminNotificationContext = createContext();

export const useAdminNotification = () => {
  const context = useContext(AdminNotificationContext);
  if (!context) {
    throw new Error(
      'useAdminNotification must be used within an AdminNotificationProvider'
    );
  }
  return context;
};

export const AdminNotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = useCallback((notificationData) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notificationData,
    };

    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);

    // Show Ant Design notification
    notification.open({
      message: notificationData.title,
      description: notificationData.message,
      type: notificationData.type || 'info',
      duration: notificationData.duration || 4.5,
    });
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    setUnreadCount(0);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => {
      const notification = prev.find((n) => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
      return prev.filter((n) => n.id !== id);
    });
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const showSuccess = useCallback(
    (message, description, duration) => {
      addNotification({
        title: message,
        message: description,
        type: 'success',
        duration,
      });
    },
    [addNotification]
  );

  const showError = useCallback(
    (message, description, duration) => {
      addNotification({
        title: message,
        message: description,
        type: 'error',
        duration,
      });
    },
    [addNotification]
  );

  const showWarning = useCallback(
    (message, description, duration) => {
      addNotification({
        title: message,
        message: description,
        type: 'warning',
        duration,
      });
    },
    [addNotification]
  );

  const showInfo = useCallback(
    (message, description, duration) => {
      addNotification({
        title: message,
        message: description,
        type: 'info',
        duration,
      });
    },
    [addNotification]
  );

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <AdminNotificationContext.Provider value={value}>
      {children}
    </AdminNotificationContext.Provider>
  );
};
