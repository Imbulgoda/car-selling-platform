import { useEffect, useState } from 'react';
import { Users, Car, HandCoins, FileText, Hourglass } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../layouts/Layout';

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const apiVersion = import.meta.env.VITE_API_VERSION;

// Custom Canceled Bookings Icon - Clipboard with Red X
const ClipboardX = ({ className, strokeWidth }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Clipboard outline */}
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    {/* Red X inside */}
    <line x1="10" y1="12" x2="14" y2="16" stroke="#EF4444" strokeWidth={strokeWidth * 1.2} />
    <line x1="14" y1="12" x2="10" y2="16" stroke="#EF4444" strokeWidth={strokeWidth * 1.2} />
  </svg>
);

const StatCard = ({ icon: Icon, title, value, subtitle, showTrend }) => (
  <div className="bg-white rounded-xl p-6 shadow-md border-l-[6px] border-l-[#0D3778] hover:shadow-xl transition-all relative">
    <div className="flex gap-5">
      <div className="flex h-24 w-24 items-center justify-center text-[#0D3778] mt-1 shrink-0">
        <Icon className="h-20 w-20" strokeWidth={1.6} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-600 mb-1">{title}</p>
        <p className="text-4xl font-bold text-[#0D3778] leading-tight">{value}</p>
        {subtitle ? (
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        ) : (
          <p className="text-xs text-slate-500 mt-1 invisible">placeholder</p>
        )}
      </div>
    </div>
    {/* Trend indicator in bottom right corner */}
    {showTrend && (
      <div className="absolute bottom-2 right-4">
        <svg width="56" height="32" viewBox="0 0 56 32" fill="none">
          <polyline
            points="2,18 10,10 18,16 26,8 34,14 42,6 50,12 54,4"
            stroke="#EF4444"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    )}
  </div>
);

