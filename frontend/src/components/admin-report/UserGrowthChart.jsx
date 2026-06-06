import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export const UserGrowthChart = ({ data = [] }) => {
  // Convert month number to abbreviated name
  const getMonthName = (monthStr) => {
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const monthNum = parseInt(monthStr) - 1;
    return monthNames[monthNum] || monthStr;
  };

  // Transform backend data
  const chartData =
    data.length > 0
      ? data.map((item) => ({
          month: getMonthName(item.month.substring(5)),
          totalUsers: item.totalUsers,
          newUsers: item.newUsers,
        }))
      : [
          { month: "Jan", totalUsers: 0, newUsers: 0 },
          { month: "Feb", totalUsers: 0, newUsers: 0 },
          { month: "Mar", totalUsers: 0, newUsers: 0 },
          { month: "Apr", totalUsers: 0, newUsers: 0 },
          { month: "May", totalUsers: 0, newUsers: 0 },
          { month: "Jun", totalUsers: 0, newUsers: 0 },
          { month: "Jul", totalUsers: 0, newUsers: 0 },
          { month: "Aug", totalUsers: 0, newUsers: 0 },
          { month: "Sep", totalUsers: 0, newUsers: 0 },
          { month: "Oct", totalUsers: 0, newUsers: 0 },
          { month: "Nov", totalUsers: 0, newUsers: 0 },
          { month: "Dec", totalUsers: 0, newUsers: 0 },
        ];

  return (
    <div className="rounded-lg sm:rounded-xl bg-white p-3 sm:p-4 md:p-5 shadow-md">
      {/* 🔥 BORDER REMOVAL CSS */}
      <style>{`
        /* Remove all SVG background rects */
        .recharts-surface > rect {
          fill: none !important;
          stroke: none !important;
          display: none !important;
        }

        /* Remove SVG outline / focus borders */
        .recharts-wrapper svg,
        .recharts-wrapper,
        .recharts-responsive-container {
          border: none !important;
          outline: none !important;
        }

        /* Remove grid lines completely */
        .recharts-cartesian-grid line {
          stroke: none !important;
        }

        /* Remove focus ring when clicking */
        .recharts-wrapper *:focus {
          outline: none !important;
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 gap-2 sm:gap-3">
        <div>
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
            User Growth Trend
          </h3>
          <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">
            Monthly active users and new registrations
          </p>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs md:text-sm">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#0D3778]" />
            <span className="text-gray-500">Total Users</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#00C950]" />
            <span className="text-gray-500">New Users</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[160px] sm:h-[200px] md:h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
            style={{ border: "none", outline: "none" }}
          >
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0D3778" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0D3778" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00C950" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00C950" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="none" />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
              }}
            />

            <Area
              type="monotone"
              dataKey="totalUsers"
              stroke="#0D3778"
              strokeWidth={2}
              fill="url(#colorTotal)"
            />

            <Area
              type="monotone"
              dataKey="newUsers"
              stroke="#00C950"
              strokeWidth={2}
              fill="url(#colorNew)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
