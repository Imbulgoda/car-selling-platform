import React from 'react';
import { Search, X, List, Clock, CheckCircle2, XCircle } from 'lucide-react';

const TableHeader = ({ activeFilter, onFilterChange, searchTerm, onSearchChange }) => {
  const tabs = [
    { name: 'All', icon: <List size={16} /> },
    { name: 'Pending', icon: <Clock size={16} /> },
    { name: 'Approved', icon: <CheckCircle2 size={16} /> },
    { name: 'Rejected', icon: <XCircle size={16} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 gap-4 font-['Nunito']">
      <h2 className="text-xl font-bold text-[#0D3778]">Booking Requests List</h2>
      
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
        
        {/* --- Tabs Container --- */}
        <div>
          {/* Mobile View: 2x2 Grid Chips (Hidden on MD screens) */}
          <div className="grid grid-cols-2 gap-2 md:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => onFilterChange(tab.name)}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                  activeFilter === tab.name
                    ? 'bg-[#0D3778] text-white border-[#0D3778] shadow-md'
                    : 'bg-white text-gray-500 border-gray-200'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Desktop View: Original Box Style (Hidden on Small screens) */}
          <div className="hidden md:flex bg-gray-100 rounded-lg p-1 border border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => onFilterChange(tab.name)}
                className={`px-6 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                  activeFilter === tab.name
                    ? 'bg-[#0D3778] text-white shadow-md'
                    : 'text-gray-500 hover:text-[#0D3778] hover:bg-gray-200'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* --- Search Input (Responsive width) --- */}
        <div className="relative">
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
            size={18} 
          />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full md:w-64 pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D3778]/20 bg-white text-sm text-[#0D3778]"
          />
          
          {searchTerm && (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
            >
              <X size={14} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default TableHeader;