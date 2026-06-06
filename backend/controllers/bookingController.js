import Booking from "../models/Booking.js";
import Vehicle from "../models/Vehicle.js";
import path from "path";
import fs from "fs";
import { notifyBooking,notifyNewBookingRequest,notifyBookingUpdated,notifyBookingCancelled } from "../controllers/notificationController.js";

const normalizeDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const calculateTotalAmount = (startDate, endDate, dailyRate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    const days = Math.max(1, Math.ceil(diffMs / dayMs));
    return days * dailyRate;
};

const canAccessBooking = (booking, user) => {
    if (!booking || !user) return false;
    if (user.role === 3) return true;
    const userId = String(user.userid);
    return String(booking.customerId) === userId || String(booking.ownerId) === userId;
};

const removeDirSafe = (dirPath) => {
    try {
        if (dirPath && fs.existsSync(dirPath)) {
            fs.rmSync(dirPath, { recursive: true, force: true });
        }
    } catch (_) {}
};

const getSafeFileName = (originalName) => {
    const baseName = path.basename(originalName || "document");
    return baseName.replace(/[\\/]/g, "_");
};

const buildBookingDocumentUrls = (booking) => {
    const bookingId = booking?._id?.toString();
    if (!bookingId) return [];
    return (booking.documents || []).map(
        (name) => `/uploads/bookings/${bookingId}/${encodeURIComponent(name)}`
    );
};

export const createBooking = async (req, res) => {
    let booking = null;
    let destDir = null;

    try {
        const { startingDate, endDate, documents, vehicleId } = req.body;
        const customerId = req.user?.userid;

        if (!startingDate || !endDate || !vehicleId) {
            return res.status(400).json({
                success: false,
                message: "startingDate, endDate, and vehicleId are required",
            });
        }

        const start = normalizeDate(startingDate);
        const end = normalizeDate(endDate);
        if (!start || !end || end <= start) {
            return res.status(400).json({
                success: false,
                message: "End date must be after starting date",
            });
        }

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        if (vehicle.status !== "Approved") {
            return res.status(400).json({
                success: false,
                message: "Vehicle is not approved for booking",
            });
        }

        const dailyRate =
            vehicle.pricePerDay ??
            vehicle.amount ??
            (typeof vehicle.get === "function" ? vehicle.get("amount") : undefined) ??
            vehicle._doc?.amount;

        if (dailyRate === null || dailyRate === undefined) {
            return res.status(400).json({
                success: false,
                message: "Vehicle price is not set",
            });
        }

        const overlap = await Booking.findOne({
            vehicleId,
            status: { $nin: ["rejected", "cancelled"] },
            startingDate: { $lte: endDate },
            endDate: { $gte: startingDate },
        });

        if (overlap) {
            return res.status(409).json({
                success: false,
                message: "Vehicle is already booked for the selected dates",
            });
        }

        booking = new Booking({
            startingDate,
            endDate,
            documents: [],
            customerId,
            vehicleId,
            ownerId: vehicle.ownerId,
            dailyRate,
            totalAmount: calculateTotalAmount(start, end, dailyRate),
        });

        const uploadRoot = path.join(process.cwd(), "uploads");
        destDir = path.join(uploadRoot, "bookings", booking._id.toString());

        const uploadedDocuments = [];

        if (req.files?.length) {
            fs.mkdirSync(destDir, { recursive: true });

            for (const file of req.files) {
                const safeName = getSafeFileName(file.originalname);
                const ext = path.extname(safeName);
                const base = path.basename(safeName, ext);

                let finalName = safeName;
                let counter = 1;
                while (fs.existsSync(path.join(destDir, finalName))) {
                    finalName = `${base}-${counter}${ext}`;
                    counter += 1;
                }

                fs.renameSync(file.path, path.join(destDir, finalName));
                uploadedDocuments.push(finalName);
            }
        }

        const bodyDocuments = Array.isArray(documents)
            ? documents
            : documents
            ? [documents]
            : [];

        booking.documents = uploadedDocuments.length ? uploadedDocuments : bodyDocuments;
        await booking.save();

        // Notify owner (notification + email)
        try {
        await notifyNewBookingRequest(booking._id);
        } catch (err) {
        console.error("Booking notification error:", err.message);
        }


        if (req._uploadTempDir) removeDirSafe(req._uploadTempDir);

        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: booking,
        });
    } catch (error) {
        if (req._uploadTempDir) removeDirSafe(req._uploadTempDir);
        if (destDir) removeDirSafe(destDir);
        return res.status(500).json({
            success: false,
            message: "Error creating booking",
            error: error.message,
        });
    }
};

