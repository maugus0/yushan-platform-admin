import { useState } from 'react';
import { Modal, Space, Typography, Checkbox, Input, Alert } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const DeleteConfirm = ({
  visible,
  onConfirm,
  onCancel,
  title = 'Delete Item',
  itemName = '',
  itemType = 'item',
  loading = false,
  requireConfirmation = false,
  confirmationText = '',
  cascadeInfo = [],
  dangerLevel = 'medium', // low, medium, high
}) => {
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState('');

  const expectedConfirmationText = confirmationText || itemName || 'DELETE';
  const isConfirmationValid = requireConfirmation
    ? confirmationChecked &&
      (!confirmationText || confirmationInput === expectedConfirmationText)
    : true;

  const handleConfirm = () => {
    if (isConfirmationValid) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    setConfirmationChecked(false);
    setConfirmationInput('');
    onCancel();
  };

  const getDangerConfig = () => {
    const configs = {
      low: {
        color: '#faad14',
        alertType: 'warning',
        description: 'This action can be undone if needed.',
      },
      medium: {
        color: '#fa8c16',
        alertType: 'warning',
        description: 'This action is difficult to undo.',
      },
      high: {
        color: '#ff4d4f',
        alertType: 'error',
        description:
          'This action cannot be undone and may affect multiple items.',
      },
    };
    return configs[dangerLevel] || configs.medium;
  };

  const dangerConfig = getDangerConfig();

  return (
    <Modal
      title={
        <Space>
          <DeleteOutlined style={{ color: dangerConfig.color }} />
          <span>{title}</span>
        </Space>
      }
      open={visible}
      onOk={handleConfirm}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Delete"
      cancelText="Cancel"
      okButtonProps={{
        danger: true,
        disabled: !isConfirmationValid,
      }}
      width={500}
      centered
      destroyOnClose
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Warning Alert */}
        <Alert
          message={
            <Space>
              <ExclamationCircleOutlined />
              <Text strong>Warning: Permanent Deletion</Text>
            </Space>
          }
          description={dangerConfig.description}
          type={dangerConfig.alertType}
          showIcon={false}
        />

        {/* Item Information */}
        <div>
          <Text>
            Are you sure you want to permanently delete this {itemType}?
          </Text>
          {itemName && (
            <div
              style={{
                marginTop: 8,
                padding: 12,
                background: '#fafafa',
                borderRadius: 6,
                border: '1px solid #f0f0f0',
              }}
            >
              <Text strong style={{ color: dangerConfig.color }}>
                {itemName}
              </Text>
            </div>
          )}
        </div>

        {/* Cascade Information */}
        {cascadeInfo.length > 0 && (
          <div>
            <Text strong>This will also delete:</Text>
            <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
              {cascadeInfo.map((item, index) => (
                <li key={index}>
                  <Text type="secondary">{item}</Text>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Confirmation Requirements */}
        {requireConfirmation && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Checkbox
              checked={confirmationChecked}
              onChange={(e) => setConfirmationChecked(e.target.checked)}
            >
              <Text>I understand this action cannot be undone</Text>
            </Checkbox>

            {confirmationText && (
              <div>
                <Text>
                  Type <Text code>{expectedConfirmationText}</Text> to confirm:
                </Text>
                <Input
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  placeholder={expectedConfirmationText}
                  style={{ marginTop: 8 }}
                />
              </div>
            )}
          </Space>
        )}

        {/* Footer Note */}
        <Text type="secondary" style={{ fontSize: '12px' }}>
          This action will be logged for audit purposes.
        </Text>
      </Space>
    </Modal>
  );
};

export default DeleteConfirm;
