import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import ChartWrapper from './chartwrapper';

const CustomLineChart = ({
  data = [],
  lines = [],
  title = 'Line Chart',
  subtitle,
  height = 300,
  showGrid = true,
  showLegend = true,
  loading = false,
  ...props
}) => {
  // Default line configuration
  const defaultLines = [
    { dataKey: 'value', stroke: '#1890ff', strokeWidth: 2, name: 'Value' },
  ];

  const lineConfig = lines.length > 0 ? lines : defaultLines;

  const formatTooltip = (value, name, _props) => {
    if (typeof value === 'number') {
      return [value.toLocaleString(), name];
    }
    return [value, name];
  };

  const renderLines = () => {
    return lineConfig.map((lineProps, index) => (
      <Line
        key={index}
        type="monotone"
        strokeWidth={2}
        dot={{ r: 4 }}
        activeDot={{ r: 6 }}
        {...lineProps}
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
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
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
          {renderLines()}
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default CustomLineChart;
