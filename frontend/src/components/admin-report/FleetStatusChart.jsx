import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useState } from "react";

export const FleetStatusChart = ({ data: apiData = {} }) => {
  // Transform data from backend API to chart format
  const { totals = {}, percentages = {} } = apiData;
  
  const data = [
    { 
      name: "Available", 
      value: totals.availableVehicles || 0, 
      color: "#0D3778" 
    },
    { 
      name: "Booked", 
      value: totals.bookedVehicles || 0, 
      color: "#00C950" 
    },
  ];

  const total = totals.totalVehicles || 0;
  const [activeIndex, setActiveIndex] = useState(1); // Default to "Booked" index

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <div className="rounded-lg sm:rounded-xl bg-white p-3 sm:p-4 md:p-5 shadow-sm border border-gray-200 h-full">
      <div className="mb-3 sm:mb-4">
        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Fleet Status</h3>
        <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">Current vehicle availability</p>
      </div>
      <div className="h-[120px] sm:h-[140px] md:h-[160px] relative" style={{ outline: 'none' }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={120}>
          <PieChart style={{ outline: 'none' }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={55}
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={onPieEnter}
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  style={{ cursor: 'pointer', outline: 'none' }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
          <span className="text-[10px] sm:text-xs text-gray-500">{data[activeIndex].name}</span>
          <span className="text-sm sm:text-lg font-bold text-gray-900">{data[activeIndex].value}</span>
        </div>
      </div>
      <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
        {data.map((item, index) => (
          <div 
            key={item.name} 
            className="flex items-center justify-between text-xs sm:text-sm cursor-pointer hover:opacity-80 py-0.5 sm:py-1"
            onClick={() => setActiveIndex(index)}
            onMouseEnter={() => setActiveIndex(index)}
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-500">{item.name}</span>
            </div>
            <span className="font-medium text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
