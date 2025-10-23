import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Space,
  Typography,
  Statistic,
  Table,
  message,
  Avatar,
} from 'antd';
import './yuanstatistics.css';
import { UserOutlined, BookOutlined } from '@ant-design/icons';
// Default images
import novelDefaultImg from '../../../assets/images/novel_default.png';
import userDefaultImg from '../../../assets/images/user.png';
import { PageHeader, LoadingSpinner } from '../../../components/admin/common';
import { rankingService } from '../../../services/admin/rankingservice';
const { Text } = Typography;

const YuanStatistics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // Removed unused states: period, activeTab, rankingsLoading
  const [rankings, setRankings] = useState({
    users: [],
    authors: [],
    novels: [],
  });
  const [totals, setTotals] = useState({ votes: 0, yuan: 0 });

  // Helpers for image fallbacks and base64 handling
  const getUserAvatar = (avatarUrl) => {
    if (avatarUrl) {
      if (avatarUrl.startsWith('data:image/')) return avatarUrl;
      if (
        avatarUrl.includes('user.png') ||
        avatarUrl.includes('user_male.png') ||
        avatarUrl.includes('user_female.png')
      )
        return `/images/${avatarUrl}`;
      return avatarUrl;
    }
    return userDefaultImg;
  };

  const getNovelCover = (coverImgUrl) => {
    if (coverImgUrl) {
      if (coverImgUrl.startsWith('data:image/')) return coverImgUrl;
      return coverImgUrl;
    }
    return novelDefaultImg;
  };

  // Fetch statistics data - replaced: use rankingService to get top yuan/vote data
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch top 10 novels/authors/users by votes/yuan
        const [novelsRes, authorsRes, usersRes] = await Promise.all([
          rankingService.getNovelRankings({
            page: 0,
            size: 10,
            sortType: 'vote',
          }),
          rankingService.getAuthorRankings({
            page: 0,
            size: 10,
            sortType: 'vote',
          }),
          rankingService.getUserRankings({
            page: 0,
            size: 10,
            sortBy: 'points',
          }),
        ]);

        const novels = novelsRes.success
          ? novelsRes.data.content || novelsRes.data
          : [];
        const authors = authorsRes.success
          ? authorsRes.data.content || authorsRes.data
          : [];
        const users = usersRes.success
          ? usersRes.data.content || usersRes.data
          : [];

        setRankings({ novels, authors, users });

        // Compute totals from client-side response
        const sumVotes = (arr) =>
          arr.reduce(
            (s, r) => s + (r.voteCnt || r.votes || r.totalVoteCnt || 0),
            0
          );
        const sumYuan = (arr) =>
          arr.reduce((s, r) => s + (r.yuan || r.currentBalance || 0), 0);
        const totalVotes =
          sumVotes(novels) + sumVotes(authors) + sumVotes(users);
        const totalYuan = sumYuan(novels) + sumYuan(authors) + sumYuan(users);
        setTotals({ votes: totalVotes, yuan: totalYuan });
      } catch (error) {
        message.error('Failed to load statistics');
        setRankings({ users: [], authors: [], novels: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []); // fetch once on mount

  // No additional rankings fetch required; handled in fetchStats above

  const handleBack = () => {
    navigate('/admin/yuan');
  };

  if (loading) {
    return <LoadingSpinner tip="Loading yuan statistics..." />;
  }

  return (
    <div>
      <PageHeader
        title="Yuan Statistics"
        subtitle="Analytics and insights for platform currency"
        onBack={handleBack}
        breadcrumbs={[
          { title: 'Dashboard', href: '/yushan-admin/admin/dashboard' },
          { title: 'Yuan', href: '/yushan-admin/admin/yuan' },
          { title: 'Statistics' },
        ]}
      />

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12}>
            <Card>
              <Statistic title="Total Votes" value={totals.votes || 0} />
              <Text type="secondary">
                Total number of votes based on response
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card>
              <Statistic title="Total Yuan" value={totals.yuan || 0} />
              <Text type="secondary">
                Total number of yuan based on response
              </Text>
            </Card>
          </Col>
        </Row>

        <Card title="Top Novels" style={{ marginBottom: 16 }}>
          <Table
            dataSource={rankings.novels}
            columns={[
              {
                title: 'Rank',
                render: (_, __, idx) => idx + 1,
                width: 70,
                responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
              },
              {
                title: 'Novel',
                render: (record) => (
                  <Space
                    direction="vertical"
                    size={8}
                    style={{ alignItems: 'flex-start' }}
                  >
                    <Avatar
                      shape="square"
                      size={40}
                      src={getNovelCover(record.coverImgUrl)}
                      icon={<BookOutlined />}
                    />
                    <Text strong style={{ wordBreak: 'break-word' }}>
                      {record.title || record.novelTitle}
                    </Text>
                  </Space>
                ),
                width: 180,
                responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
              },
              {
                title: 'Votes',
                render: (_, record) => record.voteCnt || record.votes || 0,
                width: 100,
                responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
              },
            ]}
            rowKey={(r) => r.novelId || r.id || `novel-${Math.random()}`}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 400 }}
            className="responsive-table"
          />
        </Card>

        <Card title="Top Authors" style={{ marginBottom: 16 }}>
          <Table
            dataSource={rankings.authors}
            columns={[
              {
                title: 'Rank',
                render: (_, __, idx) => idx + 1,
                width: 70,
                responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
              },
              {
                title: 'Author',
                render: (_, record) => (
                  <Space
                    direction="vertical"
                    size={8}
                    style={{ alignItems: 'flex-start' }}
                  >
                    <Avatar
                      src={getUserAvatar(record.avatarUrl)}
                      icon={<UserOutlined />}
                      size={40}
                    />
                    <Text strong style={{ wordBreak: 'break-word' }}>
                      {record.username || record.authorName}
                    </Text>
                  </Space>
                ),
                width: 180,
                responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
              },
              {
                title: 'Votes',
                render: (_, record) => record.totalVoteCnt || record.votes || 0,
                width: 100,
                responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
              },
            ]}
            rowKey={(r) => r.authorId || r.id || `author-${Math.random()}`}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 400 }}
            className="responsive-table"
          />
        </Card>

        <Card title="Top Readers">
          <Table
            dataSource={rankings.users}
            columns={[
              {
                title: 'Rank',
                render: (_, __, idx) => idx + 1,
                width: 70,
                responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
              },
              {
                title: 'Reader',
                render: (_, record) => (
                  <Space
                    direction="vertical"
                    size={8}
                    style={{ alignItems: 'flex-start' }}
                  >
                    <Avatar
                      src={getUserAvatar(record.avatarUrl)}
                      icon={<UserOutlined />}
                      size={40}
                    />
                    <Text strong style={{ wordBreak: 'break-word' }}>
                      {record.username}
                    </Text>
                  </Space>
                ),
                width: 180,
                responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
              },
              {
                title: 'Yuan',
                render: (_, record) => record.yuan || 0,
                width: 100,
                responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
              },
            ]}
            rowKey={(r) => r.userId || r.id || `user-${Math.random()}`}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 400 }}
            className="responsive-table"
          />
        </Card>
      </Space>
    </div>
  );
};

export default YuanStatistics;
