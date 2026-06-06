import User from "../models/userModel.js";
import { comparePassword, passwordHash } from "../helpers/authHelper.js";
import JWT from 'jsonwebtoken';
import crypto from "crypto";
import { sendVerifyEmail, suspendOwner, sendOtpEmail } from "../helpers/mailer.js";
import { isStrongPassword } from "../helpers/validator.js";
import fs from "fs";
import path from "path";

// ✅ NEW FEATURE: Get accurate counts for dashboard stats cards
export const getAdminUserStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: { $in: [1, 2] } });
        const owners = await User.countDocuments({ role: 2 });
        const customers = await User.countDocuments({ role: 1 });

        res.status(200).json({
            success: true,
            totalUsers,
            owners,
            customers
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server Side Error." });
    }
};

// register as a normal user
export const registerUser = async (req, res) => {
    try {
        const { first_name, last_name, email, userType, contactNumber, password } = req.body;
        let role = 1;
        if (!first_name || !last_name || !email || !password || !contactNumber || !userType) {
            return res.status(404).json({
                success: false,
                message: "All field must need to fill."
            });
        }
        // check password
        if (!isStrongPassword(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters and include 1 uppercase, 1 lowercase, 1 number, and 1 special character (@ ! # $ % &).",
            });
        }
        if (userType === "owner") {
            role = 2;
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists."
            });
        }

        const hashed = await passwordHash(password);

        // 1) generate token (raw) + store hash
        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

        const user = await User.create({
            first_name,
            last_name,
            email,
            contactNumber,
            role,
            password: hashed,
            status: "pending",
            emailVerifyTokenHash: tokenHash,
            emailVerifyTokenExpires: new Date(Date.now() + 1000 * 60 * 10), // 10 mins for expire token
        });

        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${rawToken}`;

        try {
            await sendVerifyEmail(user.email, verifyUrl);
        } catch (e) {
            await User.findByIdAndDelete(user._id);
            return res.status(500).json({
                success: false,
                message: "Verification email sending failed. Try again.",
            });
        }

        res.status(200).json({
            success: true,
            message: "User registered successfully."
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Side Error"
        });
    }
};

// user login function
export const SignIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(404).json({
                success: false,
                message: "All field must need to fill."
            });
        }
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials."
            });
        }

        const token = JWT.sign(
            {
                userid: user._id,
                role: user.role,
                status: user.status,
                emailNotify: user.emailNotify,
            },
            process.env.JWT_SECRET, { expiresIn: "1d" }
        );

        res.cookie('access_token', token, {
            httpOnly: true
        }).status(200).json({
            success: true,
            message: "Login Successfully.",
            userid: user._id,
            role: user.role,
            token
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Side Error"
        });
    }
};

// logout function
export const logout = async (req, res) => {
    try {
        res.clearCookie('access_token').status(200).json({
            success: true,
            message: "SignOut Successfully."
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Side Error."
        });
    }
};

// email verification function
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query; // from /verify-email?token=...

        if (!token) {
            return res.status(400).json({ success: false, message: "Token is required." });
        }

        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            emailVerifyTokenHash: tokenHash,
            emailVerifyTokenExpires: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired token.",
            });
        }

        user.status = "verified";
        user.emailVerifyTokenHash = undefined;
        user.emailVerifyTokenExpires = undefined;
        user.suspendExpires = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server Side Error" });
    }
};

// resend verification mail function
export const ReSendVerificationMail = async (req, res) => {
    try {
        const id = req.user.userid;

        const user = await User.findById(id);

        if (user.status === "verified") {
            return res.status(200).json({
                success: true,
                message: "Your account is already verified."
            });
        }
        // suspend end date
        let suspendDate = null;
        if (user.status === "suspend" && user.suspendExpires) {
            suspendDate = user.suspendExpires.toISOString().split("T")[0];
        }

        // todays date
        const date = new Date(Date.now());
        const TodayDate = date.toISOString().split("T")[0];

        if (user.status === "suspend" && TodayDate <= suspendDate) {
            try {
                await suspendOwner(user.email, user.first_name, suspendDate);

                return res.status(200).json({
                    success: true,
                    message: "Check your email."
                });

            } catch (e) {
                return res.status(500).json({
                    success: false,
                    message: "Suspend email sending failed. Try again.",
                });
            }
        };

        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${rawToken}`;

        const updateToken = {};
        updateToken.emailVerifyTokenHash = tokenHash;
        updateToken.emailVerifyTokenExpires = new Date(Date.now() + 1000 * 60 * 10);

        const update = await User.findByIdAndUpdate(id, { $set: updateToken });

        if (!update) {
            return res.status(404).json({
                success: false,
                message: "Account not found."
            });
        }

        try {
            await sendVerifyEmail(user.email, verifyUrl);
        } catch (e) {
            return res.status(500).json({
                success: false,
                message: "Verification email sending failed. Try again.",
            });
        }

        res.status(201).json({
            success: true,
            message: "Please check your email to verify."
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Side Error."
        });
    }
};

