import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import Layout from "../layouts/Layout";
import AvailabilityOwner from "../components/AvailabilityOwner";

const MyVehicleOwner = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState({});

  // Filter states
  const [filters, setFilters] = useState({
    numberPlate: "",
    vehicleType: "",
    transmission: "",
    location: "",
  });

  // Fetch vehicles on component mount
  useEffect(() => {
    fetchMyVehicles();
  }, []);

  // Apply filters whenever vehicles or filters change
  useEffect(() => {
    applyFilters();
  }, [vehicles, filters]);

  const fetchMyVehicles = async () => {
    try {
      setLoading(true);
      const response = await api.get("/vehicle/get-my-all");
      if (response.data.success) {
        setVehicles(response.data.vehicles);
      } else {
        toast.error("Failed to fetch vehicles");
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Error fetching vehicles");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = vehicles;

    if (filters.numberPlate) {
      filtered = filtered.filter((v) =>
        v.numberPlate.toLowerCase().includes(filters.numberPlate.toLowerCase())
      );
    }

    if (filters.vehicleType) {
      filtered = filtered.filter((v) => v.vehicleType === filters.vehicleType);
    }

    if (filters.transmission) {
      filtered = filtered.filter((v) => v.transmission === filters.transmission);
    }

    if (filters.location) {
      filtered = filtered.filter((v) =>
        (v.location?.address || "").toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredVehicles(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = async (vehicleId) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        const response = await api.delete(`/vehicle/delete/${vehicleId}`);
        if (response.data.success) {
          toast.success("Vehicle deleted successfully");
          fetchMyVehicles();
        }
      } catch (error) {
        toast.error("Failed to delete vehicle");
      }
    }
  };

  const handleManage = (vehicleId) => {
    navigate(`/owner/vehicles/${vehicleId}/edit`);
  };

  const handleAddVehicle = () => {
    navigate("/owner/vehicles/new");
  };

  const handleAvailability = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowAvailabilityModal(true);
  };

  const handleCloseAvailability = () => {
    setShowAvailabilityModal(false);
    setSelectedVehicle(null);
  };

  const handlePrevPhoto = (vehicleId, photosLength) => {
    setCurrentPhotoIndex((prev) => ({
      ...prev,
      [vehicleId]: prev[vehicleId] > 0 ? prev[vehicleId] - 1 : photosLength - 1,
    }));
  };

  const handleNextPhoto = (vehicleId, photosLength) => {
    setCurrentPhotoIndex((prev) => ({
      ...prev,
      [vehicleId]: prev[vehicleId] < photosLength - 1 ? prev[vehicleId] + 1 : 0,
    }));
  };

  const getCurrentPhotoIndex = (vehicleId) => {
    return currentPhotoIndex[vehicleId] || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-4 md:py-8">
        <div className="max-w-6xl mx-auto px-2 md:px-4">
          {/* Header */}
          <div className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Vehicles</h1>
            </div>
            <button
              onClick={handleAddVehicle}
              style={{ backgroundColor: "#0D3778" }}
              className="w-full sm:w-auto px-4 md:px-6 py-2 hover:opacity-90 text-white font-medium rounded-lg transition duration-200"
            >
              + Add Vehicle
            </button>
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-xl border border-gray-300 p-4 md:p-6 mb-6 md:mb-8 shadow-sm">
            <div className="flex flex-col gap-3 md:gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    Number Plate
                  </label>
                  <input
                    type="text"
                    name="numberPlate"
                    placeholder="WP/AB 1234"
                    value={filters.numberPlate}
                    onChange={handleFilterChange}
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-75 text-sm"
                    style={{ focusRingColor: "#0D3778" }}
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    name="vehicleType"
                    value={filters.vehicleType}
                    onChange={handleFilterChange}
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="Car">Car</option>
                    <option value="Van">Van</option>
                    <option value="SUV">SUV</option>
                    <option value="Pickup">Pickup</option>
                    <option value="Bus">Bus</option>
                    <option value="Bike">Bike</option>
                    <option value="ThreeWheel">Three Wheel</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    Transmission
                  </label>
                  <select
                    name="transmission"
                    value={filters.transmission}
                    onChange={handleFilterChange}
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    placeholder="City or Area"
                    value={filters.location}
                    onChange={handleFilterChange}
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-75 text-sm"
                    style={{ focusRingColor: "#0D3778" }}
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    &nbsp;
                  </label>
                  <button
                    style={{ backgroundColor: "#0D3778" }}
                    className="w-full px-4 md:px-8 py-2 hover:opacity-90 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center gap-2 text-sm h-10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Cards */}
          <div className="space-y-4">
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => (
                <div
                  key={vehicle._id}
                  className="bg-white rounded-xl border border-gray-300 overflow-hidden shadow-sm hover:shadow-lg transition duration-200"
                >
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6">
                    {/* Vehicle Image Carousel */}
                    <div className="flex-shrink-0 w-full md:w-48 h-40 md:h-40 relative group">
                      {vehicle.photos && vehicle.photos.length > 0 ? (
                        <>
                          <img
                            src={`${import.meta.env.VITE_API_BASE_URL}${vehicle.photos[getCurrentPhotoIndex(vehicle._id)].url}`}
                            alt={vehicle.title}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%236b7280'%3EImage not found%3C/text%3E%3C/svg%3E";
                            }}
                          />

                          {/* Navigation Buttons - Show only if more than 1 photo */}
                          {vehicle.photos.length > 1 && (
                            <>
                              {/* Previous Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePrevPhoto(vehicle._id, vehicle.photos.length);
                                }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ backgroundColor: "rgba(13, 55, 120, 0.7)" }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(13, 55, 120, 0.9)"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(13, 55, 120, 0.7)"}
                                aria-label="Previous photo"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                              </button>

                              {/* Next Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNextPhoto(vehicle._id, vehicle.photos.length);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ backgroundColor: "rgba(13, 55, 120, 0.7)" }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(13, 55, 120, 0.9)"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(13, 55, 120, 0.7)"}
                                aria-label="Next photo"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>

                              {/* Photo Indicators */}
                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {vehicle.photos.map((_, index) => (
                                  <button
                                    key={index}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCurrentPhotoIndex((prev) => ({ ...prev, [vehicle._id]: index }));
                                    }}
                                    className={`w-2 h-2 rounded-full transition-all ${getCurrentPhotoIndex(vehicle._id) === index
                                      ? 'bg-white w-4'
                                      : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                                      }`}
                                    aria-label={`Go to photo ${index + 1}`}
                                  />
                                ))}
                              </div>

                              {/* Photo Counter */}
                              <div className="absolute top-2 right-2 text-white text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "rgba(13, 55, 120, 0.7)" }}>
                                {getCurrentPhotoIndex(vehicle._id) + 1}/{vehicle.photos.length}
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
                          <span className="text-gray-500 text-sm">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Vehicle Details - Full Width Flex Column */}
                    <div className="flex-grow flex flex-col min-w-0">
                      {/* Header: Title and Booking ID on left, Price on right */}
                      <div className="flex flex-col md:flex-row justify-between items-start gap-2 md:gap-0 mb-3">
                        <div className="w-full md:w-auto">
                          <h3 style={{ color: "#0D3778" }} className="text-xl md:text-2xl font-bold break-words">
                            {vehicle.title}
                          </h3>
                          <p className="text-xs md:text-sm text-gray-500 mt-1">
                            Booking ID: {vehicle._id.substring(0, 8)}
                          </p>
                        </div>
                        <div className="text-right md:ml-auto">
                          <p style={{ color: "#0D3778" }} className="text-xl md:text-2xl font-bold whitespace-nowrap">
                            RS.{vehicle.pricePerDay}
                          </p>
                        </div>
                      </div>

                      {/* Vehicle Specs */}
                      <p className="text-gray-700 font-medium text-sm mb-2 break-words">
                        {vehicle.model} • {vehicle.year} • {vehicle.vehicleType} • {vehicle.transmission} • {vehicle.seats} {vehicle.seats === 1 ? 'Seat' : 'Seats'}
                      </p>

                      {/* Plate and Pricing */}
                      <p className="text-gray-600 text-xs md:text-sm mb-2 break-words">Plate: {vehicle.numberPlate}</p>

                      <p className="text-green-600 font-semibold text-xs md:text-sm mb-3">
                        RS.{vehicle.pricePerDay}/day • RS.{vehicle.pricePerKm}/km
                      </p>

                      {/* Location */}
                      <p className="text-blue-600 font-medium text-xs md:text-sm mb-3 flex items-center gap-1">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {vehicle.location?.address || "Location not specified"}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex text-yellow-400 text-sm md:text-base">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={i < Math.floor(vehicle.averageRating) ? "text-yellow-400" : "text-gray-300"}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons - Bottom Horizontal */}
                      <div className="flex flex-col sm:flex-row gap-2 w-full mt-auto pt-4 border-t border-gray-200">
                        <button
                          onClick={() => navigate(`/vehicles/${vehicle._id}`)}
                          style={{ backgroundColor: "#0D3778" }}
                          className="flex-1 px-4 py-2 hover:opacity-90 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center gap-2 text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details
                        </button>
                        <button
                          onClick={() => handleManage(vehicle._id)}
                          style={{ backgroundColor: "#0D3778" }}
                          className="flex-1 px-4 py-2 hover:opacity-90 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center gap-2 text-sm"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          Manage
                        </button>
                        <button
                          onClick={() => handleAvailability(vehicle)}
                          style={{ backgroundColor: "#0D3778" }}
                          className="flex-1 px-4 py-2 hover:opacity-90 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center gap-2 text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Availability
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle._id)}
                          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center gap-2 text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl border border-gray-300 p-8 md:p-12 text-center">
                <p className="text-gray-600 text-base md:text-lg mb-4">No vehicles found</p>
                <button
                  onClick={handleAddVehicle}
                  style={{ backgroundColor: "#0D3778" }}
                  className="w-full sm:w-auto px-6 py-2 hover:opacity-90 text-white font-medium rounded-lg transition duration-200"
                >
                  Add Your First Vehicle
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Availability Modal */}
      <AvailabilityOwner
        isOpen={showAvailabilityModal}
        onClose={handleCloseAvailability}
        vehicle={selectedVehicle}
      />
    </Layout>
  );
};

export default MyVehicleOwner;
