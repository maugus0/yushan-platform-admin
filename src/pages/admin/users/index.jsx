import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Space,
  Typography,
  List,
  Avatar,
  Tag,
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  EditOutlined,
  BookOutlined,
  TrophyOutlined,
  RiseOutlined,
} from '@ant-design/icons';

// Import components
import { userService } from '../../../services/admin/userservice';
import analyticsService from '../../../services/admin/analyticsservice';
import rankingService from '../../../services/admin/rankingservice';
import PageHeader from '../../../components/admin/common/pageheader';
import Breadcrumbs from '../../../components/admin/common/breadcrumbs';
import StatusBadge from '../../../components/admin/common/statusbadge';
import { BarChart } from '../../../components/admin/charts';

const { Text } = Typography;

const UsersOverview = () => {
  const navigate = useNavigate();

  // State management
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReaders: 0,
    totalWriters: 0,
    activeUsers: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [dauData, setDauData] = useState(null);
  const [topReaders, setTopReaders] = useState([]);
  const [topWriters, setTopWriters] = useState([]);

  // Fetch overview data
  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [
        readersResponse,
        writersResponse,
        allReaders,
        allWriters,
        dauResponse,
        topReadersResponse,
        topWritersResponse,
      ] = await Promise.all([
        userService.getReaders({ page: 1, pageSize: 5 }),
        userService.getWriters({ page: 1, pageSize: 5 }),
        userService.getReaders({ page: 1, pageSize: 100 }),
        userService.getWriters({ page: 1, pageSize: 100 }),
        analyticsService.getPlatformDAU(),
        rankingService.getUserRankings({
          page: 0,
          size: 5,
          timeRange: 'overall',
        }),
        rankingService.getAuthorRankings({
          page: 0,
          size: 5,
          sortType: 'vote',
          timeRange: 'overall',
        }),
      ]);

      // Calculate statistics
      const totalReaders = allReaders.total;
      const totalWriters = allWriters.total;
      const activeReaders = allReaders.data.filter(
        (user) => user.status === 'active'
      ).length;
      const activeWriters = allWriters.data.filter(
        (user) => user.status === 'active'
      ).length;

      setStats({
        totalUsers: totalReaders + totalWriters,
        totalReaders,
        totalWriters,
        activeUsers: activeReaders + activeWriters,
      });

      // Combine recent users
      const combinedUsers = [
        ...readersResponse.data.map((user) => ({
          ...user,
          userType: 'reader',
        })),
        ...writersResponse.data.map((user) => ({
          ...user,
          userType: 'writer',
        })),
      ]
        .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
        .slice(0, 6);

      setRecentUsers(combinedUsers);

      // Set DAU data
      if (dauResponse.success) {
        setDauData(dauResponse.data);
      }

      // Set top readers
      if (topReadersResponse.success) {
        setTopReaders(topReadersResponse.data.content || []);
      }

      // Set top writers
      if (topWritersResponse.success) {
        setTopWriters(topWritersResponse.data.content || []);
      }
    } catch (error) {
      console.error('Failed to fetch overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  // Helper: normalize hourly breakdown
  const normalizeHourlyData = (raw) => {
    if (!raw) return [];
    // If data is already an array of hourly items
    if (Array.isArray(raw)) return raw;
    // If API returns object with keys as hours, convert to array
    if (typeof raw === 'object') {
      return Object.keys(raw)
        .map((hourKey) => {
          const item = raw[hourKey];
          // support { hour: '0', activeUsers: 10 } or just numbers
          if (typeof item === 'number') {
            return { hour: hourKey, activeUsers: item };
          }
          return { hour: hourKey, ...item };
        })
        .sort((a, b) => Number(a.hour) - Number(b.hour));
    }
    return [];
  };

  const breadcrumbItems = [
    { title: 'Admin' },
    { title: 'User Management' },
    { title: 'Overview' },
  ];

  // Prepare hourly chart data with fallback to 24-hour zeros
  const normalizedHourly = normalizeHourlyData(dauData?.hourlyBreakdown);
  const hasHourlyData = normalizedHourly.length > 0;
  const displayHourlyData = hasHourlyData
    ? normalizedHourly
    : Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        activeUsers: 0,
        newUsers: 0,
        readingSessions: 0,
      }));

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader
        title="User Management"
        subtitle="Overview of readers and writers on the platform"
        extra={
          <Space wrap>
            <Button
              key="readers"
              icon={<UserOutlined />}
              onClick={() => navigate('/admin/users/readers')}
            >
              Manage Readers
            </Button>
            <Button
              key="writers"
              icon={<EditOutlined />}
              onClick={() => navigate('/admin/users/writers')}
            >
              Manage Writers
            </Button>
          </Space>
        }
      />

      {/* Total Users Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<TeamOutlined />}
              valueStyle={{
                color: '#3f8600',
                fontSize: '28px',
                fontWeight: 'bold',
              }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Readers"
              value={stats.totalReaders}
              prefix={<UserOutlined />}
              valueStyle={{
                color: '#1890ff',
                fontSize: '28px',
                fontWeight: 'bold',
              }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Writers"
              value={stats.totalWriters}
              prefix={<EditOutlined />}
              valueStyle={{
                color: '#722ed1',
                fontSize: '28px',
                fontWeight: 'bold',
              }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Active Users"
              value={stats.activeUsers}
              prefix={<RiseOutlined />}
              valueStyle={{
                color: '#fa8c16',
                fontSize: '28px',
                fontWeight: 'bold',
              }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* DAU/WAU/MAU Cards */}
      {dauData && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={24} md={8}>
            <Card
              hoverable
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
              }}
            >
              <Statistic
                title={
                  <span style={{ color: '#fff', fontSize: '16px' }}>
                    Daily Active Users
                  </span>
                }
                value={dauData.dau || 0}
                suffix={
                  <span
                    style={{ color: '#fff', fontSize: '14px', opacity: 0.9 }}
                  >
                    Today
                  </span>
                }
                valueStyle={{
                  color: '#fff',
                  fontSize: '32px',
                  fontWeight: 'bold',
                }}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Card
              hoverable
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
              }}
            >
              <Statistic
                title={
                  <span style={{ color: '#fff', fontSize: '16px' }}>
                    Weekly Active Users
                  </span>
                }
                value={dauData.wau || 0}
                suffix={
                  <span
                    style={{ color: '#fff', fontSize: '14px', opacity: 0.9 }}
                  >
                    Last 7 days
                  </span>
                }
                valueStyle={{
                  color: '#fff',
                  fontSize: '32px',
                  fontWeight: 'bold',
                }}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Card
              hoverable
              style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                border: 'none',
              }}
            >
              <Statistic
                title={
                  <span style={{ color: '#fff', fontSize: '16px' }}>
                    Monthly Active Users
                  </span>
                }
                value={dauData.mau || 0}
                suffix={
                  <span
                    style={{ color: '#fff', fontSize: '14px', opacity: 0.9 }}
                  >
                    Last 30 days
                  </span>
                }
                valueStyle={{
                  color: '#fff',
                  fontSize: '32px',
                  fontWeight: 'bold',
                }}
                loading={loading}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Hourly Activity Breakdown */}
      {dauData && (
        <Card title="Hourly Activity Breakdown" style={{ marginBottom: 24 }}>
          {!hasHourlyData && (
            <div style={{ marginBottom: 8, color: '#8c8c8c' }}>
              No hourly breakdown is available for {dauData.date || 'this date'}
              . Showing an empty 24-hour chart.
            </div>
          )}
          <BarChart
            data={displayHourlyData.map((item) => ({
              name: `${item.hour}:00`,
              activeUsers: item.activeUsers || item.active || 0,
              newUsers: item.newUsers || item.new_users || 0,
              readingSessions:
                item.readingSessions || item.reading_sessions || 0,
            }))}
            bars={[
              {
                dataKey: 'activeUsers',
                fill: '#1890ff',
                name: 'Active Users',
              },
              { dataKey: 'newUsers', fill: '#52c41a', name: 'New Users' },
              {
                dataKey: 'readingSessions',
                fill: '#722ed1',
                name: 'Reading Sessions',
              },
            ]}
            height={300}
            subtitle="Active users by hour"
          />
        </Card>
      )}

      <Row gutter={[24, 24]}>
        {/* Recent Users */}
        <Col xs={24} sm={24} md={24} lg={8}>
          <Card
            title="Recent Users"
            extra={
              <Button
                type="link"
                onClick={() => navigate('/admin/users/readers')}
              >
                View All
              </Button>
            }
          >
            <List
              dataSource={recentUsers}
              loading={loading}
              renderItem={(user) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar src={user.avatar} icon={<UserOutlined />} />
                    }
                    title={
                      <Space>
                        {user.username}
                        <Tag
                          color={user.userType === 'reader' ? 'blue' : 'purple'}
                        >
                          {user.userType}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space>
                        <StatusBadge status={user.status} />
                        <Text type="secondary">
                          {new Date(user.joinDate).toLocaleDateString()}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Top Readers */}
        <Col xs={24} sm={24} md={12} lg={8}>
          <Card
            title="Top Readers"
            extra={<TrophyOutlined style={{ color: '#faad14' }} />}
          >
            <List
              dataSource={topReaders}
              loading={loading}
              renderItem={(reader, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Space>
                        <Text
                          strong
                          style={{ color: '#faad14', fontSize: '16px' }}
                        >
                          #{index + 1}
                        </Text>
                        <Avatar
                          size={48}
                          src={reader.avatarUrl}
                          icon={<UserOutlined />}
                        />
                      </Space>
                    }
                    title={<Text strong>{reader.username}</Text>}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary">
                          Level {reader.level} • {reader.exp} XP
                        </Text>
                        <Text type="secondary">
                          <TrophyOutlined /> {reader.yuan} Yuan
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Top Writers */}
        <Col xs={24} sm={24} md={12} lg={8}>
          <Card
            title="Top Writers"
            extra={<TrophyOutlined style={{ color: '#faad14' }} />}
          >
            <List
              dataSource={topWriters}
              loading={loading}
              renderItem={(writer, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Space>
                        <Text
                          strong
                          style={{ color: '#faad14', fontSize: '16px' }}
                        >
                          #{index + 1}
                        </Text>
                        <Avatar
                          size={48}
                          src={writer.avatarUrl}
                          icon={<EditOutlined />}
                        />
                      </Space>
                    }
                    title={<Text strong>{writer.username}</Text>}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary">
                          <BookOutlined /> {writer.novelNum || 0} novels
                        </Text>
                        <Text type="secondary">
                          <TrophyOutlined /> {writer.totalVoteCnt || 0} votes
                        </Text>
                        <Text type="secondary">
                          <RiseOutlined /> {writer.totalViewCnt || 0} views
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card title="Quick Actions" style={{ marginTop: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={12} lg={6}>
            <Button
              block
              size="large"
              icon={<UserOutlined />}
              onClick={() => navigate('/admin/users/readers')}
            >
              Manage Readers
            </Button>
          </Col>
          <Col xs={24} sm={12} md={12} lg={6}>
            <Button
              block
              size="large"
              icon={<EditOutlined />}
              onClick={() => navigate('/admin/users/writers')}
            >
              Manage Writers
            </Button>
          </Col>
          <Col xs={24} sm={12} md={12} lg={6}>
            <Button
              block
              size="large"
              icon={<RiseOutlined />}
              onClick={() => navigate('/admin/users/change-status')}
            >
              Change User Status
            </Button>
          </Col>
          <Col xs={24} sm={12} md={12} lg={6}>
            <Button
              block
              size="large"
              icon={<TrophyOutlined />}
              onClick={() => navigate('/admin/users/promote-admin')}
            >
              Promote to Admin
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default UsersOverview;
