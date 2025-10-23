import { useState } from 'react';
import {
  Layout,
  Button,
  Dropdown,
  Avatar,
  Space,
  Typography,
  Tooltip,
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  SearchOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons';
import { useAdminAuth } from '../../../contexts/admin/adminauthcontext';

const { Header } = Layout;
const { Text } = Typography;

const AdminHeader = ({
  collapsed = false,
  onToggleCollapsed,
  showSearch = false,
  showNotifications = true,
  showFullscreen = false,
  showUserMenu = true,
  notifications = [],
  onSearch,
  onNotificationClick,
  onUserMenuClick,
  style = {},
  className = '',
  extra,
  isMobile = false,
  _unreadCount,
  ...props
}) => {
  const { admin, logout } = useAdminAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleLogout = () => {
    logout();
    if (onUserMenuClick) {
      onUserMenuClick('logout');
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => onUserMenuClick && onUserMenuClick('profile'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  const notificationMenuItems = notifications
    .slice(0, 5)
    .map((notification, index) => ({
      key: `notification-${index}`,
      label: (
        <div style={{ maxWidth: 250 }}>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            {notification.title}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {notification.description}
          </div>
          <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
            {notification.time}
          </div>
        </div>
      ),
      onClick: () => onNotificationClick && onNotificationClick(notification),
    }));

  if (notifications.length > 5) {
    notificationMenuItems.push(
      {
        type: 'divider',
      },
      {
        key: 'view-all',
        label: 'View All Notifications',
        onClick: () => onNotificationClick && onNotificationClick('view-all'),
      }
    );
  }

  return (
    <Header
      style={{
        padding: '0 24px',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...style,
      }}
      className={className}
      {...props}
    >
      {/* Left Section */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleCollapsed}
          style={{
            fontSize: '16px',
            width: 64,
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />

        {showSearch && (
          <div style={{ marginLeft: 16 }}>
            <Button
              type="text"
              icon={<SearchOutlined />}
              onClick={onSearch}
              style={{ fontSize: '16px' }}
            >
              Search
            </Button>
          </div>
        )}
      </div>

      {/* Right Section */}
      <Space size="middle" style={{ alignItems: 'center' }}>
        {extra}

        {showFullscreen && (
          <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
            <Button
              type="text"
              icon={
                isFullscreen ? (
                  <FullscreenExitOutlined />
                ) : (
                  <FullscreenOutlined />
                )
              }
              onClick={handleFullscreen}
              style={{ fontSize: '16px' }}
            />
          </Tooltip>
        )}

        {showNotifications && (
          <Dropdown
            menu={{ items: notificationMenuItems }}
            placement="bottomRight"
            arrow
            trigger={['click']}
          >
            <Button
              type="text"
              icon={<BellOutlined />}
              style={{ fontSize: '16px' }}
            />
          </Dropdown>
        )}

        {showUserMenu && admin && (
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
            trigger={['click']}
          >
            <Space
              style={{
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '6px',
              }}
            >
              <Avatar
                size="small"
                src={admin.avatar}
                icon={!admin.avatar && <UserOutlined />}
                style={{ backgroundColor: '#1890ff' }}
              />
              {!isMobile && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}
                >
                  <Text strong style={{ fontSize: '14px', lineHeight: 1.2 }}>
                    {admin.username}
                  </Text>
                  <Text
                    type="secondary"
                    style={{ fontSize: '12px', lineHeight: 1.2 }}
                  >
                    {admin.role?.replace('_', ' ') || 'Admin'}
                  </Text>
                </div>
              )}
            </Space>
          </Dropdown>
        )}
      </Space>
    </Header>
  );
};

export default AdminHeader;
