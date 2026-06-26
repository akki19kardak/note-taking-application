import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getAllNotes, getTrashedNotes, getArchivedNotes,
  getNoteById, getSharedNote,
  createNote, updateNote,
  softDeleteNote, restoreNote, permanentDelete, emptyTrash,
  archiveNote, unarchiveNote,
  toggleShareLink,
} from "../controllers/notesControllers.js";

const router = express.Router();

// Public
router.get("/shared/:shareId", getSharedNote);

// Protected
router.get(    "/",               requireAuth, getAllNotes);
router.get(    "/trash",          requireAuth, getTrashedNotes);
router.get(    "/archive",        requireAuth, getArchivedNotes);
router.get(    "/:id",            requireAuth, getNoteById);
router.post(   "/",               requireAuth, createNote);
router.put(    "/:id",            requireAuth, updateNote);
router.delete( "/:id",            requireAuth, softDeleteNote);
router.patch(  "/:id/restore",    requireAuth, restoreNote);
router.delete( "/:id/permanent",  requireAuth, permanentDelete);
router.delete( "/trash/empty",    requireAuth, emptyTrash);
router.patch(  "/:id/archive",    requireAuth, archiveNote);
router.patch(  "/:id/unarchive",  requireAuth, unarchiveNote);
router.patch(  "/:id/share",      requireAuth, toggleShareLink);

export default router;
