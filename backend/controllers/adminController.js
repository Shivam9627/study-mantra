import Document from "../models/Document.js";
import User from "../models/User.js";
import { cloudinary } from "../utils/cloudinary.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    console.error("Admin getAllUsers error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getAllDocumentsAdmin = async (req, res) => {
  try {
    const docs = await Document.find().sort({ createdAt: -1 });
    res.json({ documents: docs });
  } catch (err) {
    console.error("Admin getAllDocuments error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteDocumentAdmin = async (req, res) => {
  try {
    const docId = req.params.id;
    const doc = await Document.findById(docId);

    if (!doc) return res.status(404).json({ message: "Document not found" });

    if (process.env.USE_CLOUDINARY === "true" && doc.filePublicId) {
      await cloudinary.api.delete_resources([doc.filePublicId], { resource_type: "raw" });
    }

    await Document.findByIdAndDelete(docId);
    res.json({ message: "Document deleted successfully" });
  } catch (err) {
    console.error("Admin deleteDocument error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateDocumentAdmin = async (req, res) => {
  try {
    const docId = req.params.id;
    const doc = await Document.findById(docId);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const allowedFields = [
      "title",
      "description",
      "type",
      "subject",
      "course",
      "college",
      "semester",
      "year",
      "session",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        doc[field] = req.body[field];
      }
    });

    await doc.save();
    res.json({ message: "Document updated", document: doc });
  } catch (err) {
    console.error("Admin updateDocument error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const sendWarningToUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Warning message is required" });
    }

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      {
        $push: {
          warnings: {
            message: message.trim(),
            issuedBy: req.user?.email || "admin",
          },
        },
      },
      { new: true, upsert: true }
    );

    res.json({ message: "Warning sent", user });
  } catch (err) {
    console.error("Admin warning error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteUserLocal = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findOneAndDelete({ clerkId: userId });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User removed from local project data" });
  } catch (err) {
    console.error("Admin deleteUser error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