// get all users except admins
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $in: [1, 2] } }).select("-password");

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No users found."
            });
        }

        res.status(200).json(users);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Side Error."
        });
    }
};

// get all customers
export const getAllCustomers = async (req, res) => {
    try {
        const users = await User.find({ role: 1 }).select("-password");

        if (users.length === 0) {
            return res.status(200).json([]); // Return empty array to avoid frontend crashes
        }

        res.status(200).json(users);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Side Error."
        });
    }
};

// get all vehicle owners
export const getAllOwners = async (req, res) => {
    try {
        const users = await User.find({ role: 2 }).select("-password");
        if (users.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(users);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Side Error."
        });
    }
};

// user details update
export const Updateuser = async (req, res) => {
    try {
        const id = req.user.userid;
        const { first_name, last_name, contactNumber, location, bio } = req.body;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not fount."
            });
        }

        const updateUser = {};
        if (first_name !== undefined) updateUser.first_name = first_name;
        if (last_name !== undefined) updateUser.last_name = last_name;
        if (contactNumber !== undefined) updateUser.contactNumber = contactNumber;
        if (location !== undefined) updateUser.location = location;
        if (bio !== undefined) updateUser.bio = bio;

        // Profile picture update
        if (req.file && req._uploadTempDir) {
            const userId = String(req.user.userid);

            const profileRoot = path.join(process.cwd(), "uploads", "profile");
            const userProfileDir = path.join(profileRoot, userId);

            fs.mkdirSync(userProfileDir, { recursive: true });

            const tempFilePath = path.join(req._uploadTempDir, req.file.filename);

            const finalFileName = `profile${path.extname(req.file.filename)}`;
            const finalPath = path.join(userProfileDir, finalFileName);

            // delete old profile picture if exists
            if (user.profilePicture) {
                const oldPath = path.join(process.cwd(), user.profilePicture);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }

            // move file from temp → permanent
            if (!fs.existsSync(tempFilePath)) {
                console.error("Temp file not found:", tempFilePath);
            } else {
                fs.renameSync(tempFilePath, finalPath);
            }

            updateUser.profilePicture = `uploads/profile/${userId}/${finalFileName}`;
        }

        const update = await User.findByIdAndUpdate(
            id,
            { $set: updateUser }
        );

        if (!update) {
            return res.status(404).json({
                success: false,
                message: "User deatils update failed."
            });
        }

        res.status(200).json({
            success: true,
            message: "User details update successfully.",
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Side Error."
        });
    }
};

// get signin user details
export const getUserDetails = async (req, res) => {
    try {
        const id = req.user.userid;
        const user = await User.findById(id).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "User details fetch successfully.",
            user
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Side Error."
        });
    }
};

