import { useState, useEffect } from 'react';
import { Form, Input, Switch, Button, Space, Card, message, Spin } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { categoryService } from '../../../services/admin/categoryservice';

const { TextArea } = Input;

const CategoryForm = ({ categoryId, onSuccess, onCancel, mode = 'create' }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load category data if editing
  useEffect(() => {
    if (mode === 'edit' && categoryId) {
      loadCategory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, mode]);

  const loadCategory = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getCategoryById(categoryId);
      if (response.success) {
        form.setFieldsValue({
          name: response.data.name,
          description: response.data.description,
          isActive: response.data.isActive,
        });
      }
    } catch (error) {
      message.error('Failed to load category: ' + error.message);
      if (onCancel) onCancel();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      let response;

      if (mode === 'edit') {
        response = await categoryService.updateCategory(categoryId, values);
        message.success('Category updated successfully');
      } else {
        response = await categoryService.createCategory(values);
        message.success('Category created successfully');
      }

      if (response.success) {
        form.resetFields();
        if (onSuccess) onSuccess(response.data);
      }
    } catch (error) {
      message.error(
        `Failed to ${mode === 'edit' ? 'update' : 'create'} category: ` +
          error.message
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    if (onCancel) onCancel();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" tip="Loading category..." />
      </div>
    );
  }

  return (
    <Card
      title={mode === 'edit' ? 'Edit Category' : 'Create New Category'}
      bordered={false}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          isActive: true,
        }}
      >
        <Form.Item
          label="Category Name"
          name="name"
          rules={[
            { required: true, message: 'Please enter category name' },
            { min: 2, message: 'Name must be at least 2 characters' },
            { max: 50, message: 'Name must not exceed 50 characters' },
          ]}
        >
          <Input
            placeholder="Enter category name (e.g., Fantasy, Romance)"
            maxLength={50}
            showCount
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            { required: true, message: 'Please enter category description' },
            { min: 10, message: 'Description must be at least 10 characters' },
            { max: 500, message: 'Description must not exceed 500 characters' },
          ]}
        >
          <TextArea
            placeholder="Enter a brief description of this category"
            rows={4}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          label="Active Status"
          name="isActive"
          valuePropName="checked"
          extra={
            mode === 'create'
              ? 'Note: Backend currently only supports creating active categories. This will be enabled once backend API is updated.'
              : 'Toggle to activate or deactivate this category'
          }
          tooltip={
            mode === 'create'
              ? 'Creating inactive categories will be available soon'
              : undefined
          }
        >
          <Switch
            checkedChildren="Active"
            unCheckedChildren="Inactive"
            disabled={mode === 'create'} // Disable in create mode until backend supports it
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={submitting}
            >
              {mode === 'edit' ? 'Update Category' : 'Create Category'}
            </Button>
            <Button
              icon={<CloseOutlined />}
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CategoryForm;
