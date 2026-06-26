import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import notesRoutes from "./routes/notesRoutes.js";
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";
import { clerkAuth } from "./middleware/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// ── CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(rateLimiter);
app.use(clerkAuth); // attaches Clerk auth info to every request

// ── Routes ─────────────────────────────────────────────────────────────────
app.use("/api/notes", notesRoutes);

// ── Production static ──────────────────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../Frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/dist/index.html"));
  });
}

connectDB().then(() => {
  app.listen(PORT, () => console.log("Server started on PORT:", PORT));
});
