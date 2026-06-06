import React from 'react';

const iconBgColors = {
  purple: 'bg-purple-100',
  yellow: 'bg-orange-100',
  green: 'bg-green-100',
  red: 'bg-red-100',
};

const iconColors = {
  purple: 'text-purple-500',
  yellow: 'text-orange-500',
  green: 'text-green-500',
  red: 'text-red-500',
};

const borderColors = {
  purple: '#6F00FF',
  yellow: '#E17100',
  green: '#05DF72',
  red: '#E53E3E',
};

const Cards = ({ label, val, icon, color }) => (
  <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border-2 flex items-center gap-3 sm:gap-4" style={{ borderColor: borderColors[color] }}>
    <div className={`${iconBgColors[color]} ${iconColors[color]} p-2 sm:p-3 rounded-full flex-shrink-0`}>
      <div className="w-6 h-6 sm:w-10 sm:h-10 flex items-center justify-center">
        {React.cloneElement(icon, { size: typeof window !== 'undefined' && window.innerWidth < 640 ? 24 : 40 })}
      </div>
    </div>
    <div className="min-w-0 flex-1">
      <h3 className="text-2xl sm:text-3xl font-bold text-brand-dark leading-none mb-1">{val}</h3>
      <p className="text-xs sm:text-sm text-gray-600 truncate">{label}</p>
    </div>
  </div>
);

export default Cards;
