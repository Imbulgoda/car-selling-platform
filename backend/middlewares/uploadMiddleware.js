import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Create a unique temp folder per request
const makeTempKey = () => {
  // Node 18+ supports randomUUID
  if (crypto.randomUUID) return crypto.randomUUID();
  // fallback
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadRoot = path.join(process.cwd(), "uploads");
    const tempRoot = path.join(uploadRoot, "_temp");

    // Create uploads/_temp if not exists
    fs.mkdirSync(tempRoot, { recursive: true });

    // Create a unique folder per request
    if (!req._uploadTempKey) req._uploadTempKey = makeTempKey();
    const tempDir = path.join(tempRoot, req._uploadTempKey);

    fs.mkdirSync(tempDir, { recursive: true });

    // expose to controller
    req._uploadTempDir = tempDir;

    cb(null, tempDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) return cb(null, true);
  cb(new Error("Only image files are allowed!"), false);
};

const documentFileFilter = (req, file, cb) => {
  if (
    file.mimetype === "application/pdf" ||
    (file.mimetype && file.mimetype.startsWith("image/"))
  ) {
    return cb(null, true);
  }
  cb(new Error("Only PDF or image files are allowed!"), false);
};

export const uploadVehiclePhotos = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB each
});

export const uploadBookingDocuments = multer({
  storage,
  fileFilter: documentFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB each
});