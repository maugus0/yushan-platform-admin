import { render, screen } from '@testing-library/react';
import StatCard from './statcard';

// Mock Ant Design components
jest.mock('antd', () => ({
  Card: ({ children, hoverable, loading, bodyStyle, ...props }) => (
    <div
      data-testid="card"
      data-hoverable={hoverable}
      data-loading={loading}
      {...props}
    >
      <div data-testid="card-body" style={bodyStyle}>
        {children}
      </div>
    </div>
  ),
  Statistic: ({ title, value, prefix, suffix, precision, valueStyle }) => (
    <div data-testid="statistic" data-value={value} data-precision={precision}>
      <span data-testid="stat-title">{title}</span>
      <span data-testid="stat-value" style={valueStyle}>
        {prefix}
        {value}
        {suffix}
      </span>
    </div>
  ),
  Row: ({ children }) => <div data-testid="row">{children}</div>,
  Col: ({ span, children }) => (
    <div data-testid="col" data-span={span}>
      {children}
    </div>
  ),
}));

// Mock TrendIndicator component
jest.mock('./trendindicator', () => {
  return function MockTrendIndicator({ value, isPositive, showIcon }) {
    return (
      <div
        data-testid="trend-indicator"
        data-value={value}
        data-positive={isPositive}
      >
        {showIcon && <span data-testid="trend-icon">Icon</span>}
        {value}%
      </div>
    );
  };
});

describe('StatCard Component', () => {
  test('renders without crashing', () => {
    render(<StatCard title="Test Stat" value={100} />);
    expect(screen.getByTestId('card')).toBeInTheDocument();
  });

  test('renders title', () => {
    render(<StatCard title="Users" value={1234} />);
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  test('renders value', () => {
    render(<StatCard title="Revenue" value={5000} />);
    expect(screen.getByTestId('statistic')).toHaveAttribute(
      'data-value',
      '5000'
    );
  });

  test('renders with prefix', () => {
    render(<StatCard title="Price" value={100} prefix="$" />);
    expect(screen.getByTestId('stat-value')).toHaveTextContent('$');
  });

  test('renders with suffix', () => {
    render(<StatCard title="Growth" value={50} suffix="%" />);
    expect(screen.getByTestId('stat-value')).toHaveTextContent('%');
  });

  test('renders with custom precision', () => {
    render(<StatCard title="Ratio" value={3.14159} precision={2} />);
    expect(screen.getByTestId('statistic')).toHaveAttribute(
      'data-precision',
      '2'
    );
  });

  test('renders with default precision of 0', () => {
    render(<StatCard title="Count" value={42} />);
    expect(screen.getByTestId('statistic')).toHaveAttribute(
      'data-precision',
      '0'
    );
  });

  test('renders hoverable card', () => {
    render(<StatCard title="Test" value={100} />);
    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('data-hoverable', 'true');
  });

  test('renders loading state', () => {
    render(<StatCard title="Test" value={100} loading={true} />);
    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('data-loading', 'true');
  });

  test('renders not loading by default', () => {
    render(<StatCard title="Test" value={100} />);
    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('data-loading', 'false');
  });

  test('does not render trend indicator when trend is not provided', () => {
    render(<StatCard title="Test" value={100} />);
    expect(screen.queryByTestId('trend-indicator')).not.toBeInTheDocument();
  });

  test('renders extra element when provided', () => {
    const extra = <div data-testid="extra-element">Extra Info</div>;
    render(<StatCard title="Test" value={100} extra={extra} />);
    expect(screen.getByTestId('extra-element')).toBeInTheDocument();
  });

  test('does not render extra element when not provided', () => {
    render(<StatCard title="Test" value={100} />);
    expect(screen.queryByTestId('extra-element')).not.toBeInTheDocument();
  });

  test('renders with custom valueStyle', () => {
    const valueStyle = { color: 'red' };
    render(<StatCard title="Test" value={100} valueStyle={valueStyle} />);
    const statValue = screen.getByTestId('stat-value');
    expect(statValue).toHaveStyle('color: red');
  });

  test('renders Row component', () => {
    render(<StatCard title="Test" value={100} />);
    expect(screen.getByTestId('row')).toBeInTheDocument();
  });

  test('renders Col component with span 24', () => {
    render(<StatCard title="Test" value={100} />);
    const col = screen.getByTestId('col');
    expect(col).toHaveAttribute('data-span', '24');
  });
});
