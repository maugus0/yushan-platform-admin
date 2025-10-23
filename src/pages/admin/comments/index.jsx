import { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Space,
  Table,
  Tooltip,
  Typography,
  message,
  Modal,
  Grid,
  Card,
  Divider,
} from 'antd';
import {
  MessageOutlined,
  BookOutlined,
  CalendarOutlined,
  LikeOutlined,
  DeleteOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import {
  PageHeader,
  SearchBar,
  FilterPanel,
  StatusBadge,
  EmptyState,
  LoadingSpinner,
} from '../../../components/admin/common';
import commentService from '../../../services/admin/commentservice';

const { Text, Paragraph } = Typography;
const { confirm } = Modal;
const { useBreakpoint } = Grid;

const Comments = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('createTime');
  const [sortOrder, setSortOrder] = useState('desc');
  const [statLoading, setStatLoading] = useState(false);
  const screens = useBreakpoint() || { md: true };

  // Fetch data from API
  const fetchData = useCallback(
    async (paginationInfo = null) => {
      setLoading(true);
      try {
        const pageNum = paginationInfo?.current
          ? paginationInfo.current - 1
          : 0; // Convert to 0-based
        const pageSize = paginationInfo?.pageSize || pagination.pageSize;

        const response = await commentService.getAllComments({
          page: pageNum,
          pageSize,
          sort: sortBy,
          order: sortOrder,
          search: searchValue,
          ...(filters.isSpoiler !== undefined && {
            isSpoiler: filters.isSpoiler,
          }),
        });

        if (response.success) {
          setData(response.data);
          setPagination((prev) => ({
            ...prev,
            current: pageNum + 1, // Convert back to 1-based for Ant Design
            pageSize,
            total: response.total,
            totalPages: response.totalPages,
          }));
        } else {
          message.error(response.error || 'Failed to fetch comments');
          setData([]);
        }
      } catch (error) {
        console.error('Failed to fetch comments:', error);
        message.error('Failed to fetch comments');
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [sortBy, sortOrder, searchValue, filters, pagination.pageSize]
  );

  // Initial fetch and refetch on filter/search change
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, filters, sortBy, sortOrder]);

  // Filter configuration
  const filterConfig = [
    {
      name: 'isSpoiler',
      label: 'Spoiler Status',
      type: 'select',
      options: [
        { value: true, label: 'Spoiler' },
        { value: false, label: 'Not Spoiler' },
      ],
    },
  ];

  // Handle View Statistics
  const handleViewStatistics = async (record) => {
    setStatLoading(true);
    try {
      const response = await commentService.getCommentStatistics(
        record.chapterId
      );

      if (response.success) {
        const stats = response.data;
        Modal.info({
          title: `Comment Statistics - ${stats.chapterTitle}`,
          width: 500,
          content: (
            <div style={{ marginTop: 16 }}>
              <p>
                <strong>Chapter ID:</strong> {stats.chapterId}
              </p>
              <p>
                <strong>Total Comments:</strong> {stats.totalComments}
              </p>
              <p>
                <strong>Spoiler Comments:</strong> {stats.spoilerComments}
              </p>
              <p>
                <strong>Non-Spoiler Comments:</strong>{' '}
                {stats.nonSpoilerComments}
              </p>
              <p>
                <strong>Average Likes per Comment:</strong>{' '}
                {stats.avgLikesPerComment}
              </p>
              <p>
                <strong>Most Liked Comment ID:</strong>{' '}
                {stats.mostLikedCommentId}
              </p>
            </div>
          ),
          okText: 'Close',
        });
      } else {
        message.error(response.error || 'Failed to fetch statistics');
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      message.error('Failed to fetch comment statistics');
    } finally {
      setStatLoading(false);
    }
  };

  // Handle Delete Comment
  const handleDeleteComment = (record) => {
    confirm({
      title: 'Delete Comment',
      content: `Are you sure you want to delete this comment? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        return deleteCommentAsync(record.id);
      },
    });
  };

  const deleteCommentAsync = async (commentId) => {
    try {
      const response = await commentService.deleteCommentAdmin(commentId);

      if (response.success) {
        message.success('Comment deleted successfully');
        // Refresh the data
        fetchData({
          current: pagination.current,
          pageSize: pagination.pageSize,
        });
      } else {
        message.error(response.error || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      message.error('Failed to delete comment');
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Comment',
      dataIndex: 'content',
      key: 'content',
      render: (text, record) => (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Space>
            <Text strong>{record.username}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.chapterTitle && `on ${record.chapterTitle}`}
            </Text>
          </Space>
          <Paragraph
            ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
            style={{ margin: 0, maxWidth: 400 }}
          >
            {text}
          </Paragraph>
          {record.chapterId && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <BookOutlined style={{ marginRight: 4 }} />
              Chapter ID: {record.chapterId}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Spoiler',
      dataIndex: 'isSpoiler',
      key: 'isSpoiler',
      width: 100,
      render: (isSpoiler) => (
        <StatusBadge status={isSpoiler ? 'flagged' : 'approved'} />
      ),
    },
    {
      title: 'Engagement',
      key: 'engagement',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <LikeOutlined style={{ color: '#52c41a' }} />
            <span>{record.likes}</span>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <Tooltip title={new Date(date).toLocaleString()}>
          <Space>
            <CalendarOutlined />
            {new Date(date).toLocaleDateString()}
          </Space>
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<BarChartOutlined />}
            onClick={() => handleViewStatistics(record)}
            loading={statLoading}
          >
            Statistics
          </Button>
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteComment(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  // Handlers
  const handleSearch = (value) => {
    setSearchValue(value);
  };

  const handleFilter = (filterValues) => {
    setFilters(filterValues);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchValue('');
  };

  const handleTableChange = (paginationInfo, filters, sorter) => {
    // Handle sorting
    if (sorter.field) {
      setSortBy(sorter.field);
      setSortOrder(sorter.order === 'descend' ? 'desc' : 'asc');
    }
    // Fetch with new pagination
    fetchData(paginationInfo);
  };

  return (
    <div>
      <PageHeader
        title="Comments Management"
        subtitle="Moderate and manage user comments"
        breadcrumbs={[
          { title: 'Dashboard', href: '/yushan-admin/admin/dashboard' },
          { title: 'Comments' },
        ]}
        actions={[
          <Button key="spoiler" type="default" icon={<MessageOutlined />}>
            Spoiler Comments ({data.filter((item) => item.isSpoiler).length})
          </Button>,
        ]}
      />

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <SearchBar
          placeholder="Search comments by content or author..."
          onSearch={handleSearch}
          onClear={() => setSearchValue('')}
          searchValue={searchValue}
          showFilter={true}
          loading={loading}
        />

        <FilterPanel
          filters={filterConfig}
          onFilter={handleFilter}
          onClear={handleClearFilters}
          collapsed={true}
          showToggle={true}
        />

        {loading ? (
          <LoadingSpinner tip="Loading comments..." />
        ) : data.length === 0 ? (
          <EmptyState
            title="No Comments Found"
            description="No comments match your current search and filter criteria."
            actions={[
              {
                children: 'Clear Filters',
                onClick: handleClearFilters,
              },
            ]}
          />
        ) : screens.md ? (
          // Desktop view - Table
          <Table
            columns={columns}
            dataSource={data}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              totalPages: pagination.totalPages,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} comments`,
            }}
            onChange={handleTableChange}
            loading={loading}
            rowKey="id"
            scroll={{ x: 1000 }}
          />
        ) : (
          // Mobile view - Card
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            {data.map((comment) => (
              <Card key={comment.id} style={{ marginBottom: 8 }}>
                <Space
                  direction="vertical"
                  style={{ width: '100%' }}
                  size="small"
                >
                  <div>
                    <Text strong>{comment.username}</Text>
                    {comment.chapterTitle && (
                      <Text
                        type="secondary"
                        style={{ fontSize: '12px', marginLeft: 8 }}
                      >
                        on {comment.chapterTitle}
                      </Text>
                    )}
                  </div>
                  <Paragraph
                    ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
                    style={{ margin: 0 }}
                  >
                    {comment.content}
                  </Paragraph>
                  <Divider style={{ margin: '8px 0' }} />
                  <div>
                    <Space size="small" wrap>
                      <Space size={4}>
                        <LikeOutlined style={{ color: '#52c41a' }} />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {comment.likes}
                        </Text>
                      </Space>
                      <StatusBadge
                        status={comment.isSpoiler ? 'flagged' : 'approved'}
                      />
                    </Space>
                  </div>
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </Text>
                  <Divider style={{ margin: '8px 0' }} />
                  <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Button
                      type="primary"
                      size="small"
                      icon={<BarChartOutlined />}
                      onClick={() => handleViewStatistics(comment)}
                      loading={statLoading}
                    >
                      Stats
                    </Button>
                    <Button
                      type="primary"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteComment(comment)}
                    >
                      Delete
                    </Button>
                  </Space>
                </Space>
              </Card>
            ))}
            {/* Mobile Pagination */}
            <Space
              direction="vertical"
              style={{ width: '100%', marginTop: 16, textAlign: 'center' }}
            >
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {pagination.current} of {pagination.totalPages} pages
              </Text>
              <Space justify="center">
                <Button
                  size="small"
                  disabled={pagination.current === 1}
                  onClick={() =>
                    fetchData({
                      current: pagination.current - 1,
                      pageSize: pagination.pageSize,
                    })
                  }
                >
                  Previous
                </Button>
                <Button
                  size="small"
                  disabled={pagination.current === pagination.totalPages}
                  onClick={() =>
                    fetchData({
                      current: pagination.current + 1,
                      pageSize: pagination.pageSize,
                    })
                  }
                >
                  Next
                </Button>
              </Space>
            </Space>
          </Space>
        )}
      </Space>
    </div>
  );
};

export default Comments;
