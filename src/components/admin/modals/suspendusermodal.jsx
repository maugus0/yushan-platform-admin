import { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Checkbox,
  Space,
  Typography,
  message,
} from 'antd';
import {
  ExclamationCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

const SuspendUserModal = ({
  visible,
  onCancel,
  onConfirm,
  user = null,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [suspensionType, setSuspensionType] = useState('temporary');

  // Don't render if no user is provided
  if (!user) {
    return null;
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const suspensionData = {
        userId: user.id,
        username: user.username,
        suspensionType: values.suspensionType,
        duration: values.duration,
        reason: values.reason,
        restrictions: values.restrictions || [],
        notifyUser: values.notifyUser,
        publicReason: values.publicReason,
        adminNotes: values.adminNotes,
        suspendedAt: new Date().toISOString(),
        expiresAt:
          values.suspensionType === 'indefinite'
            ? null
            : values.expiresAt?.toISOString(),
      };

      await onConfirm(suspensionData);
      form.resetFields();
      message.success(`User ${user.username} has been suspended successfully`);
    } catch (error) {
      console.error('Suspension validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <Space>
          <ClockCircleOutlined style={{ color: '#fa8c16' }} />
          <span>Suspend User: {user.username}</span>
        </Space>
      }
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Suspend User"
      okButtonProps={{
        style: { backgroundColor: '#fa8c16', borderColor: '#fa8c16' },
      }}
      cancelText="Cancel"
      width={600}
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
        <ExclamationCircleOutlined
          style={{ color: '#faad14', marginRight: 8 }}
        />
        <span style={{ color: '#666' }}>
          This action will temporarily restrict the user's access and activities
          on the platform.
        </span>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          suspensionType: 'temporary',
          notifyUser: true,
          restrictions: ['posting'],
        }}
      >
        <Form.Item
          name="suspensionType"
          label="Suspension Type"
          rules={[{ required: true, message: 'Please select suspension type' }]}
        >
          <Select onChange={setSuspensionType}>
            <Option value="temporary">Temporary Suspension</Option>
            <Option value="indefinite">Indefinite Suspension</Option>
          </Select>
        </Form.Item>

        {suspensionType === 'temporary' && (
          <Form.Item
            name="expiresAt"
            label="Suspension Expires At"
            rules={[
              { required: true, message: 'Please select expiration date' },
            ]}
          >
            <DatePicker
              showTime
              style={{ width: '100%' }}
              placeholder="Select suspension expiration date"
              disabledDate={(current) => current && current < new Date()}
            />
          </Form.Item>
        )}

        <Form.Item
          name="reason"
          label="Suspension Reason"
          rules={[{ required: true, message: 'Please select a reason' }]}
        >
          <Select placeholder="Select a reason for suspension">
            <Option value="spam_content">Posting Spam Content</Option>
            <Option value="inappropriate_behavior">
              Inappropriate Behavior
            </Option>
            <Option value="policy_violation">Platform Policy Violation</Option>
            <Option value="harassment">Harassment of Other Users</Option>
            <Option value="fake_accounts">Creating Fake Accounts</Option>
            <Option value="copyright_issues">Copyright-related Issues</Option>
            <Option value="repeated_warnings">
              Repeated Warning Violations
            </Option>
            <Option value="other">Other (specify below)</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="restrictions"
          label="Specific Restrictions"
          rules={[
            {
              required: true,
              message: 'Please select at least one restriction',
            },
          ]}
        >
          <Select mode="multiple" placeholder="Select restrictions to apply">
            <Option value="posting">Cannot post new content</Option>
            <Option value="commenting">Cannot comment</Option>
            <Option value="reviewing">Cannot write reviews</Option>
            <Option value="messaging">Cannot send messages</Option>
            <Option value="rating">Cannot rate content</Option>
            <Option value="forum_access">No forum access</Option>
            <Option value="profile_editing">Cannot edit profile</Option>
            <Option value="uploading">Cannot upload files</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="publicReason"
          label="Public Reason (shown to user)"
          rules={[
            { required: true, message: 'Please provide a public reason' },
          ]}
        >
          <TextArea
            rows={3}
            placeholder="This message will be shown to the user explaining their suspension"
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item name="adminNotes" label="Internal Admin Notes">
          <TextArea
            rows={2}
            placeholder="Internal notes for other administrators (not visible to user)"
            maxLength={1000}
            showCount
          />
        </Form.Item>

        <Form.Item name="notifyUser" valuePropName="checked">
          <Checkbox>Send suspension notification email to user</Checkbox>
        </Form.Item>
      </Form>

      {/* Preview of suspension effects */}
      <div
        style={{
          marginTop: 16,
          padding: 12,
          background: '#fff7e6',
          borderRadius: 6,
          border: '1px solid #ffd591',
        }}
      >
        <Text strong style={{ color: '#fa8c16' }}>
          Suspension Effects:
        </Text>
        <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
          <li>
            <Text type="secondary">User will be logged out immediately</Text>
          </li>
          <li>
            <Text type="secondary">Selected restrictions will be enforced</Text>
          </li>
          <li>
            <Text type="secondary">
              User will see suspension notice when trying to access restricted
              features
            </Text>
          </li>
          <li>
            <Text type="secondary">
              Suspension will be visible in user's profile for administrators
            </Text>
          </li>
        </ul>
      </div>
    </Modal>
  );
};

export default SuspendUserModal;
