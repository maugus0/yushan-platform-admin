import { useState, useEffect, useMemo } from 'react';
import { Layout, Menu, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  BookOutlined,
  FileTextOutlined,
  TagsOutlined,
  MessageOutlined,
  StarOutlined,
  ReadOutlined,
  TrophyOutlined,
  LikeOutlined,
  FlagOutlined,
  SettingOutlined,
  EditOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;
const { Title } = Typography;

const AdminSidebar = ({
  collapsed = false,
  width = 250,
  theme = 'light',
  style = {},
  className = '',
  onMenuClick,
  ...props
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState([]);

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'Users',
      children: [
        {
          key: '/admin/users',
          icon: <UserOutlined />,
          label: 'Overview',
        },
        {
          key: '/admin/users/readers',
          icon: <UserOutlined />,
          label: 'Readers',
        },
        {
          key: '/admin/users/writers',
          icon: <EditOutlined />,
          label: 'Writers',
        },
      ],
    },
    {
      key: '/admin/novels',
      icon: <BookOutlined />,
      label: 'Novels',
    },
    {
      key: '/admin/chapters',
      icon: <FileTextOutlined />,
      label: 'Chapters',
    },
    {
      key: '/admin/categories',
      icon: <TagsOutlined />,
      label: 'Categories',
    },
    {
      key: '/admin/comments',
      icon: <MessageOutlined />,
      label: 'Comments',
    },
    {
      key: '/admin/reviews',
      icon: <StarOutlined />,
      label: 'Reviews',
    },
    {
      key: '/admin/library',
      icon: <ReadOutlined />,
      label: 'Library',
    },
    {
      key: '/admin/rankings',
      icon: <TrophyOutlined />,
      label: 'Rankings',
    },
    {
      key: '/admin/yuan',
      icon: <LikeOutlined />,
      label: 'Yuan System',
    },
    {
      key: '/admin/reports',
      icon: <FlagOutlined />,
      label: 'Reports',
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  // Calculate openKeys based on current route
  const openKeysFromPath = useMemo(() => {
    const path = location?.pathname || '';
    return path.includes('/users') ? ['users'] : [];
  }, [location?.pathname]);

  // Update openKeys when path changes
  useEffect(() => {
    setOpenKeys(openKeysFromPath);
  }, [openKeysFromPath]);

  const handleMenuClick = ({ key }) => {
    // Use replace: true to ensure proper navigation
    navigate(key, { replace: false });
    if (onMenuClick) {
      onMenuClick(key);
    }
  };

  const handleOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  const getSelectedKeys = () => {
    const path = location.pathname;

    // Handle nested routes
    if (path.includes('/users/readers/') || path === '/admin/users/readers')
      return ['/admin/users/readers'];
    if (path.includes('/users/writers/') || path === '/admin/users/writers')
      return ['/admin/users/writers'];
    if (path === '/admin/users') return ['/admin/users'];

    return [path];
  };

  const getOpenKeys = () => {
    return openKeys;
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={width}
      theme={theme}
      style={{
        background: theme === 'light' ? '#fff' : undefined,
        borderRight: theme === 'light' ? '1px solid #f0f0f0' : undefined,
        ...style,
      }}
      className={className}
      {...props}
    >
      {/* Logo/Brand Section */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom:
            theme === 'light' ? '1px solid #f0f0f0' : '1px solid #303030',
          background: theme === 'light' ? '#1890ff' : '#001529',
        }}
      >
        <Title
          level={4}
          style={{
            color: 'white',
            margin: 0,
            fontSize: collapsed ? '16px' : '20px',
            transition: 'font-size 0.2s',
          }}
        >
          {collapsed ? 'Y' : 'Yushan'}
        </Title>
      </div>

      {/* Navigation Menu */}
      <Menu
        mode="inline"
        theme={theme}
        selectedKeys={getSelectedKeys()}
        openKeys={getOpenKeys()}
        onOpenChange={handleOpenChange}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          border: 'none',
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
        }}
      />
    </Sider>
  );
};

export default AdminSidebar;
