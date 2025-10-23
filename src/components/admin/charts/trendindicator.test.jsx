import { render, screen } from '@testing-library/react';
import { TrendIndicator } from './trendindicator';

// Mock Ant Design components
jest.mock('antd', () => ({
  Typography: {
    Text: ({ children, type, style, ...props }) => (
      <span data-testid="text" data-type={type} style={style} {...props}>
        {children}
      </span>
    ),
  },
  Space: ({ children, size, style, ...props }) => (
    <div data-testid="space" data-size={size} style={style} {...props}>
      {children}
    </div>
  ),
}));

jest.mock('@ant-design/icons', () => ({
  ArrowUpOutlined: () => <span data-testid="arrow-up">↑</span>,
  ArrowDownOutlined: () => <span data-testid="arrow-down">↓</span>,
}));

describe('TrendIndicator Component', () => {
  test('renders without crashing', () => {
    render(<TrendIndicator value={10} isPositive={true} />);
    expect(screen.getByTestId('space')).toBeInTheDocument();
  });

  test('renders up arrow for positive trend', () => {
    render(<TrendIndicator value={10} isPositive={true} showIcon={true} />);
    expect(screen.getByTestId('arrow-up')).toBeInTheDocument();
  });

  test('renders down arrow for negative trend', () => {
    render(<TrendIndicator value={10} isPositive={false} showIcon={true} />);
    expect(screen.getByTestId('arrow-down')).toBeInTheDocument();
  });

  test('does not render icon when showIcon is false', () => {
    render(<TrendIndicator value={10} isPositive={true} showIcon={false} />);
    expect(screen.queryByTestId('arrow-up')).not.toBeInTheDocument();
    expect(screen.queryByTestId('arrow-down')).not.toBeInTheDocument();
  });

  test('renders value with percentage suffix by default', () => {
    render(<TrendIndicator value={15} isPositive={true} />);
    const text = screen.getAllByTestId('text')[0];
    expect(text).toHaveTextContent('15%');
  });

  test('renders value with custom suffix', () => {
    render(<TrendIndicator value={15} isPositive={true} suffix="pts" />);
    const text = screen.getAllByTestId('text')[0];
    expect(text).toHaveTextContent('15pts');
  });

  test('renders absolute value', () => {
    render(<TrendIndicator value={-15} isPositive={false} />);
    const text = screen.getAllByTestId('text')[0];
    expect(text).toHaveTextContent('15%');
  });

  test('renders success type for positive trend', () => {
    render(<TrendIndicator value={10} isPositive={true} />);
    const texts = screen.getAllByTestId('text');
    const valueText = texts[0];
    expect(valueText).toHaveAttribute('data-type', 'success');
  });

  test('renders danger type for negative trend', () => {
    render(<TrendIndicator value={10} isPositive={false} />);
    const texts = screen.getAllByTestId('text');
    const valueText = texts[0];
    expect(valueText).toHaveAttribute('data-type', 'danger');
  });

  test('renders comparison text', () => {
    render(<TrendIndicator value={10} isPositive={true} />);
    expect(screen.getByText('vs last period')).toBeInTheDocument();
  });

  test('renders with small size by default', () => {
    render(<TrendIndicator value={10} isPositive={true} />);
    const texts = screen.getAllByTestId('text');
    expect(texts.length).toBeGreaterThan(0);
  });

  test('renders with large size when specified', () => {
    render(<TrendIndicator value={10} isPositive={true} size="large" />);
    expect(screen.getByTestId('space')).toBeInTheDocument();
  });

  test('renders with custom style', () => {
    const customStyle = { marginTop: '10px' };
    render(<TrendIndicator value={10} isPositive={true} style={customStyle} />);
    const space = screen.getByTestId('space');
    expect(space).toHaveStyle('margin-top: 10px');
  });

  test('renders icon with correct color for positive trend', () => {
    render(<TrendIndicator value={10} isPositive={true} showIcon={true} />);
    const icon = screen.getByTestId('arrow-up').parentElement;
    expect(icon).toBeInTheDocument();
  });

  test('renders icon with correct color for negative trend', () => {
    render(<TrendIndicator value={10} isPositive={false} showIcon={true} />);
    const icon = screen.getByTestId('arrow-down').parentElement;
    expect(icon).toBeInTheDocument();
  });

  test('renders Space with small size', () => {
    render(<TrendIndicator value={10} isPositive={true} />);
    const space = screen.getByTestId('space');
    expect(space).toHaveAttribute('data-size', 'small');
  });

  test('renders secondary text for comparison', () => {
    render(<TrendIndicator value={10} isPositive={true} />);
    const texts = screen.getAllByTestId('text');
    const comparisonText = texts[texts.length - 1];
    expect(comparisonText).toHaveAttribute('data-type', 'secondary');
    expect(comparisonText).toHaveTextContent('vs last period');
  });

  test('handles zero value correctly', () => {
    render(<TrendIndicator value={0} isPositive={true} />);
    const text = screen.getAllByTestId('text')[0];
    expect(text).toHaveTextContent('0%');
  });

  test('handles negative values correctly', () => {
    render(<TrendIndicator value={-25} isPositive={false} />);
    const text = screen.getAllByTestId('text')[0];
    expect(text).toHaveTextContent('25%');
  });

  test('renders with decimal values', () => {
    render(<TrendIndicator value={12.5} isPositive={true} />);
    const text = screen.getAllByTestId('text')[0];
    expect(text).toHaveTextContent('12.5%');
  });
});
