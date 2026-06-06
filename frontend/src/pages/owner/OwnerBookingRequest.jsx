import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Car, Hourglass, CheckCircle2, XCircle } from 'lucide-react';
import StatsCard from './../../components/owner/StatusCard';
import TableHeader from './../../components/owner/TableHeader';
import BookingTable from './../../components/owner/TableBooking';
import BookingModal from './../../components/owner/BookingRequestModel'; 

import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const apiVersion = import.meta.env.VITE_API_VERSION;

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // --- Modal States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [stats, setStats] = useState([
    { label: 'Total Requests', val: '0', icon: <Car size={40} />, color: 'border-brand-dark' },
    { label: 'Pending Requests', val: '0', icon: <Hourglass size={40} />, color: 'border-status-pending' },
    { label: 'Approved Requests', val: '0', icon: <CheckCircle2 size={40} />, color: 'border-status-approved' },
    { label: 'Rejected Requests', val: '0', icon: <XCircle size={40} />, color: 'border-status-rejected' },
  ]);

  // Data fetch karana function eka (useCallback use kare modal eka refresh weddi performance optimize karanna)
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const currentUserId = localStorage.getItem("userid");

      if (!token || !currentUserId) {
        setLoading(false);
        return;
      }

      const url = `${baseUrl}${apiVersion}/bookings/owner/${currentUserId}`;
      const response = await axios.get(url, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const fetchedData = response.data.data || [];
        setBookings(fetchedData);
        
        // update stats based on fetched data 
        setStats([
          { label: 'Total Requests', val: fetchedData.length.toString(), icon: <Car size={40} />, color: 'border-brand-dark' },
          { label: 'Pending Requests', val: fetchedData.filter(b => b.status === 'pending').length.toString(), icon: <Hourglass size={40} />, color: 'border-status-pending text-status-pending' },
          { label: 'Approved Requests', val: fetchedData.filter(b => b.status === 'approved').length.toString(), icon: <CheckCircle2 size={40} />, color: 'border-status-approved text-status-approved' },
          { label: 'Rejected Requests', val: fetchedData.filter(b => b.status === 'rejected').length.toString(), icon: <XCircle size={40} />, color: 'border-status-rejected text-status-rejected' },
        ]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Booking details view karanna modal eka open karana function eka
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesTab = filterStatus === 'All' || 
      booking.status?.toLowerCase() === filterStatus.toLowerCase();
    
    const searchString = searchTerm.toLowerCase();
    const matchesSearch = 
      searchTerm === '' || 
      (booking.customerId?.first_name?.toLowerCase().includes(searchString)) ||
      (booking.customerId?.last_name?.toLowerCase().includes(searchString)) ||
      (booking.vehicleId?.title?.toLowerCase().includes(searchString)) || 
      (booking.vehicleId?.numberPlate?.toLowerCase().includes(searchString));

    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <Header />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-10 bg-gray-50/50">
          <div className="max-w-7xl mx-auto"> 
            <h1 className="text-2xl font-bold text-[#0D3778] font-['Nunito']">Booking Request</h1>
            <p className="text-[#0D3778] mb-8 opacity-100 font-['Nunito']">Manage incoming booking requests from customers</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              {stats.map((s, i) => <StatsCard key={i} {...s} />)}
            </div>

            <div className="rounded-xl overflow-hidden bg-white shadow-sm">
              <TableHeader 
                activeFilter={filterStatus} 
                onFilterChange={setFilterStatus}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
              
              {loading ? (
                <div className="p-20 text-center text-gray-400 animate-pulse font-['Nunito']">
                  Loading bookings...
                </div>
              ) : (
                <BookingTable 
                  data={filteredBookings} 
                  refreshData={fetchDashboardData} 
                  onViewAction={handleViewDetails} 
                />
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />

      {/* Booking Modal - Connection ekata refreshData prop eka pass karala thiyenne */}
      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        data={selectedBooking} 
        allBookings={bookings}
        refreshData={fetchDashboardData}
      />
    </div>
  );
};

export default Dashboard;