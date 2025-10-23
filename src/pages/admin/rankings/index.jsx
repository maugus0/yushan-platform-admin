import { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Space,
  Table,
  Tooltip,
  Avatar,
  Typography,
  Tag,
  Form,
  Input,
  Card,
  message,
  Divider,
} from 'antd';
import {
  UserOutlined,
  BookOutlined,
  CalendarOutlined,
  RiseOutlined,
  FallOutlined,
  EyeOutlined,
  StarOutlined,
  CrownOutlined,
  TeamOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  PageHeader,
  FilterPanel,
  EmptyState,
  LoadingSpinner,
} from '../../../components/admin/common';
import { rankingService } from '../../../services/admin/rankingservice';
import { logApiError } from '../../../utils/admin/errorReporting';

// Import default images from assets
import novelDefaultImg from '../../../assets/images/novel_default.png';
import userDefaultImg from '../../../assets/images/user.png';
import userMaleImg from '../../../assets/images/user_male.png';
import userFemaleImg from '../../../assets/images/user_female.png';

const { Text } = Typography;

const Rankings = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState('novels');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Novel rank lookup states
  const [rankLookupLoading, setRankLookupLoading] = useState(false);
  const [rankResult, setRankResult] = useState(null);
  const [form] = Form.useForm();

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper function to safely format numbers
  const safeFormat = (value) => {
    return value != null && !isNaN(value)
      ? Number(value).toLocaleString()
      : '0';
  };

  // Helper function to get user avatar with fallbacks
  const getUserAvatar = (record) => {
    const { avatarUrl, gender } = record;

    // If avatarUrl exists and is not null
    if (avatarUrl) {
      // Check if it's a base64 image
      if (avatarUrl.startsWith('data:image/')) {
        return avatarUrl;
      }
      // Check if it's a hardcoded image name
      if (
        avatarUrl.includes('user.png') ||
        avatarUrl.includes('user_male.png') ||
        avatarUrl.includes('user_female.png')
      ) {
        return `/images/${avatarUrl}`;
      }
      // If it's some other URL, try to use it
      return avatarUrl;
    }

    // Fallback based on gender using imported images
    if (gender === 'male') {
      return userMaleImg;
    } else if (gender === 'female') {
      return userFemaleImg;
    } else {
      return userDefaultImg;
    }
  };

  // Helper function to get novel cover with fallback
  const getNovelCover = (coverImgUrl) => {
    // Check if coverImgUrl exists and is not null/undefined/empty
    if (coverImgUrl && coverImgUrl.trim() !== '') {
      // Check if it's a base64 image
      if (coverImgUrl.startsWith('data:image/')) {
        return coverImgUrl;
      }
      // If it's some other URL, try to use it
      return coverImgUrl;
    }
    // Default fallback using imported image
    return novelDefaultImg;
  };

  // Helper function to handle image load errors
  const handleImageError = (e, fallbackSrc = userDefaultImg) => {
    // Prevent infinite loop by checking if we're already trying to load the fallback
    if (e.target.src !== fallbackSrc) {
      e.target.src = fallbackSrc;
    } else {
      // If even the fallback fails, use a data URL or remove the image
      e.target.style.display = 'none';
    }
  };

  // Helper component for robust image display with loading state
  const RobustImage = ({
    src,
    alt,
    style,
    onError,
    fallbackSrc = novelDefaultImg,
    ...props
  }) => {
    const [loading, setLoading] = useState(true);
    const [currentSrc, setCurrentSrc] = useState(src);
    const [hasFailed, setHasFailed] = useState(false);

    const handleLoad = () => {
      setLoading(false);
    };

    const handleErrorInternal = (e) => {
      setLoading(false);

      // If we haven't failed yet and we're not already using the fallback
      if (!hasFailed && currentSrc !== fallbackSrc) {
        setHasFailed(true);
        setCurrentSrc(fallbackSrc);
      } else {
        // If even the fallback fails, hide the image
        e.target.style.display = 'none';
      }

      if (onError) {
        onError(e);
      }
    };

    // Reset state when src changes
    useEffect(() => {
      setCurrentSrc(src);
      setLoading(true);
      setHasFailed(false);
    }, [src]);

    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {loading && (
          <div
            style={{
              ...style,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f0f0f0',
              color: '#999',
              fontSize: isMobile ? '10px' : '12px',
            }}
          >
            ...
          </div>
        )}
        <img
          src={currentSrc}
          alt={alt}
          style={{
            ...style,
            display: loading ? 'none' : 'block',
          }}
          onLoad={handleLoad}
          onError={handleErrorInternal}
          {...props}
        />
      </div>
    );
  };

  // Fetch data
  const fetchData = useCallback(
    async (params = {}) => {
      setLoading(true);
      try {
        const currentPage = params.current ? params.current - 1 : 0; // Convert to 0-based index
        const currentPageSize = params.pageSize || 10;

        const apiParams = {
          page: currentPage,
          size: currentPageSize,
          timeRange: filters.timeRange || 'overall',
        };

        let response;

        if (activeTab === 'novels') {
          apiParams.sortType = filters.sortType || 'view';
          response = await rankingService.getNovelRankings(apiParams);
        } else if (activeTab === 'authors') {
          apiParams.sortType = filters.sortType || 'vote';
          response = await rankingService.getAuthorRankings(apiParams);
        } else if (activeTab === 'users' || activeTab === 'readers') {
          // For user rankings, use sortBy instead of sortType
          apiParams.sortBy = filters.sortBy || 'level'; // Default to level sorting
          response = await rankingService.getUserRankings(apiParams);
        }

        if (response && response.success) {
          const { content, totalElements } = response.data;

          // Transform data to match table structure
          const transformedData = content.map((item, index) => {
            return {
              id: item.uuid || item.id || index,
              rank: currentPage * currentPageSize + index + 1,
              prevRank: currentPage * currentPageSize + index + 1, // TODO: Calculate from previous ranking
              ...item,
              trend: 'stable', // TODO: Calculate trend from position changes
              lastUpdated:
                item.updateTime || item.createTime || new Date().toISOString(),
            };
          });

          setData(transformedData);
          setPagination((prev) => ({
            ...prev,
            current: params.current || 1,
            total: totalElements,
            pageSize: currentPageSize,
          }));
        } else {
          setData([]);
          setPagination((prev) => ({
            ...prev,
            current: 1,
            total: 0,
          }));
        }
      } catch (error) {
        logApiError(error, `ranking/${activeTab}`, {
          activeTab,
          filters,
          pagination: params,
        });
        message.error('Failed to fetch rankings: ' + error.message);
        setData([]);
        setPagination((prev) => ({
          ...prev,
          current: 1,
          total: 0,
        }));
      } finally {
        setLoading(false);
      }
    },
    [activeTab, filters]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter configurations for different tabs
  const getFilterConfig = () => {
    const baseFilters = [
      {
        name: 'timeRange',
        label: 'Time Range',
        type: 'select',
        options: [
          { value: 'overall', label: 'All Time' },
          { value: 'monthly', label: 'This Month' },
          { value: 'weekly', label: 'This Week' },
          { value: 'daily', label: 'Today' },
        ],
      },
    ];

    if (activeTab === 'novels') {
      return [
        ...baseFilters,
        {
          name: 'sortType',
          label: 'Sort By',
          type: 'select',
          options: [
            { value: 'view', label: 'Most Viewed' },
            { value: 'vote', label: 'Most Voted' },
            { value: 'rating', label: 'Highest Rated' },
            { value: 'latest', label: 'Latest Updates' },
          ],
        },
      ];
    } else if (activeTab === 'authors') {
      return [
        ...baseFilters,
        {
          name: 'sortType',
          label: 'Sort By',
          type: 'select',
          options: [
            { value: 'vote', label: 'Most Voted' },
            { value: 'follower', label: 'Most Followers' },
            { value: 'works', label: 'Most Works' },
          ],
        },
      ];
    } else {
      // Users/Readers
      return [
        ...baseFilters,
        {
          name: 'sortBy',
          label: 'Sort By',
          type: 'select',
          options: [
            { value: 'level', label: 'Level' },
            { value: 'exp', label: 'Experience Points' },
            { value: 'readTime', label: 'Reading Time' },
          ],
        },
      ];
    }
  }; // Dynamic columns based on active tab
  const getColumns = () => {
    const baseColumns = [
      {
        title: 'Rank',
        dataIndex: 'rank',
        key: 'rank',
        width: 80,
        render: (rank, record) => (
          <Space>
            {rank <= 3 && (
              <CrownOutlined
                style={{
                  color:
                    rank === 1 ? '#ffd700' : rank === 2 ? '#c0c0c0' : '#cd7f32',
                }}
              />
            )}
            <Text strong style={{ fontSize: '16px' }}>
              #{rank}
            </Text>
            {record.trend === 'rising' && (
              <RiseOutlined style={{ color: '#52c41a' }} />
            )}
            {record.trend === 'falling' && (
              <FallOutlined style={{ color: '#ff4d4f' }} />
            )}
          </Space>
        ),
      },
    ];

    if (activeTab === 'novels') {
      return [
        ...baseColumns,
        {
          title: 'Novel',
          key: 'novel',
          render: (_, record) => (
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Space wrap size={[4, 2]}>
                <RobustImage
                  src={getNovelCover(record.coverImgUrl)}
                  alt={record.title}
                  style={{
                    width: isMobile ? '40px' : '50px',
                    height: isMobile ? '60px' : '75px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: '1px solid #d9d9d9',
                  }}
                  fallbackSrc={novelDefaultImg}
                />
                <Space direction="vertical" size={2} style={{ flex: 1 }}>
                  <Text strong style={{ fontSize: isMobile ? '13px' : '15px' }}>
                    {record.title}
                  </Text>
                  <Tag
                    color="blue"
                    style={{ fontSize: isMobile ? '10px' : '12px' }}
                  >
                    {record.categoryName}
                  </Tag>
                  <Text
                    type="secondary"
                    style={{ fontSize: isMobile ? '11px' : '14px' }}
                  >
                    ID: {record.id}
                  </Text>
                </Space>
              </Space>
            </Space>
          ),
        },
        {
          title: 'Performance',
          key: 'performance',
          render: (_, record) => (
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Space wrap size={[4, 2]}>
                <EyeOutlined />
                <Text style={{ fontSize: isMobile ? '11px' : '14px' }}>
                  {safeFormat(record.viewCnt)} views
                </Text>
              </Space>
              <Space wrap size={[4, 2]}>
                <StarOutlined />
                <Text style={{ fontSize: isMobile ? '11px' : '14px' }}>
                  {safeFormat(record.voteCnt)} votes
                </Text>
              </Space>
              {record.avgRating && (
                <Space wrap size={[4, 2]}>
                  <Text style={{ fontSize: isMobile ? '11px' : '14px' }}>
                    Rating: {record.avgRating}/5
                  </Text>
                </Space>
              )}
            </Space>
          ),
        },
      ];
    } else if (activeTab === 'authors') {
      return [
        ...baseColumns,
        {
          title: 'Author',
          key: 'author',
          render: (_, record) => (
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Space wrap size={[4, 2]}>
                <Avatar
                  size={isMobile ? 'small' : 'default'}
                  src={
                    <img
                      src={getUserAvatar(record)}
                      alt={record.username}
                      onError={(e) => handleImageError(e, userDefaultImg)}
                    />
                  }
                  icon={<UserOutlined />}
                />
                <Text strong style={{ fontSize: isMobile ? '13px' : '15px' }}>
                  {record.username}
                </Text>
              </Space>
              <Space wrap size={[4, 2]}>
                <BookOutlined />
                <Text
                  type="secondary"
                  style={{ fontSize: isMobile ? '11px' : '14px' }}
                >
                  {record.novelNum || 0} novels
                </Text>
              </Space>
            </Space>
          ),
        },
        {
          title: 'Statistics',
          key: 'stats',
          render: (_, record) => (
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Space wrap size={[4, 2]}>
                <EyeOutlined />
                <Text style={{ fontSize: isMobile ? '11px' : '14px' }}>
                  {safeFormat(record.totalViewCnt)} total views
                </Text>
              </Space>
              <Space wrap size={[4, 2]}>
                <StarOutlined />
                <Text style={{ fontSize: isMobile ? '11px' : '14px' }}>
                  {safeFormat(record.totalVoteCnt)} total votes
                </Text>
              </Space>
            </Space>
          ),
        },
      ];
    } else {
      return [
        ...baseColumns,
        {
          title: 'Reader',
          key: 'reader',
          render: (_, record) => (
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Space wrap size={[4, 2]}>
                <Avatar
                  size={isMobile ? 'small' : 'default'}
                  src={
                    <img
                      src={getUserAvatar(record)}
                      alt={record.username}
                      onError={(e) => handleImageError(e, userDefaultImg)}
                    />
                  }
                  icon={<UserOutlined />}
                />
                <Text strong style={{ fontSize: isMobile ? '13px' : '15px' }}>
                  {record.username}
                </Text>
              </Space>
              <Tag
                color="gold"
                style={{ fontSize: isMobile ? '10px' : '12px' }}
              >
                Level {record.level}
              </Tag>
            </Space>
          ),
        },
        {
          title: 'Activity',
          key: 'activity',
          render: (_, record) => (
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Space wrap size={[4, 2]}>
                <Text style={{ fontSize: isMobile ? '11px' : '14px' }}>
                  EXP: {safeFormat(record.exp)}
                </Text>
              </Space>
              {record.readTime && (
                <Space wrap size={[4, 2]}>
                  <Text
                    type="secondary"
                    style={{ fontSize: isMobile ? '11px' : '14px' }}
                  >
                    {safeFormat(record.readTime)}h reading time
                  </Text>
                </Space>
              )}
              {record.readBookNum && (
                <Space wrap size={[4, 2]}>
                  <BookOutlined />
                  <Text
                    type="secondary"
                    style={{ fontSize: isMobile ? '11px' : '14px' }}
                  >
                    {safeFormat(record.readBookNum)} books
                  </Text>
                </Space>
              )}
            </Space>
          ),
        },
      ];
    }
  };

  // Tab configuration
  const tabs = [
    { key: 'novels', label: 'Novel Rankings', icon: <BookOutlined /> },
    { key: 'authors', label: 'Author Rankings', icon: <UserOutlined /> },
    { key: 'readers', label: 'Reader Rankings', icon: <TeamOutlined /> },
  ];

  // Novel rank lookup function
  const handleNovelRankLookup = async (values) => {
    setRankLookupLoading(true);
    setRankResult(null);

    try {
      const response = await rankingService.getNovelRank(values.novelId);

      if (response.success) {
        const isInTop100 = response.data !== null;

        if (isInTop100) {
          // When novel is in rankings, response.data is an object with rank info
          const rankData = response.data;
          setRankResult({
            novelId: values.novelId,
            isInTop100: true,
            rank: rankData.rank,
            score: rankData.score,
            rankType: rankData.rankType,
            message: response.message,
          });

          message.success(
            `Novel is ranked #${rankData.rank} in ${rankData.rankType}!`
          );
        } else {
          // When novel is not in rankings, response.data is null
          setRankResult({
            novelId: values.novelId,
            isInTop100: false,
            rank: null,
            score: null,
            rankType: null,
            message: response.message,
          });

          message.info(
            response.message || 'Novel is not in the top 100 rankings.'
          );
        }
      }
    } catch (error) {
      logApiError(error, 'ranking/novel/rank', { novelId: values.novelId });
      message.error('Failed to fetch novel rank: ' + error.message);
    } finally {
      setRankLookupLoading(false);
    }
  };

  // Handlers
  const handleFilter = (filterValues) => {
    setFilters(filterValues);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleTableChange = (paginationInfo) => {
    fetchData(paginationInfo);
  };

  const columns = [
    ...getColumns(),
    {
      title: 'Updated',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: (date) => (
        <Tooltip
          title={date ? new Date(date).toLocaleString() : 'No date available'}
        >
          <Space>
            <CalendarOutlined />
            <Text style={{ fontSize: isMobile ? '11px' : '14px' }}>
              {date ? new Date(date).toLocaleDateString() : 'N/A'}
            </Text>
          </Space>
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={
          <span style={{ fontSize: isMobile ? '18px' : '24px' }}>
            Rankings Management
          </span>
        }
        subtitle={
          <span style={{ fontSize: isMobile ? '12px' : '14px' }}>
            View and analyze platform rankings
          </span>
        }
        breadcrumbs={[
          { title: 'Dashboard', href: '/yushan-admin/admin/dashboard' },
          { title: 'Rankings' },
        ]}
      />

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Tab Navigation */}
        <Space wrap style={{ width: '100%', justifyContent: 'center' }}>
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              type={activeTab === tab.key ? 'primary' : 'default'}
              icon={tab.icon}
              onClick={() => setActiveTab(tab.key)}
              style={{
                minWidth: 'auto',
                fontSize: isMobile ? '12px' : '14px',
                padding: isMobile ? '4px 8px' : undefined,
              }}
            >
              {isMobile ? tab.icon : tab.label}
            </Button>
          ))}
        </Space>

        <FilterPanel
          filters={getFilterConfig()}
          onFilter={handleFilter}
          onClear={handleClearFilters}
          collapsed={true}
          showToggle={true}
        />

        {/* Novel Rank Lookup Form */}
        <Card
          title={
            <Space>
              <SearchOutlined />
              <span style={{ fontSize: isMobile ? '14px' : '16px' }}>
                Novel Rank Lookup
              </span>
            </Space>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Form
            form={form}
            layout={isMobile ? 'vertical' : 'inline'}
            onFinish={handleNovelRankLookup}
            style={{ width: '100%' }}
          >
            <Form.Item
              name="novelId"
              rules={[
                { required: true, message: 'Please enter a novel ID' },
                {
                  pattern: /^\d+$/,
                  message: 'Novel ID must be a number',
                },
              ]}
              style={{ flex: 1, marginBottom: isMobile ? 8 : 0 }}
            >
              <Input
                placeholder="Enter novel ID to check its ranking"
                disabled={rankLookupLoading}
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={rankLookupLoading}
                icon={<SearchOutlined />}
                style={{ width: isMobile ? '100%' : 'auto' }}
              >
                Check Rank
              </Button>
            </Form.Item>
          </Form>

          {rankResult && (
            <>
              <Divider style={{ margin: '16px 0' }} />
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Novel ID: {rankResult.novelId}</Text>
                {rankResult.isInTop100 ? (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text type="success">
                      🏆 Ranked #{rankResult.rank} in {rankResult.rankType}
                    </Text>
                    <Text>📊 Score: {rankResult.score}</Text>
                    <Text type="secondary">{rankResult.message}</Text>
                  </Space>
                ) : (
                  <Text type="secondary">📊 {rankResult.message}</Text>
                )}
              </Space>
            </>
          )}
        </Card>

        {loading ? (
          <LoadingSpinner tip={`Loading ${activeTab} rankings...`} />
        ) : data.length === 0 ? (
          <EmptyState
            title="No Rankings Found"
            description={`No ${activeTab} match your current filter criteria.`}
            actions={[
              {
                children: 'Clear Filters',
                onClick: handleClearFilters,
              },
            ]}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={data}
            pagination={{
              ...pagination,
              showSizeChanger: !isMobile,
              showQuickJumper: !isMobile,
              showTotal: (total, range) =>
                !isMobile
                  ? `${range[0]}-${range[1]} of ${total} ${activeTab}`
                  : `${total} ${activeTab}`,
              size: isMobile ? 'small' : 'default',
            }}
            onChange={handleTableChange}
            loading={loading}
            rowKey="id"
            scroll={{
              x: isMobile ? 800 : 1200,
              scrollToFirstRowOnChange: true,
            }}
            size={isMobile ? 'small' : 'default'}
          />
        )}
      </Space>
    </div>
  );
};

export default Rankings;
