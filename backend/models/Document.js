// backend/models/Document.js
import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  value: { type: Number, required: true }, // 1..5
}, { _id: false });

const DocumentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ["notes", "paper"], default: "notes" },
  subject: { type: String },
  course: { type: String },
  college: { type: String },
  semester: { type: String },
  year: { type: Number },
  session: { type: String },
  fileUrl: { type: String, required: true },
  filePublicId: { type: String }, // cloudinary public id (optional)
  contributor: {
    id: { type: String },
    name: { type: String },
    email: { type: String }
  },
  ratings: { type: [RatingSchema], default: [] },
  avgRating: { type: Number, default: 0 },
  ratingsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Document", DocumentSchema);
