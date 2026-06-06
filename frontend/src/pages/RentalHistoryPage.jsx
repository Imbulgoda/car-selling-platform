import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaBell,
  FaUserCircle,
  FaSearch,
  FaCar,
  FaCogs,
  FaCalendarAlt,
  FaChevronDown,
  FaSpinner,
} from "react-icons/fa";
import { getOwnerBookings } from "../services/rentalService";
import api from "../services/api";
import Layout from "../layouts/Layout";
import RentalDetailsModal from "../components/booking/RentalDetailsModal";

const RentalHistoryPage = () => {
  const [rentals, setRentals] = useState([]);
  const [filteredRentals, setFilteredRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageCache, setImageCache] = useState({});
  const [ownerId, setOwnerId] = useState(null);
  const [selectedRental, setSelectedRental] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchAuthenticatedUser();

    // Cleanup function to revoke object URLs
    return () => {
      Object.values(imageCache).forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  useEffect(() => {
    if (ownerId) {
      fetchOwnerBookings();
    }
  }, [ownerId]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, dateRange, statusFilter, rentals]);

  const fetchAuthenticatedUser = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const API_VERSION = import.meta.env.VITE_API_VERSION || "";

      const response = await fetch(
        `${API_BASE_URL}${API_VERSION}/authUser/getUserDetails`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user details. Please login.");
      }

      const data = await response.json();
      if (data?.success && data?.user?._id) {
        setOwnerId(data.user._id);
      } else {
        throw new Error("User not authenticated. Please login.");
      }
    } catch (err) {
      console.error("❌ Error fetching authenticated user:", err);
      setError(err.message || "Failed to authenticate user");
      setLoading(false);
    }
  };

  const fetchOwnerBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getOwnerBookings(ownerId);

      const transformedData = transformBookingsData(response || []);

      setRentals(transformedData);
      setFilteredRentals(transformedData);

      await loadImages(transformedData);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load rental history",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadImages = async (bookings) => {
    const newCache = { ...imageCache };

    for (const booking of bookings) {
      if (
        booking.imageUrl &&
        !booking.imageUrl.startsWith("http") &&
        !newCache[booking.imageUrl]
      ) {
        try {
          const fullUrl = `http://localhost:8090${booking.imageUrl}`;

          const response = await fetch(fullUrl, {
            credentials: "include",
          });

          if (!response.ok) {
            continue;
          }

          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          newCache[booking.imageUrl] = blobUrl;
        } catch (err) {
          console.error(`Failed to load image: ${booking.imageUrl}`, err);
        }
      }
    }

    setImageCache(newCache);
  };

  const transformBookingsData = (bookings) => {
    return bookings.map((booking) => {
      const isVehiclePopulated =
        typeof booking.vehicleId === "object" && booking.vehicleId !== null;
      const isCustomerPopulated =
        typeof booking.customerId === "object" && booking.customerId !== null;

      const imageUrl =
        isVehiclePopulated && booking.vehicleId.photos?.[0]?.url
          ? booking.vehicleId.photos[0].url
          : null;

      return {
        id: booking._id,
        bookingId: booking._id,
        carName: isVehiclePopulated
          ? booking.vehicleId.title || booking.vehicleId.model || "Vehicle"
          : `Vehicle (${booking.vehicleId?.slice(0, 8)}...)`,
        renter: isCustomerPopulated
          ? `${booking.customerId.first_name} ${booking.customerId.last_name}`
          : `Customer (${booking.customerId?.slice(0, 8)}...)`,

        // Customer data from population
        renterPhone: isCustomerPopulated
          ? booking.customerId.contactNumber
          : "N/A",
        renterEmail: isCustomerPopulated ? booking.customerId.email : "N/A",
        licenseNo: "N/A", // Not in User schema - need to add if required

        // Vehicle data from population
        seats: isVehiclePopulated ? booking.vehicleId.seats || 4 : 4,
        transmission: isVehiclePopulated
          ? booking.vehicleId.transmission === "Automatic"
            ? "Auto"
            : "Manual"
          : booking.dailyRate > 5000
            ? "Auto"
            : "Manual",
        registrationNo: isVehiclePopulated
          ? booking.vehicleId.numberPlate
          : "N/A",
        fuelType: isVehiclePopulated ? booking.vehicleId.fuelType : "N/A",

        // Booking dates
        dateRange: `${new Date(booking.startingDate).toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          },
        )} - ${new Date(booking.endDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`,
        startDate: new Date(booking.startingDate),
        endDate: new Date(booking.endDate),

        // Payment details
        price: `Rs. ${booking.totalAmount?.toLocaleString()}`,
        dailyRate: `Rs. ${booking.dailyRate?.toLocaleString()}`,
        insurance: booking.insurance || 0,
        serviceCharge: booking.serviceCharge || 0,

        // Location details (if available in booking)
        pickupLocation: booking.pickupLocation || "N/A",
        returnLocation: booking.returnLocation || "N/A",

        // Status
        status:
          booking.status.charAt(0).toUpperCase() + booking.status.slice(1),

        // Images
        imageUrl: imageUrl,
      };
    });
  };

  const applyFilters = () => {
    let filtered = [...rentals];

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (rental) =>
          rental.carName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rental.renter.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rental.price.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (startDate && endDate) {
      const filterStart = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
      );
      const filterEnd = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate(),
      );

      filtered = filtered.filter((rental) => {
        const rentalStart = new Date(
          rental.startDate.getFullYear(),
          rental.startDate.getMonth(),
          rental.startDate.getDate(),
        );
        const rentalEnd = new Date(
          rental.endDate.getFullYear(),
          rental.endDate.getMonth(),
          rental.endDate.getDate(),
        );

        return rentalStart >= filterStart && rentalEnd <= filterEnd;
      });
    }

    if (statusFilter) {
      filtered = filtered.filter(
        (rental) => rental.status.toLowerCase() === statusFilter.toLowerCase(),
      );
    }

    setFilteredRentals(filtered);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-600";
      case "pending":
        return "bg-yellow-100 text-yellow-600";
      case "rejected":
        return "bg-red-100 text-red-600";
      case "cancelled":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-blue-100 text-blue-600";
    }
  };

  const handleViewDetails = (rental) => {
    setSelectedRental(rental);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRental(null);
  };

  const handleDownloadInvoice = async (rental) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const API_VERSION = import.meta.env.VITE_API_VERSION || "";

      const response = await fetch(
        `${API_BASE_URL}${API_VERSION}/bookings/${rental.id}/invoice`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to download invoice");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${rental.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading invoice:", err);
      alert("Failed to download invoice. Please try again.");
    }
  };

  const handleDownloadDocuments = async (rental) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const API_VERSION = import.meta.env.VITE_API_VERSION || "";

      const response = await fetch(
        `${API_BASE_URL}${API_VERSION}/bookings/${rental.id}/documents`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to download documents");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `documents-${rental.id}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading documents:", err);
      alert("Failed to download documents. Please try again.");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-900 mx-auto mb-4" />
            <p className="text-gray-600">Loading rental history...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    const isAccessDenied =
      error.toLowerCase().includes("access denied") ||
      error.toLowerCase().includes("only vehicle owners");

    const errorContent = (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800"
          >
            Retry
          </button>
        </div>
      </div>
    );

    return isAccessDenied ? errorContent : <Layout>{errorContent}</Layout>;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* --- Main Content --- */}
        <main className="max-w-7xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-8">
          <h1 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4 sm:mb-6">
            Rental Car History
          </h1>

          {/* Filters Section */}
          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-sm border border-gray-100 mb-6 lg:mb-8">
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 items-stretch">
              <div className="relative w-full lg:w-1/3">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search vehicle or renter"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-blue-900 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900 bg-white"
                />
              </div>

              <div className="w-full lg:w-1/3 relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10 text-sm" />
                <DatePicker
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => setDateRange(update)}
                  isClearable={true}
                  placeholderText="Date range"
                  wrapperClassName="w-full"
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-blue-900 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900 text-gray-600 placeholder-gray-400 bg-white"
                />
              </div>

              <div className="w-full lg:w-1/3 relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 text-sm border border-blue-900 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900 bg-white text-gray-600 appearance-none cursor-pointer leading-tight"
                >
                  <option value="">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-400 mb-4 px-1">
            Showing {filteredRentals.length} of {rentals.length} Rentals
          </p>

          {filteredRentals.length === 0 ? (
            <div className="text-center py-12">
              <FaCar className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No rentals found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredRentals.map((rental) => (
                <div
                  key={rental.id}
                  className="bg-white rounded-lg sm:rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="h-40 sm:h-48 w-full bg-gray-200 relative">
                    {rental.imageUrl && imageCache[rental.imageUrl] && (
                      <img
                        src={imageCache[rental.imageUrl]}
                        alt={rental.carName}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="p-3 sm:p-5">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-blue-900 text-base sm:text-lg">
                          {rental.carName}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {rental.renter}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 text-xs text-gray-500 my-3 sm:my-4 border-t border-b border-gray-100 py-3">
                      <div className="flex items-center gap-1.5">
                        <FaUserCircle className="shrink-0" />
                        <span>{rental.seats} Seats</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FaCogs className="shrink-0" />
                        <span>{rental.transmission}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FaCalendarAlt className="shrink-0" />
                        <span className="wrap-break-word sm:whitespace-nowrap">
                          {rental.dateRange}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                      <div>
                        <span className="block text-lg sm:text-xl font-bold text-blue-900">
                          {rental.price}
                        </span>
                        <span className="text-xs text-gray-400">
                          Total Earnings
                        </span>
                      </div>
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          rental.status,
                        )}`}
                      >
                        {rental.status}
                      </span>
                    </div>

                    <button
                      onClick={() => handleViewDetails(rental)}
                      className="w-full bg-blue-900 text-white py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium hover:bg-blue-800 transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Rental Details Modal */}
        <RentalDetailsModal
          rental={selectedRental}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onDownloadInvoice={handleDownloadInvoice}
          onDownloadDocuments={handleDownloadDocuments}
          imageCache={imageCache}
        />
      </div>
    </Layout>
  );
};

export default RentalHistoryPage;
