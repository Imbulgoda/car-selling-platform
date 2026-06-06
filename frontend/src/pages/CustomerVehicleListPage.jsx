import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Fuel, Zap, Users, X, Calendar, DollarSign, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../layouts/Layout';

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const apiVersion = import.meta.env.VITE_API_VERSION;

export function CustomerVehicleListPage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    startDate: '',
    endDate: '',
    vehicleType: '',
    transmission: '',
    fuelType: '',
    maxPrice: '',
  });

  // Fetch vehicles on component mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const access_token = localStorage.getItem('token');
      // Ensure the token is set in cookies for the backend
      if (access_token) {
        document.cookie = `access_token=${access_token}; path=/`; 
      }
      
      // Fetch user's own vehicles
      let url = `${baseUrl}${apiVersion}/vehicle/get-all`;
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Please login to view your vehicles');
          return;
        }
        throw new Error('Failed to fetch vehicles');
      }

      const data = await response.json();
      // Handle different response formats from backend
      const vehicleList = data.vehicles || data.data || [];
      setVehicles(Array.isArray(vehicleList) ? vehicleList : []);
      
      if (vehicleList.length === 0) {
        // Don't show toast for empty state
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      // Don't show error for first load, just show empty state
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    // Implement search/filter logic based on filters state
    console.log('Searching with filters:', filters);
  };

  const handleViewDetails = (vehicleId) => {
    navigate(`/vehicles/${vehicleId}`);
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    if (filters.location && !vehicle.address?.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.vehicleType && vehicle.vehicleType !== filters.vehicleType) {
      return false;
    }
    if (filters.transmission && vehicle.transmission !== filters.transmission) {
      return false;
    }
    if (filters.fuelType && vehicle.fuelType !== filters.fuelType) {
      return false;
    }
    if (filters.maxPrice && vehicle.pricePerDay > parseFloat(filters.maxPrice)) {
      return false;
    }
    return true;
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[#0D3778] via-[#0A2E5C] to-[#1a3a52] text-white py-12 md:py-16 px-4 md:px-8 shadow-xl">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-3 tracking-tight">Find Your Perfect Ride</h1>
            <p className="text-blue-100 text-base sm:text-lg md:text-xl font-light">Choose from our wide selection of quality vehicles</p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white shadow-lg sticky top-0 z-10">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Enter location"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <button
                type="submit"
                className="bg-[#0D3778] hover:bg-[#0a2959] text-white px-8 py-3 rounded-lg font-medium transition-colors w-full md:w-auto"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Advanced Filter Results Section */}
        <div className="bg-gradient-to-r from-white to-gray-50 border-b-2 border-[#0D3778] shadow-md">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            <h3 className="text-lg sm:text-xl font-bold text-[#0D3778] mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#0D3778] rounded-full"></span>
              Filter Results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Vehicle Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                <select
                  name="vehicleType"
                  value={filters.vehicleType}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="">All Types</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Coupe">Coupe</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Truck">Truck</option>
                  <option value="Van">Van</option>
                </select>
              </div>

              {/* Transmission Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
                <select
                  name="transmission"
                  value={filters.transmission}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="">All</option>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                </select>
              </div>

              {/* Fuel Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
                <select
                  name="fuelType"
                  value={filters.fuelType}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="">All</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Electric">Electric</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (LKR/Day)</label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Max price"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D3778] focus:border-[#0D3778] outline-none hover:border-gray-400 transition-all duration-200 shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-96">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#0D3778]"></div>
                <p className="mt-6 text-gray-700 font-semibold text-base sm:text-lg">Loading vehicles...</p>
              </div>
            </div>
          ) : filteredVehicles.length > 0 ? (
            <>
              {/* Filter Results Info */}
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                  <span className="w-1.5 h-7 sm:h-8 bg-gradient-to-b from-[#0D3778] to-[#0A2E5C] rounded-full shadow-md"></span>
                  <span className="bg-gradient-to-r from-[#0D3778] to-[#0A2E5C] bg-clip-text text-transparent">
                    {filteredVehicles.length} Vehicle{filteredVehicles.length !== 1 ? 's' : ''} Available
                  </span>
                </h2>
              </div>

              {/* Vehicles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredVehicles.map((vehicle) => (
                  <div
                    key={vehicle._id || vehicle.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-[#0D3778] group transform hover:-translate-y-1"
                  >
                    {/* Vehicle Image Container */}
                    <div className="relative h-44 sm:h-52 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 overflow-hidden">
                      {vehicle.photos && vehicle.photos.length > 0 ? (
                        <img
                          src={vehicle.photos[0]}
                          alt={vehicle.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                          <div className="text-center">
                            <span className="text-4xl">🚗</span>
                            <p className="text-sm text-gray-600 mt-2">No Image</p>
                          </div>
                        </div>
                      )}
                      {/* Rating Badge */}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1 shadow-md">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold text-gray-800">4.2</span>
                      </div>
                    </div>

                    {/* Vehicle Details */}
                    <div className="p-4 sm:p-5">
                      {/* Title & Model */}
                      <div className="mb-2">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{vehicle.title || 'Vehicle'}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {vehicle.year && `${vehicle.year} • `}
                          {vehicle.vehicleType && `${vehicle.vehicleType}`}
                        </p>
                      </div>

                      {/* Specs Grid */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-4 grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <Fuel className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-600">Fuel</p>
                            <p className="text-sm font-semibold text-gray-900">{vehicle.fuelType || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-600">Transmission</p>
                            <p className="text-sm font-semibold text-gray-900">{vehicle.transmission || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-2 text-sm text-gray-600 mb-4">
                        <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{vehicle.address || 'Location not specified'}</span>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-200 my-3"></div>

                      {/* Pricing Section */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Per Day</p>
                          <p className="text-xl sm:text-2xl font-bold text-gray-900">
                            <span className="text-sm text-gray-600">LKR</span> {vehicle.pricePerDay?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600 font-medium">Per KM</p>
                          <p className="text-lg sm:text-xl font-bold text-gray-900">
                            <span className="text-sm text-gray-600">LKR</span> {vehicle.pricePerKm?.toLocaleString() || '0'}
                          </p>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <button
                        onClick={() => handleViewDetails(vehicle._id || vehicle.id)}
                        className="w-full bg-[#0D3778] hover:bg-[#0a2959] text-white font-semibold py-2.5 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl border-2 border-gray-100">
              <div className="bg-gradient-to-br from-[#0D3778]/10 to-[#0A2E5C]/5 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-8 shadow-lg">
                <span className="text-6xl">🚗</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#0D3778] to-[#0A2E5C] bg-clip-text text-transparent mb-3">No Vehicles Available</h3>
              <p className="text-gray-600 text-base sm:text-lg mb-10 max-w-md text-center">For Your Search. Try adjusting your filters or check back later for new vehicles.</p>
              <button
                onClick={fetchVehicles}
                className="bg-gradient-to-r from-[#0D3778] to-[#0A2E5C] hover:from-[#0a2959] hover:to-[#081f3d] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto"
              >
                🔄 Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Details Modal */}
      {isModalOpen && selectedVehicle && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>

          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
            <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all">
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>

              {/* Image Gallery */}
              <div className="relative h-56 sm:h-80 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 rounded-t-2xl sm:rounded-t-3xl overflow-hidden">
                {selectedVehicle.photos && selectedVehicle.photos.length > 0 ? (
                  <img
                    src={selectedVehicle.photos[0]}
                    alt={selectedVehicle.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-6xl">🚗</span>
                      <p className="text-lg text-gray-600 mt-3">No Image Available</p>
                    </div>
                  </div>
                )}
                {/* Rating Badge */}
                <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2 shadow-xl">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-lg font-bold text-gray-800">4.2</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-8">
                {/* Title Section */}
                <div className="mb-6">
                  <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">{selectedVehicle.title || 'Vehicle'}</h2>
                  <div className="flex flex-wrap items-center gap-3 text-gray-600">
                    <span className="text-base sm:text-lg font-medium">{selectedVehicle.year || 'N/A'}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-base sm:text-lg">{selectedVehicle.vehicleType || 'N/A'}</span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3 mb-6 p-3 sm:p-4 bg-red-50 rounded-xl border border-red-100">
                  <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Location</p>
                    <p className="text-base text-gray-900">{selectedVehicle.address || 'Location not specified'}</p>
                  </div>
                </div>

                {/* Specifications Grid */}
                <div className="mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-[#0D3778]" />
                    Specifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="bg-white rounded-lg p-2">
                          <Fuel className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Fuel Type</p>
                          <p className="text-lg font-bold text-gray-900">{selectedVehicle.fuelType || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200">
                      <div className="flex items-center gap-3">
                        <div className="bg-white rounded-lg p-2">
                          <Zap className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Transmission</p>
                          <p className="text-lg font-bold text-gray-900">{selectedVehicle.transmission || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="bg-white rounded-lg p-2">
                          <Users className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Capacity</p>
                          <p className="text-lg font-bold text-gray-900">{selectedVehicle.capacity || 'N/A'} Seats</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedVehicle.description && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedVehicle.description}</p>
                  </div>
                )}

                {/* Pricing Section */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[#0D3778]" />
                    Pricing Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-[#0D3778]/5 to-[#0D3778]/10 rounded-xl p-6 border-2 border-[#0D3778]/20">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600 font-medium">Per Day Rate</p>
                        <Calendar className="w-5 h-5 text-[#0D3778]" />
                      </div>
                      <p className="text-3xl sm:text-4xl font-bold text-[#0D3778]">
                        {selectedVehicle.pricePerDay?.toLocaleString() || '0'}
                        <span className="text-lg text-gray-600 ml-2">LKR</span>
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600 font-medium">Per KM Rate</p>
                        <MapPin className="w-5 h-5 text-gray-600" />
                      </div>
                      <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                        {selectedVehicle.pricePerKm?.toLocaleString() || '0'}
                        <span className="text-lg text-gray-600 ml-2">LKR</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-xl transition-all duration-300"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      closeModal();
                      navigate(`/vehicle/${selectedVehicle._id || selectedVehicle.id}/book`);
                    }}
                    className="flex-1 bg-gradient-to-r from-[#0D3778] to-[#0A2E5C] hover:from-[#0a2959] hover:to-[#081f3d] text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default CustomerVehicleListPage;
