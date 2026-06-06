import axios from 'axios';

// Helper function to extract owner info consistently
export const extractOwnerInfo = (ownerId, includeEmail = false) => {
  if (!ownerId) {
    return {
      name: 'Owner',
      contact: 'N/A',
      ...(includeEmail && { email: 'N/A' })
    };
  }

  if (typeof ownerId === 'object') {
    return {
      name: `${ownerId.first_name || ''} ${ownerId.last_name || ''}`.trim() || 'Owner',
      contact: ownerId.contactNumber || 'N/A',
      ...(includeEmail && { email: ownerId.email || 'N/A' })
    };
  }

  return {
    name: 'Owner',
    contact: 'N/A',
    ...(includeEmail && { email: 'N/A' })
  };
};

// Fetch user authentication
export const fetchUserDetails = async (API_BASE_URL, API_VERSION) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${API_VERSION}/authUser/getUserDetails`,
      {
        method: 'GET',
        credentials: 'include',
      },
    );

    if (!response.ok) {
      return {
        success: false,
        user: null,
        message: 'Failed to fetch user details'
      };
    }

    const data = await response.json();
    if (data?.success && data?.user) {
      return {
        success: true,
        user: data.user,
        message: 'User details fetched successfully'
      };
    } else {
      return {
        success: false,
        user: null,
        message: 'No user data found'
      };
    }
  } catch (error) {
    console.error('Error fetching user details:', error);
    return {
      success: false,
      user: null,
      message: 'Error fetching user details'
    };
  }
};

// Handle user logout
export const handleLogout = async (API_BASE_URL, API_VERSION) => {
  try {
    await fetch(`${API_BASE_URL}${API_VERSION}/authUser/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return { success: true, message: 'Logged out successfully' };
  } catch (error) {
    console.error('Logout failed', error);
    return { success: false, message: 'Logout failed' };
  }
};

// Fetch customer bookings
export const fetchCustomerBookings = async (userId, API_BASE_URL, API_VERSION) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_VERSION}/bookings/customer/${userId}`,
      {
        withCredentials: true,
      },
    );

    const bookingsData = response.data.data || [];
    return {
      success: true,
      data: bookingsData,
      message: 'Bookings fetched successfully'
    };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Error fetching bookings'
    };
  }
};

// Fetch booking details by ID
export const fetchBookingDetails = async (bookingId, API_BASE_URL, API_VERSION) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_VERSION}/bookings/get/${bookingId}`,
      {
        withCredentials: true,
      },
    );
    
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
      status: response.status
    };
  } catch (error) {
    console.error('Error fetching booking details:', error);
    
    if (error.response) {
      return {
        success: false,
        data: null,
        message: error.response.data?.message || 'Error loading booking details',
        status: error.response.status
      };
    } else if (error.request) {
      return {
        success: false,
        data: null,
        message: 'Network error. Please check your connection.',
        status: null
      };
    } else {
      return {
        success: false,
        data: null,
        message: 'Error loading booking details. Please try again.',
        status: null
      };
    }
  }
};

