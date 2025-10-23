import { useState } from 'react';
import {
  Space,
  Button,
  Dropdown,
  Typography,
  Popconfirm,
  Modal,
  message,
} from 'antd';
import {
  CheckOutlined,
  DeleteOutlined,
  DownOutlined,
  ExportOutlined,
  FlagOutlined,
  UserDeleteOutlined,
  CloseOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const BulkActions = ({
  selectedRowKeys = [],
  selectedRows = [],
  onAction,
  actions = [],
  disabled = false,
  loading = false,
  showActionsDropdown = true,
}) => {
  const [actionLoading, setActionLoading] = useState({});

  const handleAction = async (actionKey, actionConfig) => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select items to perform bulk action');
      return;
    }

    const executeAction = async () => {
      setActionLoading((prev) => ({ ...prev, [actionKey]: true }));
      try {
        await onAction(actionKey, selectedRowKeys, selectedRows);
        message.success(
          `${actionConfig.label} completed for ${selectedRowKeys.length} items`
        );
      } catch (error) {
        message.error(`Failed to ${actionConfig.label.toLowerCase()}`);
        console.error('Bulk action error:', error);
      } finally {
        setActionLoading((prev) => ({ ...prev, [actionKey]: false }));
      }
    };

    // Show confirmation for dangerous actions
    if (actionConfig.confirm) {
      Modal.confirm({
        title: actionConfig.confirmTitle || `Confirm ${actionConfig.label}`,
        content:
          actionConfig.confirmContent ||
          `Are you sure you want to ${actionConfig.label.toLowerCase()} ${selectedRowKeys.length} selected items?`,
        okText: actionConfig.label,
        okButtonProps: actionConfig.danger ? { danger: true } : {},
        onOk: executeAction,
      });
    } else {
      await executeAction();
    }
  };

  // Default bulk actions (only used if no custom actions provided)
  const defaultActions = [
    {
      key: 'approve',
      label: 'Approve Selected',
      icon: <CheckOutlined />,
      color: '#52c41a',
      confirm: false,
    },
    {
      key: 'reject',
      label: 'Reject Selected',
      icon: <CloseOutlined />,
      color: '#fa8c16',
      confirm: true,
      confirmTitle: 'Reject Items',
      confirmContent:
        'Are you sure you want to reject the selected items? This action may notify the creators.',
    },
    {
      key: 'delete',
      label: 'Delete Selected',
      icon: <DeleteOutlined />,
      color: '#ff4d4f',
      danger: true,
      confirm: true,
      confirmTitle: 'Delete Items',
      confirmContent:
        'Are you sure you want to permanently delete the selected items? This action cannot be undone.',
    },
    {
      key: 'export',
      label: 'Export Selected',
      icon: <ExportOutlined />,
      color: '#1890ff',
      confirm: false,
    },
    {
      key: 'flag',
      label: 'Flag for Review',
      icon: <FlagOutlined />,
      color: '#faad14',
      confirm: false,
    },
    {
      key: 'ban_users',
      label: 'Ban Users',
      icon: <UserDeleteOutlined />,
      color: '#ff4d4f',
      danger: true,
      confirm: true,
      confirmTitle: 'Ban Users',
      confirmContent:
        'Are you sure you want to ban the selected users? This will restrict their access to the platform.',
    },
  ];

  // Use custom actions if provided, otherwise use default actions
  const allActions = actions.length > 0 ? actions : defaultActions;

  // Create dropdown menu items
  const menuItems = allActions.map((action) => ({
    key: action.key,
    label: (
      <Space>
        <span style={{ color: action.color }}>{action.icon}</span>
        <span>{action.label}</span>
      </Space>
    ),
    disabled: actionLoading[action.key],
  }));

  const handleMenuClick = ({ key }) => {
    const actionConfig = allActions.find((action) => action.key === key);
    if (actionConfig) {
      handleAction(key, actionConfig);
    }
  };

  if (selectedRowKeys.length === 0) {
    return null;
  }

  return (
    <Space>
      <Text strong>
        {selectedRowKeys.length} item{selectedRowKeys.length !== 1 ? 's' : ''}{' '}
        selected
      </Text>

      {/* Only show dropdown if we have actions and showActionsDropdown is true */}
      {allActions.length > 0 && showActionsDropdown && (
        <Dropdown
          menu={{
            items: menuItems,
            onClick: handleMenuClick,
          }}
          disabled={disabled || loading}
          trigger={['click']}
        >
          <Button>
            Bulk Actions <DownOutlined />
          </Button>
        </Dropdown>
      )}

      {/* Quick action buttons for common actions - only show if using default actions and showActionsDropdown is true */}
      {actions.length === 0 && showActionsDropdown && (
        <Space>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            size="small"
            loading={actionLoading.approve}
            disabled={disabled}
            onClick={() =>
              handleAction(
                'approve',
                allActions.find((a) => a.key === 'approve')
              )
            }
          >
            Approve
          </Button>

          <Popconfirm
            title="Delete selected items"
            description={`Are you sure you want to delete ${selectedRowKeys.length} selected items?`}
            onConfirm={() =>
              handleAction(
                'delete',
                allActions.find((a) => a.key === 'delete')
              )
            }
            okText="Delete"
            okButtonProps={{ danger: true }}
            disabled={disabled}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              loading={actionLoading.delete}
              disabled={disabled}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )}
    </Space>
  );
};

// Hook for managing bulk actions state
export const useBulkActions = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys, rows) => {
      setSelectedRowKeys(keys);
      setSelectedRows(rows);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      console.log('Select all:', selected, selectedRows, changeRows);
    },
  };

  const clearSelection = () => {
    setSelectedRowKeys([]);
    setSelectedRows([]);
  };

  return {
    selectedRowKeys,
    selectedRows,
    rowSelection,
    clearSelection,
    setSelectedRowKeys,
    setSelectedRows,
  };
};

export default BulkActions;
