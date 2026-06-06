import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const formatValue = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
};

// Format month from "YYYY-MM" to "Jan 2025" or similar
const formatMonth = (monthStr) => {
  if (!monthStr) return "";
  const [year, month] = monthStr.split("-");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = parseInt(month, 10) - 1;
  return `${monthNames[monthIndex]} '${year.slice(-2)}`;
};

export const PlatformRevenueChart = ({ data = [] }) => {
  // Transform API data for chart
  const chartData = data.map(item => ({
    month: formatMonth(item.month),
    totalRevenue: item.totalRevenue || 0,
    platformFee: item.platformFee || 0,
  }));

  // Show placeholder if no data
  const hasData = chartData.length > 0;

  return (
    <div className="rounded-lg sm:rounded-xl bg-white p-3 sm:p-4 md:p-5 shadow-sm border border-gray-200">
      <div className="mb-3 sm:mb-4">
        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Platform Revenue</h3>
        <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">Monthly total revenue & platform fees</p>
      </div>
      <div className="h-[160px] sm:h-[180px] md:h-[220px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%" minHeight={160}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="totalRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D3778" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0D3778" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="platformFeeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                tickFormatter={formatValue}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                }}
                formatter={(value, name) => [
                  `Rs. ${value.toLocaleString()}`,
                  name === "totalRevenue" ? "Total Revenue" : "Platform Fee"
                ]}
              />
              <Legend 
                wrapperStyle={{ fontSize: "10px" }}
                iconSize={8}
                formatter={(value) => value === "totalRevenue" ? "Total Revenue" : "Platform Fee"}
              />
              <Line
                type="monotone"
                dataKey="totalRevenue"
                stroke="#0D3778"
                strokeWidth={2}
                dot={{ fill: "#0D3778", r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="platformFee"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            No revenue data available
          </div>
        )}
      </div>
    </div>
  );
};
