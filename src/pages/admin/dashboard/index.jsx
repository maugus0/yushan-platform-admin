import { Row, Col, Typography, Space, Button, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  UserOutlined,
  BookOutlined,
  StarOutlined,
  EyeOutlined,
  CommentOutlined,
  TrophyOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import {
  StatCard,
  LineChart,
  AreaChart,
  BarChart,
  PieChart,
} from '../../../components/admin/charts';
import { LoadingSpinner } from '../../../components/admin/common';
import dashboardService from '../../../services/admin/dashboardservice';
import analyticsService from '../../../services/admin/analyticsservice';
import { message } from 'antd';

const { Title } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [userTrends, setUserTrends] = useState([]);
  const [novelTrends, setNovelTrends] = useState([]);
  const [readingActivity, setReadingActivity] = useState([]);
  const [topContent, setTopContent] = useState(null);
  const [dauData, setDauData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Helper: normalize hourly breakdown for chart compatibility
  const normalizeHourlyData = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'object') {
      return Object.keys(raw)
        .map((hourKey) => {
          const item = raw[hourKey];
          if (typeof item === 'number') {
            return { hour: hourKey, activeUsers: item };
          }
          return { hour: hourKey, ...item };
        })
        .sort((a, b) => Number(a.hour) - Number(b.hour));
    }
    return [];
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all dashboard data in parallel
      const [
        statsResponse,
        userTrendsResponse,
        novelTrendsResponse,
        readingActivityResponse,
        topContentResponse,
        dauResponse,
      ] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getUserTrends('daily'),
        dashboardService.getNovelTrends('daily'),
        dashboardService.getReadingActivity('daily'),
        dashboardService.getTopContent(10),
        analyticsService.getPlatformDAU(),
      ]);

      setStats(statsResponse.data);
      setUserTrends(userTrendsResponse.data.dataPoints || []);
      setNovelTrends(novelTrendsResponse.data.dataPoints || []);
      setReadingActivity(readingActivityResponse.data.dataPoints || []);
      setTopContent(topContentResponse.data);

      // Set analytics data if successful
      if (dauResponse.success) {
        setDauData(dauResponse.data);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      message.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner tip="Loading dashboard..." />;
  }

  if (!stats) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>Failed to load dashboard data</Title>
        <Button type="primary" onClick={fetchDashboardData}>
          Retry
        </Button>
      </div>
    );
  }

  // Transform data for charts
  const userGrowthData = userTrends.map((point) => ({
    name: point.periodLabel,
    users: point.count,
    date: point.date,
  }));

  const novelGrowthData = novelTrends.map((point) => ({
    name: point.periodLabel,
    novels: point.count,
    date: point.date,
  }));

  const activityData = readingActivity.map((point) => ({
    name: point.periodLabel,
    views: point.views,
    comments: point.comments,
    reviews: point.reviews,
    votes: point.votes,
  }));

  const topNovelsData =
    topContent?.topNovels?.slice(0, 10).map((novel) => ({
      name:
        novel.title.length > 20
          ? novel.title.substring(0, 20) + '...'
          : novel.title,
      value: novel.viewCount,
      fullTitle: novel.title,
      author: novel.authorName,
      rating: novel.rating,
    })) || [];

  const categoryData =
    topContent?.topCategories?.slice(0, 5).map((cat) => ({
      name: cat.categoryName,
      value: cat.novelCount,
      views: cat.totalViews,
    })) || [];

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '32px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <Title
            level={2}
            style={{ color: 'white', margin: 0, marginBottom: '8px' }}
          >
            Dashboard Overview
          </Title>
          <p style={{ margin: 0, fontSize: '16px', opacity: 0.95 }}>
            Welcome to Yushan Admin Panel. Here's what's happening on your
            platform.
          </p>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
              trend={{
                value: Math.abs(stats.userGrowthRate)?.toFixed(1) || 0,
                isPositive: stats.userGrowthRate >= 0,
              }}
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Active Users"
              value={stats.activeUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix={
                <span style={{ fontSize: '14px', color: '#666' }}>
                  DAU: {stats.dailyActiveUsers}
                </span>
              }
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Novels"
              value={stats.totalNovels}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#722ed1' }}
              suffix={
                <span style={{ fontSize: '14px', color: '#666' }}>
                  Published: {stats.publishedNovels}
                </span>
              }
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Chapters"
              value={stats.totalChapters}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Comments"
              value={stats.totalComments}
              prefix={<CommentOutlined />}
              valueStyle={{ color: '#52c41a' }}
              trend={{
                value: Math.abs(stats.engagementGrowthRate)?.toFixed(1) || 0,
                isPositive: stats.engagementGrowthRate >= 0,
              }}
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Reviews"
              value={stats.totalReviews}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#eb2f96' }}
              suffix={
                <span style={{ fontSize: '14px', color: '#666' }}>
                  Avg: {stats.averageRating?.toFixed(2)}
                </span>
              }
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Views"
              value={stats.totalViews}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Votes"
              value={stats.totalVotes}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
        </Row>

        {/* Active Users Analytics - DAU/WAU/MAU */}
        {dauData && (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <StatCard
                title="Daily Active Users"
                value={dauData.dau}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
                suffix={
                  <span style={{ fontSize: '14px', color: '#666' }}>Today</span>
                }
              />
            </Col>
            <Col xs={24} sm={8}>
              <StatCard
                title="Weekly Active Users"
                value={dauData.wau}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#52c41a' }}
                suffix={
                  <span style={{ fontSize: '14px', color: '#666' }}>
                    Last 7 days
                  </span>
                }
              />
            </Col>
            <Col xs={24} sm={8}>
              <StatCard
                title="Monthly Active Users"
                value={dauData.mau}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#722ed1' }}
                suffix={
                  <span style={{ fontSize: '14px', color: '#666' }}>
                    Last 30 days
                  </span>
                }
              />
            </Col>
          </Row>
        )}

        {/* Charts Row 1 - User & Novel Growth + Categories */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <LineChart
              title="User Growth Trend"
              subtitle="New users over time"
              data={userGrowthData}
              lines={[
                { dataKey: 'users', stroke: '#1890ff', name: 'New Users' },
              ]}
              height={350}
            />
          </Col>

          <Col xs={24} lg={12}>
            <LineChart
              title="Novel Creation Trend"
              subtitle="New novels over time"
              data={novelGrowthData}
              lines={[
                { dataKey: 'novels', stroke: '#52c41a', name: 'New Novels' },
              ]}
              height={350}
            />
          </Col>
        </Row>

        {/* Charts Row 2 - Category Distribution + Top Authors */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <PieChart
              title="Novel Categories"
              subtitle="Distribution by genre"
              data={categoryData}
              height={350}
            />
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                <span>
                  <TrophyOutlined
                    style={{ marginRight: '8px', color: '#faad14' }}
                  />
                  Top Authors
                </span>
              }
              bordered={false}
              style={{ height: '100%' }}
            >
              <Space
                direction="vertical"
                style={{ width: '100%' }}
                size="small"
              >
                {topContent?.topAuthors?.slice(0, 5).map((author, index) => (
                  <div
                    key={author.authorId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '16px',
                      background: index % 2 === 0 ? '#fafafa' : '#fff',
                      borderRadius: '8px',
                      border: '1px solid #f0f0f0',
                      transition: 'all 0.3s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        '0 2px 8px rgba(0,0,0,0.1)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 500,
                          marginBottom: '8px',
                          fontSize: '15px',
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-block',
                            width: '24px',
                            height: '24px',
                            lineHeight: '24px',
                            textAlign: 'center',
                            borderRadius: '50%',
                            background:
                              index === 0
                                ? '#ffd700'
                                : index === 1
                                  ? '#c0c0c0'
                                  : index === 2
                                    ? '#cd7f32'
                                    : '#e8e8e8',
                            marginRight: '8px',
                            fontWeight: 'bold',
                            fontSize: '12px',
                          }}
                        >
                          {index + 1}
                        </span>
                        {author.authorName}
                      </div>
                      <div
                        style={{
                          fontSize: '13px',
                          color: '#666',
                          marginLeft: '32px',
                        }}
                      >
                        <BookOutlined /> {author.novelCount} novels •{' '}
                        <EyeOutlined /> {author.totalViews.toLocaleString()}{' '}
                        views
                      </div>
                    </div>
                    <div
                      style={{
                        textAlign: 'right',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          color: '#faad14',
                          fontSize: '16px',
                          marginBottom: '4px',
                        }}
                      >
                        <StarOutlined /> {author.averageRating.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        {author.totalVotes} votes
                      </div>
                    </div>
                  </div>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Charts Row 3 - Reading Activity */}
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <AreaChart
              title="Reading Activity Over Time"
              subtitle="Views, comments, reviews and votes"
              data={activityData}
              areas={[
                { dataKey: 'views', fill: '#1890ff', name: 'Views' },
                { dataKey: 'comments', fill: '#52c41a', name: 'Comments' },
                { dataKey: 'reviews', fill: '#faad14', name: 'Reviews' },
                { dataKey: 'votes', fill: '#eb2f96', name: 'Votes' },
              ]}
              height={350}
            />
          </Col>
        </Row>

        {/* Charts Row 4 - Top Novels + Top Categories */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card
              bordered={false}
              style={{ height: '100%' }}
              bodyStyle={{ padding: 0 }}
            >
              <BarChart
                title="Top Novels by Views"
                subtitle="Most popular novels"
                data={topNovelsData}
                bars={[{ dataKey: 'value', fill: '#722ed1', name: 'Views' }]}
                layout="vertical"
                height={400}
              />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                <span>
                  <TrophyOutlined
                    style={{ marginRight: '8px', color: '#722ed1' }}
                  />
                  Top Categories
                </span>
              }
              bordered={false}
              style={{ height: '100%' }}
            >
              <Space
                direction="vertical"
                style={{ width: '100%' }}
                size="small"
              >
                {topContent?.topCategories
                  ?.slice(0, 8)
                  .map((category, index) => (
                    <div
                      key={category.categoryId}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '14px 16px',
                        background: index % 2 === 0 ? '#fafafa' : '#fff',
                        borderRadius: '8px',
                        border: '1px solid #f0f0f0',
                        transition: 'all 0.3s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          '0 2px 8px rgba(0,0,0,0.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 500,
                            marginBottom: '6px',
                            fontSize: '15px',
                          }}
                        >
                          {category.categoryName}
                        </div>
                        <div style={{ fontSize: '13px', color: '#666' }}>
                          <BookOutlined /> {category.novelCount} novels •{' '}
                          <EyeOutlined /> {category.totalViews.toLocaleString()}{' '}
                          views
                        </div>
                      </div>
                      <div
                        style={{
                          textAlign: 'right',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            color: '#1890ff',
                            fontSize: '16px',
                            marginBottom: '4px',
                          }}
                        >
                          <StarOutlined /> {category.averageRating.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          {category.totalVotes} votes
                        </div>
                      </div>
                    </div>
                  ))}
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions & Key Metrics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <span>
                  <RiseOutlined
                    style={{ marginRight: '8px', color: '#1890ff' }}
                  />
                  Quick Actions
                </span>
              }
              bordered={false}
              style={{ height: '100%' }}
            >
              <Space
                direction="vertical"
                style={{ width: '100%' }}
                size="middle"
              >
                <Button
                  type="primary"
                  icon={<UserOutlined />}
                  block
                  size="large"
                  onClick={() => navigate('/admin/users')}
                  style={{
                    height: '48px',
                    borderRadius: '8px',
                    fontWeight: 500,
                  }}
                >
                  Manage Users
                </Button>
                <Button
                  icon={<BookOutlined />}
                  block
                  size="large"
                  onClick={() => navigate('/admin/novels')}
                  style={{
                    height: '48px',
                    borderRadius: '8px',
                    fontWeight: 500,
                  }}
                >
                  Manage Novels
                </Button>
                <Button
                  icon={<CommentOutlined />}
                  block
                  size="large"
                  onClick={() => navigate('/admin/comments')}
                  style={{
                    height: '48px',
                    borderRadius: '8px',
                    fontWeight: 500,
                  }}
                >
                  Review Comments
                </Button>
                <Button
                  icon={<StarOutlined />}
                  block
                  size="large"
                  onClick={() => navigate('/admin/reviews')}
                  style={{
                    height: '48px',
                    borderRadius: '8px',
                    fontWeight: 500,
                  }}
                >
                  Check Reviews
                </Button>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                <span>
                  <TrophyOutlined
                    style={{ marginRight: '8px', color: '#52c41a' }}
                  />
                  Key Metrics
                </span>
              }
              bordered={false}
              style={{ height: '100%' }}
            >
              <Space
                direction="vertical"
                style={{ width: '100%' }}
                size="large"
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: '#fafafa',
                    borderRadius: '8px',
                    border: '1px solid #f0f0f0',
                  }}
                >
                  <span
                    style={{ fontSize: '15px', fontWeight: 500, color: '#666' }}
                  >
                    <UserOutlined
                      style={{ marginRight: '8px', color: '#1890ff' }}
                    />
                    Authors
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: '20px',
                      color: '#1890ff',
                    }}
                  >
                    {stats.authors}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #f0f0f0',
                  }}
                >
                  <span
                    style={{ fontSize: '15px', fontWeight: 500, color: '#666' }}
                  >
                    <BookOutlined
                      style={{ marginRight: '8px', color: '#52c41a' }}
                    />
                    Published Novels
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: '20px',
                      color: '#52c41a',
                    }}
                  >
                    {stats.publishedNovels}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: '#fafafa',
                    borderRadius: '8px',
                    border: '1px solid #f0f0f0',
                  }}
                >
                  <span
                    style={{ fontSize: '15px', fontWeight: 500, color: '#666' }}
                  >
                    <TrophyOutlined
                      style={{ marginRight: '8px', color: '#faad14' }}
                    />
                    Completed Novels
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: '20px',
                      color: '#faad14',
                    }}
                  >
                    {stats.completedNovels}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #f0f0f0',
                  }}
                >
                  <span
                    style={{ fontSize: '15px', fontWeight: 500, color: '#666' }}
                  >
                    <BookOutlined
                      style={{ marginRight: '8px', color: '#722ed1' }}
                    />
                    Total Words
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: '20px',
                      color: '#722ed1',
                    }}
                  >
                    {stats.totalWords?.toLocaleString()}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: '#fafafa',
                    borderRadius: '8px',
                    border: '1px solid #f0f0f0',
                  }}
                >
                  <span
                    style={{ fontSize: '15px', fontWeight: 500, color: '#666' }}
                  >
                    <RiseOutlined
                      style={{ marginRight: '8px', color: '#eb2f96' }}
                    />
                    Weekly Active Users
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: '20px',
                      color: '#eb2f96',
                    }}
                  >
                    {stats.weeklyActiveUsers}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #f0f0f0',
                  }}
                >
                  <span
                    style={{ fontSize: '15px', fontWeight: 500, color: '#666' }}
                  >
                    <RiseOutlined
                      style={{ marginRight: '8px', color: '#13c2c2' }}
                    />
                    Monthly Active Users
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: '20px',
                      color: '#13c2c2',
                    }}
                  >
                    {stats.monthlyActiveUsers}
                  </span>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Hourly Activity Breakdown */}
        {dauData && (
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              {normalizeHourlyData(dauData.hourlyBreakdown).length === 0 && (
                <div style={{ marginBottom: 8, color: '#8c8c8c' }}>
                  No hourly breakdown is available for{' '}
                  {dauData.date || 'this date'}. Showing an empty 24-hour chart.
                </div>
              )}

              <BarChart
                title="Hourly Activity Breakdown"
                subtitle="Active users by hour"
                data={
                  normalizeHourlyData(dauData.hourlyBreakdown).length > 0
                    ? normalizeHourlyData(dauData.hourlyBreakdown).map(
                        (item) => ({
                          name: `${item.hour}:00`,
                          activeUsers: item.activeUsers || item.active || 0,
                          newUsers: item.newUsers || item.new_users || 0,
                          readingSessions:
                            item.readingSessions || item.reading_sessions || 0,
                        })
                      )
                    : Array.from({ length: 24 }, (_, i) => ({
                        name: `${i}:00`,
                        activeUsers: 0,
                        newUsers: 0,
                        readingSessions: 0,
                      }))
                }
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
                height={350}
              />
            </Col>
          </Row>
        )}
      </Space>
    </div>
  );
};

export default Dashboard;
