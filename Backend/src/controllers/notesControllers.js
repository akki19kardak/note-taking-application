import Note from "../models/Note.js";
import { nanoid } from "nanoid";

// ── GET all active (not deleted, not archived) ───────────────────────────────
export async function getAllNotes(req, res) {
  try {
    const notes = await Note.find({ userId: req.userId, deleted: false, archived: false })
      .sort({ updatedAt: -1 });
    res.status(200).json(notes);
  } catch (e) { res.status(500).json({ message: "Internal server error" }); }
}

// ── GET trash ──────────────────────────────────────────────────────────────
export async function getTrashedNotes(req, res) {
  try {
    const notes = await Note.find({ userId: req.userId, deleted: true }).sort({ deletedAt: -1 });
    res.status(200).json(notes);
  } catch (e) { res.status(500).json({ message: "Internal server error" }); }
}

// ── GET archive ─────────────────────────────────────────────────────────────
export async function getArchivedNotes(req, res) {
  try {
    const notes = await Note.find({ userId: req.userId, archived: true, deleted: false })
      .sort({ archivedAt: -1 });
    res.status(200).json(notes);
  } catch (e) { res.status(500).json({ message: "Internal server error" }); }
}

// ── GET single note ──────────────────────────────────────────────────────────
export async function getNoteById(req, res) {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch (e) { res.status(500).json({ message: "Internal server error" }); }
}

// ── GET shared note (public) ────────────────────────────────────────────────
export async function getSharedNote(req, res) {
  try {
    const note = await Note.findOne({ shareId: req.params.shareId, isPublic: true, deleted: false });
    if (!note) return res.status(404).json({ message: "Note not found or no longer shared" });
    res.json({ _id: note._id, title: note.title, content: note.content, tags: note.tags, color: note.color, createdAt: note.createdAt, updatedAt: note.updatedAt });
  } catch (e) { res.status(500).json({ message: "Internal server error" }); }
}

// ── CREATE ───────────────────────────────────────────────────────────────────
export async function createNote(req, res) {
  try {
    const { title, content, tags = [], color = "none" } = req.body;
    const note = new Note({ title, content, tags, color, userId: req.userId });
    res.status(201).json(await note.save());
  } catch (e) { res.status(500).json({ message: "Internal server error" }); }
}

// ── UPDATE ───────────────────────────────────────────────────────────────────
export async function updateNote(req, res) {
  try {
    const { title, content, tags, color, favorite } = req.body;
    const updated = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId, deleted: false },
      { title, content, tags, color, favorite },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Note not found" });
    res.status(200).json(updated);
  } catch (e) { res.status(500).json({ message: "Internal server error" }); }
}

// ── SOFT DELETE → trash ─────────────────────────────────────────────────────
export async function softDeleteNote(req, res) {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId, deleted: false },
      { deleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.status(200).json({ message: "Note moved to trash", note });
  } catch (e) { res.status(500).json({ message: "Internal server error" }); }
}

// ── RESTORE from trash ─────────────────────────────────────────────────────
export async function restoreNote(req, res) {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId, deleted: true },
      { deleted: false, deletedAt: null },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: "Note not found in trash" });
    res.status(200).json({ message: "Note restored", note });
  } catch (e) { res.status(500).json({ message: "Internal server error" }); }
}

// ── PERMANENT DELETE ────────────────────────────────────────────────────────
export async function permanentDelete(req, res) {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId, deleted: true });
    if (!note) return res.status(404).json({ message: "Note not found in trash" });
    res.status(200).json({ message: "Note permanently deleted" });
  } catch (e) { res.status(500).json({ message: "Internal server error" }); }
}

// ── EMPTY TRASH ─────────────────────────────────────────────────────────────
export async function emptyTrash(req, res) {
  try {
    const result = await Note.deleteMany({ userId: req.userId, deleted: true });
    res.status(200).json({ message: `${result.deletedCount} notes permanently deleted` });
  } catch (e) { res.status(500).json({ message: "Internal server error" }); }
}

// ── ARCHIVE note ───────────────────────────────────────────────────────────
export async function archiveNote(req, res) {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId, deleted: false },
      { archived: true, archivedAt: new Date() },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.status(200).json({ message: "Note archived", note });
  } catch (e) { res.status(500).json({ message: "Internal server error" }); }
}

// ── UNARCHIVE note ─────────────────────────────────────────────────────────
export async function unarchiveNote(req, res) {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId, archived: true },
      { archived: false, archivedAt: null },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: "Note not found in archive" });
    res.status(200).json({ message: "Note unarchived", note });
  } catch (e) { res.status(500).json({ message: "Internal server error" }); }
}

// ── TOGGLE share link ─────────────────────────────────────────────────────
export async function toggleShareLink(req, res) {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (note.isPublic) { note.isPublic = false; note.shareId = null; }
    else { note.shareId = nanoid(12); note.isPublic = true; }
    await note.save();
    res.status(200).json({
      isPublic: note.isPublic, shareId: note.shareId,
      shareUrl: note.isPublic ? `${process.env.FRONTEND_URL}/shared/${note.shareId}` : null,
    });
  } catch (e) { res.status(500).json({ message: "Internal server error" }); }
}
