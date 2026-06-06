import React from 'react';
import { Trash2, AlertCircle, CheckCircle, AlertTriangle, Info, Calendar, Star } from 'lucide-react';

const CustomerNotificationItem = ({
  id,
  type,
  title,
  description,
  timestamp,
  isRead,
  onDelete,
  onMarkAsRead,
  onSelect
}) => {
  const getIconColor = (type) => {
    switch (type.toLowerCase()) {
      case 'reject':
      case 'rejected':
        return 'text-red-500';
      case 'approved':
      case 'success':
        return 'text-green-500';
      case 'pending':
      case 'warning':
        return 'text-yellow-500';
      case 'received':
      case 'booking':
      case 'review':
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getIconByType = (type) => {
    const iconClass = `w-5 h-5 ${getIconColor(type)}`;
    switch (type.toLowerCase()) {
      case 'reject':
      case 'rejected':
        return <AlertCircle className={iconClass} />;
      case 'approved':
      case 'success':
        return <CheckCircle className={iconClass} />;
      case 'pending':
      case 'warning':
        return <AlertTriangle className={iconClass} />;
      case 'received':
        return <Info className={iconClass} />;
      case 'booking':
        return <Calendar className={iconClass} />;
      case 'review':
        return <Star className={`${iconClass} fill-current`} />;
      case 'info':
      default:
        return <Info className={iconClass} />;
    }
  };

  return (
    <div
      className={`p-3 sm:p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 ${
        !isRead ? 'bg-blue-50 bg-opacity-60' : 'bg-white'
      }`}
      onClick={() => {
        onSelect();
        onMarkAsRead(id);
      }}
    >
      <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
        <div className="mt-0.5 flex-shrink-0">
          {getIconByType(type)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium text-xs sm:text-sm ${!isRead ? 'text-gray-900 font-semibold' : 'text-gray-800'} break-words`}>{title}</h4>
          <p className={`text-xs mt-1 break-words ${!isRead ? 'text-gray-600' : 'text-gray-500'}`}>{description}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-gray-500">
              {timestamp}
            </span>
          </div>
        </div>
      </div>
      <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-2 flex-shrink-0 sm:ml-4">
        {!isRead && (
          <span className="inline-block px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-semibold animate-pulse">
            New
          </span>
        )}
        {isRead && (
          <span className="inline-block px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full font-medium">
            Read
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default CustomerNotificationItem;
