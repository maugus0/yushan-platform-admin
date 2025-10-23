import { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Space,
  Table,
  Tooltip,
  Typography,
  Rate,
  message,
  Modal,
  Grid,
  Card,
  Divider,
} from 'antd';
import {
  BookOutlined,
  CalendarOutlined,
  LikeOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  PageHeader,
  SearchBar,
  FilterPanel,
  StatusBadge,
  EmptyState,
  LoadingSpinner,
} from '../../../components/admin/common';
import reviewService from '../../../services/admin/reviewservice';

const { Text, Paragraph } = Typography;
const { confirm } = Modal;
const { useBreakpoint } = Grid;

const Reviews = () => {
  const [loading, setLoading] = useState(false);
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
  const screens = useBreakpoint();

  // Fetch data from API
  const fetchData = useCallback(
    async (paginationInfo = null) => {
      setLoading(true);
      try {
        const pageNum = paginationInfo?.current
          ? paginationInfo.current - 1
          : 0; // Convert to 0-based
        const pageSize = paginationInfo?.pageSize || pagination.pageSize;

        const response = await reviewService.getAllReviews({
          page: pageNum,
          pageSize,
          sort: sortBy,
          order: sortOrder,
          search: searchValue,
          ...(filters.rating && { rating: parseInt(filters.rating) }),
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
          message.error(response.error || 'Failed to fetch reviews');
          setData([]);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        message.error('Failed to fetch reviews');
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
      name: 'rating',
      label: 'Rating',
      type: 'select',
      options: [
        { value: '1', label: '1 Star' },
        { value: '2', label: '2 Stars' },
        { value: '3', label: '3 Stars' },
        { value: '4', label: '4 Stars' },
        { value: '5', label: '5 Stars' },
      ],
    },
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

  // Handle Delete Review
  const handleDeleteReview = (record) => {
    confirm({
      title: 'Delete Review',
      content: `Are you sure you want to delete this review? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        return deleteReviewAsync(record.id);
      },
    });
  };

  const deleteReviewAsync = async (reviewId) => {
    try {
      const response = await reviewService.deleteReviewAdmin(reviewId);

      if (response.success) {
        message.success('Review deleted successfully');
        // Refresh the data
        fetchData({
          current: pagination.current,
          pageSize: pagination.pageSize,
        });
      } else {
        message.error(response.error || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
      message.error('Failed to delete review');
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Review',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Space>
            <Text strong>{record.username}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              on {record.novelTitle}
            </Text>
          </Space>
          <div>
            <Text strong>{text}</Text>
          </div>
          <Paragraph
            ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
            style={{ margin: 0, maxWidth: 400 }}
          >
            {record.content}
          </Paragraph>
          {record.chapterId && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <BookOutlined style={{ marginRight: 4 }} />
              Novel ID: {record.novelId}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 100,
      render: (rating) => <Rate disabled value={rating} />,
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
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteReview(record)}
        >
          Delete
        </Button>
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
        title="Reviews Management"
        subtitle="Moderate and manage user reviews"
        breadcrumbs={[
          { title: 'Dashboard', href: '/yushan-admin/admin/dashboard' },
          { title: 'Reviews' },
        ]}
        actions={[
          <Button key="spoiler" type="default" icon={<BookOutlined />}>
            Spoiler Reviews ({data.filter((item) => item.isSpoiler).length})
          </Button>,
        ]}
      />

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <SearchBar
          placeholder="Search reviews by title, content, or author..."
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
          <LoadingSpinner tip="Loading reviews..." />
        ) : data.length === 0 ? (
          <EmptyState
            title="No Reviews Found"
            description="No reviews match your current search and filter criteria."
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
                `${range[0]}-${range[1]} of ${total} reviews`,
            }}
            onChange={handleTableChange}
            loading={loading}
            rowKey="id"
            scroll={{ x: 1000 }}
          />
        ) : (
          // Mobile view - Card
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            {data.map((review) => (
              <Card key={review.id} style={{ marginBottom: 8 }}>
                <Space
                  direction="vertical"
                  style={{ width: '100%' }}
                  size="small"
                >
                  <div>
                    <Text strong style={{ fontSize: '14px' }}>
                      {review.title}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      by {review.username} on {review.novelTitle}
                    </Text>
                  </div>
                  <Divider style={{ margin: '8px 0' }} />
                  <Paragraph
                    ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
                    style={{ margin: 0, fontSize: '13px' }}
                  >
                    {review.content}
                  </Paragraph>
                  <Divider style={{ margin: '8px 0' }} />
                  <div>
                    <Rate disabled value={review.rating} />
                  </div>
                  <Divider style={{ margin: '8px 0' }} />
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Space size="small">
                      <Space size={4}>
                        <LikeOutlined style={{ color: '#52c41a' }} />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {review.likes}
                        </Text>
                      </Space>
                      <StatusBadge
                        status={review.isSpoiler ? 'flagged' : 'approved'}
                      />
                    </Space>
                    <Button
                      type="primary"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteReview(review)}
                    >
                      Delete
                    </Button>
                  </div>
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Text>
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
              <Space justify="center" wrap>
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

export default Reviews;
