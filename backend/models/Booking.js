import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        startingDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
            validate: {
                validator: function (value) {
                    return !this.startingDate || value > this.startingDate;
                },
                message: "End date must be after starting date",
            },
        },
        documents: [
            {
                type: String,
                trim: true,
            },
        ],
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        vehicleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vehicle",
            required: true,
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        dailyRate: {
            type: Number,
            min: 0,
            required: true,
        },
        totalAmount: {
            type: Number,
            min: 0,
            required: true,
        },
        currency: {
            type: String,
            default: "LKR",
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "cancelled"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
