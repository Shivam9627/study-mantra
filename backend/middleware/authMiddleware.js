// backend/middleware/authMiddleware.js
import dotenv from "dotenv";
dotenv.config();

/**
 * requireAuth:
 * - If CLERK_SECRET_KEY present -> attempts to verify via @clerk/backend
 * - If not authenticated or Clerk fails -> dev fallback expects x-user-id and x-user-email headers
 *
 * requireAdmin:
 * - Checks req.user.publicMetadata.isAdmin (Clerk)
 * - Or dev header x-user-admin: true
 */

export const requireAuth = async (req, res, next) => {
  try {
    let clerkTried = false;
    let clerkAuthenticated = false;

    // If Clerk secret is set, try to verify the request using @clerk/backend
    if (process.env.CLERK_SECRET_KEY) {
      try {
        const { createClerkClient } = await import("@clerk/backend");
        const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        clerkTried = true;

        const authResult = await clerkClient.authenticateRequest(req);
        if (authResult && authResult.isAuthenticated) {
          clerkAuthenticated = true;

          const userId = authResult.userId || (authResult.session && authResult.session.user_id);
          if (!userId) {
            req.user = { id: null, email: null, name: null, publicMetadata: {} };
            return next();
          }

          const userObj = await clerkClient.users.getUser(userId);
          const email =
            (userObj.emailAddresses && userObj.emailAddresses[0]?.emailAddress) ||
            userObj.primaryEmailAddress?.emailAddress ||
            null;

          req.user = {
            id: userObj.id,
            email,
            name: userObj.firstName ? `${userObj.firstName} ${userObj.lastName || ""}`.trim() : userObj.fullName || userObj.username || "",
            publicMetadata: userObj.publicMetadata || {},
          };

          return next();
        }
        // If not authenticated, fall through to dev fallback below
      } catch (clerkErr) {
        console.warn("Clerk verification failed or @clerk/backend not installed:", clerkErr.message || clerkErr);
      }
    }

    // DEV fallback mode: expect x-user-id and x-user-email headers
    const userId = req.header("x-user-id");
    const userEmail = req.header("x-user-email");
    const userName = req.header("x-user-name") || req.header("x-user-fullname") || "Unknown";

    if (userId && userEmail) {
      req.user = { id: userId, email: userEmail, name: userName, publicMetadata: {} };
      return next();
    }

    // If Clerk was attempted and not authenticated, and dev headers missing → 401
    if (clerkTried && !clerkAuthenticated) {
      return res.status(401).json({
        message: "Unauthorized. Send a valid Clerk token in Authorization header or provide x-user-id and x-user-email headers in dev mode.",
      });
    }

    // No Clerk configured → require dev headers
    return res.status(401).json({
      message: "Unauthorized. Provide x-user-id and x-user-email headers for dev mode, or set CLERK_SECRET_KEY and send Clerk session token.",
    });
  } catch (err) {
    console.error("requireAuth error:", err);
    res.status(401).json({ message: "Unauthorized", error: err.message || err });
  }
};

export const requireAdmin = (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    // Clerk public metadata admin flag
    if (user.publicMetadata && user.publicMetadata.isAdmin) return next();

    const adminHeader = (req.header("x-user-admin") || "").toLowerCase();
    if (adminHeader === "true") return next();

    return res.status(403).json({ message: "Forbidden: admin only" });
  } catch (err) {
    console.error("requireAdmin error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
