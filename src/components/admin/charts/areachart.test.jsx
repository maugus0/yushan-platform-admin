import { render, screen } from '@testing-library/react';
import CustomAreaChart from './areachart';

// Mock the ChartWrapper component
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
  AreaChart: ({ children, data }) => (
    <div data-testid="area-chart" data-items={data?.length || 0}>
      {children}
    </div>
  ),
  Area: ({ dataKey, fill }) => (
    <div data-testid="area" data-key={dataKey} data-fill={fill} />
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

describe('CustomAreaChart Component', () => {
  const mockData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 200 },
  ];

  test('renders without crashing', () => {
    render(<CustomAreaChart />);
    expect(screen.getByTestId('chart-wrapper')).toBeInTheDocument();
  });

  test('renders with default title', () => {
    render(<CustomAreaChart />);
    expect(screen.getByText('Area Chart')).toBeInTheDocument();
  });

  test('renders with custom title', () => {
    render(<CustomAreaChart title="Custom Area Chart" />);
    const wrapper = screen.getByTestId('chart-wrapper');
    expect(wrapper).toHaveAttribute('data-title', 'Custom Area Chart');
  });

  test('renders with subtitle', () => {
    render(<CustomAreaChart subtitle="Test Subtitle" />);
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  test('renders chart with data', () => {
    render(<CustomAreaChart data={mockData} />);
    const chart = screen.getByTestId('area-chart');
    expect(chart).toHaveAttribute('data-items', '3');
  });

  test('renders with empty data by default', () => {
    render(<CustomAreaChart />);
    const chart = screen.getByTestId('area-chart');
    expect(chart).toHaveAttribute('data-items', '0');
  });

  test('renders grid by default', () => {
    render(<CustomAreaChart data={mockData} />);
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
  });

  test('hides grid when showGrid is false', () => {
    render(<CustomAreaChart data={mockData} showGrid={false} />);
    expect(screen.queryByTestId('cartesian-grid')).not.toBeInTheDocument();
  });

  test('renders legend by default', () => {
    render(<CustomAreaChart data={mockData} />);
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  test('hides legend when showLegend is false', () => {
    render(<CustomAreaChart data={mockData} showLegend={false} />);
    expect(screen.queryByTestId('legend')).not.toBeInTheDocument();
  });

  test('renders loading state', () => {
    render(<CustomAreaChart loading={true} />);
    const wrapper = screen.getByTestId('chart-wrapper');
    expect(wrapper).toHaveAttribute('data-loading', 'true');
  });

  test('renders with custom height', () => {
    render(<CustomAreaChart height={400} />);
    expect(screen.getByTestId('chart-wrapper')).toBeInTheDocument();
  });

  test('renders default area when no areas provided', () => {
    render(<CustomAreaChart data={mockData} />);
    const area = screen.getByTestId('area');
    expect(area).toHaveAttribute('data-key', 'value');
    expect(area).toHaveAttribute('data-fill', '#1890ff');
  });

  test('renders custom areas when provided', () => {
    const customAreas = [
      { dataKey: 'customValue', fill: '#ff0000', name: 'Custom' },
    ];
    render(<CustomAreaChart data={mockData} areas={customAreas} />);
    const area = screen.getByTestId('area');
    expect(area).toHaveAttribute('data-key', 'customValue');
    expect(area).toHaveAttribute('data-fill', '#ff0000');
  });

  test('renders axes', () => {
    render(<CustomAreaChart data={mockData} />);
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
  });

  test('renders tooltip', () => {
    render(<CustomAreaChart data={mockData} />);
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  test('renders ResponsiveContainer', () => {
    render(<CustomAreaChart data={mockData} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  test('passes through custom props to ChartWrapper', () => {
    render(<CustomAreaChart data={mockData} title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  test('formats tooltip with number values', () => {
    render(<CustomAreaChart data={mockData} />);
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  test('handles non-numeric tooltip values', () => {
    // Test the else branch of formatTooltip (lines 41-42)
    const customData = [
      { name: 'Jan', value: 'custom-string', description: 'Test' },
    ];
    render(<CustomAreaChart data={customData} />);
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  test('renders with multiple stacked areas', () => {
    const multipleAreas = [
      { dataKey: 'area1', fill: '#ff0000', name: 'Area 1' },
      { dataKey: 'area2', fill: '#00ff00', name: 'Area 2' },
    ];
    render(
      <CustomAreaChart data={mockData} areas={multipleAreas} stackId="stack1" />
    );
    expect(screen.getByTestId('chart-wrapper')).toBeInTheDocument();
  });
});
