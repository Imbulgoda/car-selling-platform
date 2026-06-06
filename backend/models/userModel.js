import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"]
    },
    contactNumber: {
        type: Number,
        required: true
    },
    role: {
        type: Number,
        enum: {
            values: [1, 2, 3] // (1- customer, 2 - owner, 3 - admin )
        },
        default: 1
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        lowercase: true,
        enum: ["verified" , "suspend" , "pending"]
    },
    profilePicture: {
        type: String,
        default: null
    },
    location:{
        type: String,
        default: null
    },
    bio: {
        type: String,
        default: null
    },
    //email verification
    emailVerifyTokenHash: { 
        type: String 
    },
    emailVerifyTokenExpires: { 
        type: Date 
    },
    suspendExpires: {
        type: Date
    },
    emailNotify: {
        type: String,
        enum: ["on", "off"],
        default: "off"
    },
    resetOtpHash: {
        type: String
    },
    resetOtpExpires:{
        type: Date
    }

},{timestamps: true})

export default mongoose.model("User", userSchema);