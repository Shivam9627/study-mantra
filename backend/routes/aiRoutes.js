import express from "express";
import { chatWithGroq } from "../controllers/aiController.js";

const router = express.Router();

router.post("/chat", chatWithGroq);

export default router;