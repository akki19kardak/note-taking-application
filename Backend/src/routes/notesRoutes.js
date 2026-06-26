import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getAllNotes,
  getTrashedNotes,
  getNoteById,
  getSharedNote,
  createNote,
  updateNote,
  softDeleteNote,
  restoreNote,
  permanentDelete,
  emptyTrash,
  toggleShareLink,
} from "../controllers/notesControllers.js";

const router = express.Router();

// ── Public (no auth) ──────────────────────────────────────────────────────
router.get("/shared/:shareId", getSharedNote);

// ── Protected (must be signed in) ─────────────────────────────────────────
router.get(    "/",              requireAuth, getAllNotes);
router.get(    "/trash",         requireAuth, getTrashedNotes);
router.get(    "/:id",           requireAuth, getNoteById);
router.post(   "/",              requireAuth, createNote);
router.put(    "/:id",           requireAuth, updateNote);
router.delete( "/:id",           requireAuth, softDeleteNote);
router.patch(  "/:id/restore",   requireAuth, restoreNote);
router.delete( "/:id/permanent", requireAuth, permanentDelete);
router.delete( "/trash/empty",   requireAuth, emptyTrash);
router.patch(  "/:id/share",     requireAuth, toggleShareLink);

export default router;
