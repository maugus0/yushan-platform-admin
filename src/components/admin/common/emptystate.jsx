import { Empty, Button, Space, Typography } from 'antd';
import {
  InboxOutlined,
  FileOutlined,
  UserOutlined,
  BookOutlined,
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const EmptyState = ({
  type = 'default',
  title,
  description,
  image,
  imageStyle = {},
  actions = [],
  showDefaultAction = true,
  defaultActionText = 'Create New',
  defaultActionIcon = <PlusOutlined />,
  onDefaultAction,
  style = {},
  className = '',
  ...props
}) => {
  // Predefined empty state configurations
  const emptyConfigs = {
    default: {
      image: Empty.PRESENTED_IMAGE_SIMPLE,
      title: 'No Data',
      description: 'No data available at the moment.',
    },
    search: {
      image: <SearchOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />,
      title: 'No Results Found',
      description: 'Try adjusting your search or filter criteria.',
    },
    users: {
      image: <UserOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />,
      title: 'No Users Found',
      description: 'There are no users matching your criteria.',
    },
    novels: {
      image: <BookOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />,
      title: 'No Novels Found',
      description: 'No novels have been published yet.',
    },
    files: {
      image: <FileOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />,
      title: 'No Files Found',
      description: 'No files have been uploaded yet.',
    },
    inbox: {
      image: <InboxOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />,
      title: 'Empty Inbox',
      description: 'You have no new messages or notifications.',
    },
    error: {
      image: Empty.PRESENTED_IMAGE_SIMPLE,
      title: 'Something Went Wrong',
      description: 'Unable to load data. Please try again.',
    },
    loading: {
      image: Empty.PRESENTED_IMAGE_SIMPLE,
      title: 'Loading...',
      description: 'Please wait while we fetch your data.',
    },
  };

  const config = emptyConfigs[type] || emptyConfigs.default;

  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const finalImage = image || config.image;

  const actionButtons = (
    <Space direction="vertical" align="center">
      {showDefaultAction && onDefaultAction && (
        <Button
          type="primary"
          icon={defaultActionIcon}
          onClick={onDefaultAction}
        >
          {defaultActionText}
        </Button>
      )}

      {actions.length > 0 && (
        <Space>
          {actions.map((action, index) => (
            <Button key={index} {...action} />
          ))}
        </Space>
      )}
    </Space>
  );

  return (
    <div
      style={{
        padding: '40px 20px',
        textAlign: 'center',
        minHeight: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
      className={className}
    >
      <Empty
        image={finalImage}
        imageStyle={{
          height: 100,
          ...imageStyle,
        }}
        description={
          <Space direction="vertical" size="small">
            <Text strong style={{ fontSize: '16px', color: '#262626' }}>
              {finalTitle}
            </Text>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              {finalDescription}
            </Text>
          </Space>
        }
        {...props}
      >
        {(showDefaultAction || actions.length > 0) && actionButtons}
      </Empty>
    </div>
  );
};

// Pre-configured empty state components
export const NoSearchResults = (props) => (
  <EmptyState
    type="search"
    showDefaultAction={false}
    actions={[
      {
        icon: <ReloadOutlined />,
        children: 'Clear Filters',
        onClick: props.onClearFilters,
      },
    ]}
    {...props}
  />
);

export const NoUsers = (props) => (
  <EmptyState type="users" defaultActionText="Add User" {...props} />
);

export const NoNovels = (props) => (
  <EmptyState type="novels" defaultActionText="Add Novel" {...props} />
);

export const EmptyInbox = (props) => (
  <EmptyState type="inbox" showDefaultAction={false} {...props} />
);

export const ErrorState = (props) => (
  <EmptyState
    type="error"
    showDefaultAction={false}
    actions={[
      {
        icon: <ReloadOutlined />,
        children: 'Try Again',
        onClick: props.onRetry,
      },
    ]}
    {...props}
  />
);

export default EmptyState;
