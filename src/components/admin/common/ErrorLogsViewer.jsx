import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Typography, Modal } from 'antd';
import {
  ExclamationCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import errorReporter from '../../../utils/admin/errorReporting';

const { Text, Paragraph } = Typography;

const ErrorLogsViewer = () => {
  const [errors, setErrors] = useState([]);
  const [selectedError, setSelectedError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadErrors();
  }, []);

  const loadErrors = () => {
    const storedErrors = errorReporter.getStoredErrors();
    setErrors(storedErrors);
  };

  const clearErrors = () => {
    errorReporter.clearStoredErrors();
    setErrors([]);
  };

  const viewErrorDetails = (error) => {
    setSelectedError(error);
    setModalVisible(true);
  };

  const getErrorTypeColor = (type) => {
    switch (type) {
      case 'API_ERROR':
        return 'red';
      case 'COMPONENT_ERROR':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const columns = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp) => new Date(timestamp).toLocaleString(),
    },
    {
      title: 'Type',
      dataIndex: ['context', 'type'],
      key: 'type',
      width: 120,
      render: (type) => (
        <Tag color={getErrorTypeColor(type)}>{type || 'GENERAL'}</Tag>
      ),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: 'Context',
      dataIndex: 'context',
      key: 'context',
      width: 150,
      render: (context) => (
        <Text type="secondary">
          {context?.endpoint || context?.componentName || 'N/A'}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => viewErrorDetails(record)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            <ExclamationCircleOutlined />
            Error Logs ({errors.length})
          </Space>
        }
        extra={
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={clearErrors}
            disabled={errors.length === 0}
          >
            Clear All
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={errors}
          rowKey={(record) => record.timestamp}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} errors`,
          }}
          size="small"
        />
      </Card>

      <Modal
        title="Error Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedError && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Message:</Text>
              <Paragraph copyable>{selectedError.message}</Paragraph>
            </div>

            <div>
              <Text strong>Timestamp:</Text>
              <Paragraph>
                {new Date(selectedError.timestamp).toLocaleString()}
              </Paragraph>
            </div>

            <div>
              <Text strong>URL:</Text>
              <Paragraph copyable>{selectedError.url}</Paragraph>
            </div>

            {selectedError.context && (
              <div>
                <Text strong>Context:</Text>
                <Paragraph>
                  <pre
                    style={{
                      fontSize: '12px',
                      background: '#f5f5f5',
                      padding: '8px',
                    }}
                  >
                    {JSON.stringify(selectedError.context, null, 2)}
                  </pre>
                </Paragraph>
              </div>
            )}

            {selectedError.stack && (
              <div>
                <Text strong>Stack Trace:</Text>
                <Paragraph>
                  <pre
                    style={{
                      fontSize: '11px',
                      background: '#f5f5f5',
                      padding: '8px',
                      maxHeight: '200px',
                      overflow: 'auto',
                    }}
                  >
                    {selectedError.stack}
                  </pre>
                </Paragraph>
              </div>
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default ErrorLogsViewer;
