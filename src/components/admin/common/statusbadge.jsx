import { Tag } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';

const StatusBadge = ({
  status,
  type: _type = 'default',
  showIcon = true,
  customConfig = {},
  ...props
}) => {
  const defaultConfigs = {
    // User statuses
    active: { color: 'success', icon: <CheckCircleOutlined />, text: 'Active' },
    inactive: {
      color: 'default',
      icon: <MinusCircleOutlined />,
      text: 'Inactive',
    },
    suspended: {
      color: 'error',
      icon: <CloseCircleOutlined />,
      text: 'Suspended',
    },
    banned: { color: 'error', icon: <CloseCircleOutlined />, text: 'Banned' },
    pending: {
      color: 'warning',
      icon: <ClockCircleOutlined />,
      text: 'Pending',
    },

    // Content statuses
    published: {
      color: 'success',
      icon: <CheckCircleOutlined />,
      text: 'Published',
    },
    draft: { color: 'default', icon: <ClockCircleOutlined />, text: 'Draft' },
    reviewing: {
      color: 'processing',
      icon: <SyncOutlined spin />,
      text: 'Reviewing',
    },
    rejected: {
      color: 'error',
      icon: <CloseCircleOutlined />,
      text: 'Rejected',
    },
    archived: {
      color: 'default',
      icon: <MinusCircleOutlined />,
      text: 'Archived',
    },

    // General statuses
    online: { color: 'success', icon: <CheckCircleOutlined />, text: 'Online' },
    offline: {
      color: 'default',
      icon: <MinusCircleOutlined />,
      text: 'Offline',
    },
    loading: {
      color: 'processing',
      icon: <SyncOutlined spin />,
      text: 'Loading',
    },
    error: {
      color: 'error',
      icon: <ExclamationCircleOutlined />,
      text: 'Error',
    },
    warning: {
      color: 'warning',
      icon: <ExclamationCircleOutlined />,
      text: 'Warning',
    },

    // Novel specific
    completed: {
      color: 'success',
      icon: <CheckCircleOutlined />,
      text: 'Completed',
    },
    ongoing: {
      color: 'processing',
      icon: <SyncOutlined spin />,
      text: 'Ongoing',
    },
    hiatus: { color: 'warning', icon: <ClockCircleOutlined />, text: 'Hiatus' },
    dropped: { color: 'error', icon: <CloseCircleOutlined />, text: 'Dropped' },

    // Priority levels
    high: { color: 'error', icon: <ExclamationCircleOutlined />, text: 'High' },
    medium: {
      color: 'warning',
      icon: <ExclamationCircleOutlined />,
      text: 'Medium',
    },
    low: { color: 'default', icon: <MinusCircleOutlined />, text: 'Low' },

    // Payment/transaction statuses
    paid: { color: 'success', icon: <CheckCircleOutlined />, text: 'Paid' },
    unpaid: { color: 'error', icon: <CloseCircleOutlined />, text: 'Unpaid' },
    processing: {
      color: 'processing',
      icon: <SyncOutlined spin />,
      text: 'Processing',
    },
    refunded: {
      color: 'warning',
      icon: <ExclamationCircleOutlined />,
      text: 'Refunded',
    },
  };

  // Merge custom config with defaults
  const configs = { ...defaultConfigs, ...customConfig };
  const config = configs[status] || { color: 'default', text: status };

  return (
    <Tag color={config.color} icon={showIcon ? config.icon : null} {...props}>
      {config.text}
    </Tag>
  );
};

export default StatusBadge;
