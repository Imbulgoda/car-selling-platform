import React from 'react';

function Tab({ tab, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(tab.id)}
      className={`px-6 py-3 font-medium transition-colors relative ${
        isActive ? 'text-blue-700' : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {tab.label} {tab.count !== undefined && `(${tab.count})`}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-700"></div>
      )}
    </button>
  );
}

export function Tabs({ tabs = [], activeTab, onTabChange }) {
  return (
    <div className="flex gap-2 border-b border-gray-200">
      {(tabs || []).map((tab) => (
        <Tab
          key={tab.id}
          tab={tab}
          isActive={activeTab === tab.id}
          onClick={onTabChange}
        />
      ))}
    </div>
  );
}