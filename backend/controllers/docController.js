// backend/controllers/docController.js
import Document from "../models/Document.js";
import fs from "fs";
import path from "path";
import { cloudinary, configCloudinary } from "../utils/cloudinary.js";

if (process.env.USE_CLOUDINARY === "true") {
  configCloudinary();
}

/* -------------------------------------------------------
   📌 UPLOAD DOCUMENT (VERCEL SAFE)
--------------------------------------------------------*/
export const uploadDocument = async (req, res) => {
  try {
    const file = req.file;

    const {
      title,
      description,
      type,
      subject,
      course,
      college,
      semester,
      year,
      session,
    } = req.body;

    if (!file) return res.status(400).json({ message: "File is required" });

    const baseName = file.originalname
      ? file.originalname.replace(/\.[^/.]+$/, "")
      : "Untitled";

    const effectiveTitle =
      title && title.trim()
        ? title.trim()
        : subject && subject.trim()
        ? subject.trim()
        : baseName;

    let fileUrl = "";
    let filePublicId = "";

    /* ---------------- CLOUDINARY UPLOAD ---------------- */
    if (process.env.USE_CLOUDINARY === "true" || process.env.VERCEL) {
      await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { resource_type: "raw", folder: "studymantra" },
            (err, result) => {
              if (err) return reject(err);
              fileUrl = result.secure_url;
              filePublicId = result.public_id;
              resolve();
            }
          )
          .end(file.buffer);
      });
    }

    /* ---------------- LOCAL UPLOAD (DEV ONLY) ---------------- */
    else {
      const uploadsDir = path.join(process.cwd(), "uploads");

      // Only create this on localhost; Vercel will fail
      if (!process.env.VERCEL) {
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
      }

      const filename = `${Date.now()}-${file.originalname}`;
      const filepath = path.join(uploadsDir, filename);

      if (!process.env.VERCEL) {
        fs.writeFileSync(filepath, file.buffer);
      }

      const host = req.get("host");
      const protocol = req.protocol;
      fileUrl = `${protocol}://${host}/uploads/${filename}`;
    }

    if (type === "paper" && (!session || !String(session).includes("-"))) {
      return res.status(400).json({
        message: "Session is required for papers (e.g., 2022-2023)",
      });
    }

    const newDoc = new Document({
      title: effectiveTitle,
      description,
      type,
      subject,
      course,
      college,
      semester,
      year,
      session,
      fileUrl,
      filePublicId,
      contributor: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
      },
    });

    await newDoc.save();

    res.json({ message: "Document uploaded successfully", document: newDoc });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/* -------------------------------------------------------
   📌 GET ALL DOCUMENTS
--------------------------------------------------------*/
export const getAllDocuments = async (req, res) => {
  try {
    const { type, course, college, subject, semester, year, session } =
      req.query;

    const filter = {};

    if (type) filter.type = type;
    if (course) filter.course = course;
    if (college) filter.college = college;
    if (subject) filter.subject = subject;
    if (semester) filter.semester = semester;
    if (year) filter.year = Number(year);
    if (session) filter.session = session;

    const docs = await Document.find(filter).sort({ createdAt: -1 });

    res.json(docs);
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/* -------------------------------------------------------
   📌 GET DOCUMENTS BY USER
--------------------------------------------------------*/
export const getDocumentsByUser = async (req, res) => {
  try {
    const docs = await Document.find({ "contributor.id": req.user.id }).sort({
      createdAt: -1,
    });

    res.json(docs);
  } catch (err) {
    console.error("User Docs Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/* -------------------------------------------------------
   📌 GET DOCUMENT BY ID
--------------------------------------------------------*/
export const getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    res.json(doc);
  } catch (err) {
    console.error("Single Doc Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/* -------------------------------------------------------
   ⭐ RATE DOCUMENT
--------------------------------------------------------*/
export const rateDocument = async (req, res) => {
  try {
    const docId = req.params.id;
    const value = Number(req.body.value);

    if (!value || value < 1 || value > 5) {
      return res.status(400).json({ message: "Rating must be 1-5" });
    }

    const userId = req.user.id;
    const doc = await Document.findById(docId);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const existingIndex = doc.ratings.findIndex((r) => r.userId === userId);

    if (existingIndex > -1) {
      doc.ratings[existingIndex].value = value;
    } else {
      doc.ratings.push({ userId, value });
    }

    const total = doc.ratings.reduce((sum, r) => sum + r.value, 0);
    doc.ratingsCount = doc.ratings.length;
    doc.avgRating = Number((total / doc.ratingsCount).toFixed(2));

    await doc.save();
    res.json({ message: "Rating updated", document: doc });
  } catch (err) {
    console.error("Rating Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/* -------------------------------------------------------
   ❌ DELETE DOCUMENT
--------------------------------------------------------*/
export const deleteDocument = async (req, res) => {
  try {
    const docId = req.params.id;
    const doc = await Document.findById(docId);

    if (!doc) return res.status(404).json({ message: "Document not found" });

    if (!req.user || String(doc.contributor?.id) !== String(req.user.id)) {
      return res.status(403).json({ message: "You can only delete your own document" });
    }

    if (process.env.USE_CLOUDINARY === "true" && doc.filePublicId) {
      await cloudinary.api.delete_resources([doc.filePublicId], {
        resource_type: "raw",
      });
    }

    await Document.findByIdAndDelete(docId);

    res.json({ message: "Document deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/* -------------------------------------------------------
   ✏️ UPDATE DOCUMENT
--------------------------------------------------------*/
export const updateDocument = async (req, res) => {
  try {
    const docId = req.params.id;
    const doc = await Document.findById(docId);

    if (!doc) return res.status(404).json({ message: "Document not found" });

    if (!req.user || String(doc.contributor?.id) !== String(req.user.id)) {
      return res.status(403).json({ message: "You can only update your own document" });
    }

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
    console.error("Update Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