export const getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("customerId", "first_name last_name email")
            .populate("ownerId", "first_name last_name email")
            .populate("vehicleId", "title model numberPlate")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Bookings fetched successfully",
            data: bookings,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching bookings",
            error: error.message,
        });
    }
};

export const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        if (!canAccessBooking(booking, req.user)) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        const bookingData = booking.toObject();
        bookingData.documentUrls = buildBookingDocumentUrls(booking);

        return res.status(200).json({
            success: true,
            message: "Booking fetched successfully",
            data: bookingData,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching booking",
            error: error.message,
        });
    }
};

export const updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { startingDate, endDate, documents, status } = req.body;

        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        if (!canAccessBooking(booking, req.user)) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        const nextStartingDate = startingDate ?? booking.startingDate;
        const nextEndDate = endDate ?? booking.endDate;

        if (nextEndDate <= nextStartingDate) {
            return res.status(400).json({
                success: false,
                message: "End date must be after starting date",
            });
        }

        const overlap = await Booking.findOne({
            _id: { $ne: id },
            vehicleId: booking.vehicleId,
            status: { $nin: ["rejected", "cancelled"] },
            startingDate: { $lte: nextEndDate },
            endDate: { $gte: nextStartingDate },
        });

        if (overlap) {
            return res.status(409).json({
                success: false,
                message: "Vehicle is already booked for the selected dates",
            });
        }

        const uploadedDocuments = [];
        if (req.files?.length) {
            const uploadRoot = path.join(process.cwd(), "uploads");
            const destDir = path.join(uploadRoot, "bookings", booking._id.toString());

            if (fs.existsSync(destDir)) {
                fs.rmSync(destDir, { recursive: true, force: true });
            }

            fs.mkdirSync(destDir, { recursive: true });

            const nameCounts = new Map();

            for (const file of req.files) {
                const safeName = getSafeFileName(file.originalname);
                const ext = path.extname(safeName);
                const base = path.basename(safeName, ext);

                const count = nameCounts.get(safeName) ?? 0;
                nameCounts.set(safeName, count + 1);

                const finalName = count === 0 ? safeName : `${base}-${count}${ext}`;

                fs.renameSync(file.path, path.join(destDir, finalName));
                uploadedDocuments.push(finalName);
            }
        }

        let parsedDocuments = documents;
        if (typeof documents === "string") {
            try {
                parsedDocuments = JSON.parse(documents);
            } catch (_) {
                parsedDocuments = documents;
            }
        }

        const bodyDocuments = Array.isArray(parsedDocuments)
            ? parsedDocuments
            : parsedDocuments
            ? [parsedDocuments]
            : undefined;

        if (startingDate !== undefined) booking.startingDate = startingDate;
        if (endDate !== undefined) booking.endDate = endDate;

        if (bodyDocuments !== undefined || uploadedDocuments.length) {
            booking.documents = uploadedDocuments.length
                ? uploadedDocuments
                : bodyDocuments ?? [];
        }

        if (status !== undefined) booking.status = status;

        if (startingDate !== undefined || endDate !== undefined) {
            booking.totalAmount = calculateTotalAmount(
                booking.startingDate,
                booking.endDate,
                booking.dailyRate
            );
        }

        await booking.save();

        // --- Notification & Email (Customer updated booking) ---
        try {
            if (
                startingDate !== undefined ||
                endDate !== undefined ||
                uploadedDocuments.length
            ) {
                await notifyBookingUpdated(booking._id);
            }
        } catch (err) {
            console.error("Booking update notification error:", err.message);
        }


        if (req._uploadTempDir) removeDirSafe(req._uploadTempDir);

        const bookingData = booking.toObject();
        bookingData.documentUrls = buildBookingDocumentUrls(booking);

        return res.status(200).json({
            success: true,
            message: "Booking updated successfully",
            data: bookingData,
        });
    } catch (error) {
        if (req._uploadTempDir) removeDirSafe(req._uploadTempDir);
        return res.status(500).json({
            success: false,
            message: "Error updating booking",
            error: error.message,
        });
    }
};

