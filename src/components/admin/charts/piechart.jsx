import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import ChartWrapper from './chartwrapper';

const COLORS = [
  '#1890ff',
  '#52c41a',
  '#faad14',
  '#f5222d',
  '#722ed1',
  '#fa8c16',
  '#13c2c2',
  '#eb2f96',
];

const CustomPieChart = ({
  data = [],
  title = 'Pie Chart',
  subtitle,
  height = 300,
  showLegend = true,
  loading = false,
  innerRadius = 0,
  outerRadius = 80,
  colors = COLORS,
  showLabels = true,
  labelLine = false,
  ...props
}) => {
  const formatTooltip = (value, name, _props) => {
    const total = data.reduce((sum, entry) => sum + entry.value, 0);
    const percentage = ((value / total) * 100).toFixed(1);
    return [`${value.toLocaleString()} (${percentage}%)`, name];
  };

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    value,
    index: _index,
  }) => {
    if (!showLabels) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const total = data.reduce((sum, entry) => sum + entry.value, 0);
    const percentage = ((value / total) * 100).toFixed(1);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${percentage}%`}
      </text>
    );
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
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={labelLine}
            label={renderCustomLabel}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={formatTooltip}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          />
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry) => (
                <span style={{ color: entry.color }}>{value}</span>
              )}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default CustomPieChart;
