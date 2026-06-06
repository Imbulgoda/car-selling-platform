import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import Booking from "../models/Booking.js";
import Vehicle from "../models/Vehicle.js";
import User from "../models/userModel.js";
import paymentModel from "../models/paymentModel.js";
import { sendBookingEmail, sendVehicleEmail,sendNewBookingRequestEmail,sendAdminVehicleNotificationEmail,sendPaymentEmail } from "../helpers/mailer.js";

// Check if user allows email notifications
const canSendEmail = async (userId) => {
  const user = await User.findById(userId).select("emailNotify email first_name");
  if (!user) return { allowed: false ,user: null };

  return {
    allowed: user.emailNotify === "on",
    user
  };
};

// Helper: send notification to all admins
const notifyAdmins = async ({ title, description, type }) => {
  const admins = await User.find({ role: 3 }); // role 3 = admin
  const adminNotifications = admins.map(admin => ({
    title,
    description,
    type,
    userId: admin._id,
    isRead: false
  }));
  await Notification.insertMany(adminNotifications);
};

  //Create notification and send email for booking approval/rejection
export const notifyBooking = async ({ type, bookingId }) => {
  const booking = await Booking.findById(bookingId)
    .populate("customerId","first_name email")
    .populate("ownerId","first_name email")
    .populate("vehicleId","title model year numberPlate");

  if (!booking) throw new Error("Booking not found");

  const description =
    type === "approved"
      ? `Your booking for "${booking.vehicleId.title}" (${booking.vehicleId.numberPlate}) from ${booking.startingDate.toDateString()} to ${booking.endDate.toDateString()} has been approved.`
      : `Your booking for "${booking.vehicleId.title}" (${booking.vehicleId.numberPlate}) from ${booking.startingDate.toDateString()} to ${booking.endDate.toDateString()} has been rejected.`;

  // Create notification
  await Notification.create({
    title: type === "approved" ? "Booking Approved" : "Booking Rejected",
    description,
    type: type === "approved" ? "confirmation" : "warning",
    userId: booking.customerId._id,
  });

  //admin notification
  const adminDescription =
    type === "approved"
      ? `Booking #${booking._id} by ${booking.customerId.first_name} for "${booking.vehicleId.title}" has been approved.`
      : `Booking #${booking._id} by ${booking.customerId.first_name} for "${booking.vehicleId.title}" has been rejected.`;
  await notifyAdmins({
    title: type === "approved" ? "Booking Approved" : "Booking Rejected",
    description: adminDescription,
    type: type === "approved" ? "confirmation" : "warning"
  });

  const { allowed } = await canSendEmail(booking.customerId._id);

  // Send email
  if (allowed) {
  await sendBookingEmail({
    type,
    booking,
    customer: booking.customerId,
    owner: booking.ownerId,
    vehicle: booking.vehicleId
  });
}
};

 //Create notification and send email for vehicle approval/rejection