export const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        if (!canAccessBooking(booking, req.user)) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        await booking.deleteOne();

        // --- Notification & Email ---
        try {
        await notifyBookingCancelled(booking._id);
        } catch (err) {
        console.error("Booking deletion notification error:", err.message);
        }


        return res.status(200).json({
            success: true,
            message: "Booking deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error deleting booking",
            error: error.message,
        });
    }
};

export const approveBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerId = req.user?.userid;

        const booking = await Booking.findOneAndUpdate(
            { _id: id, ownerId, status: "pending" },
            { status: "approved" },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Pending booking not found for this owner",
            });
        }

        // --- Notification & Email ---
        try {
            await notifyBooking({ type: "approved", bookingId: booking._id });
        } catch (err) {
            console.error("Error sending booking notification/email:", err.message);
        }

        return res.status(200).json({
            success: true,
            message: "Booking approved successfully",
            data: booking,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error approving booking",
            error: error.message,
        });
    }
};

export const rejectBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerId = req.user?.userid;

        const booking = await Booking.findOneAndUpdate(
            { _id: id, ownerId, status: "pending" },
            { status: "rejected" },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Pending booking not found for this owner",
            });
        }

        // --- Notification & Email ---
        try {
            await notifyBooking({ type: "rejected", bookingId: booking._id });
        } catch (err) {
            console.error("Error sending booking notification/email:", err.message);
        }


        return res.status(200).json({
            success: true,
            message: "Booking rejected successfully",
            data: booking,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error rejecting booking",
            error: error.message,
        });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const customerId = req.user?.userid;

        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        if (String(booking.customerId) !== String(customerId)) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        if (booking.status === "rejected" || booking.status === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Booking cannot be cancelled",
            });
        }

        booking.status = "cancelled";
        await booking.save();

        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
            data: booking,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error cancelling booking",
            error: error.message,
        });
    }
};

export const searchVehicles = async (req, res) => {
    try {
        const {
            location,
            type,
            minPrice,
            maxPrice,
            startDate,
            endDate,
            fuelType,
            year,
            model,
            title,
        } = req.query;

        const filter = {
            status: "Approved",
        };

        if (location) {
            filter.location = { $regex: location, $options: "i" };
        }

        if (type) {
            filter.vehicleType = { $regex: type, $options: "i" };
        }

        if (fuelType) {
            filter.fuelType = fuelType;
        }

        if (year) {
            filter.year = Number(year);
        }

        if (model) {
            filter.model = { $regex: model, $options: "i" };
        }

        if (title) {
            filter.title = { $regex: title, $options: "i" };
        }

        if (minPrice || maxPrice) {
            filter.amount = {};
            if (minPrice) filter.amount.$gte = Number(minPrice);
            if (maxPrice) filter.amount.$lte = Number(maxPrice);
        }

        const start = startDate ? normalizeDate(startDate) : null;
        const end = endDate ? normalizeDate(endDate) : null;

        if (start && end && end > start) {
            const bookedVehicleIds = await Booking.distinct("vehicleId", {
                status: { $nin: ["rejected", "cancelled"] },
                startingDate: { $lte: end },
                endDate: { $gte: start },
            });

            if (bookedVehicleIds.length) {
                filter._id = { $nin: bookedVehicleIds };
            }
        }

        const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Vehicles fetched successfully",
            data: vehicles,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error searching vehicles",
            error: error.message,
        });
    }
};

