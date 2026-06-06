import express from 'express';
import { uploadVehiclePhotos } from '../middlewares/uploadMiddleware.js';
import {registerUser,
    SignIn,
    verifyEmail,
    ReSendVerificationMail,
    logout,
    getAllUsers,
    getAllCustomers,
    getAllOwners,
    Updateuser,
    getUserDetails,
    getUserbyId,
    OwnerStatus,
    emailNotify,
    deleteAccount,
    AdminDeleteAccount,
    otp,
    verifyResetOtp,
    ResetPassword,
} from "../controllers/userController.js"

import { requiredSignIn, isOwner, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router()

//user registration route
router.post("/register", registerUser);

//login route
router.post("/login", SignIn);
//logout function
router.post("/logout", requiredSignIn, logout);

//vehicle owner verificaton route
router.get("/verify-email", verifyEmail);

//get verify email again
router.patch("/getVerificationMail",requiredSignIn, ReSendVerificationMail);

//password reset otp code
router.post("/passwordRestOTP",otp);
router.post("/verifyOTP",verifyResetOtp); //compare OTP code
router.patch("/ResetPassword",ResetPassword); //reset password

//get all users except admins
router.get("/getAllUsers",requiredSignIn, isAdmin, getAllUsers);
//get customers
router.get("/getAllCustomers", requiredSignIn, isAdmin, getAllCustomers);
router.get("/getAllCustomersCount", getAllCustomers);
//get all vehicle owners
router.get("/getAllOwners", requiredSignIn, isAdmin, getAllOwners);

//update user details
router.put("/Updateuser", requiredSignIn, uploadVehiclePhotos.single("profilePicture"), Updateuser);
//get signin user details
router.get("/getUserDetails",requiredSignIn, getUserDetails);
//get user details by id, only admin can get other user details
router.get("/getUserbyId/:id",requiredSignIn, isAdmin, getUserbyId);
//update vehicle owner status
router.patch("/OwnerStatus/:id", requiredSignIn, isAdmin, OwnerStatus);
//email notification button trun off/on function
router.patch("/emailNotify",requiredSignIn, emailNotify)

//user delete there own account
router.delete("/deleteAccount", requiredSignIn, deleteAccount);
//admin remove owner or user
router.delete("/adminRemoveAccount/:id", requiredSignIn, isAdmin, AdminDeleteAccount);





export default router;