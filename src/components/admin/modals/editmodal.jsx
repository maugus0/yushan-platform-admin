import { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Switch,
  Upload,
  Button,
  Space,
  Typography,
  Row,
  Col,
  message,
} from 'antd';
import {
  EditOutlined,
  UploadOutlined,
  SaveOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

const EditModal = ({
  visible,
  onCancel,
  onSave,
  title = 'Edit Item',
  data = {},
  fields = [],
  loading = false,
  width = 600,
  layout = 'vertical',
}) => {
  const [form] = Form.useForm();
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (visible && data) {
      // Process data for form fields
      const processedData = { ...data };

      // Convert date strings to dayjs objects for DatePicker
      fields.forEach((field) => {
        if (field.type === 'date' && processedData[field.name]) {
          processedData[field.name] = dayjs(processedData[field.name]);
        }
      });

      form.setFieldsValue(processedData);
      // Use setTimeout to avoid direct setState in effect
      setTimeout(() => setHasChanges(false), 0);
    }
  }, [visible, data, fields, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // Process values before saving
      const processedValues = { ...values };

      // Convert dayjs objects back to ISO strings
      fields.forEach((field) => {
        if (field.type === 'date' && processedValues[field.name]) {
          processedValues[field.name] =
            processedValues[field.name].toISOString();
        }
      });

      await onSave({ ...data, ...processedValues });
      setHasChanges(false);
      message.success('Changes saved successfully');
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Modal.confirm({
        title: 'Unsaved Changes',
        content: 'You have unsaved changes. Are you sure you want to close?',
        onOk: () => {
          form.resetFields();
          setHasChanges(false);
          onCancel();
        },
      });
    } else {
      onCancel();
    }
  };

  const handleReset = () => {
    const processedData = { ...data };
    fields.forEach((field) => {
      if (field.type === 'date' && processedData[field.name]) {
        processedData[field.name] = dayjs(processedData[field.name]);
      }
    });
    form.setFieldsValue(processedData);
    setHasChanges(false);
    message.info('Form reset to original values');
  };

  const renderField = (field) => {
    const baseProps = {
      placeholder: field.placeholder || `Enter ${field.label.toLowerCase()}`,
      disabled: field.disabled || false,
    };

    switch (field.type) {
      case 'text':
        return <Input {...baseProps} />;

      case 'textarea':
        return (
          <TextArea
            {...baseProps}
            rows={field.rows || 3}
            maxLength={field.maxLength}
            showCount={field.showCount}
          />
        );

      case 'number':
        return (
          <InputNumber
            {...baseProps}
            min={field.min}
            max={field.max}
            step={field.step}
            style={{ width: '100%' }}
          />
        );

      case 'select':
        return (
          <Select {...baseProps} mode={field.mode}>
            {field.options?.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        );

      case 'date':
        return (
          <DatePicker
            {...baseProps}
            showTime={field.showTime}
            format={field.format}
            style={{ width: '100%' }}
          />
        );

      case 'switch':
        return (
          <Switch
            checked={form.getFieldValue(field.name)}
            checkedChildren={field.checkedChildren}
            unCheckedChildren={field.unCheckedChildren}
          />
        );

      case 'upload':
        return (
          <Upload {...field.uploadProps} fileList={field.fileList || []}>
            <Button icon={<UploadOutlined />}>
              {field.uploadText || 'Upload File'}
            </Button>
          </Upload>
        );

      case 'password':
        return <Input.Password {...baseProps} />;

      default:
        return <Input {...baseProps} />;
    }
  };

  const getFormItemProps = (field) => {
    const props = {
      name: field.name,
      label: field.label,
      rules: field.rules || [],
    };

    if (field.type === 'switch') {
      props.valuePropName = 'checked';
    }

    return props;
  };

  return (
    <Modal
      title={
        <Space>
          <EditOutlined />
          <span>{title}</span>
          {hasChanges && (
            <Text type="warning" style={{ fontSize: '12px' }}>
              (Unsaved changes)
            </Text>
          )}
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="reset" onClick={handleReset} disabled={!hasChanges}>
          <ReloadOutlined /> Reset
        </Button>,
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="save"
          type="primary"
          onClick={handleSave}
          loading={loading}
          icon={<SaveOutlined />}
        >
          Save Changes
        </Button>,
      ]}
      width={width}
      destroyOnClose
    >
      <Form
        form={form}
        layout={layout}
        onValuesChange={() => setHasChanges(true)}
      >
        <Row gutter={16}>
          {fields.map((field) => (
            <Col
              key={field.name}
              span={field.span || (layout === 'horizontal' ? 24 : 12)}
            >
              <Form.Item {...getFormItemProps(field)}>
                {renderField(field)}
              </Form.Item>
            </Col>
          ))}
        </Row>
      </Form>
    </Modal>
  );
};

// Common field configurations
export const fieldTypes = {
  text: (name, label, options = {}) => ({
    name,
    label,
    type: 'text',
    ...options,
  }),

  textarea: (name, label, options = {}) => ({
    name,
    label,
    type: 'textarea',
    rows: 3,
    ...options,
  }),

  number: (name, label, options = {}) => ({
    name,
    label,
    type: 'number',
    ...options,
  }),

  select: (name, label, options, config = {}) => ({
    name,
    label,
    type: 'select',
    options,
    ...config,
  }),

  date: (name, label, options = {}) => ({
    name,
    label,
    type: 'date',
    ...options,
  }),

  switch: (name, label, options = {}) => ({
    name,
    label,
    type: 'switch',
    ...options,
  }),
};

export default EditModal;
