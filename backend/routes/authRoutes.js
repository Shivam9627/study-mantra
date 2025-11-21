// routes/authRoutes.js
import express from "express";
import { verifyUser } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/auth/me
router.get("/me", requireAuth, verifyUser);

export default router;
