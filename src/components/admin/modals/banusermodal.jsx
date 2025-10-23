import { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Checkbox,
  Space,
  message,
} from 'antd';
import {
  ExclamationCircleOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

const BanUserModal = ({
  visible,
  onCancel,
  onConfirm,
  user = null,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [banType, setBanType] = useState('temporary');

  // Don't render if no user is provided
  if (!user) {
    return null;
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const banData = {
        userId: user.id,
        username: user.username,
        banType: values.banType,
        duration: values.duration,
        reason: values.reason,
        deleteContent: values.deleteContent,
        notifyUser: values.notifyUser,
        publicReason: values.publicReason,
        adminNotes: values.adminNotes,
        banDate: new Date().toISOString(),
        expiresAt:
          values.banType === 'permanent'
            ? null
            : values.expiresAt?.toISOString(),
      };

      await onConfirm(banData);
      form.resetFields();
      message.success(`User ${user.username} has been banned successfully`);
    } catch (error) {
      console.error('Ban validation failed:', error);
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
          <UserDeleteOutlined style={{ color: '#ff4d4f' }} />
          <span>Ban User: {user.username}</span>
        </Space>
      }
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Ban User"
      okButtonProps={{ danger: true }}
      cancelText="Cancel"
      width={600}
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
        <ExclamationCircleOutlined
          style={{ color: '#faad14', marginRight: 8 }}
        />
        <span style={{ color: '#666' }}>
          This action will restrict the user's access to the platform. Please
          provide a clear reason.
        </span>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          banType: 'temporary',
          notifyUser: true,
          deleteContent: false,
        }}
      >
        <Form.Item
          name="banType"
          label="Ban Type"
          rules={[{ required: true, message: 'Please select ban type' }]}
        >
          <Select onChange={setBanType}>
            <Option value="temporary">Temporary Ban</Option>
            <Option value="permanent">Permanent Ban</Option>
          </Select>
        </Form.Item>

        {banType === 'temporary' && (
          <Form.Item
            name="expiresAt"
            label="Ban Expires At"
            rules={[
              { required: true, message: 'Please select expiration date' },
            ]}
          >
            <DatePicker
              showTime
              style={{ width: '100%' }}
              placeholder="Select ban expiration date"
              disabledDate={(current) => current && current < new Date()}
            />
          </Form.Item>
        )}

        <Form.Item
          name="reason"
          label="Ban Reason"
          rules={[
            { required: true, message: 'Please provide a ban reason' },
            { min: 10, message: 'Reason must be at least 10 characters' },
          ]}
        >
          <Select placeholder="Select a reason or choose 'Other'">
            <Option value="spam">Spam Content</Option>
            <Option value="harassment">Harassment/Bullying</Option>
            <Option value="inappropriate_content">Inappropriate Content</Option>
            <Option value="copyright_violation">Copyright Violation</Option>
            <Option value="multiple_violations">
              Multiple Policy Violations
            </Option>
            <Option value="fraud">Fraudulent Activity</Option>
            <Option value="other">Other (specify below)</Option>
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
            placeholder="This will be shown to the user and other admins"
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

        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item name="deleteContent" valuePropName="checked">
            <Checkbox>
              Delete all user's content (novels, comments, reviews)
            </Checkbox>
          </Form.Item>

          <Form.Item name="notifyUser" valuePropName="checked">
            <Checkbox>Send ban notification email to user</Checkbox>
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  );
};

export default BanUserModal;
