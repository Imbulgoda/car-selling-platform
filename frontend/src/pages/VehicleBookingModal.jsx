import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Phone, Star, X, MessageSquare } from 'lucide-react';
import {
  getEnrichedBooking,
  enrichBookingData,
} from '../services/bookingHistoryService';

const VehicleBookingModal = ({
  bookingId,
  booking: initialBooking,
  onClose,
  API_BASE_URL,
  API_VERSION,
}) => {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(initialBooking || null);
  const [loading, setLoading] = useState(!initialBooking);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (initialBooking) {
      const enrichExistingBooking = async () => {
        try {
          const enriched = await enrichBookingData(
            initialBooking,
            API_BASE_URL,
            API_VERSION,
          );
          setBooking(enriched);
        } catch (err) {
          console.error('Error enriching existing booking:', err);
          setBooking(initialBooking);
        }
      };

      enrichExistingBooking();
      return;
    }

    if (!bookingId) return;

    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const enrichedBooking = await getEnrichedBooking(
          bookingId,
          API_BASE_URL,
          API_VERSION,
        );
        setBooking(enrichedBooking);
      } catch (err) {
        console.error('Error fetching booking details:', err);

        if (
          err.message?.includes('404') ||
          err.message?.includes('not found')
        ) {
          setError('Booking not found. It may have been deleted.');
        } else if (
          err.message?.includes('403') ||
          err.message?.includes('permission')
        ) {
          setError(
            'Access denied. You do not have permission to view this booking.',
          );
        } else if (
          err.message?.includes('401') ||
          err.message?.includes('sign in')
        ) {
          setError('Please sign in to view booking details.');
        } else if (err.message?.includes('Network error')) {
          setError('Network error. Please check your connection.');
        } else {
          setError(
            err.message || 'Error loading booking details. Please try again.',
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, API_BASE_URL, API_VERSION, initialBooking]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return `Rs${Math.round(amount || 0)}`;
  };

  const getStatusStyles = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'pending':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          label: 'Pending',
        };
      case 'approved':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          label: 'Approved',
        };
      case 'rejected':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          label: 'Rejected',
        };
      case 'cancelled':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          label: 'Cancelled',
        };
      case 'completed':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          label: 'Completed',
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          label: 'Unknown',
        };
    }
  };

  const getVehicleImage = (vehicle, index = 0) => {
    if (!vehicle?.photos?.[index] && !vehicle?.images?.[index]) return null;

    const imageArray = vehicle.photos || vehicle.images || [];
    if (index >= imageArray.length) return null;

    const firstImage = imageArray[index];
    return typeof firstImage === 'object' ? firstImage.url : firstImage;
  };

  const handleAddReview = () => {
    if (!booking?.vehicleId) return;

    const vehicleId = booking.vehicleId._id || booking.vehicleId;
    const vehicleName = booking.vehicleDetails.title;
    const vehicleImage = getVehicleImage(booking.vehicleDetails, 0);

    navigate('/customer-reviews', {
      state: {
        vehicleId: vehicleId,
        vehicleName: vehicleName,
        vehicleImage: vehicleImage,
        bookingId: booking._id,
      },
    });

    onClose();
  };

  const StarRating = ({ rating = 0, reviewCount = 0, size = 'md' }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    const textSize = size === 'sm' ? 'text-sm' : 'text-2xl';

    return (
      <div
        className={`flex flex-col sm:flex-row sm:items-center gap-2 ${size === 'sm' ? 'items-start' : 'items-center'}`}
      >
        <span className={`${textSize} font-bold text-gray-900`}>
          {rating.toFixed(1)}
        </span>
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className={`${starSize} ${
                index < fullStars
                  ? 'text-yellow-400 fill-yellow-400'
                  : index === fullStars && hasHalfStar
                    ? 'text-yellow-400 fill-yellow-400/50'
                    : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-500">{reviewCount} reviews</span>
      </div>
    );
  };

  // Loading State
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-2xl p-8 w-full max-w-md">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D3778] mb-4"></div>
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !booking) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-2xl p-8 w-full max-w-md">
          <div className="text-center">
            <div className="h-12 w-12 text-red-500 mx-auto mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-6">{error || 'Booking not found'}</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#0D3778] text-white font-medium rounded-lg hover:bg-[#0A2C63] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusStyle = getStatusStyles(booking.status);
  const vehicleImages =
    booking.vehicleDetails.photos || booking.vehicleDetails.images || [];
  const mainImage = getVehicleImage(booking.vehicleDetails, selectedImageIndex);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-start sm:items-center justify-center p-0 sm:p-4">
        <div className="relative bg-white w-full max-w-2xl max-h-screen sm:max-h-[95vh] sm:rounded-2xl shadow-2xl overflow-hidden">
          {/* Header  */}
          <div className="sticky top-0 bg-[#0D3778] px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Booking Details
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(100vh-60px)] sm:max-h-[calc(95vh-64px)]">
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Vehicle Title and Status  */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                <h3 className="text-xl sm:text-2xl font-bold text-[#0D3778] break-words">
                  {booking.vehicleDetails.year} {booking.vehicleDetails.title}
                </h3>
                <span
                  className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap self-start sm:self-auto ${statusStyle.bg} ${statusStyle.text}`}
                >
                  {statusStyle.label}
                </span>
              </div>

              {/* Vehicle Images */}
              <div className="space-y-3">
                <div className="bg-gray-100 rounded-xl overflow-hidden h-52 sm:h-72 md:h-80 lg:h-96">
                  {mainImage ? (
                    <img
                      src={`${API_BASE_URL}${mainImage}`}
                      alt={booking.vehicleDetails.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-gray-400 text-center">
                        <p className="text-sm font-medium">
                          No Image Available
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Thumbnail Images */}
                {vehicleImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {vehicleImages.slice(0, 3).map((img, index) => {
                      const thumbUrl = typeof img === 'object' ? img.url : img;
                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImageIndex === index
                              ? 'border-[#0D3778]'
                              : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={`${API_BASE_URL}${thumbUrl}`}
                            alt={`View ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Booking Details Section  */}
              <div className="bg-gray-50 rounded-xl p-4 sm:p-5">
                <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
                  Your Booking Details:
                </h4>

                {/* Total Amount */}
                <div className="text-right mb-3 sm:mb-4">
                  <div className="text-xs sm:text-sm text-gray-600">
                    Total Amount
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#0D3778]">
                    {formatCurrency(booking.totalAmount)}
                  </div>
                </div>

                {/* Date Range  */}
                <div className="flex items-center gap-2 text-gray-700 bg-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 border border-gray-200">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                  <span className="text-sm sm:text-base font-medium break-words">
                    {formatDate(booking.startingDate)} -{' '}
                    {formatDate(booking.endDate)}
                  </span>
                </div>
              </div>

              {/* Vehicle Specifications  */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
                <h4 className="text-base font-bold text-gray-900 mb-3 sm:mb-4">
                  Specifications
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 sm:gap-x-6 gap-y-2 sm:gap-y-3">
                  {[
                    {
                      label: 'Number Plate',
                      value: booking.vehicleDetails.numberPlate,
                    },
                    {
                      label: 'Vehicle Type',
                      value: booking.vehicleDetails.vehicleType,
                    },
                    {
                      label: 'Fuel Type',
                      value: booking.vehicleDetails.fuelType,
                    },
                    {
                      label: 'Transmission',
                      value: booking.vehicleDetails.transmission,
                    },
                    { label: 'Year', value: booking.vehicleDetails.year },
                    {
                      label: 'Current KM',
                      value: `${booking.vehicleDetails.km?.toLocaleString() || '0'} km`,
                    },
                    {
                      label: 'Price per KM',
                      value: formatCurrency(booking.vehicleDetails.pricePerKm),
                      colSpan: 'col-span-1 sm:col-span-2',
                    },
                  ].map((spec, index) => (
                    <div
                      key={index}
                      className={`flex justify-between ${spec.colSpan || ''}`}
                    >
                      <span className="text-xs sm:text-sm text-gray-600">
                        {spec.label}
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-gray-900 text-right break-words max-w-[50%]">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Owner Contact  */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold text-gray-900">
                      {booking.ownerName}
                    </div>
                    <div className="text-sm text-gray-600">Owner</div>
                  </div>
                  <a
                    href={`tel:${booking.ownerContact}`}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#0D3778] text-white rounded-lg hover:bg-[#0A2C63] transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    <Phone className="h-4 w-4" />
                    Call {booking.ownerContact}
                  </a>
                </div>
              </div>

              {/* Reviews Section  */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
                <h4 className="text-base font-bold text-gray-900 mb-3">
                  We'd love your feedback
                </h4>

                <div className="mb-4">
                  <StarRating
                    rating={booking.vehicleDetails.rating}
                    reviewCount={booking.vehicleDetails.reviewCount}
                  />
                </div>

                <button
                  onClick={handleAddReview}
                  className="w-full px-4 py-3 bg-white text-[#0D3778] font-semibold rounded-lg border-2 border-[#0D3778] hover:bg-[#0D3778] hover:text-white transition-colors text-sm sm:text-base"
                >
                  <MessageSquare className="h-4 w-4 inline-block mr-2" />
                  Add a Review
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleBookingModal;
