import React from 'react';
import { Search, Filter } from 'lucide-react';

export function SearchBar({ value = '', onChange, onFilterClick }) {
  return (
    <div className="flex gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Search by vehicle name, number plate or owner..."
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <button
        onClick={onFilterClick}
        className="px-6 py-3 border border-gray-300 rounded-xl flex items-center gap-2 text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Filter className="w-5 h-5" />
        Filter
      </button>
    </div>
  );
}