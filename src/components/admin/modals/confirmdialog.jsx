import { Modal, Space, Typography } from 'antd';
import {
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const ConfirmDialog = ({
  visible,
  onConfirm,
  onCancel,
  title = 'Confirm Action',
  content = 'Are you sure you want to proceed?',
  type = 'warning', // warning, info, success, error, question
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  danger = false,
  width = 400,
  icon = null,
  details = null,
}) => {
  const getIcon = () => {
    if (icon) return icon;

    const iconMap = {
      warning: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
      info: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
      success: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      error: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
      question: <QuestionCircleOutlined style={{ color: '#722ed1' }} />,
    };

    return iconMap[type] || iconMap.warning;
  };

  const getConfirmButtonProps = () => {
    const baseProps = {
      loading,
    };

    if (danger || type === 'error') {
      return { ...baseProps, danger: true };
    }

    if (type === 'success') {
      return { ...baseProps, type: 'primary' };
    }

    return baseProps;
  };

  return (
    <Modal
      title={
        <Space>
          {getIcon()}
          <span>{title}</span>
        </Space>
      }
      open={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={confirmText}
      cancelText={cancelText}
      okButtonProps={getConfirmButtonProps()}
      width={width}
      centered
      destroyOnClose
    >
      <div style={{ paddingTop: 16 }}>
        <Text style={{ fontSize: '14px', lineHeight: 1.6 }}>{content}</Text>

        {details && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: '#fafafa',
              borderRadius: 6,
              border: '1px solid #f0f0f0',
            }}
          >
            <Text type="secondary" style={{ fontSize: '13px' }}>
              {details}
            </Text>
          </div>
        )}
      </div>
    </Modal>
  );
};

// Pre-configured confirm dialogs for common actions
export const useConfirmDialog = () => {
  const confirm = (config) => {
    return new Promise((resolve) => {
      Modal.confirm({
        title: config.title,
        content: config.content,
        icon: config.icon,
        okText: config.confirmText || 'Confirm',
        cancelText: config.cancelText || 'Cancel',
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
        okButtonProps: config.danger ? { danger: true } : {},
        ...config,
      });
    });
  };

  return { confirm };
};

// Common confirm dialog configurations
export const confirmDialogs = {
  delete: (itemName) => ({
    title: 'Delete Confirmation',
    content: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
    type: 'error',
    danger: true,
    confirmText: 'Delete',
    icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
  }),

  approve: (itemName) => ({
    title: 'Approve Content',
    content: `Are you sure you want to approve "${itemName}"? This will make it visible to all users.`,
    type: 'success',
    confirmText: 'Approve',
    icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  }),

  reject: (itemName) => ({
    title: 'Reject Content',
    content: `Are you sure you want to reject "${itemName}"? The author will be notified.`,
    type: 'warning',
    confirmText: 'Reject',
    icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
  }),

  publish: (itemName) => ({
    title: 'Publish Content',
    content: `Are you sure you want to publish "${itemName}"? This will make it available to readers.`,
    type: 'info',
    confirmText: 'Publish',
    icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
  }),

  suspend: (userName) => ({
    title: 'Suspend User',
    content: `Are you sure you want to suspend "${userName}"? They will lose access to their account temporarily.`,
    type: 'warning',
    confirmText: 'Suspend',
    icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
  }),
};

export default ConfirmDialog;
