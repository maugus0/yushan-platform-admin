import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import ChartWrapper from './chartwrapper';

const CustomBarChart = ({
  data = [],
  bars = [],
  title = 'Bar Chart',
  subtitle,
  height = 300,
  showGrid = true,
  showLegend = true,
  loading = false,
  layout = 'horizontal', // 'horizontal' or 'vertical'
  ...props
}) => {
  // Default bar configuration
  const defaultBars = [
    {
      dataKey: 'value',
      fill: '#1890ff',
      name: 'Value',
      radius: [0, 4, 4, 0],
    },
  ];

  const barConfig = bars.length > 0 ? bars : defaultBars;

  const formatTooltip = (value, name, _props) => {
    if (typeof value === 'number') {
      return [value.toLocaleString(), name];
    }
    return [value, name];
  };

  const renderBars = () => {
    return barConfig.map((barProps, index) => (
      <Bar
        key={index}
        radius={layout === 'horizontal' ? [0, 4, 4, 0] : [4, 4, 0, 0]}
        {...barProps}
      />
    ));
  };

  return (
    <ChartWrapper
      title={title}
      subtitle={subtitle}
      height={height}
      loading={loading}
      showMoreMenu={true}
      {...props}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={layout === 'vertical' ? 'horizontal' : undefined}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          {layout === 'vertical' ? (
            <>
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
            </>
          )}
          <Tooltip
            formatter={formatTooltip}
            labelStyle={{ color: '#666' }}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          />
          {showLegend && <Legend />}
          {renderBars()}
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default CustomBarChart;
