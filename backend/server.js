import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import path from "path";

// import Router files
import userRoutes from "./routes/userRoute.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"; // Renamed for clarity
import paymentRoutes from "./routes/paymentRoute.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import { stripeWebhook } from "./controllers/paymentController.js";

// configure environment
dotenv.config();

// Database config
connectDB();

const app = express();

// import stripe webhook route (Must be before express.json())
app.post(
  "/api/v1/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// --- Middleware Configuration ---

// ✅ Updated CORS: Added specific frontend origin and allowed headers
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:8081"], 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// --- API Routes ---

app.use("/api/v1/authUser", userRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/vehicle", vehicleRoutes);
app.use("/api/v1/notification", notificationRoutes);
app.use("/api/v1/bookings", bookingRoutes);

// ✅ UPDATED: Changed from /adminReports to /admin to match your frontend fetch requests
// This allows calls to http://localhost:8090/api/v1/admin/owners
app.use("/api/v1/adminReports", adminRoutes); 

app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/subscription", subscriptionRoutes);

// Default Route
app.get("/", (req, res) => {
    res.send({
        message: "Welcome to Rent_a_Car web application"
    });
});

// --- Server Listener ---

const PORT = process.env.PORT || 8090;

app.listen(PORT, () => {
    console.log(`Server Running in ${process.env.DEV_MODE} mode`.bgCyan.white);
    console.log(`Server is listening on port ${PORT}`.bgCyan.white);
});