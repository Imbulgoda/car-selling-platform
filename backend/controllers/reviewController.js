import mongoose from "mongoose";
import Review from "../models/Review.js";
import Vehicle from "../models/Vehicle.js";
import Booking from "../models/Booking.js";
import User from "../models/userModel.js";

 //Create a new review for a vehicle
 //Only customers (role=1) can create reviews

export const createReview = async (req, res) => {
  try {
    const { vehicle_id, rate, feedback } = req.body; // ← CORRECT: vehicle_id, rate, feedback
    const customer_id = req.user.userid; // ← CORRECT: customer_id (from auth)

    // Validation
    if (!vehicle_id || !rate || !feedback) {
      return res.status(400).json({ 
        message: "Vehicle ID, rating, and review are required" 
      });
    }

    if (rate < 1 || rate > 5) {
      return res.status(400).json({ 
        message: "Rating must be between 1 and 5" 
      });
    }

    const trimmedFeedback = feedback.trim();
    if (trimmedFeedback.length < 10) {
      return res.status(400).json({ 
        message: "Review must be at least 10 characters long" 
      });
    }

    // Check if user exists and has customer role (role=1)
    const user = await User.findById(customer_id);
    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    if (user.role !== 1) { // 1 = customer
      return res.status(403).json({ 
        message: "Only customers can create reviews" 
      });
    }

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicle_id);
    if (!vehicle) {
      return res.status(404).json({ 
        message: "Vehicle not found" 
      });
    }

    // Check if user has completed booking for this vehicle
    const completedBooking = await Booking.findOne({
      vehicleId: vehicle_id,
      customerId: customer_id,
      status: "approved",
      endDate: { $lt: new Date() }
    });

    if (!completedBooking) {
      return res.status(403).json({ 
        message: "You can only review vehicles you have rented and completed" 
      });
    }

    // Check for existing review
    const existingReview = await Review.findOne({
      vehicle_id: vehicle_id,
      customer_id: customer_id
    });

    if (existingReview) {
      return res.status(409).json({ 
        message: "You have already reviewed this vehicle" 
      });
    }

    // Create review
    const newReview = new Review({
      vehicle_id: vehicle_id,
      customer_id: customer_id,
      rate: Number(rate),
      feedback: trimmedFeedback
    });

    await newReview.save();

    // Update vehicle's average rating
    await updateVehicleRating(vehicle_id);

    res.status(201).json({
      message: "Review submitted successfully",
      review: newReview
    });
  } catch (error) {
    console.error("Create review error:", error);
    
    if (error.code === 11000) {
      return res.status(409).json({ 
        message: "Duplicate review detected" 
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

 //Get all reviews for a vehicle (Public)
 
export const getReviewsByVehicle = async (req, res) => {
  try {
    const { vehicle_id } = req.params; // ← CORRECT: vehicle_id
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicle_id);
    if (!vehicle) {
      return res.status(404).json({ 
        message: "Vehicle not found" 
      });
    }

    // Build sort options
    const sortOptions = {
      'newest': { createdAt: -1 },
      'oldest': { createdAt: 1 },
      'highest': { rate: -1 },
      'lowest': { rate: 1 }
    };

    const sortBy = sortOptions[sort] || { createdAt: -1 };

    // Pagination
    const skip = (page - 1) * limit;

    // Get reviews
    const reviews = await Review.find({ vehicle_id: vehicle_id })
      .populate("customer_id", "first_name last_name email")
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit));

    // Get statistics
    const stats = await Review.aggregate([
      { $match: { 
        vehicle_id: new mongoose.Types.ObjectId(vehicle_id)
      }},
      {
        $group: {
          _id: "$vehicle_id",
          averageRating: { $avg: "$rate" },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: "$rate"
          }
        }
      }
    ]);

    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (stats[0] && stats[0].ratingDistribution) {
      stats[0].ratingDistribution.forEach(rating => {
        distribution[rating]++;
      });
    }

    res.status(200).json({
      message: "Reviews retrieved successfully",
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil((stats[0]?.totalReviews || 0) / limit),
        totalReviews: stats[0]?.totalReviews || 0
      },
      statistics: {
        averageRating: stats[0] ? parseFloat(stats[0].averageRating.toFixed(1)) : 0,
        ratingDistribution: distribution
      }
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

 //Update a review (Only review owner)

export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rate, feedback } = req.body; // ← CORRECT: rate, feedback
    const customer_id = req.user.userid; // ← CORRECT: customer_id

    const existingReview = await Review.findById(reviewId);
    
    if (!existingReview) {
      return res.status(404).json({ 
        message: "Review not found" 
      });
    }

    // Check if user is the review owner
    if (existingReview.customer_id.toString() !== customer_id) {
      return res.status(403).json({ 
        message: "You can only update your own reviews" 
      });
    }

    // Validate update data
    const updates = {};
    let hasUpdates = false;

    if (rate !== undefined) {
      if (rate < 1 || rate > 5) {
        return res.status(400).json({ 
          message: "Rating must be between 1 and 5" 
        });
      }
      updates.rate = Number(rate);
      hasUpdates = true;
    }

    if (feedback !== undefined) {
      const trimmedFeedback = feedback.trim();
      if (trimmedFeedback.length === 0) {
        return res.status(400).json({ 
          message: "Review text cannot be empty" 
        });
      }
      if (trimmedFeedback.length < 10) {
        return res.status(400).json({ 
          message: "Review must be at least 10 characters long" 
        });
      }
      updates.feedback = trimmedFeedback;
      hasUpdates = true;
    }

    if (!hasUpdates) {
      return res.status(400).json({ 
        message: "No valid fields to update" 
      });
    }

    // Apply updates
    Object.assign(existingReview, updates);
    await existingReview.save();

    // Update vehicle's average rating
    await updateVehicleRating(existingReview.vehicle_id);

    res.status(200).json({
      message: "Review updated successfully",
      review: existingReview
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

//Delete a review (Only review owner)
 
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const customer_id = req.user.userid; // ← CORRECT: customer_id

    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ 
        message: "Review not found" 
      });
    }

    // Check if user is the review owner
    if (review.customer_id.toString() !== customer_id) {
      return res.status(403).json({ 
        message: "You can only delete your own reviews" 
      });
    }

    const vehicle_id = review.vehicle_id;
    await review.deleteOne();

    // Update vehicle's average rating
    await updateVehicleRating(vehicle_id);

    res.status(200).json({
      message: "Review deleted successfully"
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

 //Get user's own reviews
 
export const getMyReviews = async (req, res) => {
  try {
    const customer_id = req.user.userid; // ← CORRECT: customer_id
    
    // Check if user exists
    const user = await User.findById(customer_id);
    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    const reviews = await Review.find({ customer_id: customer_id })
      .populate("vehicle_id", "title model year photos numberPlate fuelType")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Your reviews retrieved successfully",
      reviews,
      total: reviews.length
    });
  } catch (error) {
    console.error("Get user reviews error:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

 //Check if user can review a vehicle
 
export const canReviewVehicle = async (req, res) => {
  try {
    const { vehicle_id } = req.params; // ← CORRECT: vehicle_id
    const customer_id = req.user.userid; // ← CORRECT: customer_id

    // Check if user exists and has customer role
    const user = await User.findById(customer_id);
    if (!user) {
      return res.status(404).json({ 
        canReview: false,
        reason: "User not found"
      });
    }

    if (user.role !== 1) { // 1 = customer
      return res.status(403).json({ 
        canReview: false,
        reason: "Only customers can review vehicles"
      });
    }

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicle_id);
    if (!vehicle) {
      return res.status(404).json({ 
        canReview: false,
        reason: "Vehicle not found"
      });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      vehicle_id: vehicle_id,
      customer_id: customer_id
    });

    if (existingReview) {
      return res.status(200).json({
        canReview: false,
        reason: "Already reviewed",
        existingReviewId: existingReview._id,
        canUpdate: true
      });
    }

    // Check if user has completed booking
    const completedBooking = await Booking.findOne({
      vehicleId: vehicle_id,
      customerId: customer_id,
      status: "approved",
      endDate: { $lt: new Date() }
    });

    if (!completedBooking) {
      // Check for upcoming booking
      const upcomingBooking = await Booking.findOne({
        vehicleId: vehicle_id,
        customerId: customer_id,
        status: "approved",
        endDate: { $gt: new Date() }
      });

      if (upcomingBooking) {
        return res.status(200).json({
          canReview: false,
          reason: "Your rental hasn't completed yet. You can review after the rental period ends.",
          bookingEndDate: upcomingBooking.endDate
        });
      }

      return res.status(200).json({
        canReview: false,
        reason: "You need to rent and complete this vehicle first"
      });
    }

    res.status(200).json({
      canReview: true,
      vehicleDetails: {
        vehicle_id: vehicle._id,
        title: vehicle.title,
        model: vehicle.model,
        year: vehicle.year
      },
      bookingDetails: {
        booking_id: completedBooking._id,
        startDate: completedBooking.startingDate,
        endDate: completedBooking.endDate
      }
    });
  } catch (error) {
    console.error("Check review eligibility error:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

 //Get user's completed bookings that can be reviewed
 
export const getReviewableBookings = async (req, res) => {
  try {
    const customer_id = req.user.userid; // ← CORRECT: customer_id

    // Check if user is a customer
    const user = await User.findById(customer_id);
    if (!user || user.role !== 1) {
      return res.status(403).json({ 
        message: "Only customers can review vehicles" 
      });
    }

    // Find all approved bookings that have ended
    const completedBookings = await Booking.find({
      customerId: customer_id,
      status: "approved",
      endDate: { $lt: new Date() }
    })
      .populate("vehicleId", "title model year photos numberPlate fuelType")
      .sort({ endDate: -1 });

    // Check which vehicles have been reviewed already
    const reviewableBookings = await Promise.all(
      completedBookings.map(async (booking) => {
        const alreadyReviewed = await Review.exists({
          vehicle_id: booking.vehicleId._id,
          customer_id: customer_id
        });

        return {
          booking_id: booking._id,
          vehicle: booking.vehicleId,
          startDate: booking.startingDate,
          endDate: booking.endDate,
          canReview: !alreadyReviewed,
          alreadyReviewed: alreadyReviewed
        };
      })
    );

    res.status(200).json({
      message: "Reviewable bookings retrieved successfully",
      bookings: reviewableBookings.filter(b => b.canReview),
      total: reviewableBookings.filter(b => b.canReview).length
    });
  } catch (error) {
    console.error("Get reviewable bookings error:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

 //Get reviews of vehicles owned by the user (for owners)

export const getMyVehicleReviews = async (req, res) => {
  try {
    const ownerId = req.user.userid; // correct meaning

    // Check if user is an owner (role=2)
    const user = await User.findById(ownerId);
    if (!user || user.role !== 2) {
      return res.status(403).json({ 
        message: "Only vehicle owners can view reviews of their vehicles" 
      });
    }

    // Find vehicles owned by this user
    const ownedVehicles = await Vehicle.find({ ownerId }).select("_id");
    const vehicleIds = ownedVehicles.map(v => v._id);

    if (vehicleIds.length === 0) {
      return res.status(200).json({
        message: "You don't own any vehicles",
        reviews: [],
        vehicleStats: [],
        totalVehicles: 0,
        totalReviews: 0
      });
    }

    // Get reviews for owned vehicles
    const reviews = await Review.find({
      vehicle_id: { $in: vehicleIds }
    })
      .populate("customer_id", "first_name last_name")
      .populate("vehicle_id", "title model year photos numberPlate fuelType")
      .sort({ createdAt: -1 });

    // Calculate stats per vehicle
    const vehicleStats = await Promise.all(
      vehicleIds.map(async (vehicleId) => {
        const stats = await Review.aggregate([
          { $match: { vehicle_id: vehicleId } },
          {
            $group: {
              _id: "$vehicle_id",
              averageRating: { $avg: "$rate" },
              totalReviews: { $sum: 1 }
            }
          }
        ]);

        return {
          vehicle_id: vehicleId,
          averageRating: stats[0] 
            ? Number(stats[0].averageRating.toFixed(1)) 
            : 0,
          totalReviews: stats[0]?.totalReviews || 0
        };
      })
    );

    res.status(200).json({
      message: "Reviews of your vehicles retrieved successfully",
      reviews,
      vehicleStats,
      totalVehicles: vehicleIds.length,
      totalReviews: reviews.length
    });

  } catch (error) {
    console.error("Get my vehicle reviews error:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

 //Helper function to update vehicle's average rating
 
const updateVehicleRating = async (vehicle_id) => {
  try {
    const result = await Review.aggregate([
      { $match: { 
        vehicle_id: new mongoose.Types.ObjectId(vehicle_id)
      }},
      {
        $group: {
          _id: "$vehicle_id",
          averageRating: { $avg: "$rate" },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    if (result.length > 0) {
      await Vehicle.findByIdAndUpdate(vehicle_id, {
        averageRating: parseFloat(result[0].averageRating.toFixed(1)),
        reviewCount: result[0].reviewCount
      });
    }else {
      await Vehicle.findByIdAndUpdate(vehicle_id, {
        averageRating: 0,
        reviewCount: 0
      });
    }
  } catch (error) {
    console.error("Update vehicle rating error:", error);
  }
};

 //Get vehicle rating (simple version)
//Public endpoint - no authentication required

export const getVehicleRating = async (req, res) => {
  try {
    const { vehicle_id } = req.params; // ← CORRECT: vehicle_id

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicle_id);
    if (!vehicle) {
      return res.status(404).json({ 
        message: "Vehicle not found" 
      });
    }

    // Get basic rating info from reviews
    const ratingStats = await Review.aggregate([
      { 
        $match: { 
          vehicle_id: new mongoose.Types.ObjectId(vehicle_id)
        }
      },
      {
        $group: {
          _id: "$vehicle_id",
          averageRating: { $avg: "$rate" },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const stats = ratingStats[0] || {
      averageRating: 0,
      totalReviews: 0
    };

    res.status(200).json({
      message: "Vehicle rating retrieved successfully",
      vehicle_id,
      rating: parseFloat(stats.averageRating.toFixed(1)),
      totalReviews: stats.totalReviews
    });
  } catch (error) {
    console.error("Get vehicle rating error:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

 //Get overall average rating across all vehicles (for homepage)
export const getOverallAverageRating = async (req, res) => {
  try {
    // Aggregate all reviews
    const result = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rate" },
          totalReviews: { $sum: 1 },
          // Optional: Get rating distribution
          ratingDistribution: {
            $push: "$rate"
          }
        }
      }
    ]);

    const stats = result[0] || { 
      averageRating: 0, 
      totalReviews: 0,
      ratingDistribution: []
    };

    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (stats.ratingDistribution && stats.ratingDistribution.length > 0) {
      stats.ratingDistribution.forEach(rating => {
        distribution[rating]++;
      });
    }

    // Also get total vehicle count
    const totalVehicles = await Vehicle.countDocuments({ status: "Approved" });

    res.status(200).json({
      message: "Overall ratings retrieved successfully",
      statistics: {
        averageRating: parseFloat(stats.averageRating.toFixed(1)),
        totalReviews: stats.totalReviews,
        totalVehicles: totalVehicles,
        ratingDistribution: distribution
      }
    });
  } catch (error) {
    console.error("Get overall rating error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// Get latest reviews for homepage (not vehicle-wise)
export const getHomePageReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("customer_id", "first_name last_name")
      .populate("vehicle_id", "title")
      .sort({ createdAt: -1 })   // latest first
      .limit(15);                 // show only 15 reviews on homepage

    res.status(200).json({
      success: true,
      total: reviews.length,
      reviews
    });
  } catch (error) {
    console.error("Get homepage reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
