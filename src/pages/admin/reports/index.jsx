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
  Input,
  Select,
} from 'antd';
import {
  EyeOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import {
  PageHeader,
  FilterPanel,
  StatusBadge,
  EmptyState,
  LoadingSpinner,
} from '../../../components/admin/common';
import reportService from '../../../services/admin/reportservice';

const { Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [screens] = useState(useBreakpoint());
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [resolveModalVisible, setResolveModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolveStatus, setResolveStatus] = useState('RESOLVED');
  const [resolveNotes, setResolveNotes] = useState('');

  // Fetch data from API
  const fetchData = useCallback(
    async (paginationInfo = null) => {
      setLoading(true);
      try {
        const pageNum = paginationInfo?.current
          ? paginationInfo.current - 1
          : 0; // Convert to 0-based
        const pageSize = paginationInfo?.pageSize || pagination.pageSize;

        const response = await reportService.getAllReports({
          page: pageNum,
          pageSize,
          sort: sortBy,
          order: sortOrder,
          ...(filters.status && { status: filters.status }),
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
          message.error(response.error || 'Failed to fetch reports');
          setData([]);
        }
      } catch (error) {
        console.error('Failed to fetch reports:', error);
        message.error('Failed to fetch reports');
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [sortBy, sortOrder, filters, pagination.pageSize]
  );

  // Initial fetch and refetch on filter change
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sortBy, sortOrder]);

  // Filter configuration
  const filterConfig = [
    {
      name: 'status',
      label: 'Report Status',
      type: 'select',
      options: [
        { value: 'IN_REVIEW', label: 'In Review' },
        { value: 'RESOLVED', label: 'Resolved' },
        { value: 'DISMISSED', label: 'Dismissed' },
      ],
    },
  ];

  // Handle View Details
  const handleViewDetails = async (record) => {
    setDetailsLoading(true);
    try {
      const response = await reportService.getReportById(record.id);

      if (response.success) {
        const reportData = response.data;
        Modal.info({
          title: `Report Details - ${reportData.reportType}`,
          width: 600,
          content: (
            <div style={{ marginTop: 16 }}>
              <p>
                <strong>Report ID:</strong> {reportData.id}
              </p>
              <p>
                <strong>Reporter:</strong> {reportData.reporterUsername}
              </p>
              <p>
                <strong>Report Type:</strong> {reportData.reportType}
              </p>
              <p>
                <strong>Reason:</strong> {reportData.reason}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                <StatusBadge status={reportData.status.toLowerCase()} />
              </p>
              <p>
                <strong>Content Type:</strong> {reportData.contentType}
              </p>
              {reportData.commentContent && (
                <p>
                  <strong>Comment:</strong> {reportData.commentContent}
                </p>
              )}
              {reportData.adminNotes && (
                <p>
                  <strong>Admin Notes:</strong> {reportData.adminNotes}
                </p>
              )}
              <p>
                <strong>Created:</strong>{' '}
                {new Date(reportData.createdAt).toLocaleString()}
              </p>
              {reportData.resolvedByUsername && (
                <p>
                  <strong>Resolved By:</strong> {reportData.resolvedByUsername}
                </p>
              )}
            </div>
          ),
          okText: 'Close',
        });
      } else {
        message.error(response.error || 'Failed to fetch report details');
      }
    } catch (error) {
      console.error('Failed to fetch report details:', error);
      message.error('Failed to fetch report details');
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handle Resolve Report
  const handleResolveClick = (record) => {
    setSelectedReport(record);
    setResolveStatus('RESOLVED');
    setResolveNotes('');
    setResolveModalVisible(true);
  };

  const handleResolveSubmit = async () => {
    if (!selectedReport) return;

    try {
      const response = await reportService.resolveReport(
        selectedReport.id,
        resolveStatus,
        resolveNotes
      );

      if (response.success) {
        message.success('Report resolved successfully');
        setResolveModalVisible(false);
        // Refresh the data
        fetchData({
          current: pagination.current,
          pageSize: pagination.pageSize,
        });
      } else {
        message.error(response.error || 'Failed to resolve report');
      }
    } catch (error) {
      console.error('Failed to resolve report:', error);
      message.error('Failed to resolve report');
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Report Details',
      key: 'details',
      render: (_, record) => (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Space>
            <Text strong>{record.reportType}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              by {record.reporterUsername}
            </Text>
          </Space>
          <Paragraph
            ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
            style={{ margin: 0, maxWidth: 400 }}
          >
            {record.reason}
          </Paragraph>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Content: {record.contentType} #{record.contentId}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <StatusBadge status={status?.toLowerCase() || 'in_review'} />
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
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
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            loading={detailsLoading}
          >
            Details
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleResolveClick(record)}
          >
            Resolve
          </Button>
        </Space>
      ),
    },
  ];

  const handleFilter = (filterValues) => {
    setFilters(filterValues);
  };

  const handleClearFilters = () => {
    setFilters({});
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
        title="Reports Management"
        subtitle="Review and manage user reports"
        breadcrumbs={[
          { title: 'Dashboard', href: '/yushan-admin/admin/dashboard' },
          { title: 'Reports' },
        ]}
        actions={[
          <Button key="in_review" type="default">
            In Review (
            {data.filter((item) => item.status === 'IN_REVIEW').length})
          </Button>,
          <Button key="resolved" type="primary">
            Resolved ({data.filter((item) => item.status === 'RESOLVED').length}
            )
          </Button>,
        ]}
      />

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <FilterPanel
          filters={filterConfig}
          onFilter={handleFilter}
          onClear={handleClearFilters}
          collapsed={true}
          showToggle={true}
        />

        {loading ? (
          <LoadingSpinner tip="Loading reports..." />
        ) : data.length === 0 ? (
          <EmptyState
            title="No Reports Found"
            description="No reports match your current filters."
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
                `${range[0]}-${range[1]} of ${total} reports`,
            }}
            onChange={handleTableChange}
            loading={loading}
            rowKey="id"
            scroll={{ x: 1000 }}
          />
        ) : (
          // Mobile view - Card
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            {data.map((report) => (
              <Card key={report.id} style={{ marginBottom: 8 }}>
                <Space
                  direction="vertical"
                  style={{ width: '100%' }}
                  size="small"
                >
                  <div>
                    <Text strong style={{ fontSize: '14px' }}>
                      {report.reportType}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      by {report.reporterUsername}
                    </Text>
                  </div>
                  <Divider style={{ margin: '8px 0' }} />
                  <Paragraph
                    ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
                    style={{ margin: 0, fontSize: '13px' }}
                  >
                    {report.reason}
                  </Paragraph>
                  <Divider style={{ margin: '8px 0' }} />
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Content: {report.contentType} #{report.contentId}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Status:{' '}
                      <StatusBadge
                        status={report.status?.toLowerCase() || 'in_review'}
                      />
                    </Text>
                  </div>
                  <Divider style={{ margin: '8px 0' }} />
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    {new Date(report.createdAt).toLocaleDateString()}
                  </Text>
                  <Divider style={{ margin: '8px 0' }} />
                  <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Button
                      type="primary"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewDetails(report)}
                      loading={detailsLoading}
                    >
                      Details
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleResolveClick(report)}
                    >
                      Resolve
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

      {/* Resolve Report Modal */}
      <Modal
        title="Resolve Report"
        visible={resolveModalVisible}
        onOk={handleResolveSubmit}
        onCancel={() => setResolveModalVisible(false)}
        okText="Resolve"
        width={500}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text>
              <strong>Report ID:</strong> {selectedReport?.id}
            </Text>
            <br />
            <Text>
              <strong>Report Type:</strong> {selectedReport?.reportType}
            </Text>
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Resolution Status
            </Text>
            <Select
              value={resolveStatus}
              onChange={setResolveStatus}
              style={{ width: '100%' }}
              options={[
                { value: 'RESOLVED', label: 'Resolved' },
                { value: 'DISMISSED', label: 'Dismissed' },
                { value: 'IN_REVIEW', label: 'In Review' },
              ]}
            />
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Admin Notes
            </Text>
            <Input.TextArea
              value={resolveNotes}
              onChange={(e) => setResolveNotes(e.target.value)}
              placeholder="Add notes about this resolution..."
              rows={4}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default Reports;
