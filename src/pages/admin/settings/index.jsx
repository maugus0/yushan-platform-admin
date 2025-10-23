import { useState, useEffect } from 'react';
import {
  Button,
  Space,
  Card,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  message,
  Row,
  Col,
  ColorPicker,
  Slider,
  Grid,
} from 'antd';
import {
  SettingOutlined,
  SaveOutlined,
  ReloadOutlined,
  GlobalOutlined,
  SecurityScanOutlined,
  DollarOutlined,
  BellOutlined,
  ThunderboltOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { PageHeader, LoadingSpinner } from '../../../components/admin/common';

const { TextArea } = Input;
const { Option } = Select;
const { useBreakpoint } = Grid;

const Settings = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('general');
  const [form] = Form.useForm();
  const [hasChanges, setHasChanges] = useState(false);

  // Mock settings data
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Yushan',
      siteDescription: 'Premium Web Novel Platform',
      siteUrl: 'https://yushan.com',
      adminEmail: 'admin@yushan.com',
      timeZone: 'UTC',
      language: 'en',
      maintenanceMode: false,
      registrationEnabled: true,
    },
    appearance: {
      primaryColor: '#1890ff',
      secondaryColor: '#52c41a',
      logoUrl: '/logo.png',
      faviconUrl: '/favicon.ico',
      theme: 'light',
      headerLayout: 'fixed',
      sidebarCollapsed: false,
      customCSS: '',
    },
    content: {
      maxChapterLength: 10000,
      autoApproveChapters: false,
      allowGuestReading: true,
      requireEmailVerification: true,
      moderationLevel: 'medium',
      defaultNovelStatus: 'pending',
      allowedFileTypes: ['txt', 'docx', 'md'],
      maxFileSize: 10, // MB
    },
    monetization: {
      yuanExchangeRate: 0.01, // 1 yuan = $0.01
      authorCommission: 70, // percentage
      platformFee: 30,
      minimumPayout: 50, // dollars
      paymentMethods: ['paypal', 'stripe', 'bank'],
      enableTipping: true,
      enablePremiumContent: true,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      newChapterNotifications: true,
      commentNotifications: true,
      reviewNotifications: true,
      systemAlerts: true,
      marketingEmails: false,
      notificationBatchSize: 100,
    },
    security: {
      passwordMinLength: 8,
      requireStrongPassword: true,
      enableTwoFactor: false,
      sessionTimeout: 24, // hours
      maxLoginAttempts: 5,
      enableCaptcha: true,
      ipWhitelist: '',
      enableRateLimiting: true,
    },
    performance: {
      enableCaching: true,
      cacheExpiry: 3600, // seconds
      enableCompression: true,
      maxConcurrentUsers: 10000,
      enableCDN: true,
      cdnUrl: 'https://cdn.yushan.com',
      databaseOptimization: true,
      enableBackups: true,
    },
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load settings from API
  const loadSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      form.setFieldsValue(settings[activeSection]);
    } catch (error) {
      message.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // Handle form value changes
  const handleValuesChange = () => {
    setHasChanges(true);
  };

  // Save settings
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSettings((prev) => ({
        ...prev,
        [activeSection]: values,
      }));

      setHasChanges(false);
      message.success('Settings saved successfully');
    } catch (error) {
      message.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  // Reset settings
  const handleReset = () => {
    form.setFieldsValue(settings[activeSection]);
    setHasChanges(false);
    message.info('Settings reset to last saved values');
  };

  // Settings sections
  const sections = [
    { key: 'general', label: 'General', icon: <SettingOutlined /> },
    { key: 'appearance', label: 'Appearance', icon: <PictureOutlined /> },
    { key: 'content', label: 'Content', icon: <GlobalOutlined /> },
    { key: 'monetization', label: 'Monetization', icon: <DollarOutlined /> },
    { key: 'notifications', label: 'Notifications', icon: <BellOutlined /> },
    { key: 'security', label: 'Security', icon: <SecurityScanOutlined /> },
    { key: 'performance', label: 'Performance', icon: <ThunderboltOutlined /> },
  ];

  // Render form fields based on active section
  const renderFormFields = () => {
    // Responsive column props for form fields
    const colProps = { xs: 24, sm: 24, md: 12, lg: 12, xl: 12 };

    switch (activeSection) {
      case 'general':
        return (
          <>
            <Row gutter={[16, 16]}>
              <Col {...colProps}>
                <Form.Item
                  name="siteName"
                  label="Site Name"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Enter site name" />
                </Form.Item>
              </Col>
              <Col {...colProps}>
                <Form.Item
                  name="siteUrl"
                  label="Site URL"
                  rules={[{ required: true, type: 'url' }]}
                >
                  <Input placeholder="https://example.com" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="siteDescription" label="Site Description">
              <TextArea
                rows={3}
                placeholder="Brief description of your platform"
              />
            </Form.Item>

            <Row gutter={[16, 16]}>
              <Col {...colProps}>
                <Form.Item
                  name="adminEmail"
                  label="Admin Email"
                  rules={[{ required: true, type: 'email' }]}
                >
                  <Input placeholder="admin@example.com" />
                </Form.Item>
              </Col>
              <Col {...colProps}>
                <Form.Item name="timeZone" label="Time Zone">
                  <Select placeholder="Select timezone">
                    <Option value="UTC">UTC</Option>
                    <Option value="America/New_York">Eastern Time</Option>
                    <Option value="America/Los_Angeles">Pacific Time</Option>
                    <Option value="Europe/London">London</Option>
                    <Option value="Asia/Tokyo">Tokyo</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col {...colProps}>
                <Form.Item name="language" label="Default Language">
                  <Select placeholder="Select language">
                    <Option value="en">English</Option>
                    <Option value="zh">Chinese</Option>
                    <Option value="ja">Japanese</Option>
                    <Option value="ko">Korean</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col {...colProps}>
                <Form.Item
                  name="maintenanceMode"
                  label="Maintenance Mode"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="registrationEnabled"
              label="User Registration"
              valuePropName="checked"
            >
              <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
            </Form.Item>
          </>
        );

      case 'appearance':
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="primaryColor" label="Primary Color">
                  <ColorPicker showText />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="secondaryColor" label="Secondary Color">
                  <ColorPicker showText />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="logoUrl" label="Logo URL">
                  <Input placeholder="/logo.png" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="faviconUrl" label="Favicon URL">
                  <Input placeholder="/favicon.ico" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="theme" label="Default Theme">
                  <Select placeholder="Select theme">
                    <Option value="light">Light</Option>
                    <Option value="dark">Dark</Option>
                    <Option value="auto">Auto</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="headerLayout" label="Header Layout">
                  <Select placeholder="Select layout">
                    <Option value="fixed">Fixed</Option>
                    <Option value="static">Static</Option>
                    <Option value="sticky">Sticky</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="customCSS" label="Custom CSS">
              <TextArea rows={6} placeholder="Add custom CSS rules..." />
            </Form.Item>
          </>
        );

      case 'content':
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="maxChapterLength"
                  label="Max Chapter Length (words)"
                >
                  <InputNumber
                    min={1000}
                    max={50000}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="maxFileSize" label="Max File Size (MB)">
                  <InputNumber min={1} max={100} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="moderationLevel" label="Moderation Level">
                  <Select placeholder="Select level">
                    <Option value="low">Low</Option>
                    <Option value="medium">Medium</Option>
                    <Option value="high">High</Option>
                    <Option value="strict">Strict</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="defaultNovelStatus"
                  label="Default Novel Status"
                >
                  <Select placeholder="Select status">
                    <Option value="pending">Pending Review</Option>
                    <Option value="approved">Auto-Approved</Option>
                    <Option value="draft">Draft</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="allowedFileTypes" label="Allowed File Types">
              <Select mode="multiple" placeholder="Select file types">
                <Option value="txt">TXT</Option>
                <Option value="docx">DOCX</Option>
                <Option value="md">Markdown</Option>
                <Option value="pdf">PDF</Option>
              </Select>
            </Form.Item>

            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item
                name="autoApproveChapters"
                label="Auto-approve Chapters"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="allowGuestReading"
                label="Allow Guest Reading"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="requireEmailVerification"
                label="Require Email Verification"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Space>
          </>
        );

      case 'monetization':
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="yuanExchangeRate"
                  label="Yuan Exchange Rate (USD)"
                >
                  <InputNumber
                    min={0.001}
                    max={1}
                    step={0.001}
                    precision={3}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="minimumPayout" label="Minimum Payout ($)">
                  <InputNumber min={10} max={500} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="authorCommission"
                  label="Author Commission (%)"
                >
                  <Slider
                    min={50}
                    max={90}
                    marks={{ 50: '50%', 70: '70%', 90: '90%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="platformFee" label="Platform Fee (%)">
                  <Slider
                    min={10}
                    max={50}
                    marks={{ 10: '10%', 30: '30%', 50: '50%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="paymentMethods" label="Payment Methods">
              <Select mode="multiple" placeholder="Select payment methods">
                <Option value="paypal">PayPal</Option>
                <Option value="stripe">Stripe</Option>
                <Option value="bank">Bank Transfer</Option>
                <Option value="crypto">Cryptocurrency</Option>
              </Select>
            </Form.Item>

            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item
                name="enableTipping"
                label="Enable Tipping"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="enablePremiumContent"
                label="Enable Premium Content"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Space>
          </>
        );

      case 'notifications':
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Form.Item
                    name="emailNotifications"
                    label="Email Notifications"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  <Form.Item
                    name="pushNotifications"
                    label="Push Notifications"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  <Form.Item
                    name="newChapterNotifications"
                    label="New Chapter Alerts"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  <Form.Item
                    name="commentNotifications"
                    label="Comment Notifications"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Form.Item
                    name="reviewNotifications"
                    label="Review Notifications"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  <Form.Item
                    name="systemAlerts"
                    label="System Alerts"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  <Form.Item
                    name="marketingEmails"
                    label="Marketing Emails"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Space>
              </Col>
            </Row>

            <Form.Item
              name="notificationBatchSize"
              label="Notification Batch Size"
            >
              <InputNumber min={10} max={1000} style={{ width: '100%' }} />
            </Form.Item>
          </>
        );

      case 'security':
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="passwordMinLength" label="Min Password Length">
                  <InputNumber min={6} max={32} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="sessionTimeout"
                  label="Session Timeout (hours)"
                >
                  <InputNumber min={1} max={168} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="maxLoginAttempts" label="Max Login Attempts">
              <InputNumber min={3} max={10} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="ipWhitelist" label="IP Whitelist">
              <TextArea
                rows={3}
                placeholder="Enter IP addresses separated by commas"
              />
            </Form.Item>

            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item
                name="requireStrongPassword"
                label="Require Strong Password"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="enableTwoFactor"
                label="Enable Two-Factor Auth"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="enableCaptcha"
                label="Enable CAPTCHA"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="enableRateLimiting"
                label="Enable Rate Limiting"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Space>
          </>
        );

      case 'performance':
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="cacheExpiry" label="Cache Expiry (seconds)">
                  <InputNumber
                    min={300}
                    max={86400}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="maxConcurrentUsers"
                  label="Max Concurrent Users"
                >
                  <InputNumber
                    min={1000}
                    max={100000}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="cdnUrl" label="CDN URL">
              <Input placeholder="https://cdn.example.com" />
            </Form.Item>

            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item
                name="enableCaching"
                label="Enable Caching"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="enableCompression"
                label="Enable Compression"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="enableCDN"
                label="Enable CDN"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="databaseOptimization"
                label="Database Optimization"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="enableBackups"
                label="Enable Backups"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Space>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <PageHeader
        title="Platform Settings"
        subtitle="Configure and manage platform settings"
        breadcrumbs={[
          { title: 'Dashboard', href: '/yushan-admin/admin/dashboard' },
          { title: 'Settings' },
        ]}
        actions={[
          <Button
            key="reset"
            icon={<ReloadOutlined />}
            onClick={handleReset}
            disabled={!hasChanges}
          >
            Reset
          </Button>,
          <Button
            key="save"
            type="primary"
            icon={<SaveOutlined />}
            loading={loading}
            onClick={handleSave}
            disabled={!hasChanges}
          >
            Save Settings
          </Button>,
        ]}
      />

      <Row gutter={[16, 16]}>
        {/* Settings Navigation */}
        <Col xs={24} sm={24} md={6} lg={6} xl={5}>
          <Card
            title="Settings Categories"
            size={isMobile ? 'default' : 'small'}
            style={{ marginBottom: isMobile ? '16px' : '0' }}
          >
            <Space
              direction={isMobile ? 'horizontal' : 'vertical'}
              style={{ width: '100%' }}
              wrap={isMobile}
            >
              {sections.map((section) => (
                <Button
                  key={section.key}
                  type={activeSection === section.key ? 'primary' : 'text'}
                  icon={section.icon}
                  block={!isMobile}
                  size={isMobile ? 'small' : 'default'}
                  style={{
                    textAlign: isMobile ? 'center' : 'left',
                    minWidth: isMobile ? 'auto' : 'unset',
                  }}
                  onClick={() => {
                    setActiveSection(section.key);
                    form.setFieldsValue(settings[section.key]);
                    setHasChanges(false);
                  }}
                >
                  {isMobile ? section.icon : section.label}
                </Button>
              ))}
            </Space>
          </Card>
        </Col>

        {/* Settings Form */}
        <Col xs={24} sm={24} md={18} lg={18} xl={19}>
          <Card
            title={
              <Space>
                {sections.find((s) => s.key === activeSection)?.icon}
                <span>
                  {sections.find((s) => s.key === activeSection)?.label}{' '}
                  Settings
                </span>
              </Space>
            }
            loading={loading}
          >
            {loading ? (
              <LoadingSpinner tip="Loading settings..." />
            ) : (
              <Form
                form={form}
                layout="vertical"
                onValuesChange={handleValuesChange}
                initialValues={settings[activeSection]}
              >
                {renderFormFields()}
              </Form>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Settings;
