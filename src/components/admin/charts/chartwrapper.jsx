import { Card, Typography, Space, Button, Dropdown } from 'antd';
import {
  MoreOutlined,
  DownloadOutlined,
  FullscreenOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

const ChartWrapper = ({
  title,
  subtitle,
  children,
  loading = false,
  actions = [],
  showMoreMenu = false,
  onDownload,
  onFullscreen,
  extra,
  height = 300,
  ...props
}) => {
  const moreMenuItems = [
    {
      key: 'download',
      icon: <DownloadOutlined />,
      label: 'Download',
      onClick: onDownload,
    },
    {
      key: 'fullscreen',
      icon: <FullscreenOutlined />,
      label: 'Fullscreen',
      onClick: onFullscreen,
    },
  ];

  const headerExtra = (
    <Space>
      {actions.map((action, index) => (
        <Button key={index} {...action} />
      ))}
      {extra}
      {showMoreMenu && (
        <Dropdown menu={{ items: moreMenuItems }} placement="bottomRight" arrow>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )}
    </Space>
  );

  return (
    <Card
      loading={loading}
      title={
        <Space direction="vertical" size={0}>
          <Title level={4} style={{ margin: 0 }}>
            {title}
          </Title>
          {subtitle && (
            <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
              {subtitle}
            </Typography.Text>
          )}
        </Space>
      }
      extra={headerExtra}
      bodyStyle={{
        padding: '16px',
        height: height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      style={{
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        ...props.style,
      }}
      {...props}
    >
      <div style={{ width: '100%', height: '100%' }}>{children}</div>
    </Card>
  );
};

export default ChartWrapper;
