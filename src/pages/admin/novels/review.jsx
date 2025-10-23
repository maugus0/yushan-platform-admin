import { useState, useEffect, useCallback } from 'react';
import {
  Space,
  Table,
  Badge,
  Rate,
  message,
  Button,
  Popconfirm,
  Tag,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  UserOutlined,
  EyeOutlined,
  FileTextOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import {
  PageHeader,
  SearchBar,
  EmptyState,
  LoadingSpinner,
} from '../../../components/admin/common';
import { novelService } from '../../../services/admin/novelservice';
import defaultNovelImage from '../../../assets/images/novel_default.png';

const ReviewNovels = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchValue, setSearchValue] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  // Fetch novels under review
  const fetchData = useCallback(
    async (params = {}) => {
      setLoading(true);
      try {
        const currentPage = params.current || 1;
        const currentPageSize = params.pageSize || 10;

        const response = await novelService.getAllNovels({
          page: currentPage - 1, // Convert to 0-indexed
          size: currentPageSize,
          search: searchValue,
          sort: params.sortBy || 'createTime',
          order: params.sortOrder || 'desc',
          status: 'UNDER_REVIEW', // Only fetch novels under review
        });

        setData(response.data);
        setPagination((prev) => ({
          ...prev,
          current: response.page,
          total: response.total,
          pageSize: response.pageSize,
        }));
      } catch (error) {
        console.error('Failed to fetch novels under review:', error);
        message.error('Failed to fetch novels under review');
      } finally {
        setLoading(false);
      }
    },
    [searchValue]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle approve novel
  const handleApprove = async (record) => {
    setActionLoading((prev) => ({ ...prev, [record.id]: 'approving' }));
    try {
      const response = await novelService.approveNovel(record.id);
      message.success(
        response.message || 'Novel approved and published successfully'
      );
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Failed to approve novel:', error);
      message.error(error.message || 'Failed to approve novel');
    } finally {
      setActionLoading((prev) => ({ ...prev, [record.id]: null }));
    }
  };

  // Handle reject novel
  const handleReject = async (record) => {
    setActionLoading((prev) => ({ ...prev, [record.id]: 'rejecting' }));
    try {
      const response = await novelService.rejectNovel(record.id);
      message.success(response.message || 'Novel rejected successfully');
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Failed to reject novel:', error);
      message.error(error.message || 'Failed to reject novel');
    } finally {
      setActionLoading((prev) => ({ ...prev, [record.id]: null }));
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Novel Info',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      render: (text, record) => (
        <Space>
          <img
            src={
              record.coverImgUrl && record.coverImgUrl.startsWith('data:image')
                ? record.coverImgUrl
                : defaultNovelImage
            }
            alt={text || 'Novel'}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultNovelImage;
            }}
            style={{
              width: 40,
              height: 60,
              objectFit: 'cover',
              borderRadius: 4,
              border: '1px solid #f0f0f0',
            }}
          />
          <div>
            <div style={{ fontWeight: 500, marginBottom: 2 }}>
              {text || 'Untitled'}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <UserOutlined style={{ marginRight: 4 }} />
              by {record.authorUsername || 'Unknown'}
            </div>
            <div style={{ fontSize: '11px', color: '#999' }}>
              Author ID:{' '}
              {record.authorId ? record.authorId.substring(0, 8) : 'N/A'}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'UUID',
      dataIndex: 'uuid',
      key: 'uuid',
      width: 120,
      render: (uuid) => (
        <span style={{ fontSize: '11px', fontFamily: 'monospace' }}>
          {uuid ? uuid.substring(0, 8) : 'N/A'}...
        </span>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 120,
      render: (category) => (
        <Tag color="blue">
          <TagsOutlined style={{ marginRight: 4 }} />
          {category || 'Uncategorized'}
        </Tag>
      ),
    },
    {
      title: 'Synopsis',
      dataIndex: 'synopsis',
      key: 'synopsis',
      width: 250,
      ellipsis: true,
      render: (text) => (
        <div style={{ fontSize: '12px', color: '#666' }}>
          {text || 'No synopsis provided'}
        </div>
      ),
    },
    {
      title: 'Content Stats',
      key: 'content',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px', marginBottom: 4 }}>
            <FileTextOutlined style={{ marginRight: 4 }} />
            <strong>{record.chapterCnt || 0}</strong> chapters
          </div>
          <div style={{ fontSize: '12px', marginBottom: 4 }}>
            📝 <strong>{(record.wordCnt || 0).toLocaleString()}</strong> words
          </div>
          <div style={{ fontSize: '12px' }}>
            {record.isCompleted ? (
              <Tag color="success">✅ Complete</Tag>
            ) : (
              <Tag color="processing">📝 Ongoing</Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Engagement',
      key: 'engagement',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px', marginBottom: 2 }}>
            <EyeOutlined style={{ marginRight: 4, color: '#1890ff' }} />
            <strong>{(record.viewCnt || 0).toLocaleString()}</strong> views
          </div>
          <div style={{ fontSize: '12px', marginBottom: 2 }}>
            👍 <strong>{(record.voteCnt || 0).toLocaleString()}</strong> votes
          </div>
          <div style={{ fontSize: '12px', marginBottom: 2 }}>
            💬 <strong>{(record.reviewCnt || 0).toLocaleString()}</strong>{' '}
            reviews
          </div>
          <div>
            <Rate
              disabled
              value={parseFloat(record.avgRating || 0)}
              size="small"
            />
            <span style={{ fontSize: '11px', color: '#666', marginLeft: 4 }}>
              ({record.avgRating ? record.avgRating.toFixed(2) : '0.00'})
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Revenue',
      dataIndex: 'yuanCnt',
      key: 'yuanCnt',
      width: 100,
      render: (yuanCnt) => (
        <div>
          {(yuanCnt || 0) > 0 ? (
            <div>
              <Badge color="gold" text="Premium" style={{ marginBottom: 4 }} />
              <div
                style={{ fontSize: '13px', fontWeight: 500, color: '#52c41a' }}
              >
                ¥{(yuanCnt || 0).toFixed(2)}
              </div>
            </div>
          ) : (
            <Tag>Free</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Dates',
      key: 'dates',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '11px', marginBottom: 4 }}>
            <div style={{ color: '#666' }}>Created:</div>
            <div>{new Date(record.createTime).toLocaleDateString()}</div>
          </div>
          <div style={{ fontSize: '11px', marginBottom: 4 }}>
            <div style={{ color: '#666' }}>Updated:</div>
            <div>{new Date(record.updateTime).toLocaleDateString()}</div>
          </div>
          {record.publishTime && (
            <div style={{ fontSize: '11px' }}>
              <div style={{ color: '#666' }}>Published:</div>
              <div>{new Date(record.publishTime).toLocaleDateString()}</div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Approve Novel"
            description="Are you sure you want to approve and publish this novel?"
            onConfirm={() => handleApprove(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              icon={<CheckOutlined />}
              loading={actionLoading[record.id] === 'approving'}
              disabled={actionLoading[record.id] === 'rejecting'}
              size="small"
            >
              Approve
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Reject Novel"
            description="Are you sure you want to reject this novel?"
            onConfirm={() => handleReject(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              icon={<CloseOutlined />}
              loading={actionLoading[record.id] === 'rejecting'}
              disabled={actionLoading[record.id] === 'approving'}
              size="small"
            >
              Reject
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Handlers
  const handleSearch = (value) => {
    setSearchValue(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (paginationInfo) => {
    fetchData(paginationInfo);
  };

  return (
    <div>
      <PageHeader
        title="Review Novels"
        subtitle="Review and approve novels submitted by authors"
        breadcrumbs={[
          { title: 'Dashboard', href: '/yushan-admin/admin/dashboard' },
          { title: 'Novels', href: '/yushan-admin/admin/novels' },
          { title: 'Review' },
        ]}
      />

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <SearchBar
          placeholder="Search novels by title, author, or description..."
          onSearch={handleSearch}
          onClear={() => setSearchValue('')}
          searchValue={searchValue}
          showFilter={false}
          loading={loading}
        />

        {loading ? (
          <LoadingSpinner tip="Loading novels under review..." />
        ) : data.length === 0 ? (
          <EmptyState
            type="novels"
            title="No Novels Under Review"
            description="There are currently no novels waiting for review."
            actions={[
              {
                children: 'Refresh',
                onClick: () => fetchData(),
              },
            ]}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={data}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} novels under review`,
            }}
            onChange={handleTableChange}
            loading={loading}
            rowKey="id"
            scroll={{ x: 1400 }}
          />
        )}
      </Space>
    </div>
  );
};

export default ReviewNovels;
