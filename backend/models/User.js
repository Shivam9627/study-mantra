// backend/models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, unique: true, required: true },
  name: { type: String },
  email: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", UserSchema);
