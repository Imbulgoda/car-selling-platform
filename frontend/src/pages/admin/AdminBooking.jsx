import React, { useState, useEffect } from 'react';
import { Car, Hourglass, CheckCircle2, XCircle } from 'lucide-react';
import StatsCard from './../../components/booking/Cards';
import TableHeader from './../../components/booking/TableHeader';
import BookingTable from './../../components/booking/BookingTable';
import { getAllBookings } from '../../services/bookingApi';
import { useNavigate } from 'react-router-dom';
import Layout from './../../layouts/Layout';

const AdminBooking = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingData, setBookingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch bookings from backend
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        console.log('Token check:', {
          hasToken: !!token,
          hasUser: !!user,
          tokenPreview: token ? `${token.substring(0, 20)}...` : 'null'
        });
        
        if (!token) {
          console.log('No token found - redirecting to login');
          setError('You need to be logged in to view bookings.');
          setLoading(false);
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }

        console.log('Fetching bookings...');
        const response = await getAllBookings();
        console.log('Response received:', response);
        
        if (response.success) {
          console.log('Raw booking data:', response.data);
          
          // Transform backend data to match the expected format
          const transformedData = response.data.map((booking) => {
            console.log('Processing booking:', booking);
            console.log('Customer data:', booking.customerId);
            console.log('Owner data:', booking.ownerId);
            console.log('Vehicle data:', booking.vehicleId);
            
            // Get names from populated data
            const customerName = booking.customerId 
              ? `${booking.customerId.first_name || ''} ${booking.customerId.last_name || ''}`.trim() || 'N/A'
              : 'N/A';
            
            const ownerName = booking.ownerId 
              ? `${booking.ownerId.first_name || ''} ${booking.ownerId.last_name || ''}`.trim() || 'N/A'
              : 'N/A';
            
            const vehicleName = booking.vehicleId?.title || 'N/A';
            
            console.log('Customer name:', customerName);
            console.log('Owner name:', ownerName);
            console.log('Vehicle name:', vehicleName);

            return {
              id: booking._id,
              name: customerName,
              vOwner: ownerName,
              vName: vehicleName,
              pDate: new Date(booking.startingDate).toISOString().split('T')[0],
              rDate: new Date(booking.endDate).toISOString().split('T')[0],
              price: booking.totalAmount?.toLocaleString() || '0',
              status: booking.status === 'pending' ? 'Pending' : 
                      booking.status === 'approved' ? 'Approved' : 
                      booking.status === 'rejected' ? 'Rejected' : 
                      booking.status === 'cancelled' ? 'Cancelled' : 'Pending',
              sColor: booking.status === 'pending' ? 'text-orange-500' :
                      booking.status === 'approved' ? 'text-green-500' :
                      booking.status === 'rejected' ? 'text-red-500' :
                      booking.status === 'cancelled' ? 'text-gray-500' : 'text-orange-500',
            };
          });
          
          setBookingData(transformedData);
        } else {
          setError(response.message || 'Failed to fetch bookings');
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        console.error('Error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          message: err.message
        });
        
        // Handle 401 Unauthorized error
        if (err.response?.status === 401 || err.status === 401 || err.message?.includes('authentication token')) {
          console.log('Authentication failed - clearing session');
          setError('Your session has expired or you are not authorized. Please log in again.');
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user'); // Also clear user data if exists
          // Redirect to login after 2 seconds
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          setError(err.response?.data?.message || err.message || 'Failed to fetch bookings. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  // Calculate stats from actual data
  const stats = [
    { 
      label: 'Total Bookings', 
      val: bookingData.length.toString(), 
      icon: <Car size={40} />, 
      color: 'purple' 
    },
    { 
      label: 'Pending Bookings', 
      val: bookingData.filter(b => b.status === 'Pending').length.toString(), 
      icon: <Hourglass size={40} />, 
      color: 'yellow' 
    },
    { 
      label: 'Approved Bookings', 
      val: bookingData.filter(b => b.status === 'Approved').length.toString(), 
      icon: <CheckCircle2 size={40} />, 
      color: 'green' 
    },
    { 
      label: 'Rejected Bookings', 
      val: bookingData.filter(b => b.status === 'Rejected').length.toString(), 
      icon: <XCircle size={40} />, 
      color: 'red' 
    },
  ];

  // Filter by status
  const filteredData = activeFilter === 'All' 
    ? bookingData 
    : bookingData.filter(booking => booking.status === activeFilter);

  // Filter by search query
  const searchFilteredData = searchQuery.trim() === ''
    ? filteredData
    : filteredData.filter(booking => 
        booking.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.vOwner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.vName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.pDate.includes(searchQuery) ||
        booking.rDate.includes(searchQuery) ||
        booking.price.includes(searchQuery) ||
        booking.status.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <Layout>
      <div className="flex flex-col min-h-screen bg-app-bg font-sans">
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
            <h1 className="text-xl sm:text-2xl font-bold text-brand-dark">Recent Bookings (View Only)</h1>
            <p className="text-sm sm:text-base text-brand-dark mb-6 sm:mb-8 opacity-80">View all the recent bookings made by customers here</p>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p className="font-bold">Error</p>
                <p className="text-sm sm:text-base">{error}</p>
                {error.includes('logged in') && (
                  <p className="mt-2 text-sm">Redirecting to login page...</p>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
                  {stats.map((s, i) => <StatsCard key={i} {...s} />)}
                </div>

                <TableHeader 
                  activeFilter={activeFilter} 
                  onFilterChange={setActiveFilter}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
                <BookingTable data={searchFilteredData} />
              </>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
};


export default AdminBooking;

