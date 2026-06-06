import { Star } from "lucide-react";

export const TopPerformers = ({ data = [] }) => {
  return (
    <div className="rounded-lg sm:rounded-xl bg-white p-3 sm:p-4 md:p-5 shadow-sm border border-gray-200 h-full">
      <div className="mb-3 sm:mb-4">
        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Top Performers</h3>
        <p className="text-[10px] sm:text-xs text-gray-500">Best rated vehicles</p>
      </div>
      <div className="space-y-2 sm:space-y-3 md:space-y-4">
        {data.length > 0 ? (
          data.map((vehicle, index) => (
            <div key={vehicle._id || index} className="flex items-center justify-between gap-2 p-2 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{vehicle.title}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                  {vehicle.model} • {vehicle.vehicleType}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-[#0D3778] mt-0.5 sm:mt-1">
                  Rs. {vehicle.pricePerDay?.toLocaleString()}/day
                </p>
              </div>
              <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-xs sm:text-sm font-medium text-[#0D3778]">
                    {vehicle.averageRating?.toFixed(1) || 0}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500">
                  {vehicle.reviewCount || 0} reviews
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 sm:py-8">
            <p className="text-gray-500 text-xs sm:text-sm">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
};
