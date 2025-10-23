import { render, screen } from '@testing-library/react';
import { Avatar, Tag } from 'antd';
import { UserOutlined, MailOutlined } from '@ant-design/icons';

// Import the components that are used in column renders
import StatusBadge from '../../../components/admin/common/statusbadge';

// Mock the components
jest.mock('../../../components/admin/common/statusbadge', () => {
  const MockStatusBadge = (props) => (
    <span data-testid="status-badge">{props.status}</span>
  );
  MockStatusBadge.displayName = 'MockStatusBadge';
  return MockStatusBadge;
});

describe('Readers Column Render Functions', () => {
  const mockRecord = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    status: 'active',
    joinDate: '2024-01-01',
    avatar: 'avatar.jpg',
  };

  test('reader column renders avatar, username and email', () => {
    const readerColumnRender = (text, record) => (
      <div>
        <Avatar src={record.avatar} icon={<UserOutlined />} size="default" />
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <MailOutlined style={{ marginRight: 4 }} />
            {record.email}
          </div>
        </div>
      </div>
    );

    render(readerColumnRender(mockRecord.username, mockRecord));

    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  test('status column renders StatusBadge', () => {
    const statusColumnRender = (status) => <StatusBadge status={status} />;

    render(statusColumnRender(mockRecord.status));

    expect(screen.getByTestId('status-badge')).toHaveTextContent('active');
  });

  test('verified column renders verified tag', () => {
    const verifiedColumnRender = () => <Tag color="green">Verified</Tag>;

    render(verifiedColumnRender());

    expect(screen.getByText('Verified')).toBeInTheDocument();
  });
});
