import { useState, useEffect, useCallback } from 'react';
import { Space, message, Avatar, Tag, Tooltip } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
} from '@ant-design/icons';

// Import components
import PageHeader from '../../../components/admin/common/pageheader';
import StatusBadge from '../../../components/admin/common/statusbadge';
import Breadcrumbs from '../../../components/admin/common/breadcrumbs';
import DataTable from '../../../components/admin/tables/datatable';
import TableFilters from '../../../components/admin/tables/tablefilters';

// Import services and utilities
import { userService } from '../../../services/admin/userservice';
import { commonFilters } from '../../../utils/admin/constants';

const Writers = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]); // Store all data for client-side filtering
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({});

  // Fetch all data once
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userService.getWriters({
        page: 1,
        pageSize: 100, // Fetch more data for client-side filtering
      });

      setAllData(response.data);
      setData(response.data);
      setPagination((prev) => ({
        ...prev,
        current: 1,
        total: response.total,
      }));
    } catch (error) {
      message.error('Failed to fetch writers');
      console.error('Failed to fetch writers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Client-side filtering
  useCallback(() => {
    let filteredData = [...allData];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredData = filteredData.filter(
        (item) =>
          item.username?.toLowerCase().includes(searchTerm) ||
          item.email?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply status filter
    if (filters.status) {
      filteredData = filteredData.filter(
        (item) => item.status === filters.status
      );
    }

    setData(filteredData);
    setPagination((prev) => ({
      ...prev,
      current: 1,
      total: filteredData.length,
    }));
  }, [allData, filters]);

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply filters when they change
  useEffect(() => {
    let filteredData = [...allData];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredData = filteredData.filter(
        (item) =>
          item.username?.toLowerCase().includes(searchTerm) ||
          item.email?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply status filter
    if (filters.status) {
      filteredData = filteredData.filter(
        (item) => item.status === filters.status
      );
    }

    setData(filteredData);
    setPagination((prev) => ({
      ...prev,
      current: 1,
      total: filteredData.length,
    }));
  }, [allData, filters]);

  // Filter configuration
  const filterConfig = [
    {
      ...commonFilters.search,
      key: 'search',
      placeholder: 'Search writers...',
      span: { xs: 24, sm: 12, md: 8, lg: 8 },
    },
    {
      ...commonFilters.status,
      key: 'status',
      options: [
        { label: 'Normal', value: 'active' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Banned', value: 'banned' },
      ],
      span: { xs: 24, sm: 12, md: 6, lg: 6 },
    },
    {
      key: 'joinDateRange',
      label: 'Join Date Range',
      type: 'daterange',
      quickFilter: false,
      span: { xs: 24, sm: 24, md: 8, lg: 8 },
    },
  ];

  // Table columns
  const columns = [
    {
      title: 'Writer',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} size="default" />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <MailOutlined style={{ marginRight: 4 }} />
              {record.email}
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
      title: 'Verified',
      key: 'verified',
      render: () => <Tag color="green">Verified</Tag>,
    },
    {
      title: 'Join Date',
      dataIndex: 'joinDate',
      key: 'joinDate',
      render: (date) => (
        <Tooltip title={new Date(date).toLocaleString()}>
          <Space>
            <CalendarOutlined />
            {new Date(date).toLocaleDateString()}
          </Space>
        </Tooltip>
      ),
    },
  ];

  // Event handlers
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (paginationInfo) => {
    setPagination(paginationInfo);
  };

  const handleBulkAction = async (actionKey, _selectedKeys, _selectedRows) => {
    try {
      if (actionKey === 'export') {
        message.info('Export functionality will be implemented');
      }
    } catch (error) {
      message.error('Bulk action failed');
      console.error('Bulk action error:', error);
    }
  };

  const breadcrumbItems = [
    { title: 'Admin' },
    { title: 'User Management' },
    { title: 'Writers' },
  ];

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader
        title="Writers"
        subtitle="Manage writer accounts and their publications"
      />

      <TableFilters
        filters={filterConfig}
        onFiltersChange={handleFiltersChange}
        onReset={() => setFilters({})}
        showAdvanced={false}
        showQuickFilters={true}
      />

      <DataTable
        dataSource={data}
        columns={columns}
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} writers`,
        }}
        onChange={handleTableChange}
        enableSelection={true}
        bulkActions={[]}
        showBulkActionsDropdown={false}
        onBulkAction={handleBulkAction}
        enableColumnSelector={true}
        columnStorageKey="writers-table-columns"
        enableExport={true}
        exportFilename="writers"
        rowKey="id"
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default Writers;
