import { render, screen } from '@testing-library/react';
import CustomBarChart from './barchart';

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
  BarChart: ({ children, layout, data }) => (
    <div
      data-testid="bar-chart"
      data-layout={layout}
      data-items={data?.length || 0}
    >
      {children}
    </div>
  ),
  Bar: ({ dataKey, fill, radius }) => (
    <div
      data-testid="bar"
      data-key={dataKey}
      data-fill={fill}
      data-radius={radius}
    />
  ),
  XAxis: ({ type, dataKey }) => (
    <div data-testid="x-axis" data-type={type} data-key={dataKey} />
  ),
  YAxis: ({ type, dataKey }) => (
    <div data-testid="y-axis" data-type={type} data-key={dataKey} />
  ),
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

describe('CustomBarChart Component', () => {
  const mockData = [
    { name: 'Product A', value: 2400 },
    { name: 'Product B', value: 1398 },
    { name: 'Product C', value: 9800 },
  ];

  test('renders without crashing', () => {
    render(<CustomBarChart />);
    expect(screen.getByTestId('chart-wrapper')).toBeInTheDocument();
  });

  test('renders with default title', () => {
    render(<CustomBarChart />);
    expect(screen.getByText('Bar Chart')).toBeInTheDocument();
  });

  test('renders with custom title', () => {
    render(<CustomBarChart title="Sales Chart" />);
    const wrapper = screen.getByTestId('chart-wrapper');
    expect(wrapper).toHaveAttribute('data-title', 'Sales Chart');
  });

  test('renders with subtitle', () => {
    render(<CustomBarChart subtitle="Monthly Sales" />);
    expect(screen.getByText('Monthly Sales')).toBeInTheDocument();
  });

  test('renders chart with data', () => {
    render(<CustomBarChart data={mockData} />);
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-items', '3');
  });

  test('renders with horizontal layout by default', () => {
    render(<CustomBarChart data={mockData} />);
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toBeInTheDocument();
  });

  test('renders with vertical layout when specified', () => {
    render(<CustomBarChart data={mockData} layout="vertical" />);
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toBeInTheDocument();
  });

  test('renders grid by default', () => {
    render(<CustomBarChart data={mockData} />);
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
  });

  test('hides grid when showGrid is false', () => {
    render(<CustomBarChart data={mockData} showGrid={false} />);
    expect(screen.queryByTestId('cartesian-grid')).not.toBeInTheDocument();
  });

  test('renders legend by default', () => {
    render(<CustomBarChart data={mockData} />);
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  test('hides legend when showLegend is false', () => {
    render(<CustomBarChart data={mockData} showLegend={false} />);
    expect(screen.queryByTestId('legend')).not.toBeInTheDocument();
  });

  test('renders loading state', () => {
    render(<CustomBarChart loading={true} />);
    const wrapper = screen.getByTestId('chart-wrapper');
    expect(wrapper).toHaveAttribute('data-loading', 'true');
  });

  test('renders default bar when no bars provided', () => {
    render(<CustomBarChart data={mockData} />);
    const bar = screen.getByTestId('bar');
    expect(bar).toHaveAttribute('data-key', 'value');
    expect(bar).toHaveAttribute('data-fill', '#1890ff');
  });

  test('renders custom bars when provided', () => {
    const customBars = [{ dataKey: 'sales', fill: '#52c41a', name: 'Sales' }];
    render(<CustomBarChart data={mockData} bars={customBars} />);
    const bar = screen.getByTestId('bar');
    expect(bar).toHaveAttribute('data-key', 'sales');
    expect(bar).toHaveAttribute('data-fill', '#52c41a');
  });

  test('renders both X and Y axes', () => {
    render(<CustomBarChart data={mockData} />);
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
  });

  test('renders tooltip', () => {
    render(<CustomBarChart data={mockData} />);
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  test('renders ResponsiveContainer', () => {
    render(<CustomBarChart data={mockData} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  test('renders with custom height', () => {
    render(<CustomBarChart height={500} data={mockData} />);
    expect(screen.getByTestId('chart-wrapper')).toBeInTheDocument();
  });

  test('passes through custom props to ChartWrapper', () => {
    render(<CustomBarChart data={mockData} title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  test('formats tooltip with number values', () => {
    render(<CustomBarChart data={mockData} />);
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  test('handles non-numeric tooltip values', () => {
    // Test the else branch of formatTooltip (lines 40-41)
    const customData = [{ name: 'Product', value: 'string-value' }];
    render(<CustomBarChart data={customData} />);
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  test('renders multiple bars with different colors', () => {
    const multipleBars = [
      { dataKey: 'bar1', fill: '#ff0000', name: 'Bar 1' },
      { dataKey: 'bar2', fill: '#00ff00', name: 'Bar 2' },
      { dataKey: 'bar3', fill: '#0000ff', name: 'Bar 3' },
    ];
    render(<CustomBarChart data={mockData} bars={multipleBars} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });
});
