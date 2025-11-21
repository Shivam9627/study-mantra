import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";

import authRoutes from "./routes/authRoutes.js";
import docRoutes from "./routes/docRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();
connectDB();

const app = express();

// ---------- CORS POLICY ----------
const allowedOrigins = [
  "https://your-frontend-domain.com", // production domain - replace when deploying
];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (like curl) where origin may be undefined
      if (!origin) return callback(null, true);

      // Allow any localhost port in development
      if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);

      // Allow specific production origins
      if (allowedOrigins.includes(origin)) return callback(null, true);

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ---------- BASIC RATE LIMIT ----------
const limiter = rateLimit({ windowMs: 60 * 1000, max: 100 });
app.use(limiter);

// ---------- MIDDLEWARE ----------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve local uploads when USE_CLOUDINARY is false
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  try { fs.mkdirSync(uploadsDir); } catch (_) {}
}
app.use("/uploads", express.static(uploadsDir));

// ---------- ROUTES ----------
app.use("/api/auth", authRoutes);
app.use("/api/docs", docRoutes);
app.use("/api/ai", aiRoutes);

// ---------- DEFAULT ----------
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// ---------- START SERVER ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
