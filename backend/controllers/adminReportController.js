import User from "../models/userModel.js";
import Vehicle from "../models/Vehicle.js";
import Booking from "../models/Booking.js";
import Payment from "../models/paymentModel.js"

//user improvement chart
export const getMonthlyUserChart = async (req, res) => {
  try {
    const monthlyUsers = await User.aggregate([
      {
        $match: { 
          status: "verified",
          role: { $in: [1, 2] } }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          newUsers: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    if (monthlyUsers.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const usersMap = new Map();
    monthlyUsers.forEach(item => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
      usersMap.set(key, item.newUsers);
    });

    const first = monthlyUsers[0]._id;
    const last = monthlyUsers[monthlyUsers.length - 1]._id;

    const startDate = new Date(first.year, first.month - 1, 1);
    const endDate = new Date(last.year, last.month - 1, 1);

    let currentDate = new Date(startDate);
    let cumulativeTotal = 0;
    const result = [];

    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const key = `${year}-${String(month).padStart(2, "0")}`;

      const newUsers = usersMap.get(key) || 0;
      cumulativeTotal += newUsers;

      result.push({
        month: key,
        newUsers,
        totalUsers: cumulativeTotal
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Monthly User Chart Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Side Error"
    });
  }
};

//vehicle availability chart
export const getVehicleAvailabilityReport = async (req, res) => {
  try {
    // Total APPROVED vehicles
    const totalVehicles = await Vehicle.countDocuments({
      status: "Approved"
    });

    // Get current date (start of day in UTC for consistency)
    const today = new Date();
    const startOfToday = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      0, 0, 0, 0
    ));
    const endOfToday = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      23, 59, 59, 999
    ));

    // Get DISTINCT vehicle IDs that are booked TODAY
    const bookedVehicleIds = await Booking.distinct("vehicleId", {
      status: "approved",
      $and: [
        { startingDate: { $lte: endOfToday } },
        { endDate: { $gte: startOfToday } }
      ]
    });

    const bookedVehiclesCount = bookedVehicleIds.length;
    const availableVehiclesCount = totalVehicles - bookedVehiclesCount;

    // Calculate percentage
    const bookedPercentage = totalVehicles === 0 
      ? 0 
      : ((bookedVehiclesCount / totalVehicles) * 100).toFixed(2);
    
    const availablePercentage = totalVehicles === 0 
      ? 0 
      : ((availableVehiclesCount / totalVehicles) * 100).toFixed(2);

    res.status(200).json({
      success: true,
      data: {
        totals: {
          totalVehicles,
          bookedVehicles: bookedVehiclesCount,
          availableVehicles: availableVehiclesCount
        },
        percentages: {
          booked: parseFloat(bookedPercentage),
          available: parseFloat(availablePercentage)
        },
        date: today.toISOString().split('T')[0] // YYYY-MM-DD
      }
    });

  } catch (error) {
    console.error("Vehicle Availability Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Side Error"
    });
  }
};

// USER REPORT STATS (verified only)
export const getUserReportStats = async (req, res) => {
  try {
    // Only verified users
    const totalUsers = await User.countDocuments({ 
      status: "verified" 
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const startOfNextMonth = new Date(startOfMonth);
    startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);

    // Only verified users created this month
    const thisMonthUsers = await User.countDocuments({
      status: "verified", // <-- Add this filter
      createdAt: {
        $gte: startOfMonth,
        $lt: startOfNextMonth,
      },
    });

    const percentage = totalUsers === 0
      ? 0
      : ((thisMonthUsers / totalUsers) * 100).toFixed(2);

    return res.status(200).json({
      success: true,
      totalUsers,
      thisMonthUsers,
      percentage,
    });
  } catch (error) {
    console.log("USER REPORT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Side Error",
    });
  }
};

