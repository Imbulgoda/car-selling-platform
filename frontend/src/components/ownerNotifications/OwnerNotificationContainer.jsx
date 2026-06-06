import React from 'react';
import OwnerNotificationItem from './OwnerNotificationItem';

const OwnerNotificationContainer = ({
  notifications,
  onDelete,
  onMarkAsRead,
  onSelectNotification,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading notifications...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No notifications found</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {notifications.map((notification, index) => (
        <OwnerNotificationItem
          key={notification._id || notification.id || index}
          id={notification._id || notification.id}
          type={notification.type}
          title={notification.title}
          description={notification.description}
          timestamp={notification.timestamp}
          isRead={notification.isRead}
          onDelete={onDelete}
          onMarkAsRead={onMarkAsRead}
          onSelect={() => onSelectNotification(notification)}
        />
      ))}
    </div>
  );
};

export default OwnerNotificationContainer;
