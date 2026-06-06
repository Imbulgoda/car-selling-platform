import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
    {
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: ""
        },
        numberPlate: {
            type: String,
            required: true,
            trim: true
        },
        model: {
            type: String,
            required: true,
            trim: true
        },
        vehicleType: {
            type: String,
            enum: ["Car", "Van", "SUV", "Pickup", "Bus", "Bike", "ThreeWheel", "Other"],
            required: true,
            trim: true
        },
        seats: {
            type: Number,
            required: true,
            min: 1
        },
        year: {
            type: Number,
            required: true
        },
        fuelType: {
            type: String,
            enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
            required: true
        },
        transmission: {
            type: String,
            enum: ["Automatic", "Manual"],
            required: true
        },
        pricePerDay: {
            type: Number,
            required: true,
            min: 0
        },
        km: {
            type: Number,
            required: true,
            min: 0
        },
        pricePerKm: {
            type: Number,
            required: true,
            min: 0
        },
        photos: [{
            url: {
                type: String,
                required: true
            },
            key: {
                type: String
            }
        }],
        location: {
            address: { type: String, default: "" },
            geo: {
                type: {
                    type: String,
                    enum: ["Point"],
                    default: "Point"
                },
                coordinates: {
                    type: [Number],
                    required: true,
                    validate: {
                        validator: (v) => Array.isArray(v) && v.length === 2,
                        message: "Geo cordinates must be [lng, lat].",
                    },
                },
            },
        },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending"
        },
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        reviewCount: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    { timestamps: true }
);

vehicleSchema.index({ ownerId: 1, numberPlate: 1 }, { unique: true });

vehicleSchema.index({ "location.geo": "2dsphere" });

export default mongoose.model("Vehicle", vehicleSchema);