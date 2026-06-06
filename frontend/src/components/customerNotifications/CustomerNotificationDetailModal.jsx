import React from 'react';
import { X, Trash2, AlertCircle, CheckCircle, AlertTriangle, Info, Calendar, Star } from 'lucide-react';

const CustomerNotificationDetailModal = ({ notification, onClose, onDelete }) => {
  if (!notification) return null;

  const getIconByType = (type) => {
    switch (type.toLowerCase()) {
      case 'reject':
      case 'rejected':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      case 'approved':
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'pending':
      case 'warning':
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
      case 'received':
        return <Info className="w-8 h-8 text-blue-500" />;
      case 'booking':
        return <Calendar className="w-8 h-8 text-blue-500" />;
      case 'review':
        return <Star className="w-8 h-8 text-blue-500 fill-current" />;
      case 'info':
      default:
        return <Info className="w-8 h-8 text-blue-500" />;
    }
  };

  const renderDetails = () => {
    switch (notification.type.toLowerCase()) {
      case 'booking':
        return (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 gap-1">
              <span className="text-gray-600 text-xs sm:text-sm flex-shrink-0">Status</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold flex-shrink-0 ${notification.isRead ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>
                {notification.isRead ? 'Read' : 'Unread'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 gap-1">
              <span className="text-gray-600 text-xs sm:text-sm flex-shrink-0">Received Date</span>
              <span className="text-gray-900 font-medium text-xs sm:text-sm break-words">
                {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : notification.timestamp}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 gap-1">
              <span className="text-gray-600 text-xs sm:text-sm flex-shrink-0">Vehicle</span>
              <span className="text-gray-900 font-medium text-xs sm:text-sm break-words">
                {notification.details?.vehicle || 'N/A'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 gap-1">
              <span className="text-gray-600 text-xs sm:text-sm flex-shrink-0">Booking ID</span>
              <span className="text-gray-900 font-medium text-xs sm:text-sm break-words">
                {notification.details?.bookingId || 'N/A'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 gap-1">
              <span className="text-gray-600 text-xs sm:text-sm flex-shrink-0">Booking Date</span>
              <span className="text-gray-900 font-medium text-xs sm:text-sm break-words">
                {notification.details?.bookingDate || notification.timestamp}
              </span>
            </div>
          </div>
        );
      case 'review':
        return (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 gap-1">
              <span className="text-gray-600 text-xs sm:text-sm flex-shrink-0">Status</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold flex-shrink-0 ${notification.isRead ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>
                {notification.isRead ? 'Read' : 'Unread'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 gap-1">
              <span className="text-gray-600 text-xs sm:text-sm flex-shrink-0">Received Date</span>
              <span className="text-gray-900 font-medium text-xs sm:text-sm break-words">
                {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : notification.timestamp}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 gap-1">
              <span className="text-gray-600 text-xs sm:text-sm flex-shrink-0">Vehicle Owner</span>
              <span className="text-gray-900 font-medium text-xs sm:text-sm break-words">
                {notification.details?.owner || 'N/A'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 gap-1">
              <span className="text-gray-600 text-xs sm:text-sm flex-shrink-0">Vehicle</span>
              <span className="text-gray-900 font-medium text-xs sm:text-sm break-words">
                {notification.details?.vehicle || 'N/A'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 gap-1">
              <span className="text-gray-600 text-xs sm:text-sm flex-shrink-0">Rating</span>
              <span className="text-gray-900 font-medium text-xs sm:text-sm">
                {'⭐'.repeat(notification.details?.rating || 0)} ({notification.details?.rating || 0}.0)
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 gap-1">
              <span className="text-gray-600 text-xs sm:text-sm flex-shrink-0">Review Date</span>
              <span className="text-gray-900 font-medium text-xs sm:text-sm break-words">
                {notification.details?.reviewDate || notification.timestamp}
              </span>
            </div>
          </div>
        );
      case 'approved':
      case 'rejected':
      case 'pending':
      case 'success':
        return (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 gap-1">
              <span className="text-gray-600 text-xs sm:text-sm flex-shrink-0">Status</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold flex-shrink-0 ${notification.isRead ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>
                {notification.isRead ? 'Read' : 'Unread'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 gap-1">
              <span className="text-gray-600 text-xs sm:text-sm flex-shrink-0">Received Date</span>
              <span className="text-gray-900 font-medium text-xs sm:text-sm break-words">
                {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : notification.timestamp}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 gap-1">
              <span className="text-gray-600 text-xs sm:text-sm flex-shrink-0">Type</span>
              <span className="text-gray-900 font-medium text-xs sm:text-sm capitalize break-words">
                {notification.type}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 gap-1">
              <span className="text-gray-600 text-xs sm:text-sm flex-shrink-0">Details</span>
              <span className="text-gray-900 font-medium text-xs sm:text-sm break-words">
                {notification.details?.description || 'N/A'}
              </span>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 gap-1">
              <span className="text-gray-600 text-xs sm:text-sm flex-shrink-0">Status</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold flex-shrink-0 ${notification.isRead ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>
                {notification.isRead ? 'Read' : 'Unread'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 gap-1">
              <span className="text-gray-600 text-xs sm:text-sm flex-shrink-0">Received Date</span>
              <span className="text-gray-900 font-medium text-xs sm:text-sm break-words">
                {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : notification.timestamp}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 gap-1">
              <span className="text-gray-600 text-xs sm:text-sm flex-shrink-0">Type</span>
              <span className="text-gray-900 font-medium text-xs sm:text-sm capitalize break-words">
                {notification.type}
              </span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 border-b border-gray-200 gap-3">
          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">{getIconByType(notification.type)}</div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                {notification.title}
              </h2>
              <p className="text-xs text-gray-500">
                {notification.timestamp}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <X size={24} />
          </button>
        </div>

        {/* Description */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-xs sm:text-sm text-gray-600 break-words">
            {notification.description}
          </p>
        </div>

        {/* Details */}
        <div className="p-4 sm:p-6 border-b border-gray-200 overflow-x-auto">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-4">Details</h3>
          {renderDetails()}
        </div>

        {/* Actions */}
        <div className="p-4 sm:p-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-colors text-xs sm:text-sm font-medium"
          >
            Close
          </button>
          <button
            onClick={() => {
              onDelete(notification._id || notification.id);
              onClose();
            }}
            className="flex items-center justify-center sm:justify-between gap-2 px-3 sm:px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-xs sm:text-sm font-medium"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerNotificationDetailModal;
