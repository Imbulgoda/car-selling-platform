import { api } from "./vehicleApi";

// Helper function to ensure token is set as cookie
const setAuthCookie = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    const error = new Error('No authentication token found. Please log in.');
    error.status = 401;
    throw error;
  }
  document.cookie = `access_token=${token}; path=/; SameSite=Lax`;
};

// Get monthly user growth chart data
export const getMonthlyUserChart = async () => {
  setAuthCookie();
  try {
    const res = await api.get('/adminReports/user-chart');
    return res.data; // { success, data: [...] }
  } catch (error) {
    console.error('Error fetching user chart:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    throw error;
  }
};

// Get user report stats
export const getUserReportStats = async () => {
  setAuthCookie();
  try {
    const res = await api.get('/adminReports/admin/user-report');
    return res.data; // { success, totalUsers, thisMonthUsers, percentage }
  } catch (error) {
    console.error('Error fetching user report stats:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    throw error;
  }
};

// Get vehicle report stats
export const getVehicleReportStats = async () => {
  setAuthCookie();
  try {
    const res = await api.get('/adminReports/admin/vehicle-report');
    return res.data; // { success, totalVehicles, thisMonthVehicles, percentage }
  } catch (error) {
    console.error('Error fetching vehicle report stats:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    throw error;
  }
};

// Get booking report stats
export const getBookingReportStats = async () => {
  setAuthCookie();
  try {
    const res = await api.get('/adminReports/admin/booking-report');
    return res.data; // { success, totalBookings, thisMonthBookings, percentage }
  } catch (error) {
    console.error('Error fetching booking report stats:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    throw error;
  }
};

// Get vehicle availability chart data
export const getVehicleAvailabilityReport = async () => {
  setAuthCookie();
  try {
    const res = await api.get('/adminReports/admin/vehicle-availability');
    return res.data; // { success, data: { totals, percentages, date } }
  } catch (error) {
    console.error('Error fetching vehicle availability:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    throw error;
  }
};

// Get monthly approved booking chart data
export const getMonthlyBookingChart = async () => {
  setAuthCookie();
  try {
    const res = await api.get('/adminReports/admin/booking-performance');
    return res.data; // { success, data: [...] }
  } catch (error) {
    console.error('Error fetching booking performance chart:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    throw error;
  }
};

// Get best performance vehicles
export const getBestPerformanceVehicles = async (limit = 5) => {
  setAuthCookie();
  try {
    const res = await api.get(`/adminReports/admin/best-perform-vehicles?limit=${limit}`);
    return res.data; // { success, data: [...] }
  } catch (error) {
    console.error('Error fetching best performance vehicles:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    throw error;
  }
};

// Get admin platform revenue stats (total, this month, last month, growth)
export const getAdminPlatformRevenue = async () => {
  setAuthCookie();
  try {
    const res = await api.get('/adminReports/admin/total-revenue-platform');
    return res.data; // { success, totalEarnings, thisMonth, lastMonth, growth }
  } catch (error) {
    console.error('Error fetching platform revenue:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    throw error;
  }
};

// Get monthly revenue chart data
export const getMonthlyRevenueChart = async () => {
  setAuthCookie();
  try {
    const res = await api.get('/adminReports/admin/total-revenue-chart');
    return res.data; // { success, data: [{ month, totalRevenue, platformFee }] }
  } catch (error) {
    console.error('Error fetching monthly revenue chart:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    throw error;
  }
};

// Get payment report table data
export const getPaymentReport = async () => {
  setAuthCookie();
  try {
    const res = await api.get('/adminReports/admin/payment-table');
    return res.data; // { success, data: [{ customerName, vehicle, revenue, status }] }
  } catch (error) {
    console.error('Error fetching payment report:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    throw error;
  }
};
