import React, { useEffect, useState, useRef } from 'react';
import {
  Calendar,
  Clock,
  Car,
  Star,
  Quote,
  ChevronLeft,
  ChevronRight
} from
  'lucide-react';
import { Header } from './BookingPageHeader';
import Layout from '../layouts/Layout';
import { searchVehicles, createBooking } from '../services/bookingApi';
// import { RentYourCarPage } from './RentYourCarPage';
// import { ContactPage } from './ContactPage';
// import { PaymentModal } from './PaymentModal';
import { getAllReviews } from '../services/reviewApi';

// Analog Clock Time Picker Component
function AnalogTimePicker({
  selectedTime,
  onSelect,
  onClose
}) {
  const [mode, setMode] = useState('hour');
  const [hour, setHour] = useState(selectedTime?.hour || 12);
  const [minute, setMinute] = useState(selectedTime?.minute || 0);
  const [period, setPeriod] = useState(
    selectedTime?.period || 'AM'
  );
  const ref = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);
  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  // Calculate position on clock face
  const getPosition = (index, total, radius) => {
    const angle = (index * (360 / total) - 90) * (Math.PI / 180);
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    };
  };
  // Calculate hand rotation angle
  const getHandRotation = () => {
    if (mode === 'hour') {
      const hourIndex = hours.indexOf(hour);
      return hourIndex * 30 - 90;
    } else {
      const minuteIndex = minutes.indexOf(minute);
      return minuteIndex * 30 - 90;
    }
  };
  const handleHourClick = (h) => {
    setHour(h);
    // Auto-advance to minute selection after a brief delay
    setTimeout(() => setMode('minute'), 300);
  };
  const handleMinuteClick = (m) => {
    setMinute(m);
  };
  const handleConfirm = () => {
    onSelect({
      hour,
      minute,
      period
    });
    onClose();
  };
  return (
    <div
      ref={ref}
      className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl p-4 z-50 w-72 border border-gray-200">

      {/* Time Display Header */}
      <div className="bg-[#1e3a5f] rounded-lg p-3 mb-4">
        <div className="flex items-center justify-center space-x-1">
          <button
            onClick={() => setMode('hour')}
            className={`text-3xl font-bold transition-all ${mode === 'hour' ? 'text-white scale-110' : 'text-white/50 hover:text-white/70'}`}>

            {hour.toString().padStart(2, '0')}
          </button>
          <span className="text-3xl font-bold text-white">:</span>
          <button
            onClick={() => setMode('minute')}
            className={`text-3xl font-bold transition-all ${mode === 'minute' ? 'text-white scale-110' : 'text-white/50 hover:text-white/70'}`}>

            {minute.toString().padStart(2, '0')}
          </button>
          <div className="ml-2 flex flex-col text-xs">
            <button
              onClick={() => setPeriod('AM')}
              className={`px-2 py-0.5 rounded transition-colors ${period === 'AM' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/70'}`}>

              AM
            </button>
            <button
              onClick={() => setPeriod('PM')}
              className={`px-2 py-0.5 rounded transition-colors ${period === 'PM' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/70'}`}>

              PM
            </button>
          </div>
        </div>
        <p className="text-center text-xs text-blue-200 mt-1">
          {mode === 'hour' ? 'Select hour' : 'Select minute'}
        </p>
      </div>

      {/* Analog Clock Face */}
      <div className="relative w-48 h-48 mx-auto mb-4">
        {/* Clock Circle */}
        <div className="absolute inset-0 rounded-full border-2 border-gray-200 bg-gray-50">
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-[#1e3a5f] rounded-full -translate-x-1/2 -translate-y-1/2 z-20" />

          {/* Clock hand */}
          <div
            className="absolute top-1/2 left-1/2 origin-left h-1 bg-[#2563eb] rounded-full z-10 transition-transform duration-300"
            style={{
              width: mode === 'hour' ? '60px' : '70px',
              transform: `translate(0, -50%) rotate(${getHandRotation()}deg)`
            }}>

            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#2563eb]/20 rounded-full -mr-4" />
          </div>

          {/* Hour numbers or Minute numbers */}
          {mode === 'hour' ?
            hours.map((h, index) => {
              const pos = getPosition(index, 12, 72);
              return (
                <button
                  key={h}
                  onClick={() => handleHourClick(h)}
                  className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                      ${hour === h ? 'bg-[#2563eb] text-white scale-110' : 'text-gray-700 hover:bg-gray-200'}`}
                  style={{
                    left: `calc(50% + ${pos.x}px - 16px)`,
                    top: `calc(50% + ${pos.y}px - 16px)`
                  }}>

                  {h}
                </button>);

            }) :
            minutes.map((m, index) => {
              const pos = getPosition(index, 12, 72);
              return (
                <button
                  key={m}
                  onClick={() => handleMinuteClick(m)}
                  className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                      ${minute === m ? 'bg-[#2563eb] text-white scale-110' : 'text-gray-700 hover:bg-gray-200'}`}
                  style={{
                    left: `calc(50% + ${pos.x}px - 16px)`,
                    top: `calc(50% + ${pos.y}px - 16px)`
                  }}>

                  {m.toString().padStart(2, '0')}
                </button>);

            })}
        </div>
      </div>

      {/* Mode Toggle & Confirm */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1">
          <button
            onClick={() => setMode('hour')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${mode === 'hour' ? 'bg-[#1e3a5f] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>

            Hour
          </button>
          <button
            onClick={() => setMode('minute')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${mode === 'minute' ? 'bg-[#1e3a5f] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>

            Min
          </button>
        </div>
        <button
          onClick={handleConfirm}
          className="px-4 py-1.5 bg-[#2563eb] text-white text-xs font-semibold rounded hover:bg-blue-600 transition-colors">

          OK
        </button>
      </div>
    </div>);

}
// Calendar Component
function DatePicker({
  selectedDate,
  onSelect,
  onClose
}) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const ref = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'];

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const prevMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  const nextMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  const isSelected = (day) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear());

  };
  const isToday = (day) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear());

  };
  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-2xl p-4 z-50 w-72 border border-gray-200">

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors">

          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <span className="font-semibold text-gray-800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <button
          onClick={nextMonth}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors">

          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) =>
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-1">

            {day}
          </div>
        )}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({
          length: firstDayOfMonth
        }).map((_, i) =>
          <div key={`empty-${i}`} />
        )}
        {Array.from({
          length: daysInMonth
        }).map((_, i) => {
          const day = i + 1;
          return (
            <button
              key={day}
              onClick={() => {
                onSelect(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    day
                  )
                );
                onClose();
              }}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-all
                ${isSelected(day) ? 'bg-[#1e3a5f] text-white' : isToday(day) ? 'bg-blue-100 text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white' : 'text-gray-700 hover:bg-gray-100'}`}>

              {day}
            </button>);

        })}
      </div>
    </div>);

}
// Testimonials data - Removed dummy data, now fetched from backend

export function LandingPage({ onBookNow }) {
  // Date & Time State
  const [pickupDate, setPickupDate] = useState(null);
  const [pickupTime, setPickupTime] = useState(null);
  const [dropoffDate, setDropoffDate] = useState(null);
  const [dropoffTime, setDropoffTime] = useState(null);
  // Vehicles State
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await searchVehicles({});
        if (res.success && res.data) {
           setVehicles(res.data);
           if (res.data.length > 0) setSelectedVehicleId(res.data[0]._id);
        }
      } catch (error) {
        console.error("Failed to fetch vehicles", error);
      }
    };
    fetchVehicles();
  }, []);
  
  // Popup State
  const [showPickupCalendar, setShowPickupCalendar] = useState(false);
  const [showPickupTime, setShowPickupTime] = useState(false);
  const [showDropoffCalendar, setShowDropoffCalendar] = useState(false);
  const [showDropoffTime, setShowDropoffTime] = useState(false);
  // Reviews carousel state
  const [reviews, setReviews] = useState([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const reviewsPerPage = 2;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await getAllReviews();
        console.log("Fetched All Reviews:", response); // Debug log

        // Robust check for array in common response patterns
        let fetchedReviews = [];
        if (Array.isArray(response)) {
          fetchedReviews = response;
        } else if (response) {
          fetchedReviews = response.reviews || response.allReviews || response.data || [];
        }

        if (Array.isArray(fetchedReviews)) {
            setReviews(fetchedReviews);
        } else {
            console.warn("Reviews data format not recognized:", response);
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      }
    };
    fetchReviews();
  }, []);

  const maxIndex = Math.ceil(reviews.length / reviewsPerPage) - 1;
  const nextReviews = () => {
    if (reviews.length === 0) return;
    setReviewIndex((prev) => prev < maxIndex ? prev + 1 : 0);
  };
  const prevReviews = () => {
    if (reviews.length === 0) return;
    setReviewIndex((prev) => prev > 0 ? prev - 1 : maxIndex);
  };
  const visibleReviews = reviews.slice(
    reviewIndex * reviewsPerPage,
    reviewIndex * reviewsPerPage + reviewsPerPage
  );
  const formatDate = (date) => {
    if (!date) return 'mm/dd/yyyy';
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
  };
  const formatTime = (
    time) => {
    if (!time) return '12:00 AM';
    return `${time.hour}:${time.minute.toString().padStart(2, '0')} ${time.period}`;
  };

  const combineDateTime = (date, time) => {
    if (!date) return null;
    const t = time || { hour: 12, minute: 0, period: 'AM' };
    const d = new Date(date);
    let hours = t.hour;
    if (t.period === 'PM' && hours < 12) hours += 12;
    if (t.period === 'AM' && hours === 12) hours = 0;
    d.setHours(hours, t.minute, 0, 0);
    return d;
  };

  const getEstimatedTotal = () => {
    const vehicle = vehicles.find(v => v._id === selectedVehicleId);
    if (!vehicle || !pickupDate || !dropoffDate) return "0.00";
    const start = combineDateTime(pickupDate, pickupTime);
    const end = combineDateTime(dropoffDate, dropoffTime);
    if (!start || !end || end <= start) return "0.00";
    
    const diffMs = end.getTime() - start.getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    const days = Math.max(1, Math.ceil(diffMs / dayMs));
    const rate = vehicle.amount || vehicle.pricePerDay || 0;
    return (days * rate).toFixed(2);
  };

  const handleBookingCreate = async () => {
    if (!selectedVehicleId) return alert("Please select a vehicle.");
    const start = combineDateTime(pickupDate, pickupTime);
    const end = combineDateTime(dropoffDate, dropoffTime);
    
    if (!start || !end) return alert("Please select pickup and dropoff dates.");
    if (end <= start) return alert("End date must be after pickup date.");

    setIsLoading(true);
    try {
      // Create FormData as backend expects multipart/form-data
      const formData = new FormData();
      formData.append('vehicleId', selectedVehicleId);
      formData.append('startingDate', start.toISOString());
      formData.append('endDate', end.toISOString());
      // documents are currently empty for initial booking from landing page
    
      const res = await createBooking(formData);
      
      if (res.success) {
        alert("Booking request sent successfully!");
        if (onBookNow) onBookNow();
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to create booking. Please ensure you are logged in.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full min-h-[600px] bg-gray-900 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80"
            alt="Desert road background"
            className="w-full h-full object-cover opacity-60" />

          <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a5f]/80 to-transparent"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 flex flex-col lg:flex-row items-center gap-12">
          {/* Left: Reservation Form Card */}
          <div className="w-full max-w-md bg-[#1e3a5f]/90 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-white/10 text-white">
            <h2 className="text-sm uppercase tracking-wider font-semibold mb-6 text-blue-200">
              Continue Car Reservation
            </h2>

            <div className="space-y-4">
              {/* Car Selection */}
              <div className="space-y-1">
                <div className="relative">
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full pl-3 pr-10 py-3 bg-white text-gray-900 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                    {vehicles.length > 0 ? (
                      vehicles.map((v) => (
                        <option key={v._id} value={v._id}>
                           {v.title || `${v.make || 'Car'} ${v.model || ''}`} [{v.licensePlate || v.registrationNumber || 'NA'}]
                        </option>
                      ))
                    ) : (
                      <option disabled>No vehicles available</option>
                    )}
                  </select>
                  <Car className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Pick Up */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-200 text-gray-600 rounded px-3 py-2 flex items-center text-xs font-medium">
                  <Calendar className="h-3 w-3 mr-1" /> Pick Up
                </div>
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowPickupCalendar(!showPickupCalendar);
                      setShowPickupTime(false);
                      setShowDropoffCalendar(false);
                      setShowDropoffTime(false);
                    }}
                    className="w-full bg-white text-gray-900 rounded px-3 py-2 text-xs flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer">

                    {formatDate(pickupDate)}
                  </button>
                  {showPickupCalendar &&
                    <DatePicker
                      selectedDate={pickupDate}
                      onSelect={setPickupDate}
                      onClose={() => setShowPickupCalendar(false)} />

                  }
                </div>
                {/* Time Picker */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowPickupTime(!showPickupTime);
                      setShowPickupCalendar(false);
                      setShowDropoffCalendar(false);
                      setShowDropoffTime(false);
                    }}
                    className="w-full bg-white text-gray-900 rounded px-2 py-2 text-xs flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">

                    <span className="truncate">{formatTime(pickupTime)}</span>
                    <Clock className="h-3 w-3 text-gray-400 flex-shrink-0 ml-1" />
                  </button>
                  {showPickupTime &&
                    <AnalogTimePicker
                      selectedTime={pickupTime}
                      onSelect={setPickupTime}
                      onClose={() => setShowPickupTime(false)} />

                  }
                </div>
              </div>

              {/* Drop Off */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-200 text-gray-600 rounded px-3 py-2 flex items-center text-xs font-medium">
                  <Calendar className="h-3 w-3 mr-1" /> Drop off
                </div>
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowDropoffCalendar(!showDropoffCalendar);
                      setShowPickupCalendar(false);
                      setShowPickupTime(false);
                      setShowDropoffTime(false);
                    }}
                    className="w-full bg-white text-gray-900 rounded px-3 py-2 text-xs flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer">

                    {formatDate(dropoffDate)}
                  </button>
                  {showDropoffCalendar &&
                    <DatePicker
                      selectedDate={dropoffDate}
                      onSelect={setDropoffDate}
                      onClose={() => setShowDropoffCalendar(false)} />

                  }
                </div>
                {/* Time Picker */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowDropoffTime(!showDropoffTime);
                      setShowPickupCalendar(false);
                      setShowPickupTime(false);
                      setShowDropoffCalendar(false);
                    }}
                    className="w-full bg-white text-gray-900 rounded px-2 py-2 text-xs flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">

                    <span className="truncate">{formatTime(dropoffTime)}</span>
                    <Clock className="h-3 w-3 text-gray-400 flex-shrink-0 ml-1" />
                  </button>
                  {showDropoffTime &&
                    <AnalogTimePicker
                      selectedTime={dropoffTime}
                      onSelect={setDropoffTime}
                      onClose={() => setShowDropoffTime(false)} />

                  }
                </div>
              </div>

              {/* Total */}
              <div className="bg-white rounded px-4 py-3 flex justify-between items-center text-sm font-bold text-gray-900">
                <span>Trip total:</span>
                <span>LKR {getEstimatedTotal()}</span>
              </div>

              {/* Book Button */}
              <button
                onClick={handleBookingCreate}
                disabled={isLoading}
                className={`w-full py-3 bg-[#162c46] hover:bg-[#0f1f33] text-white font-bold rounded shadow-lg transition-all transform active:scale-[0.98] border border-white/10 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {isLoading ? 'Processing...' : 'Book Now'}
              </button>
            </div>
          </div>

          {/* Right: Hero Text & Car Image */}
          <div className="flex-1 text-white relative">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Get convenient <br />
              rental Plan for your <br />
              Car now
            </h1>

            {/* Car Image Overlay */}
            <div className="mt-8 relative">
              <img
                src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="White SUV"
                className="w-full max-w-2xl drop-shadow-2xl rounded-lg transform hover:scale-105 transition-transform duration-500" />

            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-2">
            RentmyCar Renting Process
          </h2>
          <p className="text-[#1e3a5f]/70 mb-16">
            To get a Car, RentmyCar has simple process to go ahead.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative group">
              <div className="bg-[#1e3a5f] text-white p-8 rounded-lg h-48 flex flex-col justify-center items-center relative z-10 transition-transform group-hover:-translate-y-2">
                <h3 className="text-xl font-bold mb-2">Come In Contact</h3>
                <p className="text-xs text-blue-200">
                  Come to our Location or Contact RentmyCar
                </p>
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#1a1a2e] rounded-full flex items-center justify-center text-white font-bold z-20 border-4 border-white">
                01
              </div>
            </div>

            <div className="relative group">
              <div className="bg-[#1e3a5f] text-white p-8 rounded-lg h-48 flex flex-col justify-center items-center relative z-10 transition-transform group-hover:-translate-y-2">
                <h3 className="text-xl font-bold mb-2">Choose A Car</h3>
                <p className="text-xs text-blue-200">
                  Select your Car from Various models
                </p>
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#1a1a2e] rounded-full flex items-center justify-center text-white font-bold z-20 border-4 border-white">
                02
              </div>
            </div>

            <div className="relative group">
              <div className="bg-[#1e3a5f] text-white p-8 rounded-lg h-48 flex flex-col justify-center items-center relative z-10 transition-transform group-hover:-translate-y-2">
                <h3 className="text-xl font-bold mb-2">Enjoy Driving</h3>
                <p className="text-xs text-blue-200">Enjoy your Driving</p>
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#1a1a2e] rounded-full flex items-center justify-center text-white font-bold z-20 border-4 border-white">
                03
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Car interior background"
            className="w-full h-full object-cover" />

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our Clients Reviews
            </h2>
            <p className="text-gray-300 text-sm max-w-2xl mx-auto">
              Hear from our satisfied clients! Discover real experiences and
              honest feedback from customers who rented through RentmyCar.lk We
              value transparency, ensuring you make informed choices every time.
            </p>
          </div>

          <div className="relative">
            <button
              onClick={prevReviews}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-20 w-12 h-12 bg-[#1e3a5f] hover:bg-[#2563eb] rounded-full flex items-center justify-center text-white shadow-lg transition-colors">

              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              onClick={nextReviews}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-20 w-12 h-12 bg-[#1e3a5f] hover:bg-[#2563eb] rounded-full flex items-center justify-center text-white shadow-lg transition-colors">

              <ChevronRight className="h-6 w-6" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 md:px-0">
              {visibleReviews.length > 0 ? (
                visibleReviews.map((review) => (
                <div
                  key={review.id || review._id}
                  className="bg-gray-100 rounded-lg p-8 relative transition-all duration-300">

                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={review.image || review.User?.profilePicture || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"}
                      alt={review.name || review.User?.name || "Customer"}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#1e3a5f]" />

                    <div>
                      <h4 className="font-bold text-[#1e3a5f]">
                        {review.name || review.User?.name || "Customer"}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {review.profession || review.User?.role || "Verified Cluster"}
                      </p>
                      <div className="flex text-red-700 text-xs mt-1">
                        {Array.from({
                          length: 5
                        }).map((_, i) =>
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />

                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    "{review.quote || review.feedback}"
                  </p>
                  <div className="absolute -top-3 right-8 bg-[#1a1a2e] text-white p-1 rounded-full">
                    <Quote className="h-4 w-4" />
                  </div>
                </div>
              ))
              ) : (
                <div className="col-span-2 text-center text-gray-400 py-10">
                   No reviews available yet.
                </div>
              )}
            </div>

            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({
                length: maxIndex + 1
              }).map((_, i) =>
                <button
                  key={i}
                  onClick={() => setReviewIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === reviewIndex ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'}`} />

              )}
            </div>
          </div>
        </div>
      </section>
    </div>);

}

export function BookingPage1() {
  const [activeTab, setActiveTab] = useState('home');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <LandingPage onBookNow={() => setIsModalOpen(true)} />;
        // case 'rent':
        return <RentYourCarPage onContact={() => setActiveTab('contact')} />;
        // case 'contact':
        return <ContactPage />;
      // default:
      // return <LandingPage onBookNow={() => setIsModalOpen(true)} />;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white font-sans text-gray-900">
        <Header activeTab={activeTab} onNavigate={setActiveTab} />

        <main>{renderContent()}</main>

        {/* <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} /> */}
      </div>
    </Layout>
  );
}
