import React, { useState, useEffect } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import axios from 'axios';

const BookingModal = ({ isOpen, onClose, data, refreshData, allBookings = [] }) => {
  const [currentStatus, setCurrentStatus] = useState(data?.status || 'pending');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const API_VERSION = import.meta.env.VITE_API_VERSION || '/api/v1';

  // 1. Past Bookings Count calculation (based on customerId match in allBookings)
  const pastBookingsCount = data && allBookings.length > 0 
    ? allBookings.filter(booking => booking.customerId?._id === data.customerId?._id).length 
    : 0;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (data?.status) setCurrentStatus(data.status);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, data]);

  if (!isOpen || !data) return null;

  const handleStatusUpdate = async (newStatus) => {
    setIsSubmitting(true);
    try {
      const endpoint = newStatus === 'approved' ? 'approve' : 'reject';
      const url = `${API_BASE_URL}${API_VERSION}/bookings/${endpoint}/${data._id}`;

      const response = await axios.patch(url, {}, {
        withCredentials: true 
      });

      if (response.data.success) {
        setCurrentStatus(newStatus);
        if (refreshData) refreshData();
        alert(`Booking ${newStatus} successfully!`);
        onClose();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert(error.response?.data?.message || "Failed to update booking status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDays = (start, end) => {
    const diffMs = new Date(end) - new Date(start);
    const days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    return days < 10 ? `0${days}` : days;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans leading-relaxed">
      <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-t-[6px] border-[#0D3778] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#0D3778] px-6 py-5 flex justify-between items-center text-white">
          <h2 className="text-lg font-bold tracking-wide">Customer Details</h2>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition-all">
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="max-h-[80vh] overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* Customer Details Section (Exactly like Screenshot) */}
          <section className="space-y-4">
            <div className="flex justify-between items-center pb-2">
                <h4 className="text-[14px] font-bold text-[#0D3778] uppercase tracking-wider">Customer Details</h4>
                <span className={`text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase ${
                  currentStatus === 'pending' ? 'bg-[#FF6D00]' : 
                  currentStatus === 'approved' ? 'bg-[#01aa47]' : 
                  currentStatus === 'rejected' ? 'bg-[#f32a2a]' : 'bg-gray-500'
                }`}>
                  {currentStatus}
                </span>
            </div>

            <div className="flex items-start gap-5 py-2">
                {/* Profile Image / Gender Icon - Left Side */}
                <div className="relative shrink-0">
                  {data.customerId?.profileImage ? (
                    <img 
                      src={`${API_BASE_URL}/${data.customerId.profileImage}`} 
                      alt="Customer" 
                      className="w-24 h-24 rounded-full border-4 border-[#0D3778] shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-50 flex items-center justify-center shadow-lg overflow-hidden">
                      {data.customerId?.gender?.toLowerCase() === 'female' ? (
                        <img src="https://cdn-icons-png.flaticon.com/512/6997/6997662.png" className="w-16 h-16 opacity-80" alt="Female"/>
                      ) : (
                        <img src="https://cdn-icons-png.flaticon.com/512/6997/6997674.png" className="w-16 h-16 opacity-80" alt="Male"/>
                      )}
                    </div>
                  )}
                </div>

                {/* Info - Right Side */}
                <div className="flex-1 pt-1">
                  <h3 className="text-xl font-semibold text-[#0D3778] leading-tight">
                    {data.customerId?.first_name} {data.customerId?.last_name}
                  </h3>
                  <p className="text-[14px] text-[#0D3778] font-normal truncate mb-1">
                    {data.customerId?.email}
                  </p>
                  
                  {/* Contact Number (As a peer correction: Backend code change needed for real data) */}
                  <p className="text-[12px] text-[#0D3778] font-normal mt-1">{data.customerId?.contactNumber || 'No Contact'}</p>

                  <p className="text-[13px] text-[#0D3778] font-semibold">
                    Past Bookings: <span className="text-[#0D3778]">{pastBookingsCount.toString().padStart(2, '0')}</span>
                  </p>
                  
                </div>
            </div>
          </section>

          <hr className="border-gray-300 my-2 mb-6" />

          {/* Vehicle Details Section */}
          <section className="space-y-3">
            <h4 className="text-[12px] sm:text-[14px] font-bold text-[#0D3778] uppercase tracking-wider pb-2">
              Vehicle Details
            </h4>
            <div className="flex justify-between items-start gap-4 py-1">
              <div className="space-y-1 flex-1">
                <p className="font-semibold text-[#0D3778] text-[15px] leading-tight">
                  {data.vehicleId?.title || 'N/A'} 
                  <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase">
                    {data.vehicleId?.year}
                  </span>
                </p>
                <p className="font-semibold text-[#0D3778] text-[11px]">
                  Number Plate: {data.vehicleId?.numberPlate || 'N/A'}
                </p>
            
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-[10px] font-semibold bg-[#0D3778]/5 text-[#0D3778] px-2 py-1 rounded-md border border-[#0D3778]/10">
                    {data.vehicleId?.transmission === 'automatic' ? 'Automatic' : 'Manual'}
                  </span>
                  <span className="text-[10px] font-semibold bg-[#0D3778]/5 text-[#0D3778] px-2 py-1 rounded-md border border-[#0D3778]/10">
                    {data.vehicleId?.fuelType}
                  </span>
                </div>

                <p className="font-semibold text-[#0D3778] text-[14px] mt-2">
                  LKR {data.dailyRate?.toLocaleString()}.00 <span className="text-[10px] text-gray-400 font-medium">/Day</span>
                </p>
              </div>

              {/* Vehicle Photo */}
              <div className="w-36 sm:w-40 shrink-0">
                <img 
                 
                  src={
                    data.vehicleId?.photos?.[0]?.url 
                      ? `${API_BASE_URL}/${data.vehicleId.photos[0].url}` 
                      : "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=300" 
                  } 
                  className="w-full h-auto object-cover rounded-2xl shadow-sm sm:-mt-6" 
                  alt="vehicle" 
                  
                  onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=300";
                  }}
                />
              </div>
            </div>
          </section>

          <hr className="border-gray-300 my-2 mb-6" />

          {/* Documents Section */}
          <section className="space-y-3">
            <h4 className="text-[14px] font-bold text-[#0D3778] uppercase tracking-wider pb-2">Uploaded Documents</h4>
            <div className="space-y-2">
              {data.documents?.length > 0 ? (
                data.documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#FF4D4D] px-2 py-2 rounded-lg">
                         <span className="text-[9px] font-black text-white">PDF</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#0D3778] truncate w-40">{doc}</p>
                        <p className="text-[10px] text-gray-500">Document {i+1}</p>
                      </div>
                    </div>
                    <a href={`${API_BASE_URL}/uploads/bookings/${data._id}/${doc}`} download target="_blank" rel="noreferrer">
                      <Download size={18} className="text-gray-400" />
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-2">No documents uploaded</p>
              )}
            </div>
          </section>

          <hr className="border-gray-300 my-2 mb-6" />


          {/* Booking Summary */}
          <section className="space-y-3">
            <h4 className="text-[14px] font-bold text-[#0D3778] uppercase tracking-wider pb-2">Booking Details</h4>
            <div className="grid grid-cols-2 py-2">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">Pickup Date</span>
                    <span className="text-sm font-bold text-[#0D3778]">{new Date(data.startingDate).toISOString().split('T')[0]}</span>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">Return Date</span>
                    <span className="text-sm font-bold text-[#0D3778]">{new Date(data.endDate).toISOString().split('T')[0]}</span>
                </div>
            </div>
            
            <div className="text-center py-1">
                <p className="text-xs font-bold text-[#0D3778]">
                  Total Days: <span className="ml-2 font-normal text-gray-600">{calculateDays(data.startingDate, data.endDate)} Days</span>
                </p>
            </div>

            <div className="bg-[#0D3778] text-white py-4 rounded-2xl text-center font-bold text-xl">
              LKR {data.totalAmount?.toLocaleString()}.000
            </div>
          </section>

          {currentStatus === 'pending' && (
            <div className="flex gap-3 pt-2">
              <button 
                disabled={isSubmitting}
                onClick={() => handleStatusUpdate('approved')}
                className="flex-1 bg-[#03b64d] hover:bg-[#027632] text-white font-bold py-4 rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : 'Approve Request'}
              </button>
              <button 
                disabled={isSubmitting}
                onClick={() => handleStatusUpdate('rejected')}
                className="flex-1 bg-[#f32a2a] text-white font-bold py-4 rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#c20909] transition-all"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : 'Reject Request'}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #0D377820; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default BookingModal;