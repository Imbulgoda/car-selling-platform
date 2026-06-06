import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    vehicle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true
    },
 
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",  
      required: true
    },
  
    rate: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
   
    feedback: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 500
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate reviews
reviewSchema.index({ vehicle_id: 1, customer_id: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);