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
  EyeInvisibleOutlined,
  EyeOutlined,
  InboxOutlined,
  UserOutlined,
  FileTextOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import {
  PageHeader,
  SearchBar,
  FilterPanel,
  StatusBadge,
  EmptyState,
  LoadingSpinner,
} from '../../../components/admin/common';
import { novelService } from '../../../services/admin/novelservice';
import { categoryService } from '../../../services/admin/categoryservice';
import defaultNovelImage from '../../../assets/images/novel_default.png';

const ModerateNovels = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [categories, setCategories] = useState([]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryService.getAllCategories({
        includeInactive: false,
      });
      if (response.success) {
        const categoryOptions = response.data.map((cat) => ({
          value: cat.id,
          label: cat.name,
        }));
        setCategories(categoryOptions);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch all novels (all statuses)
  const fetchData = useCallback(
    async (params = {}) => {
      setLoading(true);
      try {
        const currentPage = params.current || 1;
        const currentPageSize = params.pageSize || 10;

        const response = await novelService.getAllNovels({
          page: currentPage - 1,
          size: currentPageSize,
          search: searchValue,
          sort: params.sortBy || 'createTime',
          order: params.sortOrder || 'desc',
          category: filters.category || '',
          status: filters.status || '',
          authorName: filters.authorName || '',
          authorId: filters.authorId || '',
        });

        setData(response.data);
        setPagination((prev) => ({
          ...prev,
          current: response.page,
          total: response.total,
          pageSize: response.pageSize,
        }));
      } catch (error) {
        console.error('Failed to fetch novels:', error);
        message.error('Failed to fetch novels');
      } finally {
        setLoading(false);
      }
    },
    [searchValue, filters]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter configuration
  const filterConfig = [
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'DRAFT', label: 'Draft' },
        { value: 'UNDER_REVIEW', label: 'Under Review' },
        { value: 'PUBLISHED', label: 'Published' },
        { value: 'ARCHIVED', label: 'Archived' },
      ],
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      options: categories,
    },
    {
      name: 'authorName',
      label: 'Author Name',
      type: 'text',
      placeholder: 'Search by author name...',
    },
    {
      name: 'authorId',
      label: 'Author ID',
      type: 'text',
      placeholder: 'Enter author ID...',
    },
  ];

  // Handle hide novel
  const handleHide = async (record) => {
    setActionLoading((prev) => ({ ...prev, [record.id]: 'hiding' }));
    try {
      const response = await novelService.hideNovel(record.id);
      message.success(response.message || 'Novel hidden successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to hide novel:', error);
      message.error(error.message || 'Failed to hide novel');
    } finally {
      setActionLoading((prev) => ({ ...prev, [record.id]: null }));
    }
  };

  // Handle unhide novel
  const handleUnhide = async (record) => {
    setActionLoading((prev) => ({ ...prev, [record.id]: 'unhiding' }));
    try {
      const response = await novelService.unhideNovel(record.id);
      message.success(response.message || 'Novel unhidden successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to unhide novel:', error);
      message.error(error.message || 'Failed to unhide novel');
    } finally {
      setActionLoading((prev) => ({ ...prev, [record.id]: null }));
    }
  };

  // Handle archive novel
  const handleArchive = async (record) => {
    setActionLoading((prev) => ({ ...prev, [record.id]: 'archiving' }));
    try {
      const response = await novelService.archiveNovel(record.id);
      message.success(response.message || 'Novel archived successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to archive novel:', error);
      message.error(error.message || 'Failed to archive novel');
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const statusMap = {
          DRAFT: 'draft',
          UNDER_REVIEW: 'reviewing',
          PUBLISHED: 'published',
          ARCHIVED: 'suspended',
        };
        return <StatusBadge status={statusMap[status] || 'draft'} />;
      },
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
      title: 'Actions',
      key: 'actions',
      width: 250,
      fixed: 'right',
      render: (_, record) => {
        const isArchived = record.status === 'ARCHIVED';
        return (
          <Space direction="vertical" size="small">
            <Space>
              {!isArchived && (
                <>
                  <Popconfirm
                    title="Hide Novel"
                    description="Are you sure you want to hide this novel?"
                    onConfirm={() => handleHide(record)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      size="small"
                      icon={<EyeInvisibleOutlined />}
                      loading={actionLoading[record.id] === 'hiding'}
                      disabled={
                        actionLoading[record.id] &&
                        actionLoading[record.id] !== 'hiding'
                      }
                    >
                      Hide
                    </Button>
                  </Popconfirm>
                  <Popconfirm
                    title="Unhide Novel"
                    description="Are you sure you want to unhide this novel?"
                    onConfirm={() => handleUnhide(record)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      size="small"
                      icon={<EyeOutlined />}
                      loading={actionLoading[record.id] === 'unhiding'}
                      disabled={
                        actionLoading[record.id] &&
                        actionLoading[record.id] !== 'unhiding'
                      }
                    >
                      Unhide
                    </Button>
                  </Popconfirm>
                </>
              )}
            </Space>
            {!isArchived && (
              <Popconfirm
                title="Archive Novel"
                description="Are you sure you want to archive this novel? This action may be irreversible."
                onConfirm={() => handleArchive(record)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  size="small"
                  danger
                  icon={<InboxOutlined />}
                  loading={actionLoading[record.id] === 'archiving'}
                  disabled={
                    actionLoading[record.id] &&
                    actionLoading[record.id] !== 'archiving'
                  }
                  block
                >
                  Archive
                </Button>
              </Popconfirm>
            )}
            {isArchived && (
              <Tag color="red" style={{ margin: 0 }}>
                Archived
              </Tag>
            )}
          </Space>
        );
      },
    },
  ];

  // Handlers
  const handleSearch = (value) => {
    setSearchValue(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleCategoryChange = (categoryId) => {
    setFilters((prev) => ({
      ...prev,
      category: categoryId === 'all' ? '' : categoryId,
    }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleFilter = (filterValues) => {
    setFilters(filterValues);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchValue('');
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (paginationInfo) => {
    fetchData(paginationInfo);
  };

  return (
    <div>
      <PageHeader
        title="Moderate Novels"
        subtitle="Review and moderate all novels on the platform"
        breadcrumbs={[
          { title: 'Dashboard', href: '/yushan-admin/admin/dashboard' },
          { title: 'Novels', href: '/yushan-admin/admin/novels' },
          { title: 'Moderate' },
        ]}
      />

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <SearchBar
          placeholder="Search novels by title, author, or description..."
          onSearch={handleSearch}
          onClear={() => setSearchValue('')}
          searchValue={searchValue}
          showFilter={false}
          showCategoryFilter={true}
          categories={categories}
          selectedCategory={filters.category || 'all'}
          onCategoryChange={handleCategoryChange}
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
          <LoadingSpinner tip="Loading novels..." />
        ) : data.length === 0 ? (
          <EmptyState
            type="novels"
            title="No Novels Found"
            description="No novels match your current search and filter criteria."
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
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} novels`,
            }}
            onChange={handleTableChange}
            loading={loading}
            rowKey="id"
            scroll={{ x: 1500 }}
          />
        )}
      </Space>
    </div>
  );
};

export default ModerateNovels;
