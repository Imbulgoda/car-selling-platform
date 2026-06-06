import React, { useState, useEffect } from 'react';
import { Car, AlertCircle, CheckCircle, XCircle, FileDown } from 'lucide-react';
import Header from '../../layouts/Header';
import { StatCard } from '../../components/adminVehicle/StatCard';
import { SearchBar } from '../../components/adminVehicle/SearchBar';
import { Tabs } from '../../components/adminVehicle/Tabs';
import { VehicleCard } from '../../components/adminVehicle/VehicleCard';
import { vehicleAPI, VEHICLE_STATUS, getImageBaseUrl } from '../../services/vehicleService';
import toast from 'react-hot-toast';

function VehicleStatistics({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        icon={Car}
        label="Total Vehicles"
        value={stats.total}
        color="text-blue-600"
        bgColor="bg-blue-100"
      />
      <StatCard
        icon={AlertCircle}
        label="Pending Approval"
        value={stats.pending}
        color="text-yellow-600"
        bgColor="bg-yellow-100"
      />
      <StatCard
        icon={CheckCircle}
        label="Active Listings"
        value={stats.approved}
        color="text-green-600"
        bgColor="bg-green-100"
      />
      <StatCard
        icon={XCircle}
        label="Rejected"
        value={stats.rejected}
        color="text-red-600"
        bgColor="bg-red-100"
      />
    </div>
  );
}

function SearchSection({ searchQuery, onSearchChange }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <SearchBar
        value={searchQuery}
        onChange={onSearchChange}
        onFilterClick={() => {}}
      />
    </div>
  );
}

function VehicleList({ vehicles, loading, searchQuery, activeTab, onApprove, onReject, onDelete, onView }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No vehicles found
        </h3>
        <p className="text-gray-600">
          {searchQuery
            ? 'Try adjusting your search criteria'
            : `No ${activeTab} vehicles at the moment`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {vehicles.map((vehicle, index) => (
        <VehicleCard
          key={vehicle.id ?? `vehicle-${index}`}
          vehicle={vehicle}
          onApprove={onApprove}
          onReject={onReject}
          onDelete={onDelete}
          onView={onView}
          status={activeTab}
        />
      ))}
    </div>
  );
}

