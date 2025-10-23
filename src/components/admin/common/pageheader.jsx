import { Space, Typography, Divider, Grid } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Breadcrumbs from './breadcrumbs';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const PageHeader = ({
  title,
  subtitle,
  onBack,
  showBackButton = false,
  breadcrumbs = [],
  showBreadcrumbs = true,
  extra,
  actions = [],
  tags,
  avatar,
  footer,
  style = {},
  className = '',
  children,
  ..._props
}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const backIcon = showBackButton ? <ArrowLeftOutlined /> : null;

  const headerExtra = (
    <Space
      size={isMobile ? 'small' : 'middle'}
      direction={isMobile ? 'vertical' : 'horizontal'}
      style={{
        width: isMobile ? '100%' : 'auto',
        alignItems: isMobile ? 'stretch' : 'center',
      }}
    >
      {actions.map((action, index) => (
        <div key={index} style={{ width: isMobile ? '100%' : 'auto' }}>
          {action}
        </div>
      ))}
      {extra}
    </Space>
  );

  return (
    <div style={{ marginBottom: '24px', ...style }} className={className}>
      {/* Breadcrumbs */}
      {showBreadcrumbs && breadcrumbs.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <Breadcrumbs items={breadcrumbs} />
        </div>
      )}

      {/* Main Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'flex-start',
          marginBottom: footer ? '16px' : '0',
          gap: isMobile ? '16px' : '0',
        }}
      >
        <div style={{ flex: 1 }}>
          <Space
            align="start"
            size="middle"
            direction={isMobile ? 'column' : 'horizontal'}
          >
            {showBackButton && (
              <span
                onClick={onBack}
                style={{
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#1890ff',
                  display: 'flex',
                  alignItems: 'center',
                  height: '32px',
                }}
              >
                {backIcon}
              </span>
            )}

            {avatar && <div>{avatar}</div>}

            <div style={{ width: isMobile ? '100%' : 'auto' }}>
              <Title
                level={isMobile ? 3 : 2}
                style={{
                  margin: 0,
                  lineHeight: 1.2,
                  fontSize: isMobile ? '20px' : undefined,
                }}
              >
                {title}
              </Title>
              {subtitle && (
                <Text
                  type="secondary"
                  style={{
                    fontSize: isMobile ? '13px' : '14px',
                    display: 'block',
                    marginTop: '4px',
                    lineHeight: isMobile ? 1.4 : 1.2,
                  }}
                >
                  {subtitle}
                </Text>
              )}
              {tags && <div style={{ marginTop: '8px' }}>{tags}</div>}
            </div>
          </Space>
        </div>

        {(actions.length > 0 || extra) && (
          <div
            style={{
              marginLeft: isMobile ? '0' : '16px',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            {headerExtra}
          </div>
        )}
      </div>

      {/* Footer */}
      {footer && (
        <>
          <Divider style={{ margin: '16px 0' }} />
          <div>{footer}</div>
        </>
      )}

      {/* Children Content */}
      {children && (
        <>
          <Divider style={{ margin: '16px 0' }} />
          <div>{children}</div>
        </>
      )}
    </div>
  );
};

export default PageHeader;
