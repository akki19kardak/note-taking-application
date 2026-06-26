import { clerkMiddleware, getAuth } from "@clerk/express";

// Attach Clerk to every request
export const clerkAuth = clerkMiddleware();

// Protect routes — must be signed in
export function requireAuth(req, res, next) {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  req.userId = userId;
  next();
}

// Public routes — attach userId if present, continue either way
export function optionalAuth(req, res, next) {
  const { userId } = getAuth(req);
  req.userId = userId || null;
  next();
}
