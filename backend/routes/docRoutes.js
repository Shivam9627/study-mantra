// backend/routes/docRoutes.js
import express from "express";
import multer from "multer";
import {
  uploadDocument,
  getAllDocuments,
  getDocumentsByUser,
  deleteDocument,
  getDocumentById,
  rateDocument,
  updateDocument,
} from "../controllers/docController.js";

import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer memory storage for Cloudinary streaming
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

// PUBLIC ROUTES
router.get("/", getAllDocuments);

// PRIVATE ROUTES (specific paths first to avoid being captured by /:id)
router.get("/user/my", requireAuth, getDocumentsByUser);
router.post("/upload", requireAuth, upload.single("file"), uploadDocument);
router.put("/:id", requireAuth, updateDocument);
router.post("/:id/rate", requireAuth, rateDocument);
router.delete("/:id", requireAuth, deleteDocument);

// PUBLIC: parameterized route last
router.get("/:id", getDocumentById);

export default router;
