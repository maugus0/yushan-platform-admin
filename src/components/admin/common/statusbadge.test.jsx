import { render, screen } from '@testing-library/react';
import StatusBadge from './statusbadge';

jest.mock('antd', () => ({
  Tag: ({ children, color, icon, ...props }) => (
    <span
      data-testid="status-tag"
      data-color={color}
      data-has-icon={!!icon}
      {...props}
    >
      {children}
    </span>
  ),
}));

jest.mock('@ant-design/icons', () => ({
  CheckCircleOutlined: () => <span data-testid="check-icon" />,
  ClockCircleOutlined: () => <span data-testid="clock-icon" />,
  CloseCircleOutlined: () => <span data-testid="close-icon" />,
  ExclamationCircleOutlined: () => <span data-testid="exclamation-icon" />,
  SyncOutlined: () => <span data-testid="sync-icon" />,
  MinusCircleOutlined: () => <span data-testid="minus-icon" />,
}));

describe('StatusBadge Component', () => {
  test('renders without crashing', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByTestId('status-tag')).toBeInTheDocument();
  });

  test('displays active status', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByTestId('status-tag')).toHaveAttribute(
      'data-color',
      'success'
    );
  });

  test('displays inactive status', () => {
    render(<StatusBadge status="inactive" />);
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  test('displays suspended status', () => {
    render(<StatusBadge status="suspended" />);
    expect(screen.getByText('Suspended')).toBeInTheDocument();
  });

  test('displays banned status', () => {
    render(<StatusBadge status="banned" />);
    expect(screen.getByText('Banned')).toBeInTheDocument();
  });

  test('displays pending status', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  test('displays published status', () => {
    render(<StatusBadge status="published" />);
    expect(screen.getByText('Published')).toBeInTheDocument();
  });

  test('displays draft status', () => {
    render(<StatusBadge status="draft" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  test('displays reviewing status', () => {
    render(<StatusBadge status="reviewing" />);
    expect(screen.getByText('Reviewing')).toBeInTheDocument();
  });

  test('displays online status', () => {
    render(<StatusBadge status="online" />);
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  test('displays paid status', () => {
    render(<StatusBadge status="paid" />);
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });

  test('shows icon by default', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByTestId('status-tag')).toHaveAttribute(
      'data-has-icon',
      'true'
    );
  });

  test('hides icon when showIcon is false', () => {
    render(<StatusBadge status="active" showIcon={false} />);
    expect(screen.getByTestId('status-tag')).toHaveAttribute(
      'data-has-icon',
      'false'
    );
  });

  test('handles unknown status gracefully', () => {
    render(<StatusBadge status="unknown-status" />);
    expect(screen.getByText('unknown-status')).toBeInTheDocument();
  });

  test('applies custom config', () => {
    const customConfig = {
      custom: {
        color: 'cyan',
        text: 'Custom Status',
      },
    };
    render(<StatusBadge status="custom" customConfig={customConfig} />);
    expect(screen.getByText('Custom Status')).toBeInTheDocument();
    expect(screen.getByTestId('status-tag')).toHaveAttribute(
      'data-color',
      'cyan'
    );
  });

  test('displays high priority status', () => {
    render(<StatusBadge status="high" />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  test('displays medium priority status', () => {
    render(<StatusBadge status="medium" />);
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  test('displays low priority status', () => {
    render(<StatusBadge status="low" />);
    expect(screen.getByText('Low')).toBeInTheDocument();
  });
});
