import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import ChartWrapper from './chartwrapper';

const CustomAreaChart = ({
  data = [],
  areas = [],
  title = 'Area Chart',
  subtitle,
  height = 300,
  showGrid = true,
  showLegend = true,
  loading = false,
  stackId,
  ...props
}) => {
  // Default area configuration
  const defaultAreas = [
    {
      dataKey: 'value',
      fill: '#1890ff',
      stroke: '#1890ff',
      fillOpacity: 0.6,
      name: 'Value',
    },
  ];

  const areaConfig = areas.length > 0 ? areas : defaultAreas;

  const formatTooltip = (value, name, _props) => {
    if (typeof value === 'number') {
      return [value.toLocaleString(), name];
    }
    return [value, name];
  };

  const renderAreas = () => {
    return areaConfig.map((areaProps, index) => (
      <Area
        key={index}
        type="monotone"
        strokeWidth={2}
        fillOpacity={0.6}
        stackId={stackId}
        {...areaProps}
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
        <AreaChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            {areaConfig.map((area, index) => (
              <linearGradient
                key={`gradient-${index}`}
                id={`gradient-${index}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={area.fill} stopOpacity={0.8} />
                <stop offset="95%" stopColor={area.fill} stopOpacity={0.2} />
              </linearGradient>
            ))}
          </defs>
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
          {renderAreas()}
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default CustomAreaChart;
