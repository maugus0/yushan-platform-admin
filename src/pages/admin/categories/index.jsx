import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Space, Table, Tooltip, Badge, Modal, Grid, Card } from 'antd';
import {
  PlusOutlined,
  TagsOutlined,
  BookOutlined,
  CalendarOutlined,
  FolderOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import {
  PageHeader,
  SearchBar,
  FilterPanel,
  StatusBadge,
  ActionButtons,
  EmptyState,
  LoadingSpinner,
} from '../../../components/admin/common';
import { categoryService } from '../../../services/admin/categoryservice';
import CategoryForm from './categoryform';
import { message } from 'antd';

const { useBreakpoint } = Grid;

const Categories = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({});

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  // Fetch data from API
  const fetchData = useCallback(
    async (params = {}) => {
      setLoading(true);
      try {
        const response = await categoryService.getAllCategories({
          includeInactive: true,
        });

        if (response.success) {
          let filteredData = response.data;

          // Apply search filter
          if (searchValue) {
            filteredData = filteredData.filter(
              (item) =>
                item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                item.description
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
            );
          }

          // Apply status filter - map isActive to status for UI
          if (filters.status) {
            const isActiveFilter = filters.status === 'active';
            filteredData = filteredData.filter(
              (item) => item.isActive === isActiveFilter
            );
          }

          // Apply date range filter
          if (
            filters.createdDateRange &&
            filters.createdDateRange.length === 2
          ) {
            const [startDate, endDate] = filters.createdDateRange;
            filteredData = filteredData.filter((item) => {
              const itemDate = new Date(item.createTime);
              return itemDate >= startDate && itemDate <= endDate;
            });
          }

          // Fetch novel counts for all categories
          const categoryIds = filteredData.map((item) => item.id);
          let countsResponse = { counts: {} };

          // Only fetch counts if we have categories
          if (categoryIds.length > 0) {
            try {
              countsResponse =
                await categoryService.getCategoryNovelCounts(categoryIds);
            } catch (countError) {
              console.warn(
                'Failed to fetch novel counts, defaulting all counts to 0:',
                countError
              );
              // Create empty counts map if fetch fails
              countsResponse = { counts: {} };
            }
          }

          // Map API response to match UI expectations
          const mappedData = filteredData.map((item) => ({
            ...item,
            status: item.isActive ? 'active' : 'inactive',
            novelCount: countsResponse.counts[item.id] || 0, // Use fetched count
            color: getCategoryColor(item.id), // Generate consistent color based on ID
            createdAt: item.createTime,
            updatedAt: item.updateTime,
          }));

          // Apply pagination
          const pageSize = params.pageSize || pagination.pageSize;
          const current = params.current || pagination.current;
          const startIndex = (current - 1) * pageSize;
          const endIndex = startIndex + pageSize;

          setData(mappedData.slice(startIndex, endIndex));
          setPagination((prev) => ({
            ...prev,
            current: current,
            total: mappedData.length,
          }));
        }
      } catch (error) {
        message.error('Failed to fetch categories: ' + error.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchValue, filters, pagination.pageSize, pagination.current]
  );

  // Helper function to generate consistent colors based on category ID
  const getCategoryColor = (categoryId) => {
    const colors = [
      '#722ed1',
      '#eb2f96',
      '#fa8c16',
      '#1890ff',
      '#f5222d',
      '#52c41a',
      '#13c2c2',
      '#2f54eb',
      '#faad14',
      '#a0d911',
    ];
    // Use category ID to deterministically select a color
    return colors[categoryId % colors.length];
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, filters]);

  // Remove mock data - replaced with API
  /* const mockCategories = [
    {
      id: 1,
      name: 'Fantasy',
      description:
        'Stories with magical elements, mythical creatures, and supernatural powers',
      novelCount: 450,
      status: 'active',
      color: '#722ed1',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-09-20T14:20:00Z',
    },
    {
      id: 2,
      name: 'Romance',
      description: 'Love stories and romantic relationships',
      novelCount: 320,
      status: 'active',
      color: '#eb2f96',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-09-18T09:15:00Z',
    },
    {
      id: 3,
      name: 'Action',
      description: 'Fast-paced stories with adventure and combat',
      novelCount: 280,
      status: 'active',
      color: '#fa8c16',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-09-15T16:45:00Z',
    },
    {
      id: 4,
      name: 'Sci-Fi',
      description: 'Science fiction and futuristic stories',
      novelCount: 180,
      status: 'active',
      color: '#1890ff',
      createdAt: '2024-02-01T08:20:00Z',
      updatedAt: '2024-09-10T11:30:00Z',
    },
    {
      id: 5,
      name: 'Horror',
      description: 'Scary and supernatural thriller stories',
      novelCount: 95,
      status: 'active',
      color: '#f5222d',
      createdAt: '2024-02-15T12:10:00Z',
      updatedAt: '2024-08-30T13:25:00Z',
    },
    {
      id: 6,
      name: 'Mystery',
      description: 'Detective and mystery stories',
      novelCount: 65,
      status: 'inactive',
      color: '#52c41a',
      createdAt: '2024-03-01T15:40:00Z',
      updatedAt: '2024-07-20T10:15:00Z',
    },
  ]; */

  // Filter configuration
  const filterConfig = [
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
    {
      name: 'novelCountRange',
      label: 'Novel Count Range',
      type: 'numberrange',
      min: { placeholder: 'Min novels' },
      max: { placeholder: 'Max novels' },
    },
    {
      name: 'createdDateRange',
      label: 'Created Date Range',
      type: 'daterange',
    },
  ];

  // Table columns
  const columns = [
    {
      title: 'Category',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: record.color,
            }}
          />
          <FolderOutlined style={{ color: record.color }} />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#666', maxWidth: 200 }}>
              {record.description}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: 'Novel Count',
      dataIndex: 'novelCount',
      key: 'novelCount',
      render: (count) => (
        <Badge count={count} showZero style={{ backgroundColor: '#1890ff' }}>
          <BookOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
        </Badge>
      ),
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
      render: (color) => (
        <Space>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              backgroundColor: color,
              border: '1px solid #d9d9d9',
            }}
          />
          <code style={{ fontSize: '11px' }}>{color}</code>
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
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => (
        <Tooltip title={new Date(date).toLocaleString()}>
          {new Date(date).toLocaleDateString()}
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <ActionButtons
          record={record}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showMore={true}
          customActions={[
            {
              key: 'novels',
              icon: <BookOutlined />,
              label: 'View Novels',
              onClick: () => handleViewNovels(record),
            },
            {
              key: 'toggle',
              icon: <TagsOutlined />,
              label: record.status === 'active' ? 'Deactivate' : 'Activate',
              onClick: () => handleToggleStatus(record),
            },
          ]}
        />
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

  const handleView = (record) => {
    setSelectedCategory(record);
    setViewModalVisible(true);
  };

  const handleEdit = (record) => {
    setSelectedCategory(record);
    setModalMode('edit');
    setModalVisible(true);
  };

  const handleDelete = async (record) => {
    // Show confirmation modal with two delete options
    Modal.confirm({
      title: 'Delete Category',
      content: (
        <div>
          <p>Choose how to delete "{record.name}":</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li>
              <strong>Soft Delete:</strong> Mark as deleted (can be recovered
              later, recommended if category has novels)
            </li>
            <li>
              <strong>Hard Delete:</strong> Permanently remove from database
              (only works if category has no novels)
            </li>
          </ul>
          {record.novelCount > 0 && (
            <div
              style={{
                marginTop: '12px',
                padding: '8px 12px',
                background: '#fff7e6',
                border: '1px solid #ffd591',
                borderRadius: '4px',
              }}
            >
              ⚠️ This category currently has{' '}
              <strong>{record.novelCount} novel(s)</strong>. Hard delete will
              fail unless all novels are removed first.
            </div>
          )}
        </div>
      ),
      okText: 'Soft Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await categoryService.deleteCategory(record.id, false);
          message.success('Category soft deleted successfully');
          fetchData(); // Refresh the list
        } catch (error) {
          message.error('Failed to delete category: ' + error.message);
        }
      },
      footer: (_, { CancelBtn }) => (
        <>
          <CancelBtn />
          <Button
            danger
            onClick={async () => {
              Modal.destroyAll();
              try {
                await categoryService.deleteCategory(record.id, false);
                message.success('Category soft deleted successfully');
                fetchData();
              } catch (error) {
                message.error('Failed to soft delete: ' + error.message);
              }
            }}
          >
            Soft Delete
          </Button>
          <Button
            type="primary"
            danger
            onClick={async () => {
              Modal.destroyAll();
              // Extra confirmation for hard delete
              Modal.confirm({
                title: 'Confirm Hard Delete',
                content: (
                  <div>
                    <p>
                      Are you absolutely sure? Hard deleting "{record.name}" is
                      PERMANENT and cannot be undone!
                    </p>
                    {record.novelCount > 0 && (
                      <div
                        style={{
                          marginTop: '12px',
                          padding: '12px',
                          background: '#fff2e8',
                          border: '1px solid #ffbb96',
                          borderRadius: '4px',
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontWeight: 500,
                            color: '#d4380d',
                          }}
                        >
                          ⚠️ Warning: This category has {record.novelCount}{' '}
                          novel(s)
                        </p>
                        <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>
                          Hard delete will fail due to database constraints. You
                          must first remove or reassign all novels in this
                          category.
                        </p>
                      </div>
                    )}
                  </div>
                ),
                okText: 'Yes, Hard Delete',
                okType: 'danger',
                cancelText: 'Cancel',
                onOk: async () => {
                  try {
                    await categoryService.deleteCategory(record.id, true);
                    message.success('Category permanently deleted');
                    fetchData();
                  } catch (error) {
                    // Check if error is foreign key constraint violation
                    const errorMessage = error.message?.toLowerCase() || '';
                    const isForeignKeyError =
                      errorMessage.includes('foreign key constraint') ||
                      errorMessage.includes('fk_novel_category') ||
                      errorMessage.includes('still referenced');

                    if (isForeignKeyError) {
                      Modal.error({
                        title: 'Cannot Hard Delete Category',
                        width: 520,
                        content: (
                          <div>
                            <p>
                              <strong>"{record.name}"</strong> cannot be
                              permanently deleted because it still has novels
                              associated with it.
                            </p>
                            <div
                              style={{
                                marginTop: '16px',
                                padding: '12px',
                                background: '#f6ffed',
                                border: '1px solid #b7eb8f',
                                borderRadius: '4px',
                              }}
                            >
                              <p style={{ margin: 0, fontWeight: 500 }}>
                                ✅ What you can do:
                              </p>
                              <ol
                                style={{
                                  margin: '8px 0 0 0',
                                  paddingLeft: '20px',
                                }}
                              >
                                <li>
                                  Use <strong>Soft Delete</strong> instead
                                  (recommended)
                                </li>
                                <li>
                                  Navigate to novels in this category and
                                  delete/reassign them first
                                </li>
                                <li>
                                  Then return here to hard delete the empty
                                  category
                                </li>
                              </ol>
                            </div>
                            <div
                              style={{
                                marginTop: '12px',
                                fontSize: '12px',
                                color: '#666',
                              }}
                            >
                              💡 Tip: Click "View Novels" to see and manage all
                              novels in this category.
                            </div>
                          </div>
                        ),
                      });
                    } else {
                      message.error('Failed to hard delete: ' + error.message);
                    }
                  }
                },
              });
            }}
          >
            Hard Delete
          </Button>
        </>
      ),
    });
  };

  const handleAddNew = () => {
    setSelectedCategory(null);
    setModalMode('create');
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedCategory(null);
  };

  const handleModalSuccess = () => {
    setModalVisible(false);
    setSelectedCategory(null);
    fetchData(); // Refresh the list after successful create/update
  };

  const handleViewModalClose = () => {
    setViewModalVisible(false);
    setSelectedCategory(null);
  };

  const handleToggleStatus = async (record) => {
    try {
      const newStatus = !record.isActive;
      await categoryService.toggleCategoryStatus(record.id, newStatus);
      message.success(
        `Category ${newStatus ? 'activated' : 'deactivated'} successfully`
      );
      fetchData(); // Refresh the list
    } catch (error) {
      message.error('Failed to toggle category status: ' + error.message);
    }
  };

  const handleTableChange = (paginationInfo) => {
    fetchData(paginationInfo);
  };

  const handleViewNovels = (record) => {
    // Navigate to novels page with category filter pre-applied
    navigate(
      `/admin/novels?category=${record.id}&categoryName=${encodeURIComponent(record.name)}`
    );
  };

  // Mobile Card Component
  const CategoryCard = ({ category }) => (
    <Card
      size="small"
      style={{ marginBottom: 16 }}
      actions={[
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleView(category)}
          key="view"
        >
          View
        </Button>,
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => handleEdit(category)}
          key="edit"
        >
          Edit
        </Button>,
        <Button
          type="text"
          icon={<DeleteOutlined />}
          danger
          onClick={() => handleDelete(category)}
          key="delete"
        >
          Delete
        </Button>,
      ]}
    >
      <div
        style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12 }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: category.color,
            marginRight: 12,
            marginTop: 2,
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, fontSize: '16px', marginBottom: 4 }}>
            {category.name}
          </div>
          <div style={{ color: '#666', fontSize: '14px', marginBottom: 8 }}>
            {category.description}
          </div>
          <Space size="middle" wrap>
            <StatusBadge status={category.status} />
            <Badge
              count={category.novelCount}
              showZero
              style={{ backgroundColor: '#1890ff' }}
            >
              <BookOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
            </Badge>
          </Space>
        </div>
      </div>
      <div style={{ fontSize: '12px', color: '#999' }}>
        Created: {new Date(category.createdAt).toLocaleDateString()}
      </div>
    </Card>
  );

  return (
    <div>
      <PageHeader
        title="Categories Management"
        subtitle="Manage novel categories and genres"
        breadcrumbs={[
          { title: 'Dashboard', href: '/yushan-admin/admin/dashboard' },
          { title: 'Categories' },
        ]}
        actions={[
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddNew}
          >
            Add Category
          </Button>,
        ]}
      />

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <SearchBar
          placeholder="Search categories by name or description..."
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
          <LoadingSpinner tip="Loading categories..." />
        ) : data.length === 0 ? (
          <EmptyState
            title="No Categories Found"
            description="No categories match your current search and filter criteria."
            onDefaultAction={handleAddNew}
            defaultActionText="Add First Category"
            actions={[
              {
                children: 'Clear Filters',
                onClick: handleClearFilters,
              },
            ]}
          />
        ) : isMobile ? (
          <div>
            {data.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
            {/* Mobile Pagination */}
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Button
                disabled={pagination.current <= 1}
                onClick={() =>
                  handleTableChange({
                    ...pagination,
                    current: pagination.current - 1,
                  })
                }
                style={{ marginRight: 8 }}
              >
                Previous
              </Button>
              <span style={{ margin: '0 16px' }}>
                {pagination.current} /{' '}
                {Math.ceil(pagination.total / pagination.pageSize)}
              </span>
              <Button
                disabled={
                  pagination.current >=
                  Math.ceil(pagination.total / pagination.pageSize)
                }
                onClick={() =>
                  handleTableChange({
                    ...pagination,
                    current: pagination.current + 1,
                  })
                }
              >
                Next
              </Button>
            </div>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={data}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} categories`,
            }}
            onChange={handleTableChange}
            loading={loading}
            rowKey="id"
            scroll={{ x: 1000 }}
          />
        )}
      </Space>

      {/* Create/Edit Modal */}
      <Modal
        title={modalMode === 'edit' ? 'Edit Category' : 'Create New Category'}
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={isMobile ? '95vw' : 600}
        style={
          isMobile
            ? {
                top: '10px',
                maxHeight: '90vh',
                paddingBottom: 0,
              }
            : {}
        }
        bodyStyle={
          isMobile
            ? {
                maxHeight: 'calc(90vh - 110px)',
                overflowY: 'auto',
              }
            : {}
        }
        destroyOnClose
      >
        <CategoryForm
          categoryId={selectedCategory?.id}
          mode={modalMode}
          onSuccess={handleModalSuccess}
          onCancel={handleModalClose}
        />
      </Modal>

      {/* View Modal */}
      <Modal
        title="Category Details"
        open={viewModalVisible}
        onCancel={handleViewModalClose}
        footer={
          isMobile ? (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <Button
                key="edit"
                type="primary"
                block
                onClick={() => {
                  handleViewModalClose();
                  handleEdit(selectedCategory);
                }}
              >
                Edit Category
              </Button>
              <Button key="close" block onClick={handleViewModalClose}>
                Close
              </Button>
            </div>
          ) : (
            [
              <Button key="close" onClick={handleViewModalClose}>
                Close
              </Button>,
              <Button
                key="edit"
                type="primary"
                onClick={() => {
                  handleViewModalClose();
                  handleEdit(selectedCategory);
                }}
              >
                Edit Category
              </Button>,
            ]
          )
        }
        width={isMobile ? '95vw' : 600}
        style={
          isMobile
            ? {
                top: '10px',
                maxHeight: '90vh',
                paddingBottom: 0,
              }
            : {}
        }
        bodyStyle={
          isMobile
            ? {
                maxHeight: 'calc(90vh - 110px)',
                overflowY: 'auto',
              }
            : {}
        }
      >
        {selectedCategory && (
          <div style={{ padding: isMobile ? '8px 0' : '16px 0' }}>
            <Space
              direction="vertical"
              style={{ width: '100%' }}
              size={isMobile ? 'middle' : 'large'}
            >
              <div>
                <Space size={isMobile ? 'small' : 'middle'}>
                  <div
                    style={{
                      width: isMobile ? 12 : 16,
                      height: isMobile ? 12 : 16,
                      borderRadius: '50%',
                      backgroundColor: selectedCategory.color,
                    }}
                  />
                  <FolderOutlined
                    style={{
                      color: selectedCategory.color,
                      fontSize: isMobile ? '16px' : '20px',
                    }}
                  />
                </Space>
              </div>

              <div>
                <div
                  style={{
                    fontSize: isMobile ? '10px' : '12px',
                    color: '#999',
                    marginBottom: '4px',
                  }}
                >
                  Category Name
                </div>
                <div
                  style={{
                    fontSize: isMobile ? '16px' : '18px',
                    fontWeight: 500,
                    wordBreak: 'break-word',
                  }}
                >
                  {selectedCategory.name}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: isMobile ? '10px' : '12px',
                    color: '#999',
                    marginBottom: '4px',
                  }}
                >
                  Description
                </div>
                <div
                  style={{
                    wordBreak: 'break-word',
                    lineHeight: isMobile ? '1.4' : '1.6',
                  }}
                >
                  {selectedCategory.description}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: isMobile ? '10px' : '12px',
                    color: '#999',
                    marginBottom: '4px',
                  }}
                >
                  Status
                </div>
                <StatusBadge status={selectedCategory.status} />
              </div>

              <div>
                <div
                  style={{
                    fontSize: isMobile ? '10px' : '12px',
                    color: '#999',
                    marginBottom: '4px',
                  }}
                >
                  Slug
                </div>
                <code
                  style={{
                    fontSize: isMobile ? '12px' : '14px',
                    wordBreak: 'break-all',
                  }}
                >
                  {selectedCategory.slug}
                </code>
              </div>

              <Space
                size={isMobile ? 'small' : 'large'}
                direction={isMobile ? 'vertical' : 'horizontal'}
                style={{ width: '100%' }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: isMobile ? '10px' : '12px',
                      color: '#999',
                      marginBottom: '4px',
                    }}
                  >
                    <CalendarOutlined /> Created
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? '12px' : '14px',
                      wordBreak: 'break-word',
                    }}
                  >
                    {new Date(selectedCategory.createdAt).toLocaleString()}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: isMobile ? '10px' : '12px',
                      color: '#999',
                      marginBottom: '4px',
                    }}
                  >
                    <CalendarOutlined /> Last Updated
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? '12px' : '14px',
                      wordBreak: 'break-word',
                    }}
                  >
                    {new Date(selectedCategory.updatedAt).toLocaleString()}
                  </div>
                </div>
              </Space>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Categories;
