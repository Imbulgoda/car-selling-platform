// VehicleCard.jsx

import React, { useState, useEffect } from 'react';
import { User, MapPin, Calendar, Fuel, Settings, Eye, Trash2, Check, X, CheckCircle, XCircle } from 'lucide-react';

const PLACEHOLDER = 'https://via.placeholder.com/400x300?text=Vehicle';

function VehicleImage({ src, alt, images = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const urlList = Array.isArray(images) && images.length > 0 ? images : (src ? [src] : []);
  const currentUrl = urlList[currentIndex] || src;
  const imgSrc = (imgError || !currentUrl || typeof currentUrl !== 'string') ? PLACEHOLDER : currentUrl;

  useEffect(() => {
    setImgError(false);
    setCurrentIndex(0);
  }, [src, images?.length]);

  return (
    <div className="md:w-2/5 h-48 md:h-auto min-h-[12rem] relative bg-gray-100">
      <img
        key={imgSrc}
        src={imgSrc}
        alt={alt || 'Vehicle'}
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
      />
      {urlList.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => (i === 0 ? urlList.length - 1 : i - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
            aria-label="Previous photo"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => (i === urlList.length - 1 ? 0 : i + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
            aria-label="Next photo"
          >
            ›
          </button>
          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/50 text-white text-xs">
            {currentIndex + 1} / {urlList.length}
          </span>
        </>
      )}
    </div>
  );
}

function VehicleInfo({ name, owner, plateNumber, location }) {
  // Ensure we never render an object (backend may send location as { address, geo })
  const locationText = typeof location === 'string' ? location : (location?.address ?? '') || 'N/A';
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <User className="w-4 h-4" />
          <span>{owner}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{plateNumber}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          <span>{locationText}</span>
        </div>
      </div>
    </div>
  );
}

function VehicleActions({ onView, onDelete }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onView}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Eye className="w-5 h-5" />
      </button>
      <button
        onClick={onDelete}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}

function VehicleSpecs({ year, fuelType, transmission }) {
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
        {year}
      </span>
      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full flex items-center gap-1">
        <Fuel className="w-3 h-3" />
        {fuelType}
      </span>
      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full flex items-center gap-1">
        <Settings className="w-3 h-3" />
        {transmission}
      </span>
    </div>
  );
}

function VehiclePricing({ pricePerDay, pricePerKm, showSinglePrice = false }) {
  if (showSinglePrice) {
    return (
      <div className="mb-4">
        <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
          LKR {pricePerDay}/day
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-semibold">
        LKR {pricePerDay}/day
      </div>
      <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-semibold">
        LKR {pricePerKm}/km
      </div>
    </div>
  );
}

function ApprovalBadge({ approvalDate }) {
  return (
    <div className="flex items-center gap-2 mb-4 text-green-600">
      <CheckCircle className="w-5 h-5" />
      <span className="text-sm font-medium">
        Approved on {approvalDate}
      </span>
    </div>
  );
}

function RejectionBadge({ rejectionReason }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
      <div className="flex items-start gap-3">
        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-700">Rejection Reason:</p>
          <p className="text-sm text-red-600 mt-1">
            {rejectionReason || 'No reason provided'}
          </p>
        </div>
      </div>
    </div>
  );
}

function VehicleDetailsButton({ onDetails }) {
  return (
    <button
      type="button"
      onClick={onDetails}
      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
    >
      Details
    </button>
  );
}

export function VehicleCard({ vehicle, onApprove, onReject, onDelete, onView, status = null }) {
  if (!vehicle) return null;

  const handleDelete = () => onDelete?.(vehicle.id);
  const handleView = () => onView?.(vehicle);
  
  // Determine vehicle status
  const isApproved = status === 'approved' || vehicle.status === 'approved';
  const isRejected = status === 'rejected' || vehicle.status === 'rejected';

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
      <div className="md:flex">
        <VehicleImage src={vehicle.image} alt={vehicle.name ?? 'Vehicle'} images={vehicle.images} />

        <div className="md:w-3/5 p-6">
          <div className="flex justify-between items-start mb-4">
            <VehicleInfo
              name={vehicle.name ?? 'Unknown'}
              owner={vehicle.owner ?? 'Unknown'}
              plateNumber={vehicle.plateNumber ?? 'N/A'}
              location={vehicle.location ?? 'Unknown'}
            />
            <VehicleActions onView={handleView} onDelete={handleDelete} />
          </div>

          {isApproved && vehicle.submittedDate && (
            <ApprovalBadge approvalDate={vehicle.submittedDate} />
          )}

          {isRejected && vehicle.rejectionReason && (
            <RejectionBadge rejectionReason={vehicle.rejectionReason} />
          )}

          <VehicleSpecs
            year={vehicle.year ?? ''}
            fuelType={vehicle.fuelType ?? ''}
            transmission={vehicle.transmission ?? ''}
          />

          <VehiclePricing
            pricePerDay={vehicle.pricePerDay ?? 0}
            pricePerKm={vehicle.pricePerKm ?? 0}
            showSinglePrice={isApproved}
          />

          {!isApproved && !isRejected && <VehicleDetailsButton onDetails={handleView} />}

          {!isApproved && !isRejected && (
            <p className="text-sm text-gray-500 mt-3">
              Submitted: {vehicle.submittedDate ?? '-'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}