const VehicleStatusChart = ({ approved = 0, pending = 0, rejected = 0 }) => {
  const total = approved + pending + rejected || 1;
  const approvedPercent = (approved / total) * 100;
  const pendingPercent = (pending / total) * 100;
  const rejectedPercent = (rejected / total) * 100;

  // Small gap between segments (in percentage)
  const gap = 1.0;
  
  // Calculate arc lengths with gaps
  const approvedArc = approvedPercent > 0 ? (approvedPercent - gap) * 1.88 : 0;
  const pendingArc = pendingPercent > 0 ? (pendingPercent - gap) * 1.88 : 0;
  const rejectedArc = rejectedPercent > 0 ? (rejectedPercent - gap) * 1.88 : 0;

  // Calculate offsets including gaps
  const approvedOffset = 0;
  const pendingOffset = -(approvedPercent * 1.88);
  const rejectedOffset = -((approvedPercent + pendingPercent) * 1.88);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
      <h3 className="text-base font-semibold text-[#0D3778] mb-6">Vehicle Status</h3>
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-40 h-40">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {/* Approved segment - Green */}
            {approvedPercent > 0 && (
              <circle
                cx="50"
                cy="50"
                r="30"
                fill="none"
                stroke="#10B981"
                strokeWidth="18"
                strokeDasharray={`${approvedArc} 188.4`}
                strokeDashoffset={approvedOffset}
                strokeLinecap="butt"
              />
            )}
            {/* Pending segment - Amber */}
            {pendingPercent > 0 && (
              <circle
                cx="50"
                cy="50"
                r="30"
                fill="none"
                stroke="#FBBF24"
                strokeWidth="18"
                strokeDasharray={`${pendingArc} 188.4`}
                strokeDashoffset={pendingOffset}
                strokeLinecap="butt"
              />
            )}
            {/* Rejected segment - Red */}
            {rejectedPercent > 0 && (
              <circle
                cx="50"
                cy="50"
                r="30"
                fill="none"
                stroke="#EF4444"
                strokeWidth="18"
                strokeDasharray={`${rejectedArc} 188.4`}
                strokeDashoffset={rejectedOffset}
                strokeLinecap="butt"
              />
            )}
          </svg>
        </div>

        <div className="w-full space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              <span className="text-xs font-medium text-slate-600">Approved</span>
            </div>
            <span className="text-xs font-semibold text-slate-900">{approved}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
              <span className="text-xs font-medium text-slate-600">Pending</span>
            </div>
            <span className="text-xs font-semibold text-slate-900">{pending}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <span className="text-xs font-medium text-slate-600">Rejected</span>
            </div>
            <span className="text-xs font-semibold text-slate-900">{rejected}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingOverviewChart = ({ data = [] }) => {
  // Calculate max value from actual data
  const maxDone = Math.max(...data.map(d => d.done), 0);
  const maxCancelled = Math.max(...data.map(d => d.cancelled), 0);
  const maxValue = Math.max(maxDone, maxCancelled);

  // Determine appropriate scale based on data
  let maxYAxisValue;
  if (maxValue <= 5) {
    maxYAxisValue = 5;
  } else if (maxValue <= 10) {
    maxYAxisValue = 10;
  } else if (maxValue <= 20) {
    maxYAxisValue = 20;
  } else if (maxValue <= 50) {
    maxYAxisValue = 50;
  } else if (maxValue <= 100) {
    maxYAxisValue = 100;
  } else if (maxValue <= 200) {
    maxYAxisValue = 200;
  } else if (maxValue <= 400) {
    maxYAxisValue = 400;
  } else {
    // For values > 400, round up to nearest 100
    maxYAxisValue = Math.ceil(maxValue / 100) * 100;
  }

  // Calculate Y-axis labels (top to bottom: max, mid, 0, mid, max)
  const midValue = maxYAxisValue / 2;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-[#0D3778]">Booking Overview</h3>
        <span className="text-xs px-2.5 py-1 bg-slate-100 rounded-full text-slate-600 font-medium">This Year</span>
      </div>

      <div className="flex gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#0D3778]"></div>
          <span className="text-xs font-medium text-slate-600">Done</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span className="text-xs font-medium text-slate-600">Cancelled</span>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between text-right pr-2" style={{ width: '40px', height: '280px' }}>
          <span className="text-xs text-slate-500 font-medium">{maxYAxisValue}</span>
          <span className="text-xs text-slate-500 font-medium">{midValue}</span>
          <span className="text-xs text-slate-500 font-medium">0</span>
          <span className="text-xs text-slate-500 font-medium">{midValue}</span>
          <span className="text-xs text-slate-500 font-medium">{maxYAxisValue}</span>
        </div>

        {/* Chart area */}
        <div className="flex-1">
          {/* Grid lines and bars */}
          <div style={{ height: '280px' }} className="relative flex items-center justify-between gap-1">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="border-t border-dashed border-slate-300"></div>
              <div className="border-t border-dashed border-slate-300"></div>
              <div className="border-t-2 border-slate-400"></div>
              <div className="border-t border-dashed border-slate-300"></div>
              <div className="border-t border-dashed border-slate-300"></div>
            </div>

            {/* Bars */}
            <div className="w-full h-full flex items-center justify-between gap-1 relative z-10">
              {data.map((item, index) => {
                // Calculate height based on dynamic maxYAxisValue
                const doneHeight = maxYAxisValue > 0 ? Math.min((item.done / maxYAxisValue) * 100, 100) : 0;
                const cancelledHeight = maxYAxisValue > 0 ? Math.min((item.cancelled / maxYAxisValue) * 100, 100) : 0;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center h-full justify-center">
                    {/* Done bar - goes up from center */}
                    <div className="w-1/3 flex flex-col-reverse items-center justify-start" style={{ height: '50%' }}>
                      <div
                        className="w-full bg-[#0D3778] rounded-t"
                        style={{ height: `${doneHeight}%`, minHeight: doneHeight > 0 ? '2px' : '0px' }}
                      ></div>
                    </div>

                    {/* Center line (0) */}
                    <div className="w-full border-b border-slate-400"></div>

                    {/* Cancelled bar - goes down from center */}
                    <div className="w-1/3 flex flex-col items-center justify-start" style={{ height: '50%' }}>
                      <div
                        className="w-full bg-red-500 rounded-b"
                        style={{ height: `${cancelledHeight}%`, minHeight: cancelledHeight > 0 ? '2px' : '0px' }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Months labels below chart */}
          <div className="flex justify-between gap-1 mt-3">
            {data.map((item, index) => (
              <div key={index} className="flex-1 text-center">
                <span className="text-xs text-slate-600 font-medium">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MostRentedCars = ({ vehicles = [] }) => (
  <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
    <h3 className="text-lg font-semibold text-[#0D3778] mb-6">Most Rented Cars</h3>
    <div className="space-y-5">
      {vehicles.map((vehicle, index) => (
        <div key={index} className="flex items-center justify-between pb-5 last:pb-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative">
              <div className="w-20 h-20 rounded-full flex-shrink-0 overflow-hidden bg-gray-100 border border-slate-200">
                <img
                  src={vehicle.image || 'https://via.placeholder.com/80'}
                  alt={vehicle.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-1 -left-1 bg-[#0D3778] text-white text-xs font-bold px-1.5 py-0.5 rounded">
                #{index + 1}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900">{vehicle.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{vehicle.numberPlate}</p>
            </div>
          </div>
          <span className="text-base font-bold text-[#0D3778] ml-4 whitespace-nowrap">{vehicle.rentCount} Rents</span>
        </div>
      ))}
    </div>
  </div>
);

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVehicles: 0,
    totalRevenue: 0,
    totalBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
  });
  const [vehicleStatus, setVehicleStatus] = useState({
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [bookingData, setBookingData] = useState([]);
  const [mostRentedCars, setMostRentedCars] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [usersRes, vehiclesRes, bookingsRes] = await Promise.all([
        fetch(`${baseUrl}${apiVersion}/authUser/getAllUsers`, {
          credentials: 'include',
        }),
        fetch(`${baseUrl}${apiVersion}/vehicle/admin/get-all`, {
          credentials: 'include',
        }),
        fetch(`${baseUrl}${apiVersion}/bookings/get`, {
          credentials: 'include',
        }),
      ]);

      const usersData = await usersRes.json();
      const vehiclesData = await vehiclesRes.json();
      const bookingsData = await bookingsRes.json();

      if (usersData.success && vehiclesData.success && bookingsData.success) {
        const users = usersData.users || [];
        const vehicles = vehiclesData.vehicles || [];
        const bookings = bookingsData.data || [];

        const totalRevenue = bookings
          .filter(b => b.status === 'approved')
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        const pendingCount = bookings.filter(b => b.status === 'pending').length;
        const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

        const approvedVehicles = vehicles.filter(v => v.status === 'Approved');
        // Count vehicles by status
        const approvedVehicleCount = vehicles.filter(v => v.status === 'Approved').length;
        const pendingVehicleCount = vehicles.filter(v => v.status === 'Pending').length;
        const rejectedVehicleCount = vehicles.filter(v => v.status === 'Rejected').length;

        setStats({
          totalUsers: users.length,
          totalVehicles: approvedVehicleCount,
          totalRevenue,
          totalBookings: bookings.length,
          pendingBookings: pendingCount,
          cancelledBookings: cancelledCount,
        });

        setVehicleStatus({
          approved: approvedVehicleCount,
          pending: pendingVehicleCount,
          rejected: rejectedVehicleCount,
        });

        const monthlyData = calculateMonthlyBookings(bookings);
        setBookingData(monthlyData);

        const rentedCars = calculateMostRentedCars(bookings, vehicles);
        setMostRentedCars(rentedCars);
      } else {
        toast.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyBookings = (bookings) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    const monthlyStats = months.map((month, index) => {
      const monthBookings = bookings.filter(b => {
        const bookingDate = new Date(b.createdAt);
        return bookingDate.getFullYear() === currentYear && bookingDate.getMonth() === index;
      });

      return {
        month,
        done: monthBookings.filter(b => b.status === 'approved').length,
        cancelled: monthBookings.filter(b => b.status === 'cancelled').length,
      };
    });

    return monthlyStats;
  };

  const calculateMostRentedCars = (bookings, vehicles) => {
    const approvedVehicles = vehicles.filter(v => v.status === 'Approved');
    const vehicleRentCount = {};

    bookings.forEach(booking => {
      const vehicleId = booking.vehicleId?._id || booking.vehicleId;
      const vehicle = approvedVehicles.find(v => v._id === vehicleId);
      if (vehicleId && vehicle && booking.status === 'approved') {
        vehicleRentCount[vehicleId] = (vehicleRentCount[vehicleId] || 0) + 1;
      }
    });

    const sortedVehicles = Object.entries(vehicleRentCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([vehicleId, count]) => {
        const vehicle = vehicles.find(v => v._id === vehicleId);
        const photoUrl = vehicle?.photos?.[0]?.url;
        const fullImageUrl = photoUrl ? `${baseUrl}${photoUrl}` : null;
        return {
          title: vehicle?.title || vehicle?.model || 'Unknown',
          numberPlate: vehicle?.numberPlate || 'N/A',
          rentCount: count,
          image: fullImageUrl,
        };
      });

    return sortedVehicles;
  };

  if (loading) {
    return (
      <Layout showFooter={true}>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#0D3778] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={true}>
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">

          {/* Top Section - Stats Cards Left + Rent Status Right */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Left Side - Stats Cards */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  icon={Users}
                  title="Total Users"
                  value={stats.totalUsers}
                  subtitle="Owners + Customers"
                  bgColor="bg-[#0D3778]"
                />
                <StatCard
                  icon={Car}
                  title="Total Vehicles"
                  value={stats.totalVehicles}
                  subtitle="Owners + Customers"
                  bgColor="bg-[#0D3778]"
                />
                <StatCard
                  icon={HandCoins}
                  title="Total Revenue (LKR)"
                  value={stats.totalRevenue.toLocaleString()}
                  bgColor="bg-[#0D3778]"
                />
                <StatCard
                  icon={FileText}
                  title="Total Bookings"
                  value={stats.totalBookings}
                  subtitle="Owners + Customers"
                  bgColor="bg-[#0D3778]"
                />
                <StatCard
                  icon={Hourglass}
                  title="Pending Bookings"
                  value={stats.pendingBookings}
                  bgColor="bg-amber-500"
                />
                <StatCard
                  icon={ClipboardX}
                  title="Canceled Bookings"
                  value={stats.cancelledBookings}
                  bgColor="bg-red-500"
                  showTrend={true}
                />
              </div>
            </div>

            {/* Right Side - Vehicle Status */}
            <div className="lg:col-span-1">
              <VehicleStatusChart
                approved={vehicleStatus.approved}
                pending={vehicleStatus.pending}
                rejected={vehicleStatus.rejected}
              />
            </div>
          </div>

          {/* Bottom Section - Booking Overview Left + Most Rented Cars Right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BookingOverviewChart data={bookingData} />
            </div>
            <div className="lg:col-span-1">
              <MostRentedCars vehicles={mostRentedCars} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
