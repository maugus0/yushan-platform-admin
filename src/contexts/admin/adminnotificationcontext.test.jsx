import { render, screen, fireEvent, act } from '@testing-library/react';
import { notification } from 'antd';
import {
  AdminNotificationProvider,
  useAdminNotification,
} from './adminnotificationcontext';

// Mock Ant Design notification
jest.mock('antd', () => ({
  notification: {
    open: jest.fn(),
  },
}));

// Test component to consume context
const TestComponent = () => {
  const {
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
  } = useAdminNotification();

  return (
    <div>
      <div data-testid="notifications-count">{notifications.length}</div>
      <div data-testid="unread-count">{unreadCount}</div>
      <div data-testid="notifications-list">
        {notifications.map((notif) => (
          <div key={notif.id} data-testid={`notification-${notif.id}`}>
            {notif.title} - {notif.read ? 'read' : 'unread'}
          </div>
        ))}
      </div>
      <button
        data-testid="add-notification-btn"
        onClick={() =>
          addNotification({
            title: 'Test',
            message: 'Test message',
            type: 'info',
          })
        }
      >
        Add Notification
      </button>
      <button
        data-testid="mark-read-btn"
        onClick={() =>
          notifications.length > 0 && markAsRead(notifications[0].id)
        }
      >
        Mark First as Read
      </button>
      <button data-testid="mark-all-read-btn" onClick={markAllAsRead}>
        Mark All as Read
      </button>
      <button
        data-testid="remove-notification-btn"
        onClick={() =>
          notifications.length > 0 && removeNotification(notifications[0].id)
        }
      >
        Remove First
      </button>
      <button data-testid="clear-all-btn" onClick={clearAllNotifications}>
        Clear All
      </button>
      <button
        data-testid="show-success-btn"
        onClick={() => showSuccess('Success', 'Operation successful')}
      >
        Show Success
      </button>
      <button
        data-testid="show-error-btn"
        onClick={() => showError('Error', 'Operation failed')}
      >
        Show Error
      </button>
      <button
        data-testid="show-warning-btn"
        onClick={() => showWarning('Warning', 'Be careful')}
      >
        Show Warning
      </button>
      <button
        data-testid="show-info-btn"
        onClick={() => showInfo('Info', 'Information')}
      >
        Show Info
      </button>
    </div>
  );
};

