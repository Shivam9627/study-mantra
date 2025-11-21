import User from "../models/User.js";

/**
 * Optionally sync user from frontend (or Clerk webhooks can be used later)
 * For now this endpoint accepts basic user info and stores/updates it.
 */
export const upsertUser = async (req, res) => {
  try {
    const { id, name, email } = req.body;
    if (!id || !email) {
      return res.status(400).json({ message: "id and email required" });
    }

    const user = await User.findOneAndUpdate(
      { clerkId: id },
      { name, email, clerkId: id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ user });
  } catch (err) {
    console.error("upsertUser error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const verifyUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return res.json({ user: req.user });
  } catch (err) {
    console.error("verifyUser error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