export const getVehicleAvailability = async (req, res) => {
    try {
        const { vehicleId } = req.params;

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        const bookings = await Booking.find({
            vehicleId,
            status: { $nin: ["rejected", "cancelled"] },
        })
            .select("startingDate endDate status")
            .sort({ startingDate: 1 });

        return res.status(200).json({
            success: true,
            message: "Availability fetched successfully",
            data: bookings,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching availability",
            error: error.message,
        });
    }
};

export const getCustomerBookings = async (req, res) => {
    try {
        const customerId = req.user?.userid;
        const { customerId: paramCustomerId } = req.params;
        const { type, status } = req.query;

        if (paramCustomerId && String(paramCustomerId) !== String(customerId)) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        const filter = { customerId };
        if (status) filter.status = status;

        const now = new Date();
        if (type === "past") {
            filter.endDate = { $lt: now };
        } else if (type === "upcoming") {
            filter.endDate = { $gte: now };
        }

        const bookings = await Booking.find(filter)
            .populate("ownerId", "first_name last_name contactNumber")
            .sort({ startingDate: -1 });

        return res.status(200).json({
            success: true,
            message: "Customer bookings fetched successfully",
            data: bookings,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching customer bookings",
            error: error.message,
        });
    }
};

export const getOwnerBookings = async (req, res) => {
    try {
        const ownerId = req.user?.userid;
        console.log(ownerId)
        const { ownerId: paramOwnerId } = req.params;
        const { status } = req.query;

        if (paramOwnerId && String(paramOwnerId) !== String(ownerId)) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        const filter = { ownerId };
        if (status) filter.status = status;

        const bookings = await Booking.find(filter)
            .populate("customerId", "first_name last_name email contactNumber")
            .populate("vehicleId")
            .sort({ startingDate: -1 });

        return res.status(200).json({
            success: true,
            message: "Owner bookings fetched successfully",
            data: bookings,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching owner bookings",
            error: error.message,
        });
    }
};

export const getOwnerEarnings = async (req, res) => {
    try {
        const ownerId = req.user?.userid;
        const { ownerId: paramOwnerId } = req.params;
        const { startDate, endDate } = req.query;

        if (paramOwnerId && String(paramOwnerId) !== String(ownerId)) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        const filter = { ownerId, status: "approved" };
        const start = startDate ? normalizeDate(startDate) : null;
        const end = endDate ? normalizeDate(endDate) : null;

        if (start && end && end > start) {
            filter.startingDate = { $gte: start };
            filter.endDate = { $lte: end };
        }

        const earnings = await Booking.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalEarnings: { $sum: "$totalAmount" },
                    totalBookings: { $sum: 1 },
                },
            },
        ]);

        const summary = earnings[0] || { totalEarnings: 0, totalBookings: 0 };

        return res.status(200).json({
            success: true,
            message: "Owner earnings fetched successfully",
            data: summary,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching owner earnings",
            error: error.message,
        });
    }
};



// Owner personal use 
export const onwerPersonalUseBooking = async (req, res) => {
    try {
        const { vehicleId, startingDate, endDate } = req.body;
        const ownerId = req.user?.userid;

        if (!vehicleId || !startingDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "vehicleId, startingDate, and endDate are required",
            });
        }

        const start = new Date(startingDate);
        const end = new Date(endDate);

        if (end <= start) {
            return res.status(400).json({
                success: false,
                message: "End date must be after starting date",
            });
        }

        const vehicle = await Vehicle.findById(vehicleId);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        if (String(vehicle.ownerId) !== String(ownerId)) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        const overlap = await Booking.findOne({
            vehicleId,
            status: { $nin: ["rejected", "cancelled"] },
            startingDate: { $lte: end },
            endDate: { $gte: start },
        });

        if (overlap) {
            return res.status(409).json({
                success: false,
                message: "Vehicle is already booked for the selected dates",
            });
        }

        const booking = await Booking.create({
            vehicleId,
            ownerId,
            customerId: ownerId,
            startingDate: start,
            endDate: end,
            dailyRate: 0,
            totalAmount: 0,
            status: "approved",
        });

        return res.status(201).json({
            success: true,
            message: "Vehicle blocked for personal use successfully",
            data: booking,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error creating personal use booking",
            error: error.message,
        });
    }
}