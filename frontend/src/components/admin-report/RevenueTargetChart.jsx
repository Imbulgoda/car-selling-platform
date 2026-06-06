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

// Format month from "YYYY-MM" to "Jan" or similar
const formatMonth = (monthStr) => {
  if (!monthStr) return "";
  const [year, month] = monthStr.split("-");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = parseInt(month, 10) - 1;
  return `${monthNames[monthIndex]} '${year.slice(-2)}`;
};

export const RevenueTargetChart = ({ data = [] }) => {
  // Transform API data for chart - calculate target as 15% growth over previous month
  const chartData = data.map((item, index) => {
    const actual = item.totalRevenue || 0;
    // Target: 15% more than previous month's actual, or same as actual for first month
    const previousActual = index > 0 ? (data[index - 1]?.totalRevenue || 0) : actual;
    const target = Math.round(previousActual * 1.15);
    
    return {
      month: formatMonth(item.month),
      actual,
      target: target > 0 ? target : actual,
    };
  });

  // Show placeholder if no data
  const hasData = chartData.length > 0;

  return (
    <div className="rounded-lg sm:rounded-xl bg-white p-3 sm:p-4 md:p-5 shadow-sm border border-gray-200">
      <div className="mb-3 sm:mb-4">
        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Revenue vs Target</h3>
        <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">Actual revenue against growth targets</p>
      </div>
      <div className="h-[160px] sm:h-[180px] md:h-[220px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%" minHeight={160}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D3778" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0D3778" stopOpacity={0} />
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
                  name === "actual" ? "Actual Revenue" : "Target (15% Growth)"
                ]}
              />
              <Legend 
                wrapperStyle={{ fontSize: "10px" }}
                iconSize={8}
                formatter={(value) => value === "actual" ? "Actual" : "Target"}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#9CA3AF"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#0D3778"
                strokeWidth={2}
                dot={{ fill: "#0D3778", r: 4 }}
                activeDot={{ r: 6 }}
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
