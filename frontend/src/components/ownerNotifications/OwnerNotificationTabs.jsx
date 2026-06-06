import React from 'react';

const OwnerNotificationTabs = ({ activeTab, onTabChange, counts }) => {
  const tabs = [
    { id: 'all', label: 'All', icon: null },
    { id: 'unread', label: 'Unread', icon: null },
    { id: 'bookings', label: 'Booking Requests', icon: null },
    { id: 'reviews', label: 'Reviews', icon: null },
    { id: 'alerts', label: 'Alerts', icon: null }
  ];

  return (
    <div className="border-b border-gray-200">
      <div className="flex gap-0 overflow-x-auto sm:overflow-x-visible scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors relative whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            {counts[tab.id] > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {counts[tab.id]}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default OwnerNotificationTabs;
