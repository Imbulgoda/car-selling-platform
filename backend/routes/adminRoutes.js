import express from "express";
import { requiredSignIn, isAdmin } from "../middlewares/authMiddleware.js";
// Import management controllers from userController
import { 
    getAllOwners, 
    getAllCustomers, 
    getAdminUserStats // ✅ Added new stats controller
} from "../controllers/userController.js"; 
import { 
    getMonthlyUserChart,
    getUserReportStats,
    getVehicleReportStats,
    getBookingReportStats,
    getVehicleAvailabilityReport,
    getMonthlyApprovedBookingChart,
    getBestPerformanceVehicles,
    getAdminEarningsAnalytics,
    getSystemMoneyAnalytics,
    getMonthlyRevenueChart,
    getPaymentReport 
} from "../controllers/adminReportController.js";

const router = express.Router();

// --- Analytics Routes (Still Secured) ---
router.get("/user-chart", requiredSignIn, isAdmin, getMonthlyUserChart);
router.get("/admin/user-report", requiredSignIn, isAdmin, getUserReportStats);
router.get("/admin/vehicle-report", requiredSignIn, isAdmin, getVehicleReportStats);
router.get("/admin/booking-report", requiredSignIn, isAdmin, getBookingReportStats);
router.get("/admin/vehicle-availability", requiredSignIn, isAdmin, getVehicleAvailabilityReport);
router.get("/admin/booking-performance", requiredSignIn, isAdmin, getMonthlyApprovedBookingChart);
router.get("/admin/best-perform-vehicles", requiredSignIn, isAdmin, getBestPerformanceVehicles);
router.get("/admin/total-revenue", requiredSignIn, isAdmin, getSystemMoneyAnalytics);
router.get("/admin/total-revenue-platform", requiredSignIn, isAdmin, getAdminEarningsAnalytics);
router.get("/admin/total-revenue-chart", requiredSignIn, isAdmin, getMonthlyRevenueChart);
router.get("/admin/payment-table", requiredSignIn, isAdmin, getPaymentReport);

// --- ✅ Dashboard Stats Route ---
// This allows your frontend cards to show real-time database counts
router.get("/user-stats", getAdminUserStats);

// --- ✅ User Management Routes (Bypass Applied) ---
// Temporary bypass to view data without login/admin privileges
router.get("/owners", getAllOwners);
router.get("/customers", getAllCustomers);

export default router;