import { useState, useEffect } from 'react';
import {
  Button,
  Space,
  Table,
  Tooltip,
  Avatar,
  Typography,
  Tag,
  Grid,
  Card,
} from 'antd';
import {
  BookOutlined,
  UserOutlined,
  EyeOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  BarsOutlined,
} from '@ant-design/icons';
import {
  PageHeader,
  FilterPanel,
  ActionButtons,
  EmptyState,
  LoadingSpinner,
} from '../../../components/admin/common';
import ViewModal, {
  viewFieldTypes,
} from '../../../components/admin/modals/viewmodal';
import { libraryService } from '../../../services/admin/libraryservice';
import {
  exportToCSV,
  getTimestampedFilename,
} from '../../../utils/admin/exportutils';

const { Text } = Typography;
const { useBreakpoint } = Grid;

const Library = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  // Remove activeTab since we only show user libraries
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({});
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch data
  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const pageSize = params.pageSize || pagination.pageSize;
      const current = params.current || pagination.current;

      // Call the real API to get user libraries
      const response = await libraryService.getAllLibraries({
        page: current,
        pageSize: pageSize,
        search: searchValue,
        sortBy: 'createTime',
        sortOrder: 'DESC',
        ...filters,
      });

      if (response.success) {
        setData(response.data);
        setPagination((prev) => ({
          ...prev,
          current: response.page,
          total: response.total,
        }));
      } else {
        throw new Error('Failed to fetch user libraries');
      }
    } catch (error) {
      console.error('Failed to fetch library data:', error);
      // Handle error gracefully
      setData([]);
      setPagination((prev) => ({
        ...prev,
        total: 0,
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, filters]);

  // Remove unused helper functions for bookmarks and reading status

  // Filter configurations for user libraries
  const getFilterConfig = () => {
    return [
      {
        name: 'level',
        label: 'User Level',
        type: 'select',
        options: [
          { value: 1, label: 'Level 1' },
          { value: 2, label: 'Level 2' },
          { value: 3, label: 'Level 3' },
          { value: 4, label: 'Level 4' },
          { value: 5, label: 'Level 5' },
        ],
      },
      {
        name: 'minBooks',
        label: 'Min Books',
        type: 'number',
        placeholder: 'Minimum books read',
      },
      {
        name: 'maxBooks',
        label: 'Max Books',
        type: 'number',
        placeholder: 'Maximum books read',
      },
      {
        name: 'isAuthor',
        label: 'User Type',
        type: 'select',
        options: [
          { value: true, label: 'Authors' },
          { value: false, label: 'Readers' },
        ],
      },
    ];
  };

  // Columns for user libraries
  const getColumns = () => {
    return [
      {
        title: 'User Information',
        key: 'user',
        render: (_, record) => (
          <Space direction="vertical" size={4}>
            <Space>
              <Avatar
                size="large"
                src={record.avatarUrl}
                icon={<UserOutlined />}
                style={{ minWidth: 40 }}
              />
              <div>
                <Text strong style={{ fontSize: '15px', display: 'block' }}>
                  {record.username}
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {record.email}
                </Text>
              </div>
            </Space>
            {record.profileDetail && (
              <Text type="secondary" style={{ fontSize: '13px' }}>
                {record.profileDetail}
              </Text>
            )}
            <Space wrap>
              <Tag color="blue">Level {record.level}</Tag>
              <Tag color="green">{record.exp} EXP</Tag>
              {record.isAuthor && <Tag color="purple">Author</Tag>}
              {record.isAdmin && <Tag color="red">Admin</Tag>}
            </Space>
          </Space>
        ),
      },
      {
        title: 'Library Statistics',
        key: 'stats',
        render: (_, record) => (
          <Space direction="vertical" size={4}>
            <Space>
              <BookOutlined style={{ color: '#1890ff' }} />
              <Text strong>{record.totalBooks} books</Text>
            </Space>
            <Space>
              <ClockCircleOutlined style={{ color: '#52c41a' }} />
              <Text>{record.totalReadingTime}h reading</Text>
            </Space>
            <Space>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Read Time: {record.readTime} min
              </Text>
            </Space>
            <Space>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Yuan: {record.yuan}
              </Text>
            </Space>
          </Space>
        ),
      },
      {
        title: 'Personal Info',
        key: 'personal',
        render: (_, record) => (
          <Space direction="vertical" size={4}>
            {record.birthday && (
              <Space>
                <CalendarOutlined />
                <Text style={{ fontSize: '13px' }}>
                  {new Date(record.birthday).toLocaleDateString()}
                </Text>
              </Space>
            )}
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Joined: {new Date(record.createdAt).toLocaleDateString()}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Updated: {new Date(record.updatedAt).toLocaleDateString()}
            </Text>
            {record.lastActive && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Last Active: {new Date(record.lastActive).toLocaleDateString()}
              </Text>
            )}
          </Space>
        ),
      },
    ];
  };

  // Remove tabs - we only show user libraries now

  // Handlers
  const handleFilter = (filterValues) => {
    setFilters(filterValues);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchValue('');
  };

  const handleView = (record) => {
    setSelectedUser(record);
    setViewModalVisible(true);
  };

  const handleExportAll = () => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    // Define export columns based on the table structure
    const exportColumns = [
      { key: 'username', title: 'Username', dataIndex: 'username' },
      { key: 'email', title: 'Email', dataIndex: 'email' },
      { key: 'level', title: 'Level', dataIndex: 'level' },
      { key: 'exp', title: 'Experience', dataIndex: 'exp' },
      { key: 'totalBooks', title: 'Books in Library', dataIndex: 'totalBooks' },
      { key: 'readTime', title: 'Reading Time (hours)', dataIndex: 'readTime' },
      {
        key: 'birthday',
        title: 'Birthday',
        dataIndex: 'birthday',
        render: (value) => (value ? new Date(value).toLocaleDateString() : ''),
      },
      {
        key: 'createdAt',
        title: 'Account Created',
        dataIndex: 'createdAt',
        render: (value) => new Date(value).toLocaleDateString(),
      },
      {
        key: 'updatedAt',
        title: 'Last Updated',
        dataIndex: 'updatedAt',
        render: (value) => new Date(value).toLocaleDateString(),
      },
    ];

    const filename = getTimestampedFilename('user_libraries', 'csv');
    exportToCSV(data, exportColumns, filename.replace('.csv', ''));
  };

  const handleAnalytics = () => {
    // For now, show basic analytics in console/alert
    // In a real app, this would open an analytics dashboard or modal
    const totalUsers = data.length;
    const totalBooks = data.reduce(
      (sum, user) => sum + (user.totalBooks || 0),
      0
    );
    const totalReadingTime = data.reduce(
      (sum, user) => sum + (user.readTime || 0),
      0
    );
    const avgLevel =
      data.reduce((sum, user) => sum + (user.level || 0), 0) / totalUsers;

    alert(`Reading Analytics Summary:
    
Total Users: ${totalUsers}
Total Books in All Libraries: ${totalBooks}
Total Reading Time: ${Math.round(totalReadingTime)} hours
Average User Level: ${Math.round(avgLevel * 10) / 10}

Note: This is a basic summary. Full analytics dashboard would be implemented here.`);
  };

  const handleExportUserDetails = (user) => {
    // Export individual user details to Excel
    const userData = [
      {
        Username: user.username,
        Email: user.email,
        Level: user.level,
        Experience: user.exp,
        'Total Books': user.totalBooks,
        'Reading Time (hours)': user.readTime,
        Birthday: user.birthday
          ? new Date(user.birthday).toLocaleDateString()
          : '',
        'Account Created': new Date(user.createdAt).toLocaleDateString(),
        'Last Updated': new Date(user.updatedAt).toLocaleDateString(),
        Yuan: user.yuan,
      },
    ];

    const fileName = getTimestampedFilename(
      `user_details_${user.username}`,
      'xlsx'
    );
    exportToCSV(userData, fileName, 'User Details');
  };

  const handleExportUserLibrary = (user) => {
    // Export user's library data to Excel
    const libraryData = [
      {
        Username: user.username,
        'Books in Library': user.totalBooks,
        'Reading Time': user.readTime + ' hours',
        Level: user.level,
        Experience: user.exp,
        'Account Created': new Date(user.createdAt).toLocaleDateString(),
        'Last Active': user.lastActive
          ? new Date(user.lastActive).toLocaleDateString()
          : '',
      },
    ];

    const fileName = getTimestampedFilename(`library_${user.username}`, 'xlsx');
    exportToCSV(libraryData, fileName, `${user.username}'s Library`);
  };

  const handleTableChange = (paginationInfo) => {
    fetchData(paginationInfo);
  };

  // Mobile Card Component for User Libraries
  const UserLibraryCard = ({ user }) => (
    <Card
      size="small"
      style={{ marginBottom: 16 }}
      actions={[
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleView(user)}
          key="view"
        >
          View Library
        </Button>,
        <Button
          type="text"
          icon={<DownloadOutlined />}
          onClick={() => handleExportUserDetails(user)}
          key="export"
        >
          Export Details
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 12 }}>
        {/* User Header */}
        <Space style={{ marginBottom: 12, width: '100%' }}>
          <Avatar
            size="large"
            src={user.avatarUrl}
            icon={<UserOutlined />}
            style={{ minWidth: 48, minHeight: 48 }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: '16px', marginBottom: 2 }}>
              {user.username}
            </div>
            <div style={{ color: '#666', fontSize: '12px', marginBottom: 4 }}>
              {user.email}
            </div>
            {user.profileDetail && (
              <div style={{ color: '#999', fontSize: '11px' }}>
                {user.profileDetail}
              </div>
            )}
          </div>
        </Space>

        {/* User Tags */}
        <Space wrap style={{ marginBottom: 12 }}>
          <Tag color="blue">Level {user.level}</Tag>
          <Tag color="green">{user.exp} EXP</Tag>
          {user.isAuthor && <Tag color="purple">Author</Tag>}
          {user.isAdmin && <Tag color="red">Admin</Tag>}
        </Space>

        {/* Library Stats */}
        <div style={{ marginBottom: 12 }}>
          <Space size="middle" wrap style={{ width: '100%' }}>
            <Space size="small">
              <BookOutlined style={{ color: '#1890ff' }} />
              <Text strong style={{ fontSize: '14px' }}>
                {user.totalBooks} books
              </Text>
            </Space>
            <Space size="small">
              <ClockCircleOutlined style={{ color: '#52c41a' }} />
              <Text style={{ fontSize: '14px' }}>{user.totalReadingTime}h</Text>
            </Space>
          </Space>
          <div style={{ marginTop: 8 }}>
            <Space size="middle" wrap>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Read Time: {user.readTime} min
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Yuan: {user.yuan}
              </Text>
            </Space>
          </div>
        </div>

        {/* Personal Info */}
        <div>
          {user.birthday && (
            <div style={{ marginBottom: 4 }}>
              <Space size="small">
                <CalendarOutlined style={{ fontSize: '12px' }} />
                <Text style={{ fontSize: '12px' }}>
                  Born: {new Date(user.birthday).toLocaleDateString()}
                </Text>
              </Space>
            </div>
          )}
          <div style={{ fontSize: '11px', color: '#999' }}>
            Joined: {new Date(user.createdAt).toLocaleDateString()}
          </div>
          {user.lastActive && (
            <div style={{ fontSize: '11px', color: '#999' }}>
              Last Active: {new Date(user.lastActive).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  const renderMobileCards = () => {
    return (
      <div>
        {data.map((user) => (
          <UserLibraryCard key={user.id} user={user} />
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
    );
  };

  const columns = [
    ...getColumns(),
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'date',
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
        <ActionButtons
          record={record}
          onView={handleView}
          showEdit={false}
          showDelete={false}
          showMore={true}
          onMore={(record) => handleExportUserDetails(record)}
          customActions={[
            {
              key: 'export',
              icon: <DownloadOutlined />,
              label: 'Export Library',
              onClick: (record) => handleExportUserLibrary(record),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="User Libraries"
        subtitle="View and manage user reading libraries (Read-only for administrators)"
        breadcrumbs={[
          { title: 'Dashboard', href: '/yushan-admin/admin/dashboard' },
          { title: 'User Libraries' },
        ]}
        actions={[
          <Button
            key="export"
            type="default"
            icon={<DownloadOutlined />}
            onClick={handleExportAll}
            disabled={loading || data.length === 0}
            size={isMobile ? 'small' : 'default'}
            style={{ width: isMobile ? '100%' : 'auto' }}
          >
            {isMobile ? 'Export' : 'Export All Data'}
          </Button>,
          <Button
            key="analytics"
            type="primary"
            icon={<BarsOutlined />}
            onClick={handleAnalytics}
            disabled={loading || data.length === 0}
            size={isMobile ? 'small' : 'default'}
            style={{ width: isMobile ? '100%' : 'auto' }}
          >
            {isMobile ? 'Analytics' : 'Reading Analytics'}
          </Button>,
        ]}
      />

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <FilterPanel
          filters={getFilterConfig()}
          onFilter={handleFilter}
          onClear={handleClearFilters}
          collapsed={true}
          showToggle={true}
        />

        {loading ? (
          <LoadingSpinner tip="Loading user libraries..." />
        ) : data.length === 0 ? (
          <EmptyState
            title="No User Libraries Found"
            description="No users match your current search and filter criteria."
            actions={[
              {
                children: 'Clear Filters',
                onClick: handleClearFilters,
              },
            ]}
          />
        ) : isMobile ? (
          renderMobileCards()
        ) : (
          <Table
            columns={columns}
            dataSource={data}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} user libraries`,
            }}
            onChange={handleTableChange}
            loading={loading}
            rowKey="id"
            scroll={{ x: 1200 }}
          />
        )}
      </Space>

      {/* View User Library Modal */}
      {selectedUser && (
        <ViewModal
          visible={viewModalVisible}
          onCancel={() => {
            setViewModalVisible(false);
            setSelectedUser(null);
          }}
          title={`${selectedUser.username}'s Library Details`}
          data={selectedUser}
          width={900}
          fields={[
            viewFieldTypes.text('username', 'Username', { copyable: true }),
            viewFieldTypes.text('email', 'Email', { copyable: true }),
            viewFieldTypes.number('level', 'Level', { strong: true }),
            viewFieldTypes.number('exp', 'Experience Points', { strong: true }),
            viewFieldTypes.number('totalBooks', 'Books in Library', {
              strong: true,
              suffix: 'books',
            }),
            viewFieldTypes.number('readTime', 'Total Reading Time', {
              strong: true,
              suffix: 'hours',
            }),
            {
              name: 'birthday',
              label: 'Birthday',
              type: 'date',
              format: 'YYYY-MM-DD',
            },
            {
              name: 'createdAt',
              label: 'Account Created',
              type: 'date',
              format: 'YYYY-MM-DD HH:mm:ss',
            },
            {
              name: 'updatedAt',
              label: 'Last Updated',
              type: 'date',
              format: 'YYYY-MM-DD HH:mm:ss',
            },
            {
              name: 'lastActive',
              label: 'Last Active',
              type: 'date',
              format: 'YYYY-MM-DD HH:mm:ss',
            },
          ]}
        />
      )}
    </div>
  );
};

export default Library;
