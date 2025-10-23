import { Typography, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Text } = Typography;

export const TrendIndicator = ({
  value,
  isPositive,
  showIcon = true,
  suffix = '%',
  size = 'small',
  style = {},
}) => {
  const color = isPositive ? '#52c41a' : '#ff4d4f';
  const icon = isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />;

  return (
    <Space size="small" style={style}>
      {showIcon && <span style={{ color }}>{icon}</span>}
      <Text
        type={isPositive ? 'success' : 'danger'}
        style={{
          fontWeight: '500',
          fontSize: size === 'small' ? '12px' : '14px',
        }}
      >
        {Math.abs(value)}
        {suffix}
      </Text>
      <Text
        type="secondary"
        style={{
          fontSize: size === 'small' ? '12px' : '14px',
        }}
      >
        vs last period
      </Text>
    </Space>
  );
};

export default TrendIndicator;
