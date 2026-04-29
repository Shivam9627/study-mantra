// backend/models/User.js
import mongoose from "mongoose";

const WarningSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    issuedBy: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, unique: true, required: true },
  name: { type: String },
  email: { type: String },
  isAdmin: { type: Boolean, default: false },
  warnings: { type: [WarningSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", UserSchema);
