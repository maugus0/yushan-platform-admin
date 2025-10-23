import { useState, useEffect } from 'react';
import { Button, Space, Table, Avatar, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { BookOutlined, BarChartOutlined } from '@ant-design/icons';
import './yuanstatistics.css';
import novelDefaultImg from '../../../assets/images/novel_default.png';
import userDefaultImg from '../../../assets/images/user.png';
import { PageHeader, LoadingSpinner } from '../../../components/admin/common';
import { rankingService } from '../../../services/admin/rankingservice';

const { Text } = Typography;

const Yuan = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [novelRankings, setNovelRankings] = useState([]);
  const [authorRankings, setAuthorRankings] = useState([]);
  const [userRankings, setUserRankings] = useState([]);

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        const [novelRes, authorRes, userRes] = await Promise.all([
          rankingService.getNovelRankings({
            page: 0,
            size: 1000,
            sortType: 'vote',
          }),
          rankingService.getAuthorRankings({
            page: 0,
            size: 1000,
            sortType: 'vote',
          }),
          rankingService.getUserRankings({
            page: 0,
            size: 1000,
            sortBy: 'points',
          }),
        ]);

        const novels = novelRes.success
          ? novelRes.data.content || novelRes.data
          : [];
        const authors = authorRes.success
          ? authorRes.data.content || authorRes.data
          : [];
        const users = userRes.success
          ? userRes.data.content || userRes.data
          : [];

        setNovelRankings(novels);
        setAuthorRankings(authors);
        setUserRankings(users);
      } catch (error) {
        message.error('Failed to fetch ranking data');
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  // Columns for ranking tables
  const novelColumns = [
    {
      title: 'Rank',
      render: (_, __, idx) => idx + 1,
      width: 70,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Novel',
      render: (_, record) => (
        <Space
          direction="vertical"
          size={8}
          style={{ alignItems: 'flex-start' }}
        >
          <Avatar
            shape="square"
            size={40}
            src={
              (record.coverImgUrl &&
                (record.coverImgUrl.startsWith('data:image/')
                  ? record.coverImgUrl
                  : record.coverImgUrl)) ||
              novelDefaultImg
            }
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
      render: (_, record) =>
        (record.voteCnt || record.votes || 0).toLocaleString(),
      width: 100,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  ];

  const authorColumns = [
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
            src={
              (record.avatarUrl &&
                (record.avatarUrl.startsWith('data:image/')
                  ? record.avatarUrl
                  : record.avatarUrl.includes('user.png')
                    ? `/images/${record.avatarUrl}`
                    : record.avatarUrl)) ||
              userDefaultImg
            }
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
      render: (_, record) =>
        (record.totalVoteCnt || record.votes || 0).toLocaleString(),
      width: 100,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  ];

  const userColumns = [
    {
      title: 'Rank',
      render: (_, __, idx) => idx + 1,
      width: 70,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'User',
      render: (_, record) => (
        <Space
          direction="vertical"
          size={8}
          style={{ alignItems: 'flex-start' }}
        >
          <Avatar
            src={
              (record.avatarUrl &&
                (record.avatarUrl.startsWith('data:image/')
                  ? record.avatarUrl
                  : record.avatarUrl.includes('user.png')
                    ? `/images/${record.avatarUrl}`
                    : record.avatarUrl)) ||
              userDefaultImg
            }
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
      render: (_, record) =>
        (record.yuan || record.currentBalance || 0).toLocaleString(),
      width: 100,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  ];

  // No table handlers required — ranking tables are static (no server-side pagination)

  // ranking table columns defined above

  return (
    <div>
      <PageHeader
        title="Yuan Management"
        subtitle="Manage platform currency, transactions, and rewards"
        breadcrumbs={[
          { title: 'Dashboard', href: '/yushan-admin/admin/dashboard' },
          { title: 'Yuan' },
        ]}
        actions={[
          <Button
            key="statistics"
            type="default"
            icon={<BarChartOutlined />}
            onClick={() => navigate('/admin/yuan/statistics')}
          >
            View Statistics
          </Button>,
        ]}
      />

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {loading ? (
          <LoadingSpinner tip="Loading ranking data..." />
        ) : (
          <>
            <Typography.Title level={4}>Top Novels</Typography.Title>
            <Table
              columns={novelColumns}
              dataSource={novelRankings}
              pagination={{ pageSize: 10 }}
              rowKey={(r, idx) => r.novelId || r.id || idx}
              style={{ marginBottom: 24 }}
              scroll={{ x: 400 }}
              className="responsive-table"
            />

            <Typography.Title level={4}>Top Authors</Typography.Title>
            <Table
              columns={authorColumns}
              dataSource={authorRankings}
              pagination={{ pageSize: 10 }}
              rowKey={(r, idx) => r.authorId || r.id || idx}
              style={{ marginBottom: 24 }}
              scroll={{ x: 400 }}
              className="responsive-table"
            />

            <Typography.Title level={4}>Top Readers</Typography.Title>
            <Table
              columns={userColumns}
              dataSource={userRankings}
              pagination={{ pageSize: 10 }}
              rowKey={(r, idx) => r.userId || r.id || idx}
              scroll={{ x: 400 }}
              className="responsive-table"
            />
          </>
        )}
      </Space>
    </div>
  );
};

export default Yuan;
