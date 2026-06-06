import express from "express";
import {
  requiredSignIn,
  isCustomer,
  isOwner
} from "../middlewares/authMiddleware.js";

import {
  createReview,
  getReviewsByVehicle,
  updateReview,
  deleteReview,
  getMyReviews,
  canReviewVehicle,
  getReviewableBookings,
  getMyVehicleReviews,
  getVehicleRating,
  getOverallAverageRating,
  getHomePageReviews
} from "../controllers/reviewController.js";

const router = express.Router();

// Public routes
router.get("/vehicle/:vehicle_id", getReviewsByVehicle);
router.get("/vehicle/:vehicle_id/rating", getVehicleRating);
router.get("/overall-rating", getOverallAverageRating);
router.get("/home", getHomePageReviews);


//customer routes
router.post("/create", requiredSignIn, isCustomer, createReview);
router.get("/me", requiredSignIn, isCustomer, getMyReviews);
router.get("/can-review/:vehicle_id", requiredSignIn, isCustomer, canReviewVehicle);
router.get("/reviewable-bookings", requiredSignIn, isCustomer, getReviewableBookings);
router.put("/update/:reviewId", requiredSignIn, isCustomer, updateReview);
router.delete("/delete/:reviewId", requiredSignIn, isCustomer, deleteReview);

//Vehicle Owner
router.get("/my-vehicles", requiredSignIn, isOwner, getMyVehicleReviews);

export default router;
