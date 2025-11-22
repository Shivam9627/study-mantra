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

// --------------------- CORS ---------------------
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://study-mantra-frontend.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS blocked: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// --------------------- RATE LIMIT ---------------------
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 200,
  })
);

// --------------------- BODY PARSER ---------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// --------------------- STATIC FILES ---------------------
// Only create /uploads locally (NOT on Vercel)
if (!process.env.VERCEL) {
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    try {
      fs.mkdirSync(uploadsDir);
    } catch (err) {
      console.error("Error creating uploads folder:", err.message);
    }
  }
  app.use("/uploads", express.static(uploadsDir));
} else {
  console.log("Production mode → Skipping local uploads folder");
}

// --------------------- ROUTES ---------------------
app.use("/api/auth", authRoutes);
app.use("/api/docs", docRoutes);
app.use("/api/ai", aiRoutes);

// --------------------- DEFAULT ---------------------
app.get("/", (req, res) => {
  res.send("Backend running ✔ Vercel mode=" + (process.env.VERCEL ? "true" : "false"));
});

// --------------------- EXPORT FOR VERCEL ---------------------
export default app;

// --------------------- LOCAL RUN ONLY ---------------------
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`Local server running → http://localhost:${PORT}`)
  );
}
