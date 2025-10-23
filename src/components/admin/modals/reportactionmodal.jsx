import { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Space,
  Typography,
  Card,
  Tag,
  Divider,
  message,
} from 'antd';
import {
  FlagOutlined,
  UserOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { Text, Paragraph } = Typography;

const ReportActionModal = ({
  visible,
  onCancel,
  onResolve,
  report = {},
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [actionType, setActionType] = useState('');

  const handleResolve = async () => {
    try {
      const values = await form.validateFields();
      const actionData = {
        reportId: report.id,
        action: values.action,
        resolution: values.resolution,
        moderatorNotes: values.moderatorNotes,
        contentAction: values.contentAction,
        userAction: values.userAction,
        notifyReporter: values.notifyReporter,
        notifyReported: values.notifyReported,
        resolvedAt: new Date().toISOString(),
      };

      await onResolve(actionData);
      form.resetFields();
      setActionType('');
      message.success('Report resolved successfully');
    } catch (error) {
      console.error('Resolution failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setActionType('');
    onCancel();
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#52c41a',
      medium: '#fa8c16',
      high: '#ff4d4f',
      critical: '#722ed1',
    };
    return colors[priority] || '#fadb14';
  };
  return (
    <Modal
      title={
        <Space>
          <FlagOutlined style={{ color: '#faad14' }} />
          <span>Resolve Report #{report.id}</span>
        </Space>
      }
      open={visible}
      onOk={handleResolve}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Resolve Report"
      cancelText="Cancel"
      width={700}
      destroyOnClose
    >
      {/* Report Summary */}
      <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Text strong>Report Type:</Text>
            <Tag color="orange">
              {report.type?.replace('_', ' ').toUpperCase()}
            </Tag>
            <Text strong>Priority:</Text>
            <Tag color={getPriorityColor(report.priority)}>
              {report.priority?.toUpperCase()}
            </Tag>
          </Space>

          <Space>
            <UserOutlined />
            <Text>
              <strong>Reported by:</strong> {report.reportedBy}
            </Text>
            <Text>
              <strong>Reported user:</strong> {report.reportedUser}
            </Text>
          </Space>

          <div>
            <Text strong>Reason:</Text>
            <Paragraph
              style={{
                margin: '4px 0',
                padding: 8,
                background: '#fff',
                borderRadius: 4,
              }}
            >
              {report.reason}
            </Paragraph>
          </div>

          {report.evidence && (
            <div>
              <Text strong>Evidence:</Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                {report.evidence}
              </Text>
            </div>
          )}
        </Space>
      </Card>

      <Divider>Resolution Actions</Divider>

      <Form
        form={form}
        layout="vertical"
        onValuesChange={(changedValues) => {
          if (changedValues.action) {
            setActionType(changedValues.action);
          }
        }}
      >
        <Form.Item
          name="action"
          label="Resolution Action"
          rules={[{ required: true, message: 'Please select an action' }]}
        >
          <Select
            placeholder="Select resolution action"
            onChange={setActionType}
          >
            <Option value="dismiss">
              <Space>
                <EyeOutlined style={{ color: '#1890ff' }} />
                Dismiss Report - No violation found
              </Space>
            </Option>
            <Option value="warning">
              <Space>
                <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                Issue Warning - Minor violation
              </Space>
            </Option>
            <Option value="content_removal">
              <Space>
                <CloseOutlined style={{ color: '#ff4d4f' }} />
                Remove Content - Policy violation
              </Space>
            </Option>
            <Option value="user_suspension">
              <Space>
                <UserOutlined style={{ color: '#fa8c16' }} />
                Suspend User - Serious violation
              </Space>
            </Option>
            <Option value="user_ban">
              <Space>
                <CloseOutlined style={{ color: '#ff4d4f' }} />
                Ban User - Severe violation
              </Space>
            </Option>
            <Option value="escalate">
              <Space>
                <ExclamationCircleOutlined style={{ color: '#722ed1' }} />
                Escalate to Senior Moderator
              </Space>
            </Option>
          </Select>
        </Form.Item>

        {actionType && actionType !== 'dismiss' && (
          <Form.Item name="contentAction" label="Content Action">
            <Select placeholder="What to do with the reported content?">
              <Option value="no_action">No action required</Option>
              <Option value="edit_content">Edit/Moderate content</Option>
              <Option value="remove_content">Remove content</Option>
              <Option value="hide_content">Hide content temporarily</Option>
              <Option value="add_warning">Add content warning</Option>
            </Select>
          </Form.Item>
        )}

        {actionType &&
          ['user_suspension', 'user_ban', 'warning'].includes(actionType) && (
            <Form.Item name="userAction" label="User Account Action">
              <Select placeholder="Additional user account actions">
                <Option value="no_action">No additional action</Option>
                <Option value="restrict_posting">
                  Restrict posting privileges
                </Option>
                <Option value="restrict_comments">Restrict commenting</Option>
                <Option value="probation">Place on probation</Option>
                <Option value="require_approval">
                  Require content approval
                </Option>
              </Select>
            </Form.Item>
          )}

        <Form.Item
          name="resolution"
          label="Resolution Summary"
          rules={[
            { required: true, message: 'Please provide a resolution summary' },
            { min: 20, message: 'Summary must be at least 20 characters' },
          ]}
        >
          <TextArea
            rows={3}
            placeholder="Provide a clear summary of your decision and actions taken"
            maxLength={1000}
            showCount
          />
        </Form.Item>

        <Form.Item name="moderatorNotes" label="Internal Moderator Notes">
          <TextArea
            rows={2}
            placeholder="Internal notes for other moderators (not visible to users)"
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item
            name="notifyReporter"
            valuePropName="checked"
            initialValue={true}
          >
            <Select defaultValue={true} style={{ width: '100%' }}>
              <Option value={true}>Notify reporter of resolution</Option>
              <Option value={false}>Do not notify reporter</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notifyReported"
            valuePropName="checked"
            initialValue={actionType !== 'dismiss'}
          >
            <Select
              defaultValue={actionType !== 'dismiss'}
              style={{ width: '100%' }}
            >
              <Option value={true}>Notify reported user of action</Option>
              <Option value={false}>Do not notify reported user</Option>
            </Select>
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  );
};

export default ReportActionModal;
