import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    type: {
      type: String,
      enum: ["alert", "info", "warning", "confirmation"],
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

//admin role=3
    role:{
      type:Number,
      default: null 
    },

    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true   // createdAt = notification date
  }
);

export default mongoose.model("Notification", notificationSchema);