// VEHICLE REPORT STATS(approved only)
export const getVehicleReportStats = async (req, res) => {
  try {
    // Only approved vehicles
    const totalVehicles = await Vehicle.countDocuments({ 
      status: "Approved" 
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const startOfNextMonth = new Date(startOfMonth);
    startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);

    // Only approved vehicles created this month
    const thisMonthVehicles = await Vehicle.countDocuments({
      status: "Approved", // <-- Add this filter
      createdAt: {
        $gte: startOfMonth,
        $lt: startOfNextMonth
      }
    });

    const percentage = totalVehicles === 0
      ? 0
      : ((thisMonthVehicles / totalVehicles) * 100).toFixed(2);

    return res.status(200).json({
      success: true,
      totalVehicles,
      thisMonthVehicles,
      percentage
    });
  } catch (error) {
    console.log("VEHICLE REPORT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Side Error"
    });
  }
};

// BOOKING REPORT STATS (approved only - based on booking month)
export const getBookingReportStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments({
      status: "approved",
    });

    const now = new Date();

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const startOfNextMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    );

    // 🔥 Count bookings happening THIS month (startingDate)
    const thisMonthBookings = await Booking.countDocuments({
      status: "approved",
      startingDate: {
        $gte: startOfMonth,
        $lt: startOfNextMonth,
      },
    });

    const percentage =
      totalBookings === 0
        ? 0
        : Number(((thisMonthBookings / totalBookings) * 100).toFixed(2));

    return res.status(200).json({
      success: true,
      totalBookings,
      thisMonthBookings,
      percentage,
    });
  } catch (error) {
    console.error("BOOKING REPORT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server Side Error",
    });
  }
};

//booking performance chart
export const getMonthlyApprovedBookingChart = async (req, res) => {
  try {
    const data = await Booking.aggregate([
      {
        $match: {
          status: "approved"
        }
      },
      {
        // 🔥 Group by BOOKING startingDate (NOT createdAt)
        $group: {
          _id: {
            year: { $year: "$startingDate" },
            month: { $month: "$startingDate" }
          },
          bookingCount: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]);

    const formattedData = data.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
      bookings: item.bookingCount
    }));

    res.status(200).json({
      success: true,
      data: formattedData
    });

  } catch (error) {
    console.error("Booking Performance Chart Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Side Error"
    });
  }
};

//get best performance vehicle list
export const getBestPerformanceVehicles = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;

    const vehicles = await Vehicle.find({ status: "Approved" })
      .sort({
        averageRating: -1,
        reviewCount: -1 // tie-breaker
      })
      .limit(limit)
      .select(
        "title model vehicleType averageRating reviewCount pricePerDay"
      );

    res.status(200).json({
      success: true,
      data: vehicles
    });

  } catch (error) {
    console.error("Best Performance Vehicle Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Side Error"
    });
  }
};

//get revenue stats (customer + platform)
export const getSystemMoneyAnalytics = async (req, res) => {
  try {
    const now = new Date();

    // Month boundaries (UTC safe)
    const startOfThisMonth = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      1, 0, 0, 0, 0
    ));

    const startOfNextMonth = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() + 1,
      1, 0, 0, 0, 0
    ));

    const startOfLastMonth = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() - 1,
      1, 0, 0, 0, 0
    ));

    //  TOTAL ALL TIME
    const totalResult = await Payment.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $add: ["$amount.amount", "$amount.platformFee"]
            }
          }
        }
      }
    ]);

    const totalMoney = totalResult[0]?.total || 0;

    // THIS MONTH
    const thisMonthResult = await Payment.aggregate([
      {
        $match: {
          status: "paid",
          paymentDate: {
            $gte: startOfThisMonth,
            $lt: startOfNextMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $add: ["$amount.amount", "$amount.platformFee"]
            }
          }
        }
      }
    ]);

    const thisMonth = thisMonthResult[0]?.total || 0;

    //  LAST MONTH
    const lastMonthResult = await Payment.aggregate([
      {
        $match: {
          status: "paid",
          paymentDate: {
            $gte: startOfLastMonth,
            $lt: startOfThisMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $add: ["$amount.amount", "$amount.platformFee"]
            }
          }
        }
      }
    ]);

    const lastMonth = lastMonthResult[0]?.total || 0;

    //  Growth %
    let growth = 0;

    if (lastMonth === 0) {
      growth = thisMonth > 0 ? 100 : 0;
    } else {
      growth = Number(
        (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(2)
      );
    }

    res.status(200).json({
      success: true,
      totalMoney,
      thisMonth,
      lastMonth,
      growth
    });

  } catch (error) {
    console.error("System Money Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Side Error"
    });
  }
};