// Rejection Reason Modal
function RejectionReasonModal({ vehicle, isOpen, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onConfirm?.(vehicle.id, reason.trim());
    } finally {
      setIsSubmitting(false);
      setReason('');
      onClose();
    }
  };

  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative max-w-md w-full mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 shadow hover:bg-white"
        >
          <XCircle className="w-5 h-5 text-gray-700" />
        </button>

        {/* Content */}
        <div className="p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Reject Vehicle
          </h2>
          <p className="text-gray-600 mb-6">
            {vehicle.name}
          </p>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Rejection Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter the reason for rejecting this vehicle..."
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !reason.trim()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              {isSubmitting ? 'Rejecting...' : 'Reject Vehicle'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pending Vehicle Details Modal
function VehicleDetailsModal({ vehicle, isOpen, onClose, onApprove, onReject }) {
  if (!isOpen || !vehicle) return null;

  const handleApprove = () => {
    onApprove?.(vehicle.id);
  };

  const handleReject = () => {
    onReject?.(vehicle.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative max-w-4xl w-full mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 shadow hover:bg-white"
        >
          <XCircle className="w-5 h-5 text-gray-700" />
        </button>

        {/* Image */}
        <div className="h-40 md:h-80 w-full bg-gray-100 overflow-hidden">
          {vehicle.images && vehicle.images.length > 0 ? (
            <img
              src={vehicle.images[0]}
              alt={vehicle.name}
              className="w-full h-full object-cover"
            />
          ) : vehicle.image ? (
            <img
              src={vehicle.image}
              alt={vehicle.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
              No image available
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-4 md:p-8">
          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-6">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 md:mb-2">
                Vehicle Type
              </p>
              <p className="text-sm md:text-base font-semibold text-gray-900">
                {vehicle.name}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 md:mb-2">
                Vehicle Number
              </p>
              <p className="text-sm md:text-base font-semibold text-gray-900">
                {vehicle.plateNumber}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 md:mb-2">
                Owner
              </p>
              <p className="text-sm md:text-base font-semibold text-gray-900">
                {vehicle.owner}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 md:mb-2">
                Model &amp; Year
              </p>
              <p className="text-sm md:text-base font-semibold text-gray-900">
                {vehicle.year}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 md:mb-2">
                Fuel Type
              </p>
              <p className="text-sm md:text-base font-semibold text-gray-900">
                {vehicle.fuelType}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 md:mb-2">
                Transmission
              </p>
              <p className="text-sm md:text-base font-semibold text-gray-900">
                {vehicle.transmission}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 md:mb-2">
                Price Per Day
              </p>
              <p className="text-sm md:text-base font-semibold text-gray-900">
                LKR {vehicle.pricePerDay}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 md:mb-2">
                Price Per KM
              </p>
              <p className="text-sm md:text-base font-semibold text-gray-900">
                LKR {vehicle.pricePerKm}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 md:mb-2">
                Location
              </p>
              <p className="text-sm md:text-base font-semibold text-gray-900">
                {vehicle.location}
              </p>
            </div>
          </div>

          {/* Operation Areas */}
          {vehicle.operationAreas && vehicle.operationAreas.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                Operation Areas
              </p>
              <div className="flex flex-wrap gap-2">
                {vehicle.operationAreas.map((area, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs md:text-sm font-medium">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Document Submitted */}
          {vehicle.documents && vehicle.documents.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                Document Submitted
              </p>
              <div className="flex flex-wrap gap-2">
                {vehicle.documents.map((doc, idx) => (
                  <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs md:text-sm font-medium">
                    {doc}
                  </span>
                ))}
              </div>
            </div>
          )}

          <hr className="border-gray-200 my-6" />

          {/* Status Badge */}
          {vehicle.status === 'approved' && vehicle.approvalDate && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg text-center font-medium flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Approved on {vehicle.approvalDate}
            </div>
          )}

          {vehicle.status === 'rejected' && vehicle.rejectionReason && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg font-medium flex items-start gap-2">
              <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Rejection Reason</p>
                <p className="text-sm mt-1">{vehicle.rejectionReason}</p>
              </div>
            </div>
          )}

          {/* Actions - Only show for pending vehicles */}
          {vehicle.status === 'pending' && (
            <div className="mt-6 flex flex-col sm:flex-row gap-2 md:gap-4 justify-center border-t border-gray-200 pt-4 md:pt-6">
              <button
                type="button"
                onClick={handleApprove}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-lg bg-blue-900 text-white text-sm md:text-base font-semibold hover:bg-blue-950 transition-colors"
              >
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                Approve
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-lg bg-red-600 text-white text-sm md:text-base font-semibold hover:bg-red-700 transition-colors"
              >
                <XCircle className="w-4 h-4 md:w-5 md:h-5" />
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function VehicleManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(VEHICLE_STATUS.PENDING);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [rejectionVehicle, setRejectionVehicle] = useState(null);
  const [isRejectionopen, setIsRejectionOpen] = useState(false);

  // Get user from localStorage
  const getUser = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return {
      first_name: 'Admin',
      last_name: 'User',
      role: 3
    };
  };

  const user = getUser();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Fetch vehicles on component mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      
      // Call backend API
      const response = await vehicleAPI.getAllVehicles();
      
      // Extract vehicles from response
      // Response format: { success: true, vehicles: [...] }
      const vehiclesData = response?.vehicles || [];
      
      if (!Array.isArray(vehiclesData)) {
        console.warn('Invalid vehicles data format:', vehiclesData);
        setVehicles([]);
        return;
      }

      console.log(`Fetched ${vehiclesData.length} vehicles from backend`);
      
      // Transform backend data to match frontend structure (location can be object { address, geo } from backend)
      const getLocationString = (v) => {
        const loc = v.location;
        if (typeof loc === 'string') return loc || 'Unknown';
        if (loc && typeof loc === 'object' && 'address' in loc) return loc.address || 'Unknown';
        return v.city || v.address || 'Unknown';
      };
      const apiBase = getImageBaseUrl();
      const toFullImageUrl = (url) => {
        if (!url || typeof url !== 'string') return null;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${apiBase}${path}`;
      };
      const getPhotoUrls = (v) => {
        const out = [];
        if (Array.isArray(v.photos) && v.photos.length > 0) {
          v.photos.forEach((p) => {
            const u = p && (typeof p === 'string' ? p : p.url);
            if (u && typeof u === 'string') {
              const full = toFullImageUrl(u);
              if (full) out.push(full);
            }
          });
        }
        if (out.length) return out;
        if (v.image && typeof v.image === 'string') return [toFullImageUrl(v.image)];
        if (Array.isArray(v.images)) v.images.forEach((u) => { const f = typeof u === 'string' ? toFullImageUrl(u) : (u?.url ? toFullImageUrl(u.url) : null); if (f) out.push(f); });
        return out;
      };
      const transformedVehicles = vehiclesData.map((vehicle, index) => {
        const imageUrls = getPhotoUrls(vehicle);
        
        // Helper function to format date
        const formatDate = (dateString) => {
          if (!dateString) return null;
          const date = new Date(dateString);
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });
        };
        
        return {
          id: vehicle._id || vehicle.id || `vehicle-${index}`,
          name: `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || (vehicle.title || 'Unknown Vehicle'),
          owner: vehicle.ownerName || vehicle.owner?.first_name || vehicle.owner?.name || 'Unknown Owner',
          plateNumber: vehicle.plateNumber || vehicle.numberPlate || vehicle.registrationNumber || vehicle.licensePlate || 'N/A',
          location: getLocationString(vehicle),
          year: vehicle.year || vehicle.modelYear || new Date().getFullYear(),
          fuelType: vehicle.fuelType || vehicle.fuel || 'Petrol',
          transmission: vehicle.transmission || vehicle.gearbox || 'Auto',
          pricePerDay: vehicle.pricePerDay || vehicle.dailyRate || vehicle.rentPerDay || 5000,
          pricePerKm: vehicle.pricePerKm || vehicle.kmRate || vehicle.perKmRate || 50,
          status: String(vehicle.status || VEHICLE_STATUS.PENDING).toLowerCase(),
          rejectionReason: vehicle.rejectionReason || vehicle.rejectReason || null,
          submittedDate: formatDate(vehicle.createdAt) || new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }),
          approvalDate: formatDate(vehicle.approvedAt) || formatDate(vehicle.updatedAt) || null,
          operationAreas: Array.isArray(vehicle.operationAreas) ? vehicle.operationAreas : [],
          documents: Array.isArray(vehicle.documents) ? vehicle.documents.map(d => typeof d === 'string' ? d : d.name || d.type || 'Document') : [],
          image: imageUrls[0] || null,
          images: imageUrls,
        };
      });
      
      setVehicles(transformedVehicles);
      console.log('Vehicles loaded successfully');
      
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      
      // Handle specific error cases
      if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const message = error.response.data?.message || 'Failed to load vehicles';
        
        if (status === 401) {
          toast.error('Session expired. Please login again.');
          setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }, 1500);
        } else if (status === 403) {
          toast.error('Access denied. Admin privileges required.');
        } else {
          toast.error(message);
        }
      } else if (error.request) {
        // Request made but no response
        toast.error('Cannot connect to server. Please check if backend is running.');
      } else {
        // Something else happened
        toast.error('An error occurred while loading vehicles');
      }
      
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vehicleId) => {
    try {
      console.log('Approving vehicle:', vehicleId);
      
      // Call backend API to update status
      await vehicleAPI.updateVehicleStatus(vehicleId, VEHICLE_STATUS.APPROVED);
      
      toast.success('Vehicle approved successfully');
      
      // Refresh vehicle list
      await fetchVehicles();
    } catch (error) {
      console.error('Failed to approve vehicle:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        const message = error.response?.data?.message || 'Failed to approve vehicle';
        toast.error(message);
      }
    }
  };

  const handleReject = async (vehicleId) => {
    try {
      console.log('Rejecting vehicle:', vehicleId);
      
      // Call backend API to update status
      await vehicleAPI.updateVehicleStatus(vehicleId, VEHICLE_STATUS.REJECTED);
      
      toast.success('Vehicle rejected successfully');
      
      // Refresh vehicle list
      await fetchVehicles();
    } catch (error) {
      console.error('Failed to reject vehicle:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        const message = error.response?.data?.message || 'Failed to reject vehicle';
        toast.error(message);
      }
    }
  };

  const handleDelete = async (vehicleId) => {
    // Confirm deletion
    const confirmed = window.confirm(
      'Are you sure you want to delete this vehicle? This action cannot be undone.'
    );
    
    if (!confirmed) {
      return;
    }

    try {
      console.log('Deleting vehicle:', vehicleId);
      
      // Call backend API to delete vehicle
      await vehicleAPI.deleteVehicle(vehicleId);
      
      toast.success('Vehicle deleted successfully');
      
      // Refresh vehicle list
      await fetchVehicles();
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else if (error.response?.status === 403) {
        toast.error('Only the vehicle owner can delete this listing.');
      } else {
        const message = error.response?.data?.message || 'Failed to delete vehicle';
        toast.error(message);
      }
    }
  };

  const handleView = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailsOpen(true);
  };

  const handleExport = () => {
    try {
      if (vehicles.length === 0) {
        toast.error('No vehicles to export');
        return;
      }
      
      // Prepare CSV headers
      const headers = [
        'ID',
        'Name',
        'Owner',
        'Plate Number',
        'Location',
        'Year',
        'Fuel Type',
        'Transmission',
        'Price/Day (LKR)',
        'Price/Km (LKR)',
        'Status',
        'Submitted Date'
      ];
      
      // Prepare CSV rows
      const csvRows = [
        headers.join(','),
        ...vehicles.map(v => [
          v.id,
          `"${v.name}"`,
          `"${v.owner}"`,
          v.plateNumber,
          `"${v.location}"`,
          v.year,
          v.fuelType,
          v.transmission,
          v.pricePerDay,
          v.pricePerKm,
          v.status,
          v.submittedDate
        ].join(','))
      ];
      
      // Create CSV content
      const csvContent = csvRows.join('\n');
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vehicle-report-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Failed to export:', error);
      toast.error('Failed to export report');
    }
  };

  // Calculate statistics (safe for undefined status)
  const stats = {
    total: vehicles.length,
    pending: vehicles.filter(v => (v.status || '') === VEHICLE_STATUS.PENDING).length,
    approved: vehicles.filter(v => (v.status || '') === VEHICLE_STATUS.APPROVED).length,
    rejected: vehicles.filter(v => (v.status || '') === VEHICLE_STATUS.REJECTED).length,
  };

  // Filter vehicles based on search and active tab (safe for undefined fields)
  const filteredVehicles = vehicles.filter(vehicle => {
    const searchLower = (searchQuery || '').toLowerCase();
    const matchesSearch = 
      (vehicle.name || '').toLowerCase().includes(searchLower) ||
      (vehicle.plateNumber || '').toLowerCase().includes(searchLower) ||
      (vehicle.owner || '').toLowerCase().includes(searchLower) ||
      (vehicle.location || '').toLowerCase().includes(searchLower);

    const matchesTab = (vehicle.status || '') === activeTab;

    return matchesSearch && matchesTab;
  });

  // Prepare tabs with counts
  const tabs = [
    { id: VEHICLE_STATUS.PENDING, label: 'Pending', count: stats.pending },
    { id: VEHICLE_STATUS.APPROVED, label: 'Approved', count: stats.approved },
    { id: VEHICLE_STATUS.REJECTED, label: 'Rejected', count: stats.rejected },
  ];

  const safeUser = user && typeof user === 'object' ? user : { first_name: 'Admin', last_name: 'User', role: 3 };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        role={3}
        user={safeUser}
        isAuthenticated={true}
        onLogout={handleLogout}
        notifications={0}
      />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Vehicle Management
            </h1>
            <p className="text-gray-600">
              Manage and moderate vehicle listings
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={vehicles.length === 0}
            className="px-6 py-3 bg-blue-700 text-white rounded-xl flex items-center gap-2 hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileDown className="w-5 h-5" />
            Export Report
          </button>
        </div>

        {/* Statistics Cards */}
        <VehicleStatistics stats={stats} />

        {/* Search Bar */}
        <SearchSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        {/* Vehicles List with Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 pb-0">
            <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          <div className="p-6">
            <VehicleList
              vehicles={filteredVehicles}
              loading={loading}
              searchQuery={searchQuery}
              activeTab={activeTab}
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={handleDelete}
              onView={handleView}
            />
          </div>
        </div>
      </div>

      <VehicleDetailsModal
        vehicle={selectedVehicle}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}

export default VehicleManagement;