describe('AdminNotificationContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Provider rendering', () => {
    test('renders children correctly', () => {
      render(
        <AdminNotificationProvider>
          <div>Test Child</div>
        </AdminNotificationProvider>
      );

      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    test('initializes with empty state', () => {
      render(
        <AdminNotificationProvider>
          <TestComponent />
        </AdminNotificationProvider>
      );

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
      expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
    });
  });

  describe('useAdminNotification hook', () => {
    test('throws error when used outside provider', () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => render(<TestComponent />)).toThrow(
        'useAdminNotification must be used within an AdminNotificationProvider'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('addNotification', () => {
    test('adds notification and increments unread count', () => {
      render(
        <AdminNotificationProvider>
          <TestComponent />
        </AdminNotificationProvider>
      );

      fireEvent.click(screen.getByTestId('add-notification-btn'));

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
      expect(screen.getByTestId('unread-count')).toHaveTextContent('1');
      expect(notification.open).toHaveBeenCalledWith({
        message: 'Test',
        description: 'Test message',
        type: 'info',
        duration: 4.5,
      });
    });

    test('adds notification with custom properties', () => {
      render(
        <AdminNotificationProvider>
          <TestComponent />
        </AdminNotificationProvider>
      );

      // Access the context directly for testing
      let contextValue;
      const ContextConsumer = () => {
        contextValue = useAdminNotification();
        return null;
      };

      render(
        <AdminNotificationProvider>
          <ContextConsumer />
        </AdminNotificationProvider>
      );

      act(() => {
        contextValue.addNotification({
          title: 'Custom',
          message: 'Custom message',
          type: 'success',
          duration: 10,
          customProp: 'value',
        });
      });

      expect(contextValue.notifications).toHaveLength(1);
      expect(contextValue.notifications[0]).toMatchObject({
        title: 'Custom',
        message: 'Custom message',
        type: 'success',
        duration: 10,
        customProp: 'value',
        read: false,
      });
      expect(contextValue.notifications[0]).toHaveProperty('id');
      expect(contextValue.notifications[0]).toHaveProperty('timestamp');
    });
  });

  describe('markAsRead', () => {
    test('marks notification as read and decrements unread count', () => {
      render(
        <AdminNotificationProvider>
          <TestComponent />
        </AdminNotificationProvider>
      );

      // Add a notification first
      fireEvent.click(screen.getByTestId('add-notification-btn'));
      expect(screen.getByTestId('unread-count')).toHaveTextContent('1');

      // Mark it as read
      fireEvent.click(screen.getByTestId('mark-read-btn'));

      expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
    });

    test('does nothing if notification not found', () => {
      render(
        <AdminNotificationProvider>
          <TestComponent />
        </AdminNotificationProvider>
      );

      let contextValue;
      const ContextConsumer = () => {
        contextValue = useAdminNotification();
        return null;
      };

      render(
        <AdminNotificationProvider>
          <ContextConsumer />
        </AdminNotificationProvider>
      );

      act(() => {
        contextValue.markAsRead('nonexistent-id');
      });

      expect(contextValue.unreadCount).toBe(0);
    });
  });

  describe('markAllAsRead', () => {
    test('marks all notifications as read', () => {
      render(
        <AdminNotificationProvider>
          <TestComponent />
        </AdminNotificationProvider>
      );

      let contextValue;
      const ContextConsumer = () => {
        contextValue = useAdminNotification();
        return null;
      };

      render(
        <AdminNotificationProvider>
          <ContextConsumer />
        </AdminNotificationProvider>
      );

      // Add multiple notifications
      act(() => {
        contextValue.addNotification({ title: 'Test 1', message: 'Message 1' });
        contextValue.addNotification({ title: 'Test 2', message: 'Message 2' });
        contextValue.addNotification({ title: 'Test 3', message: 'Message 3' });
      });

      expect(contextValue.unreadCount).toBe(3);

      act(() => {
        contextValue.markAllAsRead();
      });

      expect(contextValue.unreadCount).toBe(0);
      expect(contextValue.notifications.every((n) => n.read)).toBe(true);
    });
  });

  describe('removeNotification', () => {
    test('removes notification and decrements unread count if unread', () => {
      render(
        <AdminNotificationProvider>
          <TestComponent />
        </AdminNotificationProvider>
      );

      let contextValue;
      const ContextConsumer = () => {
        contextValue = useAdminNotification();
        return null;
      };

      render(
        <AdminNotificationProvider>
          <ContextConsumer />
        </AdminNotificationProvider>
      );

      // Add notification
      act(() => {
        contextValue.addNotification({ title: 'Test', message: 'Message' });
      });

      expect(contextValue.notifications).toHaveLength(1);
      expect(contextValue.unreadCount).toBe(1);

      // Remove it
      act(() => {
        contextValue.removeNotification(contextValue.notifications[0].id);
      });

      expect(contextValue.notifications).toHaveLength(0);
      expect(contextValue.unreadCount).toBe(0);
    });

    test('removes read notification without affecting unread count', () => {
      render(
        <AdminNotificationProvider>
          <TestComponent />
        </AdminNotificationProvider>
      );

      let contextValue;
      const ContextConsumer = () => {
        contextValue = useAdminNotification();
        return null;
      };

      render(
        <AdminNotificationProvider>
          <ContextConsumer />
        </AdminNotificationProvider>
      );

      // Add notification and mark as read
      act(() => {
        contextValue.addNotification({ title: 'Test', message: 'Message' });
      });

      expect(contextValue.notifications).toHaveLength(1);
      expect(contextValue.unreadCount).toBe(1);

      const notificationId = contextValue.notifications[0].id;

      act(() => {
        contextValue.markAsRead(notificationId);
      });

      expect(contextValue.unreadCount).toBe(0);

      // Remove it
      act(() => {
        contextValue.removeNotification(notificationId);
      });

      expect(contextValue.notifications).toHaveLength(0);
      expect(contextValue.unreadCount).toBe(0);
    });
  });

  describe('clearAllNotifications', () => {
    test('removes all notifications and resets unread count', () => {
      render(
        <AdminNotificationProvider>
          <TestComponent />
        </AdminNotificationProvider>
      );

      let contextValue;
      const ContextConsumer = () => {
        contextValue = useAdminNotification();
        return null;
      };

      render(
        <AdminNotificationProvider>
          <ContextConsumer />
        </AdminNotificationProvider>
      );

      // Add multiple notifications
      act(() => {
        contextValue.addNotification({ title: 'Test 1', message: 'Message 1' });
        contextValue.addNotification({ title: 'Test 2', message: 'Message 2' });
      });

      expect(contextValue.notifications).toHaveLength(2);
      expect(contextValue.unreadCount).toBe(2);

      act(() => {
        contextValue.clearAllNotifications();
      });

      expect(contextValue.notifications).toHaveLength(0);
      expect(contextValue.unreadCount).toBe(0);
    });
  });

  describe('Convenience methods', () => {
    let contextValue;

    beforeEach(() => {
      const ContextConsumer = () => {
        contextValue = useAdminNotification();
        return null;
      };

      render(
        <AdminNotificationProvider>
          <ContextConsumer />
        </AdminNotificationProvider>
      );
    });

    test('showSuccess calls addNotification with success type', () => {
      act(() => {
        contextValue.showSuccess('Success', 'Operation successful', 5);
      });

      expect(notification.open).toHaveBeenCalledWith({
        message: 'Success',
        description: 'Operation successful',
        type: 'success',
        duration: 5,
      });
    });

    test('showError calls addNotification with error type', () => {
      act(() => {
        contextValue.showError('Error', 'Operation failed');
      });

      expect(notification.open).toHaveBeenCalledWith({
        message: 'Error',
        description: 'Operation failed',
        type: 'error',
        duration: 4.5,
      });
    });

    test('showWarning calls addNotification with warning type', () => {
      act(() => {
        contextValue.showWarning('Warning', 'Be careful');
      });

      expect(notification.open).toHaveBeenCalledWith({
        message: 'Warning',
        description: 'Be careful',
        type: 'warning',
        duration: 4.5,
      });
    });

    test('showInfo calls addNotification with info type', () => {
      act(() => {
        contextValue.showInfo('Info', 'Information');
      });

      expect(notification.open).toHaveBeenCalledWith({
        message: 'Info',
        description: 'Information',
        type: 'info',
        duration: 4.5,
      });
    });
  });

  describe('Context value', () => {
    test('provides all required values and functions', () => {
      let contextValue;
      const ContextConsumer = () => {
        contextValue = useAdminNotification();
        return null;
      };

      render(
        <AdminNotificationProvider>
          <ContextConsumer />
        </AdminNotificationProvider>
      );

      expect(contextValue).toHaveProperty('notifications');
      expect(contextValue).toHaveProperty('unreadCount');
      expect(contextValue).toHaveProperty('addNotification');
      expect(contextValue).toHaveProperty('markAsRead');
      expect(contextValue).toHaveProperty('markAllAsRead');
      expect(contextValue).toHaveProperty('removeNotification');
      expect(contextValue).toHaveProperty('clearAllNotifications');
      expect(contextValue).toHaveProperty('showSuccess');
      expect(contextValue).toHaveProperty('showError');
      expect(contextValue).toHaveProperty('showWarning');
      expect(contextValue).toHaveProperty('showInfo');

      // Check types
      expect(Array.isArray(contextValue.notifications)).toBe(true);
      expect(typeof contextValue.unreadCount).toBe('number');
      expect(typeof contextValue.addNotification).toBe('function');
      expect(typeof contextValue.markAsRead).toBe('function');
      expect(typeof contextValue.markAllAsRead).toBe('function');
      expect(typeof contextValue.removeNotification).toBe('function');
      expect(typeof contextValue.clearAllNotifications).toBe('function');
      expect(typeof contextValue.showSuccess).toBe('function');
      expect(typeof contextValue.showError).toBe('function');
      expect(typeof contextValue.showWarning).toBe('function');
      expect(typeof contextValue.showInfo).toBe('function');
    });
  });
});
