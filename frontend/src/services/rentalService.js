import api from "./api";

// Get owner's rental bookings
export const getOwnerBookings = async (ownerId) => {
  const response = await api.get(`/bookings/owner/${ownerId}`);
  return response.data.data;
};

export default { getOwnerBookings };