export const notifyVehicle = async ({ type, vehicleId }) => {
  const vehicle = await Vehicle.findById(vehicleId).populate("ownerId","first_name email");
  if (!vehicle) throw new Error("Vehicle not found");

  vehicle.status = type === "approved" ? "Approved" : "Rejected";
  await vehicle.save();

  const description =
    type === "approved"
      ? `Your vehicle "${vehicle.title}" (${vehicle.numberPlate}) has been approved and is now visible to customers.`
      : `Your vehicle "${vehicle.title}" (${vehicle.numberPlate}) has been rejected. Please check the details and submit again.`;


  // Create notification
  await Notification.create({
    title: type === "approved" ? "Vehicle Approved" : "Vehicle Rejected",
    description,
    type: type === "approved" ? "confirmation" : "warning",
    userId: vehicle.ownerId._id
  });

  //  Admin-friendly notification
  const adminDescription =
    type === "approved"
      ? `Vehicle "${vehicle.title}" submitted by ${vehicle.ownerId.first_name} has been approved.`
      : `Vehicle "${vehicle.title}" submitted by ${vehicle.ownerId.first_name} has been rejected.`;
  await notifyAdmins({
    title: type === "approved" ? "Vehicle Approved" : "Vehicle Rejected",
    description: adminDescription,
    type: type === "approved" ? "confirmation" : "warning",
  });

  const { allowed } = await canSendEmail(vehicle.ownerId._id);

  // Send email
  if(allowed){
    await sendVehicleEmail({
    type,
    vehicle,
    owner: vehicle.ownerId
  });
  }
};

  //Get notifications for the logged-in user
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.userid; // get logged-in user ID

    const notifications = await Notification.find({
     userId: userId
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

  //Mark a notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userid; // logged-in user

    // Find the notification
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    // Ensure the logged-in user owns the notification
    if (
      !notification.userId?.equals(userId) 
    ) {
    return res.status(403).json({ success: false, message: "Access denied" });
}


    notification.isRead = true;
    await notification.save();

    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// get unread count (total)
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userid;

    const count = await Notification.countDocuments({
      isRead: false,
      userId: userId
    });

    res.status(200).json({
      success: true,
      unreadCount: count
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

//get unread count by type
export const getUnreadCountsByType = async (req, res) => {
  try {
    const userId = req.user.userid;

    const counts = await Notification.aggregate([
      {
        $match: {
          isRead: false,
          userId: new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      alert: 0,
      info: 0,
      warning: 0,
      confirmation: 0
    };

    counts.forEach(c => {
      result[c._id] = c.count;
    });

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//get new booking request by owner(send to owner when new booking create)
export const notifyNewBookingRequest = async (bookingId) => {
  const booking = await Booking.findById(bookingId)
    .populate("customerId", "first_name")
    .populate("ownerId", "first_name _id")
    .populate("vehicleId", "title numberPlate");

  if (!booking) throw new Error("Booking not found");

  await Notification.create({
    title: "New Booking Request",
    description: `${booking.customerId.first_name} requested to book your vehicle ${booking.vehicleId.title} (${booking.vehicleId.numberPlate})`,
    type: "alert",
    userId: booking.ownerId._id,
    isRead: false
  });

  // Admin-friendly notification
  const adminDescription = `New booking request #${booking._id} by ${booking.customerId.first_name} for vehicle "${booking.vehicleId.title}"`;
  await notifyAdmins({
    title: "New Booking Request",
    description: adminDescription,
    type: "alert"
  });

  const { allowed } = await canSendEmail(booking.ownerId._id);

  // Send email
  if(allowed){
    await sendNewBookingRequestEmail({
    booking,
    customer: booking.customerId,
    owner: booking.ownerId,
    vehicle: booking.vehicleId
  });
  }
};

//get new vehicle approve request by admin
export const notifyAdminNewVehicle = async (vehicleId) => {
  const vehicle = await Vehicle.findById(vehicleId).populate("ownerId", "first_name");
  if (!vehicle) throw new Error("Vehicle not found");

  // Find all admins
  const admins = await User.find({ role: 3 }); // assuming role 3 = admin

  const notifications = admins.map(admin => ({
    title: "Vehicle Approval Request",
    description: `${vehicle.ownerId.first_name} submitted a new vehicle "${vehicle.title}" (${vehicle.numberPlate}) for approval.`,
    type: "info",
    userId: admin._id,
    role: 3,
    isRead: false,
  }));

  await Notification.insertMany(notifications);

  // Optional: send email to all admins
  await Promise.all(
  admins.map(admin =>
    sendAdminVehicleNotificationEmail({
      vehicle,
      owner: vehicle.ownerId,
      adminEmail: admin.email,
      type: "new"  
    })
  )
);
};

//get unread notifications
export const getUnreadNotifications = async (req, res) => {
  try {
    const userId = req.user.userid;

    const notifications = await Notification.find({
      isRead: false,
      userId: userId 
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get notifications by type (and optional unread)
export const getNotificationsByType = async (req, res) => {
  try {
    const userId = req.user.userid;
    const { type, unread } = req.query;

    const query = {
      userId: userId
    };

    if (type) query.type = type;
    if (unread === "true") query.isRead = false;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

//get notification when customer update booking request
export const notifyBookingUpdated = async (bookingId) => {
  const booking = await Booking.findById(bookingId)
    .populate("customerId", "first_name")
    .populate("ownerId", "first_name email _id")
    .populate("vehicleId", "title numberPlate");

  if (!booking) throw new Error("Booking not found");

  // Notification
  await Notification.create({
    title: "Booking Updated",
    description: `${booking.customerId.first_name} updated the booking for ${booking.vehicleId.title} (${booking.vehicleId.numberPlate}).`,
    type: "info",
    userId: booking.ownerId._id,
    isRead: false
  });

  // Admin-friendly notification
  const adminDescription = `Booking #${booking._id} by ${booking.customerId.first_name} for vehicle "${booking.vehicleId.title}" has been updated.`;
  await notifyAdmins({
    title: "Booking Updated",
    description: adminDescription,
    type: "info"
  });

  // Email (if owner allows)
  const { allowed } = await canSendEmail(booking.ownerId._id);
  if (allowed) {
    await sendBookingEmail({
      type: "updated",
      booking,
      customer: booking.customerId,
      owner: booking.ownerId,
      vehicle: booking.vehicleId
    });
  }
};

//get notification when customer delete booking request
export const notifyBookingCancelled = async (bookingId) => {
  const booking = await Booking.findById(bookingId)
    .populate("customerId", "first_name")
    .populate("ownerId", "first_name email _id")
    .populate("vehicleId", "title numberPlate");

  if (!booking) throw new Error("Booking not found");

  // Notification
  await Notification.create({
    title: "Booking Cancelled",
    description: `${booking.customerId.first_name} cancelled the booking for ${booking.vehicleId.title} (${booking.vehicleId.numberPlate}).`,
    type: "warning",
    userId: booking.ownerId._id,
    isRead: false
  });

  // Admin-friendly notification
  const adminDescription = `Booking #${booking._id} by ${booking.customerId.first_name} for vehicle "${booking.vehicleId.title}" has been cancelled.`;
  await notifyAdmins({
    title: "Booking Cancelled",
    description: adminDescription,
    type: "warning"
  });

  // Email (if owner allows)
  const { allowed } = await canSendEmail(booking.ownerId._id);
  if (allowed) {
    await sendBookingEmail({
      type: "cancelled",
      booking,
      customer: booking.customerId,
      owner: booking.ownerId,
      vehicle: booking.vehicleId
    });
  }
};

// Notify admins when a vehicle is updated by the owner
export const notifyAdminVehicleUpdated = async (vehicleId) => {
  const vehicle = await Vehicle.findById(vehicleId).populate("ownerId", "first_name email");
  if (!vehicle) throw new Error("Vehicle not found");

  // Get all admins
  const admins = await User.find({ role: 3 }); // assuming role 3 = admin

  // Create notifications for each admin
  const notifications = admins.map(admin => ({
    title: "Vehicle Updated",
    description: `${vehicle.ownerId.first_name} updated their vehicle "${vehicle.title}" (${vehicle.numberPlate}).`,
    type: "info",
    userId: admin._id,
    isRead: false,
  }));

  await Notification.insertMany(notifications);

  // Send emails to admins
  await Promise.all(
    admins.map(admin =>
      sendAdminVehicleNotificationEmail({
        vehicle,
        owner: vehicle.ownerId,
        adminEmail: admin.email,
        type: "updated"
      })
    )
  );
};

// Notify admins when a vehicle is deleted by the owner
export const notifyAdminVehicleDeleted = async (vehicleId) => {
  // Get vehicle with populated owner BEFORE deletion
  const vehicle = await Vehicle.findById(vehicleId)
    .populate("ownerId", "first_name last_name email");
    
  if (!vehicle) throw new Error("Vehicle not found");

  // Get all admins
  const admins = await User.find({ role: 3 });

  // Create notifications
  const notifications = admins.map(admin => ({
    title: "Vehicle Deleted",
    description: `${vehicle.ownerId.first_name} deleted their vehicle "${vehicle.title}" (${vehicle.numberPlate}).`,
    type: "warning",
    userId: admin._id,
    isRead: false,
  }));

  await Notification.insertMany(notifications);

  // Send emails
  await Promise.all(
    admins.map(admin =>
      sendAdminVehicleNotificationEmail({
        vehicle,
        owner: vehicle.ownerId,  
        adminEmail: admin.email,
        type: "deleted"
      })
    )
  );
};

// Notify customer that payment is initiated/processing
export const notifyPaymentInitiated = async (paymentId) => {
  const payment = await paymentModel.findById(paymentId)
    .populate("customerId", "first_name email")
    .populate("vehicleId", "title numberPlate")
    .populate("bookingId", "startingDate endDate");

  if (!payment) throw new Error("Payment not found");

  const currencySymbol = payment.amount.currency === "LKR" ? "Rs." : "$";

  const description = `Your payment of ${currencySymbol}${payment.amount.amount} for ${payment.vehicleId.title} (${payment.vehicleId.numberPlate}) is being processed. We'll notify you once the payment is successfully completed.`;

  // Create notification for customer
  await Notification.create({
    title: "Payment Processing",
    description,
    type: "info", 
    userId: payment.customerId._id,
    isRead: false
  });

  // Admin notification
  const adminDescription = `Payment of ${currencySymbol}${payment.amount.amount} initiated by ${payment.customerId.first_name} for vehicle "${payment.vehicleId.title}"`;

  await notifyAdmins({
    title: "Payment Initiated",
    description: adminDescription,
    type: "info"
  });

  // Send email to customer if they allow notifications
  const { allowed, user } = await canSendEmail(payment.customerId._id);
  if (allowed && user) {
    await sendPaymentEmail({//sendPaymentEmail
      type: "initiated",
      payment,
      customer: payment.customerId,
      vehicle: payment.vehicleId,
      booking: payment.bookingId
    });
  }
};

// Notify owner that customer has initiated payment
export const notifyOwnerPaymentInitiated = async (paymentId) => {
  const payment = await paymentModel.findById(paymentId)
    .populate("customerId", "first_name email")
    .populate("OwnerId", "first_name email _id")
    .populate("vehicleId", "title numberPlate")
    .populate("bookingId", "startingDate endDate");

  if (!payment) throw new Error("Payment not found");

  const currencySymbol = payment.amount.currency === "LKR" ? "Rs." : "$";

  const description = `${payment.customerId.first_name} has initiated a payment of ${currencySymbol}${payment.amount.amount} for your vehicle ${payment.vehicleId.title} (${payment.vehicleId.numberPlate}). Payment is being processed.`;

  // Create notification for owner
  await Notification.create({
    title: "Payment Initiated by Customer",
    description,
    type: "info",
    userId: payment.OwnerId._id,
    isRead: false
  });

  // Send email to owner if they allow notifications
  const { allowed, user } = await canSendEmail(payment.OwnerId._id);
  if (allowed && user) {
    await sendPaymentEmail({
      type: "owner_initiated",
      payment,
      customer: payment.customerId,
      owner: payment.OwnerId,
      vehicle: payment.vehicleId,
      booking: payment.bookingId
    });
  }
};

// Notify owner when payment is received for their vehicle booking
export const notifyOwnerPaymentReceived = async (paymentId) => {
  const payment = await paymentModel.findById(paymentId)
    .populate("customerId", "first_name email")
    .populate("OwnerId", "first_name email _id") 
    .populate("vehicleId", "title numberPlate")
    .populate("bookingId", "startingDate endDate");

  if (!payment) throw new Error("Payment not found");

  const currencySymbol = payment.amount.currency === "LKR" ? "Rs." : "$";

  const description = `${payment.customerId.first_name} has successfully paid ${currencySymbol}${payment.amount.amount} for booking ${payment.vehicleId.title} (${payment.vehicleId.numberPlate}). Platform fee: ${currencySymbol}${payment.amount.platformFee}`;
  
  // Create notification for owner
  await Notification.create({
    title: "Payment Received",
    description,
    type: "confirmation", // matches notification schema enum
    userId: payment.OwnerId._id, // Capital O as in payment schema
    isRead: false
  });

  // Admin-friendly notification
  const adminDescription = `Payment of ${currencySymbol}${payment.amount.amount} received from ${payment.customerId.first_name} for vehicle "${payment.vehicleId.title}" (Owner: ${payment.OwnerId.first_name})`;

  await notifyAdmins({
    title: "Payment Completed",
    description: adminDescription,
    type: "confirmation"
  });

  // Send email to owner if they allow notifications
  const { allowed, user } = await canSendEmail(payment.OwnerId._id);
  if (allowed && user) {
    await sendPaymentEmail({
      type: "received",
      payment,
      customer: payment.customerId,
      owner: payment.OwnerId,
      vehicle: payment.vehicleId,
      booking: payment.bookingId
    });
  }
};

// Notify customer when their payment is successful
export const notifyCustomerPaymentSuccess = async (paymentId) => {
  const payment = await paymentModel.findById(paymentId)
    .populate("customerId", "first_name email")
    .populate("vehicleId", "title numberPlate")
    .populate("bookingId", "startingDate endDate");

  if (!payment) throw new Error("Payment not found");

  const currencySymbol = payment.amount.currency === "LKR" ? "Rs." : "$";

  const description = `Your payment of ${currencySymbol}${payment.amount.amount} for ${payment.vehicleId.title} (${payment.vehicleId.numberPlate}) was successful. Your booking is now confirmed.`;

  // Create notification for customer
  await Notification.create({
    title: "Payment Successful",
    description,
    type: "confirmation",
    userId: payment.customerId._id,
    isRead: false
  });

  // Send email to customer if they allow notifications
  const { allowed, user } = await canSendEmail(payment.customerId._id);
  if (allowed) {
    await sendPaymentEmail({
      type: "success",
      payment,
      customer: payment.customerId,
      vehicle: payment.vehicleId,
      booking: payment.bookingId
    });
  }
};

// Notify customer when payment fails
export const notifyCustomerPaymentFailed = async (paymentIntentId) => {
  const payment = await paymentModel.findOne({ stripePaymentIntentId: paymentIntentId })
    .populate("customerId", "first_name email")
    .populate("vehicleId", "title numberPlate");

  if (!payment) return; // Payment record might not exist yet

  //FIXED: Add dynamic currency symbol
  const currencySymbol = payment.amount.currency === "LKR" ? "Rs." : "$";

  //FIXED: Use currencySymbol instead of hardcoded $
  const description = `Your payment of ${currencySymbol}${payment.amount.amount} for ${payment.vehicleId.title} (${payment.vehicleId.numberPlate}) failed. Please try again with a different payment method.`;

  // Create notification for customer
  await Notification.create({
    title: "Payment Failed",
    description,
    type: "warning", // matches notification schema enum
    userId: payment.customerId._id,
    isRead: false
  });

  // Use currencySymbol in admin notification
  const adminDescription = `Payment failed for ${payment.customerId.first_name} - ${currencySymbol}${payment.amount.amount} for ${payment.vehicleId.title}`;

  await notifyAdmins({
    title: "Payment Failed",
    description: adminDescription,
    type: "warning"
  });

  // Send email to customer if they allow notifications
  const { allowed, user } = await canSendEmail(payment.customerId._id);
  if (allowed && user) {
    await sendPaymentEmail({
      type: "failed",
      payment,
      customer: payment.customerId,
      vehicle: payment.vehicleId
    });
  }
};

// Notify owner when a booking payment is refunded/cancelled
export const notifyOwnerPaymentRefunded = async (paymentId) => {
  const payment = await paymentModel.findById(paymentId)
    .populate("customerId", "first_name email")
    .populate("OwnerId", "first_name email _id") // Capital O as in payment schema
    .populate("vehicleId", "title numberPlate");

  if (!payment) throw new Error("Payment not found");

  // FIXED 1: Add dynamic currency symbol
  const currencySymbol = payment.amount.currency === "LKR" ? "Rs." : "$";

  // FIXED 2: Use currencySymbol instead of hardcoded $
  const description = `Payment of ${currencySymbol}${payment.amount.amount} from ${payment.customerId.first_name} for ${payment.vehicleId.title} has been refunded.`;

  // Create notification for owner
  await Notification.create({
    title: "Payment Refunded",
    description,
    type: "warning",
    userId: payment.OwnerId._id, // Capital O as in payment schema
    isRead: false
  });

  // Admin notification
  const adminDescription = `Payment #${payment._id} of ${currencySymbol}${payment.amount.amount} has been refunded to ${payment.customerId.first_name}`;

  await notifyAdmins({
    title: "Payment Refunded",
    description: adminDescription,
    type: "warning"
  });

  // Send email to owner if they allow
  const { allowed, user } = await canSendEmail(payment.OwnerId._id);
  if (allowed && user) {
    await sendPaymentEmail({
      type: "refunded",
      payment,
      customer: payment.customerId,
      owner: payment.OwnerId,
      vehicle: payment.vehicleId
    });
  }
};

// Get payment notifications summary for dashboard
export const getPaymentNotificationsSummary = async (req, res) => {
  try {
    const userId = req.user.userid;
    const userRole = req.user.role;

    // ✅ FIXED: Include all payment notification titles
    const paymentTitles = [
      "Payment Processing",
      "Payment Initiated",
      "Payment Initiated by Customer",
      "Payment Received",
      "Payment Successful",
      "Payment Failed",
      "Payment Refunded",
      "Payment Completed"
    ];

    const query = {
      userId: userId,
      title: { $in: paymentTitles }
    };

    // Add role-based query if user is admin (role 3)
    if (userRole === 3) {
      // ✅ FIXED: Include all admin notification titles
      const adminNotifications = await Notification.find({
        role: 3,
        title: { 
          $in: [
            "Payment Initiated",
            "Payment Completed", 
            "Payment Failed", 
            "Payment Refunded"
          ] 
        }
      }).sort({ createdAt: -1 }).limit(20);
      
      const userNotifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(20);
      
      const allNotifications = [...userNotifications, ...adminNotifications]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 20);
      
      const grouped = {};
      allNotifications.forEach(notification => {
        if (!grouped[notification.title]) {
          grouped[notification.title] = {
            count: 0,
            unread: 0,
            recent: notification
          };
        }
        grouped[notification.title].count += 1;
        if (!notification.isRead) {
          grouped[notification.title].unread += 1;
        }
      });

      const result = Object.keys(grouped).map(title => ({
        _id: title,
        ...grouped[title]
      }));

      return res.status(200).json({
        success: true,
        data: result
      });
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(20);

    const grouped = {};
    notifications.forEach(notification => {
      if (!grouped[notification.title]) {
        grouped[notification.title] = {
          count: 0,
          unread: 0,
          recent: notification
        };
      }
      grouped[notification.title].count += 1;
      if (!notification.isRead) {
        grouped[notification.title].unread += 1;
      }
    });

    const result = Object.keys(grouped).map(title => ({
      _id: title,
      ...grouped[title]
    }));

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (err) {
    console.error("Error in getPaymentNotificationsSummary:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Get unread payment notifications count
export const getUnreadPaymentCount = async (req, res) => {
  try {
    const userId = req.user.userid;
    const userRole = req.user.role;

    // ✅ FIXED: Include all payment notification titles
    const paymentTitles = [
      "Payment Processing",
      "Payment Initiated",
      "Payment Initiated by Customer",
      "Payment Received",
      "Payment Successful", 
      "Payment Failed",
      "Payment Refunded",
      "Payment Completed"
    ];

    let query = {
      isRead: false,
      title: { $in: paymentTitles }
    };

    if (userRole !== 3) {
      query.userId = userId;
    } else {
      query = {
        $or: [
          { userId: userId, title: { $in: paymentTitles } },
          { role: 3, title: { $in: paymentTitles } }
        ],
        isRead: false
      };
    }

    const count = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      unreadCount: count
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Delete a single notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userid;
    const userRole = req.user.role;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    // If admin (role = 3), allow delete
    // Otherwise only allow owner to delete
    if (
      userRole !== 3 &&
      (!notification.userId || !notification.userId.equals(userId))
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    await notification.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};













