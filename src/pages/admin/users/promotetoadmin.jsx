import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  message,
  Modal,
  Tag,
  Space,
  Input,
  Select,
  Typography,
} from 'antd';
import {
  ExclamationCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { userService } from '../../../services/admin/userservice';
import LoadingSpinner from '../../../components/admin/common/loadingspinner';
import PageHeader from '../../../components/admin/common/pageheader';

const { confirm } = Modal;
const { Text } = Typography;
const { Option } = Select;

const PromoteToAdmin = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: '',
    userType: '',
  });
  const [searchText, setSearchText] = useState('');

  const fetchNonAdminUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        isAdmin: false, // Only fetch non-admin users
        status: filters.status,
        userType: filters.userType,
      };

      const response = await userService.getAllUsers(params);
      setUsers(response.data);
      setFilteredUsers(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
      }));
    } catch (error) {
      message.error('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pagination.current,
    pagination.pageSize,
    filters.status,
    filters.userType,
  ]);

  const handleSearch = useCallback(
    (value) => {
      if (!value) {
        setFilteredUsers(users);
        return;
      }

      const searchLower = value.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.username?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower)
      );
      setFilteredUsers(filtered);
    },
    [users]
  );

  useEffect(() => {
    fetchNonAdminUsers();
  }, [fetchNonAdminUsers]);

  useEffect(() => {
    handleSearch(searchText);
  }, [searchText, handleSearch]);

  const handlePromoteToAdmin = (email, username) => {
    confirm({
      title: 'Confirm Admin Promotion',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>
            Are you sure you want to promote <strong>{username}</strong> to
            admin?
          </p>
          <p>
            <Text type="secondary">Email: </Text>
            <Text strong>{email}</Text>
          </p>
          <p style={{ marginTop: 16 }}>
            <Text type="warning">
              This user will have full administrative privileges and access to
              all admin features.
            </Text>
          </p>
        </div>
      ),
      okText: 'Yes, Promote to Admin',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await userService.promoteToAdmin(email);
          message.success(
            `${username} has been promoted to admin successfully`
          );
          fetchNonAdminUsers(); // Refresh the list
        } catch (error) {
          message.error(
            error.response?.data?.message || 'Failed to promote user to admin'
          );
        }
      },
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'green',
      suspended: 'orange',
      banned: 'red',
    };
    return colors[status.toLowerCase()] || 'default';
  };

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: 200,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: 'User Type',
      dataIndex: 'userType',
      key: 'userType',
      width: 120,
      render: (type) => {
        const colors = {
          reader: 'blue',
          writer: 'purple',
        };
        return (
          <Tag color={colors[type] || 'default'}>{type.toUpperCase()}</Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Join Date',
      dataIndex: 'joinDate',
      key: 'joinDate',
      width: 150,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Action',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<CrownOutlined />}
          onClick={() => handlePromoteToAdmin(record.email, record.username)}
          disabled={record.status === 'banned' || record.status === 'suspended'}
        >
          Promote to Admin
        </Button>
      ),
    },
  ];

  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  if (loading && users.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title="Promote to Admin"
        subtitle="Grant administrative privileges to users"
      />

      <Card>
        <Space
          direction="vertical"
          size="large"
          style={{ width: '100%', marginBottom: 16 }}
        >
          <Space wrap>
            <Input
              placeholder="Search by username or email"
              prefix={<SearchOutlined />}
              style={{ width: '100%', minWidth: 200, maxWidth: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Select
              placeholder="Filter by Status"
              style={{ width: 150 }}
              value={filters.status || undefined}
              onChange={(value) => handleFilterChange('status', value)}
              allowClear
            >
              <Option value="active">NORMAL</Option>
              <Option value="suspended">SUSPENDED</Option>
              <Option value="banned">BANNED</Option>
            </Select>
            <Select
              placeholder="Filter by User Type"
              style={{ width: 150 }}
              value={filters.userType || undefined}
              onChange={(value) => handleFilterChange('userType', value)}
              allowClear
            >
              <Option value="reader">Reader</Option>
              <Option value="writer">Writer</Option>
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchNonAdminUsers}
              loading={loading}
            >
              Refresh
            </Button>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default PromoteToAdmin;
