import express from "express";
import {
  getAllUsers,
  getAllDocumentsAdmin,
  deleteDocumentAdmin,
  updateDocumentAdmin,
  sendWarningToUser,
  deleteUserLocal,
} from "../controllers/adminController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/users", getAllUsers);
router.get("/docs", getAllDocumentsAdmin);
router.put("/docs/:id", updateDocumentAdmin);
router.delete("/docs/:id", deleteDocumentAdmin);
router.post("/users/:id/warning", sendWarningToUser);
router.delete("/users/:id", deleteUserLocal);

export default router;
