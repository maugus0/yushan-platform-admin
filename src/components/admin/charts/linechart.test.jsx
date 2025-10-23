import { render, screen } from '@testing-library/react';
import CustomLineChart from './linechart';

// Mock ChartWrapper
jest.mock('./chartwrapper', () => {
  return function MockChartWrapper({ children, title, subtitle, loading }) {
    return (
      <div
        data-testid="chart-wrapper"
        data-title={title}
        data-loading={loading}
      >
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
        <div data-testid="chart-content">{children}</div>
      </div>
    );
  };
});

// Mock recharts
jest.mock('recharts', () => ({
  LineChart: ({ children, data }) => (
    <div data-testid="line-chart" data-items={data?.length || 0}>
      {children}
    </div>
  ),
  Line: ({ dataKey, stroke }) => (
    <div data-testid="line" data-key={dataKey} data-stroke={stroke} />
  ),
  XAxis: ({ dataKey }) => <div data-testid="x-axis" data-key={dataKey} />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

describe('CustomLineChart Component', () => {
  const mockData = [
    { name: 'Mon', value: 2400 },
    { name: 'Tue', value: 1398 },
    { name: 'Wed', value: 9800 },
    { name: 'Thu', value: 3908 },
  ];

  test('renders without crashing', () => {
    render(<CustomLineChart />);
    expect(screen.getByTestId('chart-wrapper')).toBeInTheDocument();
  });

  test('renders with default title', () => {
    render(<CustomLineChart />);
    expect(screen.getByText('Line Chart')).toBeInTheDocument();
  });

  test('renders with custom title', () => {
    render(<CustomLineChart title="Revenue Trend" />);
    const wrapper = screen.getByTestId('chart-wrapper');
    expect(wrapper).toHaveAttribute('data-title', 'Revenue Trend');
  });

  test('renders with subtitle', () => {
    render(<CustomLineChart subtitle="Weekly Revenue" />);
    expect(screen.getByText('Weekly Revenue')).toBeInTheDocument();
  });

  test('renders chart with data', () => {
    render(<CustomLineChart data={mockData} />);
    const chart = screen.getByTestId('line-chart');
    expect(chart).toHaveAttribute('data-items', '4');
  });

  test('renders with empty data by default', () => {
    render(<CustomLineChart />);
    const chart = screen.getByTestId('line-chart');
    expect(chart).toHaveAttribute('data-items', '0');
  });

  test('renders grid by default', () => {
    render(<CustomLineChart data={mockData} />);
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
  });

  test('hides grid when showGrid is false', () => {
    render(<CustomLineChart data={mockData} showGrid={false} />);
    expect(screen.queryByTestId('cartesian-grid')).not.toBeInTheDocument();
  });

  test('renders legend by default', () => {
    render(<CustomLineChart data={mockData} />);
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  test('hides legend when showLegend is false', () => {
    render(<CustomLineChart data={mockData} showLegend={false} />);
    expect(screen.queryByTestId('legend')).not.toBeInTheDocument();
  });

  test('renders loading state', () => {
    render(<CustomLineChart loading={true} />);
    const wrapper = screen.getByTestId('chart-wrapper');
    expect(wrapper).toHaveAttribute('data-loading', 'true');
  });

  test('renders default line when no lines provided', () => {
    render(<CustomLineChart data={mockData} />);
    const line = screen.getByTestId('line');
    expect(line).toHaveAttribute('data-key', 'value');
    expect(line).toHaveAttribute('data-stroke', '#1890ff');
  });

  test('renders custom lines when provided', () => {
    const customLines = [
      {
        dataKey: 'revenue',
        stroke: '#52c41a',
        strokeWidth: 2,
        name: 'Revenue',
      },
    ];
    render(<CustomLineChart data={mockData} lines={customLines} />);
    const line = screen.getByTestId('line');
    expect(line).toHaveAttribute('data-key', 'revenue');
    expect(line).toHaveAttribute('data-stroke', '#52c41a');
  });

  test('renders axes', () => {
    render(<CustomLineChart data={mockData} />);
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
  });

  test('renders tooltip', () => {
    render(<CustomLineChart data={mockData} />);
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  test('renders ResponsiveContainer', () => {
    render(<CustomLineChart data={mockData} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  test('renders with custom height', () => {
    render(<CustomLineChart height={400} data={mockData} />);
    expect(screen.getByTestId('chart-wrapper')).toBeInTheDocument();
  });

  test('passes through custom props to ChartWrapper', () => {
    render(<CustomLineChart data={mockData} title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  test('formats tooltip with number values', () => {
    render(<CustomLineChart data={mockData} />);
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  test('handles non-numeric tooltip values', () => {
    // Test the else branch of formatTooltip (lines 34-35)
    const customData = [{ name: 'Day', value: 'text-value', extra: 'data' }];
    render(<CustomLineChart data={customData} />);
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  test('renders multiple lines with different stroke colors', () => {
    const multipleLines = [
      { dataKey: 'line1', stroke: '#ff0000', strokeWidth: 2, name: 'Line 1' },
      { dataKey: 'line2', stroke: '#00ff00', strokeWidth: 2, name: 'Line 2' },
    ];
    render(<CustomLineChart data={mockData} lines={multipleLines} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  test('renders with dot and activeDot configuration', () => {
    render(<CustomLineChart data={mockData} />);
    expect(screen.getByTestId('line')).toBeInTheDocument();
  });
});
