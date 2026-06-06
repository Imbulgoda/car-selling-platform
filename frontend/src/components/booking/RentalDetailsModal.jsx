import React from "react";
import { FaTimes, FaDownload } from "react-icons/fa";

const RentalDetailsModal = ({
  rental,
  isOpen,
  onClose,
  onDownloadInvoice,
  onDownloadDocuments,
  imageCache = {},
}) => {
  if (!isOpen || !rental) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate number of rental days
  const calculateRentalDays = () => {
    const start = new Date(rental.startDate);
    const end = new Date(rental.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const rentalDays = calculateRentalDays();

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-blue-900">Rental Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-4">
            View brief information about the rental
          </p>

          {/* Vehicle Image */}
          <div className="mb-6 rounded-lg overflow-hidden">
            <img
              src={
                rental.imageUrl && imageCache[rental.imageUrl]
                  ? imageCache[rental.imageUrl]
                  : rental.image
              }
              alt={rental.carName}
              className="w-full h-64 object-cover"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=400";
              }}
            />
          </div>

          {/* Vehicle Name and Status */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-blue-900">
              {rental.carName}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(rental.status)}`}
            >
              {rental.status}
            </span>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Vehicle Information */}
            <div>
              <h4 className="font-semibold text-blue-900 mb-3">
                VEHICLE INFORMATION
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Vehicle Name:</span>
                  <p className="font-medium">{rental.carName}</p>
                </div>
                <div>
                  <span className="text-gray-500">Registration No:</span>
                  <p className="font-medium">
                    {rental.registrationNo || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Seats:</span>
                  <p className="font-medium">{rental.seats} Seats</p>
                </div>
                <div>
                  <span className="text-gray-500">Transmission:</span>
                  <p className="font-medium">
                    {rental.transmission === "Auto" ? "Automatic" : "Manual"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Fuel:</span>
                  <p className="font-medium">{rental.fuelType || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Renter Information */}
            <div>
              <h4 className="font-semibold text-blue-900 mb-3">
                RENTER INFORMATION
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Renter Name:</span>
                  <p className="font-medium">{rental.renter}</p>
                </div>
                <div>
                  <span className="text-gray-500">Contact Number:</span>
                  <p className="font-medium">{rental.renterPhone || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Email Address:</span>
                  <p className="font-medium">{rental.renterEmail || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-500">License No:</span>
                  <p className="font-medium">{rental.licenseNo || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rental Period */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-3">RENTAL PERIOD</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Pickup Date & Time:</span>
                <p className="font-medium">
                  {formatDate(rental.startDate)} •{" "}
                  {formatTime(rental.startDate)}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Return Date & Time:</span>
                <p className="font-medium">
                  {formatDate(rental.endDate)} • {formatTime(rental.endDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-3">
              PAYMENT DETAILS
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Base Rent (Daily Rate):</span>
                <span className="font-medium">
                  {rental.dailyRate || rental.price}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Number of Days:</span>
                <span className="font-medium">
                  {rentalDays} {rentalDays === 1 ? "Day" : "Days"}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300">
                <span className="font-semibold text-blue-900">
                  Total Amount:
                </span>
                <span className="font-bold text-blue-900 text-lg">
                  {rental.price}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Status Badge */}
          {rental.status.toLowerCase() === "approved" && (
            <div className="bg-green-100 text-green-700 rounded-lg p-3 mb-6 flex items-center ">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">
                Payment completed successfully
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onDownloadInvoice(rental)}
              className="flex-1 bg-blue-900 text-white py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
            >
              <FaDownload />
              Download Invoice
            </button>
            <button
              onClick={() => onDownloadDocuments(rental)}
              className="flex-1 bg-blue-900 text-white py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
            >
              <FaDownload />
              Download Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const getStatusBadgeColor = (status) => {
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

export default RentalDetailsModal;
