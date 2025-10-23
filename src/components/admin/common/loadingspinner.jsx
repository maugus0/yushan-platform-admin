import { Spin, Space, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

const LoadingSpinner = ({
  spinning = true,
  size = 'default',
  tip = 'Loading...',
  children,
  overlay = false,
  delay = 0,
  indicator,
  style = {},
  className = '',
  showText = true,
  textStyle = {},
  centered = true,
  fullScreen = false,
  ...props
}) => {
  const customIndicator = indicator || (
    <LoadingOutlined style={{ fontSize: 24 }} spin />
  );

  const spinnerContent = (
    <Space direction="vertical" align="center" style={{ width: '100%' }}>
      <Spin
        spinning={spinning}
        size={size}
        indicator={customIndicator}
        delay={delay}
        {...props}
      >
        {children}
      </Spin>
      {showText && tip && (
        <Text type="secondary" style={{ fontSize: '14px', ...textStyle }}>
          {tip}
        </Text>
      )}
    </Space>
  );

  const containerStyle = {
    ...style,
    ...(centered && {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: children ? 'auto' : '200px',
    }),
    ...(fullScreen && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      zIndex: 9999,
    }),
  };

  if (overlay && children) {
    return (
      <div style={{ position: 'relative', ...style }} className={className}>
        {children}
        {spinning && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            {spinnerContent}
          </div>
        )}
      </div>
    );
  }

  if (children && !overlay) {
    return (
      <Spin
        spinning={spinning}
        size={size}
        tip={showText ? tip : ''}
        indicator={customIndicator}
        delay={delay}
        style={style}
        className={className}
        {...props}
      >
        {children}
      </Spin>
    );
  }

  return (
    <div style={containerStyle} className={className}>
      {spinnerContent}
    </div>
  );
};

// Pre-configured spinner variations
export const PageLoader = (props) => (
  <LoadingSpinner
    size="large"
    tip="Loading page..."
    centered
    fullScreen
    {...props}
  />
);

export const TableLoader = (props) => (
  <LoadingSpinner
    tip="Loading data..."
    style={{ minHeight: '300px' }}
    {...props}
  />
);

export const ButtonLoader = (props) => (
  <LoadingSpinner size="small" showText={false} centered={false} {...props} />
);

export const InlineLoader = (props) => (
  <LoadingSpinner
    size="small"
    tip="Loading..."
    centered={false}
    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
    {...props}
  />
);

export default LoadingSpinner;
