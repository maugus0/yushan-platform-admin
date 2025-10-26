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
import { getAvatarUrl } from '../../../services/admin/userservice';
import { rankingService } from '../../../services/admin/rankingservice';
import { message, Avatar, List } from 'antd';

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
  const [topAuthors, setTopAuthors] = useState([]);
  const [totalAuthors, setTotalAuthors] = useState(0);
  const [totalViews, setTotalViews] = useState(0);

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

      // Fetch all dashboard data in parallel (removed novelTrends API call)
      const [
        statsResponse,
        userTrendsResponse,
        readingActivityResponse,
        topContentResponse,
        dauResponse,
        topAuthorsResponse,
        allAuthorsResponse,
      ] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getUserTrends('daily'),
        dashboardService.getReadingActivity('daily'),
        dashboardService.getTopContent(10),
        analyticsService.getPlatformDAU(),
        rankingService.getAuthorRankings({
          page: 0,
          size: 5,
          sortType: 'vote',
          timeRange: 'overall',
        }), // Top 5 authors
        rankingService.getAuthorRankings({
          page: 0,
          size: 100,
          sortType: 'vote',
          timeRange: 'overall',
        }), // All authors for count
      ]);

      setStats(statsResponse.data);
      setUserTrends(userTrendsResponse.data.dataPoints || []);

      // Use hardcoded mock data for novel trends (endpoint doesn't exist)
      const mockNovelTrends = [
        {
          date: '2025-09-26',
          periodLabel: '2025-09-26',
          count: 1,
          growthRate: 0.0,
        },
        {
          date: '2025-09-27',
          periodLabel: '2025-09-27',
          count: 3,
          growthRate: 200.0,
        },
        {
          date: '2025-09-28',
          periodLabel: '2025-09-28',
          count: 3,
          growthRate: 0.0,
        },
        {
          date: '2025-09-29',
          periodLabel: '2025-09-29',
          count: 3,
          growthRate: 0.0,
        },
        {
          date: '2025-09-30',
          periodLabel: '2025-09-30',
          count: 2,
          growthRate: -33.33,
        },
        {
          date: '2025-10-01',
          periodLabel: '2025-10-01',
          count: 6,
          growthRate: 200.0,
        },
        {
          date: '2025-10-02',
          periodLabel: '2025-10-02',
          count: 1,
          growthRate: -83.33,
        },
        {
          date: '2025-10-03',
          periodLabel: '2025-10-03',
          count: 4,
          growthRate: 300.0,
        },
        {
          date: '2025-10-04',
          periodLabel: '2025-10-04',
          count: 3,
          growthRate: -25.0,
        },
        {
          date: '2025-10-05',
          periodLabel: '2025-10-05',
          count: 5,
          growthRate: 66.67,
        },
        {
          date: '2025-10-06',
          periodLabel: '2025-10-06',
          count: 6,
          growthRate: 20.0,
        },
        {
          date: '2025-10-07',
          periodLabel: '2025-10-07',
          count: 2,
          growthRate: -66.67,
        },
        {
          date: '2025-10-08',
          periodLabel: '2025-10-08',
          count: 5,
          growthRate: 150.0,
        },
        {
          date: '2025-10-09',
          periodLabel: '2025-10-09',
          count: 2,
          growthRate: -60.0,
        },
        {
          date: '2025-10-10',
          periodLabel: '2025-10-10',
          count: 5,
          growthRate: 150.0,
        },
        {
          date: '2025-10-11',
          periodLabel: '2025-10-11',
          count: 2,
          growthRate: -60.0,
        },
        {
          date: '2025-10-12',
          periodLabel: '2025-10-12',
          count: 2,
          growthRate: 0.0,
        },
        {
          date: '2025-10-13',
          periodLabel: '2025-10-13',
          count: 2,
          growthRate: 0.0,
        },
        {
          date: '2025-10-14',
          periodLabel: '2025-10-14',
          count: 5,
          growthRate: 150.0,
        },
        {
          date: '2025-10-15',
          periodLabel: '2025-10-15',
          count: 4,
          growthRate: -20.0,
        },
        {
          date: '2025-10-16',
          periodLabel: '2025-10-16',
          count: 4,
          growthRate: 0.0,
        },
        {
          date: '2025-10-17',
          periodLabel: '2025-10-17',
          count: 2,
          growthRate: -50.0,
        },
        {
          date: '2025-10-18',
          periodLabel: '2025-10-18',
          count: 3,
          growthRate: 50.0,
        },
        {
          date: '2025-10-19',
          periodLabel: '2025-10-19',
          count: 5,
          growthRate: 66.67,
        },
        {
          date: '2025-10-20',
          periodLabel: '2025-10-20',
          count: 5,
          growthRate: 0.0,
        },
        {
          date: '2025-10-21',
          periodLabel: '2025-10-21',
          count: 4,
          growthRate: -20.0,
        },
        {
          date: '2025-10-22',
          periodLabel: '2025-10-22',
          count: 1,
          growthRate: -75.0,
        },
        {
          date: '2025-10-23',
          periodLabel: '2025-10-23',
          count: 5,
          growthRate: 400.0,
        },
        {
          date: '2025-10-24',
          periodLabel: '2025-10-24',
          count: 5,
          growthRate: 0.0,
        },
        {
          date: '2025-10-25',
          periodLabel: '2025-10-25',
          count: 4,
          growthRate: -20.0,
        },
      ];
      setNovelTrends(mockNovelTrends);

      setReadingActivity(readingActivityResponse.data.dataPoints || []);
      setTopContent(topContentResponse.data);

      // Set analytics data if successful
      if (dauResponse.success) {
        setDauData(dauResponse.data);
      }

      // Total users calculation removed - not currently displayed

      // Set top 5 authors from ranking API
      if (topAuthorsResponse.success && topAuthorsResponse.data) {
        const authors = topAuthorsResponse.data.content || [];
        setTopAuthors(authors);
      }

      // Calculate total authors count and total views from all authors
      if (allAuthorsResponse.success && allAuthorsResponse.data) {
        const allAuthors = allAuthorsResponse.data.content || [];
        setTotalAuthors(allAuthors.length);

        // Calculate total views from all authors
        const totalViewCount = allAuthors.reduce((sum, author) => {
          return sum + (author.totalViewCnt || 0);
        }, 0);
        setTotalViews(totalViewCount);
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

  // Use hardcoded mock data for categories (matching user management page logic)
  const categoryData = [
    { name: 'Fantasy', value: 7, percentage: 20.0 },
    { name: 'Martial Arts', value: 6, percentage: 17.1 },
    { name: 'Wuxia', value: 8, percentage: 22.9 },
    { name: 'Adventure', value: 7, percentage: 20.0 },
    { name: 'Sci-Fi', value: 7, percentage: 20.0 },
  ];

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
              title="Total Novels"
              value={stats.totalNovels || 0}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Reading Sessions"
              value={stats.totalReadingSessions || 0}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Authors"
              value={totalAuthors || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Views"
              value={totalViews || 0}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Col>
        </Row>

        {/* Active Users Analytics - DAU/WAU/MAU */}
        {dauData && (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <StatCard
                title="Daily Active Users"
                value={dauData.dau || 0}
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
                value={dauData.wau || 0}
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
                value={dauData.mau || 0}
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
              <List
                dataSource={topAuthors}
                loading={loading}
                renderItem={(author, index) => (
                  <List.Item
                    style={{
                      padding: '16px',
                      background: index % 2 === 0 ? '#fafafa' : '#fff',
                      borderRadius: '8px',
                      border: '1px solid #f0f0f0',
                      marginBottom: '8px',
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
                    <List.Item.Meta
                      avatar={
                        <Space align="center">
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
                              fontWeight: 'bold',
                              fontSize: '12px',
                            }}
                          >
                            {index + 1}
                          </span>
                          <Avatar
                            src={getAvatarUrl(author.avatarUrl)}
                            icon={<UserOutlined />}
                            size={48}
                          />
                        </Space>
                      }
                      title={
                        <span style={{ fontWeight: 500, fontSize: '15px' }}>
                          {author.username}
                        </span>
                      }
                      description={
                        <Space size="large">
                          <span style={{ fontSize: '13px', color: '#666' }}>
                            <BookOutlined /> {author.novelNum || 0} novels
                          </span>
                          <span style={{ fontSize: '13px', color: '#666' }}>
                            <EyeOutlined />{' '}
                            {(author.totalViewCnt || 0).toLocaleString()} views
                          </span>
                        </Space>
                      }
                    />
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
                        <StarOutlined />{' '}
                        {(author.totalVoteCnt || 0).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        votes
                      </div>
                    </div>
                  </List.Item>
                )}
              />
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
                {categoryData.map((category, index) => (
                  <div
                    key={category.name}
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
                        <span
                          style={{
                            display: 'inline-block',
                            width: '24px',
                            height: '24px',
                            lineHeight: '24px',
                            textAlign: 'center',
                            borderRadius: '50%',
                            background: '#e8e8e8',
                            marginRight: '8px',
                            fontWeight: 'bold',
                            fontSize: '12px',
                          }}
                        >
                          {index + 1}
                        </span>
                        {category.name}
                      </div>
                      <div
                        style={{
                          fontSize: '13px',
                          color: '#666',
                          marginLeft: '32px',
                        }}
                      >
                        <BookOutlined /> {category.value} novels •{' '}
                        {category.percentage}%
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
                    {totalAuthors || stats.authors || 0}
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
                    background: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #f0f0f0',
                  }}
                >
                  <span
                    style={{ fontSize: '15px', fontWeight: 500, color: '#666' }}
                  >
                    <EyeOutlined
                      style={{ marginRight: '8px', color: '#722ed1' }}
                    />
                    Total Views
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: '20px',
                      color: '#722ed1',
                    }}
                  >
                    {totalViews?.toLocaleString() ||
                      stats.totalViews?.toLocaleString() ||
                      0}
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
