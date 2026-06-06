import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

export function Header({ activeTab, onNavigate }) {
  return (
    <header className="w-full bg-[#1e3a5f] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          {/* Logo/Location */}
          <div
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onNavigate('home')}>

            <MapPin className="h-5 w-5 text-white" />
            <span className="font-medium text-sm sm:text-base">
              Find A Location
            </span>
          </div>

          {/* Contact Info (Hidden on small mobile) */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span className="text-sm">077764224</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span className="text-sm">rentmycar@gmail.com</span>
            </div>
          </div>
        </div>

        {/* Right: CTA Button */}
        <div>
          <button
            onClick={() => onNavigate('rent')}
            className={`px-4 py-2 rounded bg-white text-[#1e3a5f] text-sm font-semibold hover:bg-gray-100 transition-colors ${activeTab === 'rent' ? 'ring-2 ring-[#2563eb] ring-offset-2 ring-offset-[#1e3a5f]' : ''}`}>

            Rent Your Car
          </button>
        </div>
      </div>

      {/* Mobile Contact Info Bar */}
      <div className="md:hidden bg-[#162c46] px-4 py-2 flex justify-between text-xs text-gray-300">
        <div className="flex items-center space-x-1">
          <Phone className="h-3 w-3" />
          <span>077764224</span>
        </div>
        <div className="flex items-center space-x-1">
          <Mail className="h-3 w-3" />
          <span>rentmycar@gmail.com</span>
        </div>
      </div>
    </header>);

}
