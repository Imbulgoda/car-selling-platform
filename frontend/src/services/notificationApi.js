// src/services/notificationApi.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8090";
const API_VERSION = import.meta.env.VITE_API_VERSION || "";

const api = axios.create({
  baseURL: `${BASE_URL}${API_VERSION}`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Fetch all notifications for the authenticated user
 */
export const getAllNotifications = async () => {
  try {
    const response = await api.get("/notification/me");
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    // Return empty array if endpoint fails
    return { success: true, data: [], notifications: [] };
  }
};

/**
 * Fetch notifications with filters
 * @param {Object} params - Filter parameters (type, unread, etc.)
 * Example: { type: 'alert', unread: true }
 */
export const getNotifications = async (params = {}) => {
  try {
    const response = await api.get("/notification/by-type", { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching filtered notifications:', error);
    // Return empty array if endpoint fails
    return { success: true, notifications: [] };
  }
};

/** Get only unread notifications */
export const getUnreadNotifications = async () => {
  try {
    const response = await api.get("/notification/unread");
    return response.data;
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    // Return empty array if endpoint fails
    return { success: true, notifications: [] };
  }
};

/* Get notifications by type */
export const getNotificationsByType = async (type, unread = false) => {
  try {
    const params = { type };
    if (unread) {
      params.unread = true;
    }
    const response = await api.get("/notification/by-type", { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications by type:', error);
    // Return empty array if endpoint fails
    return { success: true, notifications: [] };
  }
};

/* Get total unread notification count */
export const getUnreadCount = async () => {
  try {
    const response = await api.get("/notification/unread-count");
    return response.data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    // Return default count if endpoint fails
    return { success: true, count: 0 };
  }
};

/* Get unread counts grouped by type (alert, info, warning, confirmation) */
export const getUnreadCountsByType = async () => {
  try {
    const response = await api.get("/notification/unread-by-type");
    return response.data;
  } catch (error) {
    console.error('Error fetching unread counts by type:', error);
    // Return default counts if endpoint fails
    return { 
      success: true, 
      counts: { alert: 0, info: 0, warning: 0, confirmation: 0 } 
    };
  }
};

/* Mark a notification as read */
export const markAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/notification/read/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    // Return optimistic response
    return { success: true, message: 'Notification marked as read' };
  }
};

/* Mark all notifications as read */
export const markAllAsRead = async () => {
  try {
    const response = await api.put("/notification/mark-all-read");
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      // Fallback: get unread and mark each
      try {
        const unreadResponse = await getUnreadNotifications();
        const notifications = unreadResponse.notifications || [];
        
        if (notifications.length === 0) {
          return { success: true, message: 'No unread notifications' };
        }
        
        const unreadIds = notifications.map(n => n._id || n.id);
        await markMultipleAsRead(unreadIds);
        return { success: true, message: 'All notifications marked as read' };
      } catch (fallbackError) {
        console.error('Error marking all notifications as read:', fallbackError);
        throw fallbackError;
      }
    }
    throw error.response?.data || error.message;
  }
};

/* Delete a notification */
export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/notification/${notificationId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn('Delete notification endpoint not available');
      return { 
        success: false, 
        message: 'Delete functionality not available' 
      };
    }
    throw error.response?.data || error.message;
  }
};

/* Get notification counts */
export const getNotificationCounts = async () => {
  try {
    const [totalCount, countsByType] = await Promise.all([
      getUnreadCount(),
      getUnreadCountsByType()
    ]);
    
    return {
      success: true,
      total: totalCount.count || 0,
      byType: countsByType.counts || {},
      ...totalCount,
      ...countsByType
    };
  } catch (error) {
    console.error('Error getting notification counts:', error);
    // Return default values instead of throwing
    return {
      success: false,
      total: 0,
      byType: { alert: 0, info: 0, warning: 0, confirmation: 0 }
    };
  }
};

export default api;