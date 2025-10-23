import { Form, Input, Button, Card, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAdminAuth } from '../../contexts/admin/adminauthcontext';
import { Navigate, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const AdminLogin = () => {
  const [form] = Form.useForm();
  const { login, loading, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleLogin = async (values) => {
    const result = await login(values);

    if (result.success) {
      navigate('/admin/dashboard', { replace: true });
    } else {
      form.setFields([
        {
          name: 'password',
          errors: ['Invalid username or password'],
        },
      ]);
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          margin: '0 16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          borderRadius: 12,
        }}
        styles={{
          body: { padding: '40px 32px' },
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ marginBottom: 8, color: '#1890ff' }}>
              Yushan Admin
            </Title>
            <Text type="secondary">Web Novel Platform Administration</Text>
          </div>

          <Form
            form={form}
            onFinish={handleLogin}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: 'Please enter your email' },
                {
                  type: 'email',
                  message: 'Please enter a valid email address',
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Email"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please enter your password' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ width: '100%', height: 45 }}
              >
                Login
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', fontSize: '12px', color: '#999' }}>
            <Text type="secondary">
              ~ Yushan Platform Administrators only ~
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default AdminLogin;