//get revenue stats (platform only)
export const getAdminEarningsAnalytics = async (req, res) => {
  try {
    const now = new Date();

    const startOfThisMonth = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      1
    ));

    const startOfNextMonth = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() + 1,
      1
    ));

    const startOfLastMonth = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() - 1,
      1
    ));

    // TOTAL
    const totalResult = await Payment.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount.platformFee" }
        }
      }
    ]);

    const totalEarnings = totalResult[0]?.total || 0;

    // THIS MONTH
    const thisMonthResult = await Payment.aggregate([
      {
        $match: {
          status: "paid",
          paymentDate: {
            $gte: startOfThisMonth,
            $lt: startOfNextMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount.platformFee" }
        }
      }
    ]);

    const thisMonth = thisMonthResult[0]?.total || 0;

    // LAST MONTH
    const lastMonthResult = await Payment.aggregate([
      {
        $match: {
          status: "paid",
          paymentDate: {
            $gte: startOfLastMonth,
            $lt: startOfThisMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount.platformFee" }
        }
      }
    ]);

    const lastMonth = lastMonthResult[0]?.total || 0;

    // Growth
    let growth = 0;

    if (lastMonth === 0) {
      growth = thisMonth > 0 ? 100 : 0;
    } else {
      growth = Number(
        (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(2)
      );
    }

    res.status(200).json({
      success: true,
      totalEarnings,
      thisMonth,
      lastMonth,
      growth
    });

  } catch (error) {
    console.error("Admin Earnings Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Side Error"
    });
  }
};

// Revenue Monthly Line Chart (all-time)
export const getMonthlyRevenueChart = async (req, res) => {
  try {
    const data = await Payment.aggregate([
      { 
        $match: { status: "paid" } // only paid payments
      },
      {
        // Group by year and month
        $group: {
          _id: {
            year: { $year: "$paymentDate" },
            month: { $month: "$paymentDate" }
          },
          totalRevenue: { $sum: "$amount.amount" },
          totalPlatformFee: { $sum: "$amount.platformFee" }
        }
      },
      {
        // Sort chronologically
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]);

    // Format for frontend line chart
    const formattedData = data.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`, // YYYY-MM
      totalRevenue: item.totalRevenue,
      platformFee: item.totalPlatformFee
    }));

    res.status(200).json({
      success: true,
      data: formattedData
    });

  } catch (error) {
    console.error("Monthly Revenue Chart Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Side Error"
    });
  }
};

// GET /api/admin/payment-report
export const getPaymentReport = async (req, res) => {
  try {
    // Fetch all payments with customer & vehicle info
    const payments = await Payment.find()
      .populate({
        path: "customerId",
        select: "first_name last_name" 
      })
      .populate({
        path: "vehicleId",
        select: "title model"
      })
      .sort({ paymentDate: -1 }); // latest first

    // Map to frontend table structure
    const report = payments.map(p => ({
      customerName: p.customerId ? `${p.customerId.first_name} ${p.customerId.last_name}` : "Unknown",
      vehicle: p.vehicleId ? `${p.vehicleId.title} (${p.vehicleId.model})` : "Unknown",
      revenue: p.amount.amount + (p.amount.platformFee || 0),
      status: p.status
    }));

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error("Payment Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Side Error"
    });
  }
};


















