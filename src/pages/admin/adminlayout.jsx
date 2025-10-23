import { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/admin/adminauthcontext';
import {
  AdminHeader,
  AdminSidebar,
  ErrorBoundary,
} from '../../components/admin/common';

const { Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { isAuthenticated, loading } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(false); // Always show full sidebar on mobile when visible
        setSidebarVisible(false); // Hide sidebar by default on mobile
      } else {
        setSidebarVisible(true); // Always show sidebar on desktop
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarVisible(false);
    }
  }, [location.pathname, isMobile]);

  // Redirect to login if not authenticated and not loading
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // Don't render anything if not authenticated and not loading
  if (!loading && !isAuthenticated) {
    return null;
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  // Mock notifications data
  const mockNotifications = [
    {
      title: 'New User Registration',
      description: 'John Doe has registered as a reader',
      time: '2 minutes ago',
      type: 'user',
    },
    {
      title: 'Novel Submitted for Review',
      description: 'Jane Smith submitted "Dragon Chronicles" for review',
      time: '5 minutes ago',
      type: 'novel',
    },
    {
      title: 'Comment Reported',
      description: 'Inappropriate comment reported on Chapter 45',
      time: '10 minutes ago',
      type: 'report',
    },
    {
      title: 'New Review Posted',
      description: 'Alice rated "Mystic Journey" 5 stars',
      time: '15 minutes ago',
      type: 'review',
    },
  ];

  const sidebarNotifications = {
    users: 3,
    novels: 2,
    comments: 5,
    reviews: 1,
    reports: 2,
  };

  const handleToggleCollapsed = () => {
    if (isMobile) {
      setSidebarVisible(!sidebarVisible);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleSidebarClose = () => {
    if (isMobile) {
      setSidebarVisible(false);
    }
  };

  const handleUserMenuClick = (key) => {
    switch (key) {
      case 'profile':
        navigate('/admin/profile');
        break;
      case 'logout':
        // Logout is handled in AdminHeader
        break;
      default:
        break;
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification === 'view-all') {
      navigate('/admin/notifications');
    } else {
      // Handle individual notification click
      // TODO: Add notification handling logic
    }
  };

  return (
    <ErrorBoundary>
      <Layout
        style={{ minHeight: '100vh' }}
        className={`admin-layout ${isMobile && sidebarVisible ? 'sidebar-open' : ''} ${!isMobile && collapsed ? 'sidebar-collapsed' : ''}`}
      >
        {/* Mobile sidebar backdrop */}
        {isMobile && sidebarVisible && (
          <div
            className="admin-sidebar-backdrop show"
            onClick={handleSidebarClose}
          />
        )}

        <AdminSidebar
          collapsed={!isMobile && collapsed}
          notifications={sidebarNotifications}
          style={{
            transform: isMobile
              ? sidebarVisible
                ? 'translateX(0)'
                : 'translateX(-100%)'
              : 'translateX(0)',
            position: isMobile ? 'fixed' : 'fixed',
            zIndex: isMobile ? 1050 : 1030,
          }}
          onMenuClick={handleSidebarClose}
        />

        <Layout style={{ marginLeft: isMobile ? 0 : collapsed ? 80 : 256 }}>
          <AdminHeader
            collapsed={isMobile ? false : collapsed}
            onToggleCollapsed={handleToggleCollapsed}
            notifications={mockNotifications}
            unreadCount={
              sidebarNotifications.users + sidebarNotifications.reports
            }
            onUserMenuClick={handleUserMenuClick}
            onNotificationClick={handleNotificationClick}
            showSearch={!isMobile}
            showNotifications={true}
            showFullscreen={!isMobile}
            isMobile={isMobile}
          />

          <Content
            style={{
              margin: isMobile ? '16px' : '24px',
              padding: isMobile ? '16px' : '24px',
              background: '#fff',
              borderRadius: '8px',
              minHeight: 280,
            }}
          >
            <ErrorBoundary
              title="Page Error"
              subTitle="Something went wrong while loading this page."
              showHomeButton={false}
            >
              <Outlet key={location.pathname} />
            </ErrorBoundary>
          </Content>
        </Layout>
      </Layout>
    </ErrorBoundary>
  );
};

export default AdminLayout;
