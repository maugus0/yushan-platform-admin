import { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Avatar,
  Typography,
  Tag,
  Space,
  message,
  Grid,
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  BookOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { PageHeader, LoadingSpinner } from '../../../components/admin/common';
import {
  getCurrentUserProfile,
  getGenderDisplayText,
  getUserStatusColor,
} from '../../../services/admin/userservice';
import { useAdminAuth } from '../../../contexts/admin/adminauthcontext';
import userProfileCover from '../../../assets/images/userprofilecover.png';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const AdminProfile = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const { refreshUserProfile } = useAdminAuth();

  // Fetch current user profile
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await getCurrentUserProfile();
      if (response.success) {
        setProfile(response.data);
        setError(null);
        // Also refresh the auth context to update navbar avatar
        if (refreshUserProfile) {
          await refreshUserProfile();
        }
      } else {
        setError(response.error);
        message.error('Failed to load profile: ' + response.error);
      }
    } catch (err) {
      setError('Failed to load profile');
      message.error('Failed to load profile');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <LoadingSpinner tip="Loading profile..." />;
  }

  if (error || !profile) {
    return (
      <div>
        <PageHeader
          title="My Profile"
          subtitle="View your account information"
          breadcrumbs={[
            { title: 'Dashboard', href: '/admin/dashboard' },
            { title: 'My Profile' },
          ]}
        />
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text type="danger">Failed to load profile data</Text>
            <br />
            <Text type="secondary">{error}</Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="View and manage your account information"
        breadcrumbs={[
          { title: 'Dashboard', href: '/admin/dashboard' },
          { title: 'My Profile' },
        ]}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Profile Header Card */}
        <Card
          style={{
            background: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${userProfileCover})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'center' : 'flex-start',
              gap: '24px',
              padding: '20px',
            }}
          >
            <Avatar
              size={isMobile ? 80 : 120}
              src={profile.avatar || profile.avatarUrl}
              icon={<UserOutlined />}
              style={{
                backgroundColor: '#1890ff',
                flexShrink: 0,
                border: '4px solid white',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
            />

            <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
              <Title
                level={2}
                style={{ margin: 0, marginBottom: '8px', color: 'white' }}
              >
                {profile.username}
              </Title>
              <Text
                style={{
                  fontSize: '16px',
                  display: 'block',
                  marginBottom: '12px',
                  color: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                {profile.email}
              </Text>

              <Space wrap size="middle">
                {profile.profile?.isAdmin && (
                  <Tag
                    color="red"
                    style={{
                      fontSize: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: '#ff4d4f',
                      border: 'none',
                    }}
                  >
                    Administrator
                  </Tag>
                )}
                {profile.profile?.isAuthor && (
                  <Tag
                    color="purple"
                    style={{
                      fontSize: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: '#722ed1',
                      border: 'none',
                    }}
                  >
                    Author
                  </Tag>
                )}
                {!profile.profile?.isAdmin && !profile.profile?.isAuthor && (
                  <Tag
                    style={{
                      fontSize: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: '#666',
                      border: 'none',
                    }}
                  >
                    Reader
                  </Tag>
                )}
              </Space>
            </div>
          </div>
        </Card>

        {/* Profile Information */}
        <Card title="Profile Information">
          <Descriptions
            bordered
            column={isMobile ? 1 : 2}
            size="middle"
            items={[
              {
                key: 'username',
                label: 'Username',
                children: profile.username,
              },
              {
                key: 'email',
                label: 'Email',
                children: profile.email,
              },
              {
                key: 'bio',
                label: 'Bio',
                children: profile.profile?.bio || 'No bio provided',
              },
              {
                key: 'gender',
                label: 'Gender',
                children: getGenderDisplayText(profile.profile?.gender),
              },
              {
                key: 'birthday',
                label: 'Birthday',
                children: profile.profile?.birthDate
                  ? new Date(profile.profile.birthDate).toLocaleDateString()
                  : 'Not specified',
              },
              {
                key: 'status',
                label: 'Account Status',
                children: (
                  <Tag color={getUserStatusColor(profile.status)}>
                    {profile.status}
                  </Tag>
                ),
              },
            ]}
          />
        </Card>

        {/* Reading Statistics */}
        <Card title="Reading Statistics">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile
                ? '1fr'
                : 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '32px',
                  color: '#1890ff',
                  marginBottom: '8px',
                }}
              >
                <TrophyOutlined />
              </div>
              <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                {profile.profile?.level || 0}
              </Title>
              <Text type="secondary">Level</Text>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '32px',
                  color: '#52c41a',
                  marginBottom: '8px',
                }}
              >
                <StarOutlined />
              </div>
              <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                {profile.profile?.experience?.toLocaleString() || 0}
              </Title>
              <Text type="secondary">Experience Points</Text>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '32px',
                  color: '#fa8c16',
                  marginBottom: '8px',
                }}
              >
                <BookOutlined />
              </div>
              <Title level={3} style={{ margin: 0, color: '#fa8c16' }}>
                {profile.profile?.readBookNum || 0}
              </Title>
              <Text type="secondary">Books Read</Text>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '32px',
                  color: '#722ed1',
                  marginBottom: '8px',
                }}
              >
                <ClockCircleOutlined />
              </div>
              <Title level={3} style={{ margin: 0, color: '#722ed1' }}>
                {profile.profile?.readTime || 0}h
              </Title>
              <Text type="secondary">Reading Time</Text>
            </div>

            {profile.profile?.yuan !== null &&
              profile.profile?.yuan !== undefined && (
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '32px',
                      color: '#eb2f96',
                      marginBottom: '8px',
                    }}
                  >
                    💰
                  </div>
                  <Title level={3} style={{ margin: 0, color: '#eb2f96' }}>
                    {profile.profile?.yuan || 0}
                  </Title>
                  <Text type="secondary">Yuan</Text>
                </div>
              )}
          </div>
        </Card>

        {/* Account Activity */}
        <Card title="Account Activity">
          <Descriptions
            bordered
            column={isMobile ? 1 : 2}
            size="middle"
            items={[
              {
                key: 'created',
                label: 'Account Created',
                children: (
                  <Space>
                    <CalendarOutlined />
                    <Text>{new Date(profile.createdAt).toLocaleString()}</Text>
                  </Space>
                ),
              },
              {
                key: 'updated',
                label: 'Last Updated',
                children: (
                  <Space>
                    <CalendarOutlined />
                    <Text>{new Date(profile.updatedAt).toLocaleString()}</Text>
                  </Space>
                ),
              },
              {
                key: 'lastActive',
                label: 'Last Active',
                children: profile.lastActive ? (
                  <Space>
                    <CalendarOutlined />
                    <Text>{new Date(profile.lastActive).toLocaleString()}</Text>
                  </Space>
                ) : (
                  <Text type="secondary">Not available</Text>
                ),
              },
              {
                key: 'userId',
                label: 'User ID',
                children: (
                  <Text code copyable={{ text: profile.id }}>
                    {profile.id}
                  </Text>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </div>
  );
};

export default AdminProfile;
