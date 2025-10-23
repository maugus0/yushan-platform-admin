import {
  Modal,
  Descriptions,
  Space,
  Typography,
  Tag,
  Avatar,
  Image,
  Divider,
  Grid,
} from 'antd';
import {
  EyeOutlined,
  UserOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Paragraph, Title } = Typography;
const { useBreakpoint } = Grid;

const ViewModal = ({
  visible,
  onCancel,
  title = 'View Details',
  data = {},
  fields = [],
  width = 800,
  layout = 'horizontal', // horizontal, vertical
}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Adjust width and layout for mobile
  const modalWidth = isMobile ? '95vw' : width;
  const columnCount = isMobile ? 1 : layout === 'horizontal' ? 2 : 1;
  const renderFieldValue = (field, value) => {
    if (value === null || value === undefined || value === '') {
      return <Text type="secondary">-</Text>;
    }

    switch (field.type) {
      case 'text':
      case 'textarea':
        return (
          <Paragraph
            copyable={field.copyable}
            ellipsis={field.ellipsis ? { rows: 3, expandable: true } : false}
          >
            {value}
          </Paragraph>
        );

      case 'number':
        return (
          <Text strong={field.strong}>
            {typeof value === 'number' ? value.toLocaleString() : value}
            {field.suffix && (
              <span style={{ marginLeft: 4 }}>{field.suffix}</span>
            )}
          </Text>
        );

      case 'date':
        return (
          <Space>
            <CalendarOutlined />
            <Text>
              {dayjs(value).format(field.format || 'YYYY-MM-DD HH:mm:ss')}
            </Text>
          </Space>
        );

      case 'status':
        return (
          <Tag
            color={field.colorMap?.[value] || 'default'}
            style={{ textTransform: 'capitalize' }}
          >
            {field.labelMap?.[value] || value}
          </Tag>
        );

      case 'tags':
        return (
          <Space wrap>
            {Array.isArray(value) ? (
              value.map((tag, index) => (
                <Tag key={index} color={field.tagColor || 'blue'}>
                  {tag}
                </Tag>
              ))
            ) : (
              <Tag color={field.tagColor || 'blue'}>{value}</Tag>
            )}
          </Space>
        );

      case 'user':
        return (
          <Space>
            <Avatar size="small" icon={<UserOutlined />} src={value.avatar} />
            <Text>{value.username || value.name || value}</Text>
          </Space>
        );

      case 'image':
        return (
          <Image
            width={field.width || 100}
            height={field.height || 100}
            src={value}
            alt={field.alt || 'Image'}
            style={{ borderRadius: 4 }}
          />
        );

      case 'link':
        return (
          <a href={value} target="_blank" rel="noopener noreferrer">
            {field.linkText || value}
          </a>
        );

      case 'boolean':
        return (
          <Tag color={value ? 'green' : 'red'}>
            {value ? field.trueText || 'Yes' : field.falseText || 'No'}
          </Tag>
        );

      case 'progress':
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>{value}%</Text>
            <div
              style={{
                width: '100%',
                height: 8,
                backgroundColor: '#f0f0f0',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.min(value, 100)}%`,
                  height: '100%',
                  backgroundColor: field.color || '#1890ff',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </Space>
        );

      case 'json':
        return (
          <pre
            style={{
              background: '#f6f8fa',
              padding: 12,
              borderRadius: 4,
              fontSize: '12px',
              maxHeight: 200,
              overflow: 'auto',
            }}
          >
            {JSON.stringify(value, null, 2)}
          </pre>
        );

      case 'rating':
        return (
          <Space>
            {'★'.repeat(Math.floor(value))}
            {'☆'.repeat(5 - Math.floor(value))}
            <Text type="secondary">({value}/5)</Text>
          </Space>
        );

      case 'currency':
        return (
          <Text strong style={{ color: '#52c41a' }}>
            {field.symbol || '$'}
            {typeof value === 'number' ? value.toFixed(2) : value}
          </Text>
        );

      case 'list':
        return (
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {Array.isArray(value) ? (
              value.map((item, index) => (
                <li key={index}>
                  <Text>{item}</Text>
                </li>
              ))
            ) : (
              <li>
                <Text>{value}</Text>
              </li>
            )}
          </ul>
        );

      default:
        return <Text>{String(value)}</Text>;
    }
  };

  const getDescriptionItems = () => {
    return fields
      .filter((field) => field && field.name) // Filter out null/undefined fields
      .map((field) => ({
        key: field.name,
        label: field.label,
        children: renderFieldValue(field, data[field.name]),
        span: field.span || 1,
      }));
  };

  return (
    <Modal
      title={
        <Space>
          <EyeOutlined />
          <span>{title}</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={modalWidth}
      destroyOnHidden
      centered
      className={isMobile ? 'mobile-view-modal' : ''}
      styles={{
        body: {
          maxHeight: isMobile ? '70vh' : '60vh',
          overflow: 'auto',
          padding: isMobile ? '12px' : '24px',
        },
      }}
    >
      <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
        {/* Main Content */}
        <Descriptions
          bordered
          column={columnCount}
          size={isMobile ? 'small' : 'default'}
          items={getDescriptionItems()}
          labelStyle={{
            width: isMobile ? '35%' : '25%',
            fontWeight: 600,
            backgroundColor: '#fafafa',
          }}
          contentStyle={{
            backgroundColor: '#fff',
          }}
        />

        {/* Additional Sections */}
        {data.additionalSections &&
          data.additionalSections.map((section, index) => (
            <div key={index}>
              <Divider orientation="left">
                <Space>
                  {section.icon && section.icon}
                  <Title level={5} style={{ margin: 0 }}>
                    {section.title}
                  </Title>
                </Space>
              </Divider>

              {section.type === 'description' && (
                <Descriptions
                  bordered
                  column={isMobile ? 1 : 2}
                  size={isMobile ? 'small' : 'default'}
                  items={section.items.map((item) => ({
                    key: item.key,
                    label: item.label,
                    children: item.value,
                  }))}
                />
              )}

              {section.type === 'content' && (
                <div
                  style={{
                    padding: 16,
                    background: '#fafafa',
                    borderRadius: 6,
                    border: '1px solid #f0f0f0',
                  }}
                >
                  {section.content}
                </div>
              )}
            </div>
          ))}

        {/* Metadata */}
        {(data.createdAt || data.updatedAt || data.id) && (
          <>
            <Divider orientation="left">
              <Space>
                <InfoCircleOutlined />
                <Title level={5} style={{ margin: 0 }}>
                  Metadata
                </Title>
              </Space>
            </Divider>

            <Descriptions bordered column={isMobile ? 1 : 2} size="small">
              {data.id && (
                <Descriptions.Item label="ID">
                  <Text code>{data.id}</Text>
                </Descriptions.Item>
              )}
              {data.createdAt && (
                <Descriptions.Item label="Created">
                  <Space>
                    <CalendarOutlined />
                    <Text>
                      {dayjs(data.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                    </Text>
                  </Space>
                </Descriptions.Item>
              )}
              {data.updatedAt && (
                <Descriptions.Item label="Last Updated">
                  <Space>
                    <CalendarOutlined />
                    <Text>
                      {dayjs(data.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
                    </Text>
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>
          </>
        )}
      </div>
    </Modal>
  );
};

// Common field configurations for different data types
export const viewFieldTypes = {
  text: (name, label, options = {}) => ({
    name,
    label,
    type: 'text',
    ...options,
  }),

  status: (name, label, colorMap = {}, labelMap = {}) => ({
    name,
    label,
    type: 'status',
    colorMap,
    labelMap,
  }),

  date: (name, label, format = 'YYYY-MM-DD HH:mm:ss') => ({
    name,
    label,
    type: 'date',
    format,
  }),

  user: (name, label) => ({
    name,
    label,
    type: 'user',
  }),

  tags: (name, label, color = 'blue') => ({
    name,
    label,
    type: 'tags',
    tagColor: color,
  }),

  number: (name, label, options = {}) => ({
    name,
    label,
    type: 'number',
    ...options,
  }),

  boolean: (name, label, trueText = 'Yes', falseText = 'No') => ({
    name,
    label,
    type: 'boolean',
    trueText,
    falseText,
  }),
};

export default ViewModal;