// fetch user by ID
export const getUserbyId = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }
        res.status(200).json({
            success: true,
            message: "User details fetch sunccessfully.",
            user
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Side Error."
        });
    }
};

export const OwnerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            });
        };

        const updateUser = {};
        if (status !== undefined) updateUser.status = status;
        updateUser.suspendExpires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // expire within 1 week 

        const onlyDate = updateUser.suspendExpires.toISOString().split("T")[0]; //to catch date 

        const update = await User.findByIdAndUpdate(
            id,
            { $set: updateUser },
            {
                new: true,
                runValidators: true
            }
        );

        if (!update) {
            return res.status(404).json({
                success: false,
                message: "user status update failed."
            });
        }

        try {
            await suspendOwner(user.email, user.first_name, onlyDate);
        } catch (e) {
            return res.status(500).json({
                success: false,
                message: "Suspend email sending failed. Try again.",
            });
        }

        res.status(200).json({
            success: true,
            message: "User status update success fully."
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Side Error."
        });
    }
};

// email notification button turn turn/off seeting update
export const emailNotify = async (req, res) => {
    try {
        const id = req.user.userid;
        const { emailNotify } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const updateUser = await User.findByIdAndUpdate(
            id,
            { $set: { emailNotify: emailNotify } },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updateUser) {
            return res.status(400).json({
                success: false,
                message: "Email notification update faild."
            });
        }
        res.status(200).json({
            success: true,
            message: "Email notification setting update successfully."
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Side Error."
        });
    }
};

// remove user account
export const deleteAccount = async (req, res) => {
    try {
        const id = req.user.userid;
        const deleteAccount = await User.findByIdAndDelete(id);

        if (!deleteAccount) {
            return res.status(400).json({
                success: false,
                message: "Account not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Account deleted successfully."
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Side Error."
        });
    }
};

// remove user account by id (admin part)
export const AdminDeleteAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const deleteAccount = await User.findByIdAndDelete(id);

        if (!deleteAccount) {
            return res.status(400).json({
                success: false,
                message: "Account not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Account deleted successfully."
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Side Error."
        });
    }
};

// password reset process 1- create random 6 digit number and send it to email
export const otp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Account not found."
            });
        }

        const otp = crypto.randomInt(100000, 1000000).toString(); // "100000" - "999999"

        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
        user.resetOtpHash = otpHash;
        user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // expire with in 10 minutes

        await user.save();
        await sendOtpEmail(user.email, user.first_name, otp);
        return res.status(200).json({
            success: true,
            message: "OTP sent to your email.",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Side Error"
        });
    }
};


// OTP verification part
export const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required.",
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        if (!user.resetOtpHash || !user.resetOtpExpires) {
            return res.status(400).json({
                success: false,
                message: "No OTP request found. Please request a new OTP.",
            });
        }

        // check OTP is expired or not
        if (user.resetOtpExpires < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP expired. Please request a new OTP.",
            });
        }

        const otpHash = crypto.createHash("sha256").update(String(otp)).digest("hex");

        // compare OTP code
        if (otpHash !== user.resetOtpHash) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP.",
            });
        }

        // remove otp code from DB
        user.resetOtpHash = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "OTP verification complete.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server Side Error." });
    }
};

// rest password
export const ResetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(404).json({
                success: false,
                message: "fill the password field."
            });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Account not found."
            });
        }

        // check password
        if (!isStrongPassword(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters and include 1 uppercase, 1 lowercase, 1 number, and 1 special character (@ ! # $ % &).",
            });
        }
        if (user.resetOtpExpires < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Please request a new OTP.",
            });
        }
        if (user.resetOtpHash) {
            return res.status(400).json({
                success: false,
                message: "Please verify it is your account first.",
            });
        }

        // hash password
        const hashedPassword = await passwordHash(password);
        // set new password
        user.password = hashedPassword;
        // remove otp code and otp expire date from DB
        user.resetOtpExpires = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password change successfully."
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Side Error."
        });
    }
};