import express from "express";
import {
  getUserNotifications,
  markAsRead,
  getUnreadCount,
  getUnreadCountsByType,
  getUnreadNotifications,
  getNotificationsByType,
  deleteNotification
} from "../controllers/notificationController.js";

import { requiredSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @route   GET /api/notifications/:userId
 * @desc    Get all notifications for a user (customer or owner)
 * @access  Protected - only the logged-in user can access
 */
router.get("/me", requiredSignIn, getUserNotifications);

/**
 * @route   PUT /api/notifications/read/:notificationId
 * @desc    Mark a notification as read
 * @access  Protected - only the logged-in user can update
 */
router.put("/read/:notificationId", requiredSignIn, markAsRead);

// Get total unread count 
router.get("/unread-count", requiredSignIn, getUnreadCount);

// Get unread counts grouped by type (alert, info, warning, confirmation)
router.get("/unread-by-type", requiredSignIn, getUnreadCountsByType);

// Get only unread notifications
router.get("/unread", requiredSignIn, getUnreadNotifications); 

// Get notifications filtered by type (and optional unread)
// Example: /api/notifications/by-type?type=alert&unread=true
router.get("/by-type", requiredSignIn, getNotificationsByType);

router.delete("/:notificationId", requiredSignIn, deleteNotification);

export default router;
