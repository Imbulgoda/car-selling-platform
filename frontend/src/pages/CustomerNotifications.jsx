import React, { useState, useEffect } from 'react';
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import CustomerNotificationTabs from '../../components/customerNotifications/CustomerNotificationTabs';
import CustomerNotificationContainer from '../../components/customerNotifications/CustomerNotificationContainer';
import CustomerNotificationDetailModal from '../../components/customerNotifications/CustomerNotificationDetailModal';
import toast from 'react-hot-toast';
import * as notificationApi from '../../services/notificationApi';

const CustomerNotifications = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [counts, setCounts] = useState({
    all: 0,
    unread: 0,
    bookings: 0,
    reviews: 0,
    alerts: 0
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const API_VERSION = import.meta.env.VITE_API_VERSION || "";

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}${API_VERSION}/authUser/getUserDetails`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          setUser(null);
          setRole(1);
          setIsAuthenticated(false);
          return;
        }

        const data = await response.json();
        if (data?.success && data?.user) {
          setUser(data.user);
          setRole(data.user.role ?? 1);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setRole(1);
          setIsAuthenticated(false);
        }
      } catch (error) {
        setUser(null);
        setRole(1);
        setIsAuthenticated(false);
      }
    };

    fetchUser();
  }, [API_BASE_URL, API_VERSION]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}${API_VERSION}/authUser/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed", error);
    }
    setUser(null);
    setRole(1);
    setIsAuthenticated(false);
  };

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await notificationApi.getAllNotifications();
      
      // Handle different response formats from backend
      let notificationsList = [];
      if (Array.isArray(response)) {
        notificationsList = response;
      } else if (response.data && Array.isArray(response.data)) {
        notificationsList = response.data;
      } else if (response.notifications && Array.isArray(response.notifications)) {
        notificationsList = response.notifications;
      }
      
      if (notificationsList.length > 0) {
        // Filter notifications to show only customer-related ones
        const customerNotifications = notificationsList.filter(n => 
          n.type && (
            n.type.toLowerCase() === 'booking' || 
            n.type.toLowerCase() === 'review' ||
            n.type.toLowerCase() === 'approved' ||
            n.type.toLowerCase() === 'rejected' ||
            n.type.toLowerCase() === 'pending'
          )
        );
        setNotifications(customerNotifications);
        updateCounts(customerNotifications);
      } else {
        // No notifications found or endpoint not yet implemented
        setNotifications([]);
        updateCounts([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      updateCounts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize notifications
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Filter notifications based on active tab
  useEffect(() => {
    let filtered = notifications;

    if (activeTab === 'unread') {
      filtered = notifications.filter(n => !n.isRead);
    } else if (activeTab === 'bookings') {
      filtered = notifications.filter(n => n.type && (n.type.toLowerCase() === 'booking' || n.type.toLowerCase() === 'pending'));
    } else if (activeTab === 'reviews') {
      filtered = notifications.filter(n => n.type && n.type.toLowerCase() === 'review');
    } else if (activeTab === 'alerts') {
      filtered = notifications.filter(n => n.type && (n.type.toLowerCase() === 'alert' || n.type.toLowerCase() === 'reject' || n.type.toLowerCase() === 'rejected'));
    }
    // For 'all' tab, show all notifications (no additional filtering)

    // Sort so unread notifications appear first, then by timestamp
    filtered = filtered.sort((a, b) => {
      // Unread notifications first
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1;
      }
      // Then by timestamp (newer first)
      return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
    });

    setFilteredNotifications(filtered);
  }, [activeTab, notifications]);

  // Update counts
  const updateCounts = (notifs) => {
    const newCounts = {
      all: notifs.length,
      unread: notifs.filter(n => !n.isRead).length,
      bookings: notifs.filter(n => n.type && (n.type.toLowerCase() === 'booking' || n.type.toLowerCase() === 'pending')).length,
      reviews: notifs.filter(n => n.type && n.type.toLowerCase() === 'review').length,
      alerts: notifs.filter(n => n.type && (n.type.toLowerCase() === 'alert' || n.type.toLowerCase() === 'reject' || n.type.toLowerCase() === 'rejected')).length
    };
    setCounts(newCounts);
  };

  // Handle delete notification
  const handleDeleteNotification = async (id) => {
    try {
      const response = await notificationApi.deleteNotification(id);
      if (response.success) {
        const updated = notifications.filter(n => n._id !== id && n.id !== id);
        setNotifications(updated);
        updateCounts(updated);
        toast.success('Notification deleted successfully');
      } else {
        toast.error('Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Fallback: update local state if API fails
      const updated = notifications.filter(n => n._id !== id && n.id !== id);
      setNotifications(updated);
      updateCounts(updated);
      toast.success('Notification deleted');
    }
  };

  // Handle mark as read
  const handleMarkAsRead = async (id) => {
    try {
      const response = await notificationApi.markAsRead(id);
      if (response.success) {
        const updatedNotifications = notifications.map(n =>
          (n._id === id || n.id === id) ? { ...n, isRead: true } : n
        );
        setNotifications(updatedNotifications);
        updateCounts(updatedNotifications);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Fallback: update local state if API fails
      const updatedNotifications = notifications.map(n =>
        (n._id === id || n.id === id) ? { ...n, isRead: true } : n
      );
      setNotifications(updatedNotifications);
      updateCounts(updatedNotifications);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationApi.markAllAsRead();
      if (response.success) {
        // Update local state immediately for better UX
        const allReadNotifications = notifications.map(n => ({ ...n, isRead: true }));
        setNotifications(allReadNotifications);
        updateCounts(allReadNotifications);
        toast.success('All notifications marked as read');
        
        // Refetch to verify backend persistence after a short delay
        setTimeout(() => {
          fetchNotifications();
        }, 500);
      } else {
        toast.error(response.message || 'Failed to mark all as read');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };


  return (
    <>
      <Header
        role={role}
        isAuthenticated={isAuthenticated}
        user={user}
        notifications={counts.unread}
        onLogout={handleLogout}
      />
      <div className="min-h-screen bg-gray-50 pb-20">

        {/* Page Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-500 mt-1">
                  You have {counts.unread} unread notifications
                </p>
              </div>
              {counts.unread > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-6">
            <CustomerNotificationTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white max-w-7xl mx-auto">
          <CustomerNotificationContainer
            notifications={filteredNotifications}
            onDelete={handleDeleteNotification}
            onMarkAsRead={handleMarkAsRead}
            onSelectNotification={setSelectedNotification}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Notification Detail Modal */}
      <CustomerNotificationDetailModal
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
        onDelete={handleDeleteNotification}
      />

      <Footer />
    </>
  );
};

export default CustomerNotifications;
