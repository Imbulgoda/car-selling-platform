import PropTypes from 'prop-types';

const variantStyles = {
  users: "bg-[#0D3778]",
  vehicles: "bg-[#00C950]",
  bookings: "bg-[#FF6900]",
  revenue: "bg-[#AD46FF]",
};

const borderStyles = {
  users: "border-l-[#0D3778]",
  vehicles: "border-l-[#00C950]",
  bookings: "border-l-[#FF6900]",
  revenue: "border-l-[#AD46FF]",
};

export const StatCard = ({
  title,
  value,
  subtitle,
  change,
  changeType,
  icon: Icon,
  variant,
}) => {
  return (
    <div className={`rounded-lg sm:rounded-xl bg-white p-3 sm:p-4 md:p-5 shadow-sm border border-gray-200 border-l-4 ${borderStyles[variant]}`}>
      <div className="flex items-start justify-between gap-1">
        <div className={`flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 items-center justify-center rounded-lg sm:rounded-xl text-white ${variantStyles[variant]} flex-shrink-0`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
        </div>
        <span className={`text-[10px] sm:text-xs md:text-sm font-medium px-1.5 py-0.5 rounded ${
          changeType === "positive" 
            ? "text-green-700 bg-green-50" 
            : "text-red-700 bg-red-50"
        }`}>
          {changeType === "positive" ? "+" : ""}
          {change}
        </span>
      </div>
      <div className="mt-2 sm:mt-3 md:mt-4">
        <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 truncate">{title}</p>
        <p className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 truncate">{value}</p>
        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">{subtitle}</p>
      </div>
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  change: PropTypes.string.isRequired,
  changeType: PropTypes.oneOf(['positive', 'negative']).isRequired,
  icon: PropTypes.elementType.isRequired,
  variant: PropTypes.oneOf(['users', 'vehicles', 'bookings', 'revenue']).isRequired,
};
