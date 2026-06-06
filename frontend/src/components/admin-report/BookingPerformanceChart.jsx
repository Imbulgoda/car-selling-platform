import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const BookingPerformanceChart = ({ data = [] }) => {
  // Convert month number to abbreviated name
  const getMonthName = (monthStr) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthNum = parseInt(monthStr) - 1;
    return monthNames[monthNum] || monthStr;
  };

  // Transform data from backend format to chart format
  const chartData = data.length > 0 
    ? data.map(item => ({
        month: getMonthName(item.month.substring(5)), // Get "MM" from "YYYY-MM" and convert to name
        bookings: item.bookings
      }))
    : [
        { month: "Jan", bookings: 0 },
        { month: "Feb", bookings: 0 },
        { month: "Mar", bookings: 0 },
        { month: "Apr", bookings: 0 },
        { month: "May", bookings: 0 },
        { month: "Jun", bookings: 0 },
        { month: "Jul", bookings: 0 },
        { month: "Aug", bookings: 0 },
        { month: "Sep", bookings: 0 },
        { month: "Oct", bookings: 0 },
        { month: "Nov", bookings: 0 },
        { month: "Dec", bookings: 0 },
      ];

  return (
    <div className="rounded-lg sm:rounded-xl bg-white p-3 sm:p-4 md:p-5 shadow-sm border border-gray-200">
      <div className="mb-3 sm:mb-4">
        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Booking Performance</h3>
        <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">Monthly booking volume</p>
      </div>
      <div className="h-[160px] sm:h-[180px] md:h-[220px]">
        <ResponsiveContainer width="100%" height="100%" minHeight={160}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
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
            <Bar
              dataKey="bookings"
              fill="#0D3778"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
