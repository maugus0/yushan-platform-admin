import { Card, Statistic, Row, Col } from 'antd';
import { TrendIndicator } from './trendindicator';

const StatCard = ({
  title,
  value,
  prefix,
  suffix,
  precision = 0,
  trend = null, // { value: 12.5, isPositive: true }
  loading = false,
  valueStyle = {},
  extra = null,
  ...props
}) => {
  return (
    <Card
      loading={loading}
      hoverable
      style={{
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        ...props.style,
      }}
      bodyStyle={{ padding: '20px' }}
      {...props}
    >
      <Row>
        <Col span={24}>
          <Statistic
            title={title}
            value={value}
            precision={precision}
            prefix={prefix}
            suffix={suffix}
            valueStyle={{
              fontSize: '28px',
              fontWeight: 'bold',
              ...valueStyle,
            }}
          />
          {trend && (
            <div style={{ marginTop: '8px' }}>
              <TrendIndicator
                value={trend.value}
                isPositive={trend.isPositive}
                showIcon={true}
              />
            </div>
          )}
          {extra && <div style={{ marginTop: '8px' }}>{extra}</div>}
        </Col>
      </Row>
    </Card>
  );
};

export default StatCard;
