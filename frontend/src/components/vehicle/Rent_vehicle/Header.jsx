import React, { useState } from 'react';
import { Car, MapPin, Phone, Mail, Menu, X } from 'lucide-react';
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <header className="w-full font-sans">
      {/* Top Row - Navigation */}
      <div className="bg-white py-4 px-4 md:px-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Car className="h-6 w-6 text-[#1e3a5f]" />
            <span className="text-xl font-bold text-[#1e3a5f]">
              Rent My Car
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#"
              className="text-gray-600 hover:text-[#1e3a5f] transition-colors text-sm font-medium">

              Browse Cars
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-[#1e3a5f] transition-colors text-sm font-medium">

              How It Works
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-[#1e3a5f] transition-colors text-sm font-medium">

              Become a Host
            </a>
            <div className="flex items-center gap-3 ml-4">
              <button className="px-5 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:border-[#1e3a5f] hover:text-[#1e3a5f] transition-colors">
                Login
              </button>
              <button className="px-5 py-2 bg-[#1e3a5f] text-white rounded text-sm font-medium hover:bg-[#162c46] transition-colors shadow-sm">
                Sign Up
              </button>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}>

            {isMenuOpen ?
            <X className="h-6 w-6" /> :

            <Menu className="h-6 w-6" />
            }
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen &&
      <div className="md:hidden bg-white border-b border-gray-100 py-4 px-4 flex flex-col gap-4">
          <a href="#" className="text-gray-600 hover:text-[#1e3a5f]">
            Browse Cars
          </a>
          <a href="#" className="text-gray-600 hover:text-[#1e3a5f]">
            How It Works
          </a>
          <a href="#" className="text-gray-600 hover:text-[#1e3a5f]">
            Become a Host
          </a>
          <div className="flex flex-col gap-2 pt-2">
            <button className="w-full px-5 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700">
              Login
            </button>
            <button className="w-full px-5 py-2 bg-[#1e3a5f] text-white rounded text-sm font-medium">
              Sign Up
            </button>
          </div>
        </div>
      }

      {/* Bottom Row - Contact Bar */}
      <div className="bg-[#1e3a5f] text-white py-3 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Find A Location</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>0777764224</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>rentmycar@gmail.com</span>
            </div>
          </div>

          <button className="bg-white text-[#1e3a5f] px-6 py-1.5 rounded text-sm font-bold hover:bg-gray-100 transition-colors w-full md:w-auto text-center">
            Rent Your Car
          </button>
        </div>
      </div>
    </header>);

}