// Fetch vehicle details by ID
export const fetchVehicleDetails = async (vehicleId, API_BASE_URL, API_VERSION) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_VERSION}/vehicle/get/${vehicleId}`,
      {
        withCredentials: true,
      },
    );
    
    return {
      success: response.data.success,
      data: response.data.data || response.data.vehicle,
      message: response.data.message,
      status: response.status
    };
  } catch (error) {
    console.error('Error fetching vehicle details:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Error fetching vehicle details',
      status: error.response?.status
    };
  }
};

// Enrich booking data for BookingHistory component 
export const enrichBookingForHistory = async (booking, API_BASE_URL, API_VERSION) => {
  try {
    const ownerInfo = extractOwnerInfo(booking.ownerId, true);

    // Vehicle details
    let vehicleDetails = {
      title: 'Unknown Vehicle',
      photos: [],
      rating: 0,
      reviewCount: 0,
    };

    if (booking.vehicleId) {
      // Check if vehicleId is populated or just an ID
      if (typeof booking.vehicleId === 'object') {
        vehicleDetails = {
          title: booking.vehicleId.title || 'Unknown Vehicle',
          photos: booking.vehicleId.photos || [],
          rating: booking.vehicleId.averageRating || 0,
          reviewCount: booking.vehicleId.reviewCount || 0,
          model: booking.vehicleId.model,
          year: booking.vehicleId.year,
          numberPlate: booking.vehicleId.numberPlate,
          fuelType: booking.vehicleId.fuelType,
          amount: booking.vehicleId.amount,
          pricePerDay: booking.vehicleId.pricePerDay,
        };
      } else {
        // If it's just an ID, fetch the vehicle details
        try {
          const vehicleRes = await fetchVehicleDetails(booking.vehicleId, API_BASE_URL, API_VERSION);
          
          if (vehicleRes.success && vehicleRes.data) {
            vehicleDetails = {
              title: vehicleRes.data.title || 'Unknown Vehicle',
              photos: vehicleRes.data.photos || [],
              rating: vehicleRes.data.averageRating || 0,
              reviewCount: vehicleRes.data.reviewCount || 0,
              model: vehicleRes.data.model,
              year: vehicleRes.data.year,
              numberPlate: vehicleRes.data.numberPlate,
              fuelType: vehicleRes.data.fuelType,
              amount: vehicleRes.data.amount,
              pricePerDay: vehicleRes.data.pricePerDay,
            };
          }
        } catch (vehicleError) {
          console.error('Error fetching vehicle details:', vehicleError);
        }
      }
    }

    const startDate = new Date(booking.startingDate);
    const endDate = new Date(booking.endDate);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    return {
      ...booking,
      ownerName: ownerInfo.name,
      ownerEmail: ownerInfo.email,
      ownerContact: ownerInfo.contact,
      vehicleDetails,
      days,
      createdAt: booking.createdAt || new Date().toISOString(),
      updatedAt: booking.updatedAt || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error enriching booking for history:', error);
    return {
      ...booking,
      ownerName: 'Owner',
      ownerEmail: 'N/A',
      ownerContact: 'N/A',
      vehicleDetails: {
        title: 'Unknown Vehicle',
        photos: [],
        rating: 0,
        reviewCount: 0,
      },
      days: 1,
    };
  }
};

// Enrich booking data with vehicle and owner details 
export const enrichBookingData = async (bookingData, API_BASE_URL, API_VERSION) => {
  try {
    const ownerInfo = extractOwnerInfo(bookingData.ownerId);
    const ownerName = bookingData.ownerName || ownerInfo.name;
    const ownerContact = bookingData.ownerContact || ownerInfo.contact;

    let vehicleDetails = {
      title: 'Unknown Vehicle',
      model: 'N/A',
      numberPlate: 'N/A',
      vehicleType: 'N/A',
      year: 'N/A',
      fuelType: 'N/A',
      transmission: 'N/A',
      pricePerDay: 0,
      km: 0,
      pricePerKm: 0,
      photos: [],
      description: '',
      rating: 0,
      reviewCount: 0,
    };

    if (bookingData.vehicleId) {
      try {
        let vehicleData;
        let vehicleRating = 0;
        let reviewCount = 0;
        
        if (typeof bookingData.vehicleId === 'object' && bookingData.vehicleId._id) {
          vehicleData = bookingData.vehicleId;
          vehicleRating = vehicleData.averageRating || 0;
          reviewCount = vehicleData.reviewCount || 0;
        } else {
          const vehicleId = bookingData.vehicleId._id || bookingData.vehicleId;
          const vehicleRes = await fetchVehicleDetails(vehicleId, API_BASE_URL, API_VERSION);
          
          if (vehicleRes.success && vehicleRes.data) {
            vehicleData = vehicleRes.data;
            vehicleRating = vehicleData.averageRating || 0;
            reviewCount = vehicleData.reviewCount || 0;
          }
        }

        if (vehicleData) {
          vehicleDetails = {
            title: vehicleData.title || 'Unknown Vehicle',
            model: vehicleData.model || 'N/A',
            numberPlate: vehicleData.numberPlate || 'N/A',
            vehicleType: vehicleData.vehicleType || 'N/A',
            year: vehicleData.year || 'N/A',
            fuelType: vehicleData.fuelType || 'N/A',
            transmission: vehicleData.transmission || 'N/A',
            pricePerDay: vehicleData.pricePerDay || 0,
            km: vehicleData.km || 0,
            pricePerKm: vehicleData.pricePerKm || 0,
            photos: vehicleData.photos || [],
            description: vehicleData.description || '',
            rating: vehicleRating,
            reviewCount: reviewCount,
          };
        }
      } catch (vehicleError) {
        console.error('Error fetching vehicle details:', vehicleError);
        if (typeof bookingData.vehicleId === 'object') {
          vehicleDetails.title = bookingData.vehicleId.title || 'Unknown Vehicle';
          vehicleDetails.model = bookingData.vehicleId.model || 'N/A';
          vehicleDetails.numberPlate = bookingData.vehicleId.numberPlate || 'N/A';
          vehicleDetails.pricePerDay = bookingData.vehicleId.pricePerDay || 0;
          vehicleDetails.rating = bookingData.vehicleId.averageRating || 0;
          vehicleDetails.reviewCount = bookingData.vehicleId.reviewCount || 0;
          vehicleDetails.photos = bookingData.vehicleId.photos || [];
        }
      }
    }

    const startDate = new Date(bookingData.startingDate);
    const endDate = new Date(bookingData.endDate);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    const subtotal = (vehicleDetails.pricePerDay || 0) * days;
    const totalAmount = bookingData.totalAmount || subtotal;

    return {
      ...bookingData,
      ownerName,
      ownerContact,
      vehicleDetails,
      days,
      subtotal,
      totalAmount,
      createdAt: bookingData.createdAt || new Date().toISOString(),
      updatedAt: bookingData.updatedAt || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error enriching booking:', error);
    return {
      ...bookingData,
      ownerName: bookingData.ownerName || 'Owner',
      ownerContact: bookingData.ownerContact || 'N/A',
      vehicleDetails: {
        title: 'Unknown Vehicle',
        model: 'N/A',
        numberPlate: 'N/A',
        vehicleType: 'N/A',
        year: 'N/A',
        fuelType: 'N/A',
        transmission: 'N/A',
        pricePerDay: 0,
        km: 0,
        pricePerKm: 0,
        photos: [],
        description: '',
        rating: 0,
        reviewCount: 0,
      },
      days: 1,
      subtotal: bookingData.totalAmount || 0,
      totalAmount: bookingData.totalAmount || 0,
    };
  }
};

// Fetch and enrich all customer bookings for history page
export const fetchAndEnrichCustomerBookings = async (userId, API_BASE_URL, API_VERSION) => {
  try {
    const bookingsResponse = await fetchCustomerBookings(userId, API_BASE_URL, API_VERSION);
    
    if (!bookingsResponse.success || !bookingsResponse.data) {
      return {
        success: false,
        data: [],
        message: bookingsResponse.message || 'Failed to load bookings'
      };
    }

    const enrichedBookings = await Promise.all(
      bookingsResponse.data.map(async (booking) => {
        try {
          const enriched = await enrichBookingForHistory(booking, API_BASE_URL, API_VERSION);
          return enriched;
        } catch (error) {
          console.error('Error enriching booking:', error);
          return {
            ...booking,
            ownerName: 'Owner',
            ownerEmail: 'N/A',
            ownerContact: 'N/A',
            vehicleDetails: {
              title: 'Unknown Vehicle',
              photos: [],
              rating: 0,
              reviewCount: 0,
            },
            days: 1,
          };
        }
      })
    );

    return {
      success: true,
      data: enrichedBookings,
      message: 'Bookings enriched successfully'
    };
  } catch (error) {
    console.error('Error fetching and enriching bookings:', error);
    return {
      success: false,
      data: [],
      message: 'Error loading bookings'
    };
  }
};

// Fetch and enrich single booking data for modal
export const getEnrichedBooking = async (bookingId, API_BASE_URL, API_VERSION) => {
  try {
    const bookingResponse = await fetchBookingDetails(bookingId, API_BASE_URL, API_VERSION);
    
    if (!bookingResponse.success) {
      throw new Error(bookingResponse.message || 'Failed to load booking details');
    }
    
    const enrichedBooking = await enrichBookingData(bookingResponse.data, API_BASE_URL, API_VERSION);
    return enrichedBooking;
  } catch (error) {
    console.error('Error getting enriched booking:', error);
    throw error;
  }
};

// Utility functions for date formatting
export const formatBookingDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatSimpleDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

// Utility function for currency formatting
export const formatCurrency = (amount, currency = 'LKR') => {
  if (currency === 'LKR') {
    return `LKR ${amount?.toLocaleString() || '0'}`;
  }
  return `Rs${Math.round(amount || 0)}`;
};

// Get vehicle image URL 
export const getVehicleImageUrl = (vehicle, index = 0, API_BASE_URL = '') => {
  if (!vehicle) return null;
  
  // Get photos array from vehicle object
  const photosArray = vehicle?.photos || vehicle?.images || [];
  
  if (!photosArray || photosArray.length === 0) return null;
  
  const photo = photosArray[index] || photosArray[0];
  if (!photo) return null;
  
  // Get the URL from the photo object
  const imageUrl = typeof photo === 'object' ? photo.url : photo;
  
  if (!imageUrl) return null;
  
  // If URL already has http or is a full URL, return as is
  if (imageUrl.startsWith('http')) return imageUrl;
  
  // If URL starts with /, prepend API_BASE_URL
  if (API_BASE_URL && imageUrl.startsWith('/')) {
    // Remove duplicate API_BASE_URL if already present
    if (imageUrl.startsWith(API_BASE_URL)) {
      return imageUrl;
    }
    return `${API_BASE_URL}${imageUrl}`;
  }
  
  return imageUrl;
};