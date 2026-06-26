import Note from "../models/Note.js";
import { nanoid } from "nanoid";

// ── GET all active notes for current user ─────────────────────────────────
export async function getAllNotes(req, res) {
  try {
    const notes = await Note.find({ userId: req.userId, deleted: false })
      .sort({ updatedAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    console.error("getAllNotes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ── GET trash (deleted notes) for current user ────────────────────────────
export async function getTrashedNotes(req, res) {
  try {
    const notes = await Note.find({ userId: req.userId, deleted: true })
      .sort({ deletedAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    console.error("getTrashedNotes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ── GET single note by ID (owner only) ───────────────────────────────────
export async function getNoteById(req, res) {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch (error) {
    console.error("getNoteById:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ── GET public shared note by shareId (no auth required) ─────────────────
export async function getSharedNote(req, res) {
  try {
    const note = await Note.findOne({
      shareId: req.params.shareId,
      isPublic: true,
      deleted:  false,
    });
    if (!note) return res.status(404).json({ message: "Note not found or no longer shared" });

    res.json({
      _id:       note._id,
      title:     note.title,
      content:   note.content,
      tags:      note.tags,
      color:     note.color,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    });
  } catch (error) {
    console.error("getSharedNote:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ── CREATE note ───────────────────────────────────────────────────────────
export async function createNote(req, res) {
  try {
    const { title, content, tags = [], color = "none" } = req.body;
    const note = new Note({ title, content, tags, color, userId: req.userId });
    const saved = await note.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("createNote:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ── UPDATE note ───────────────────────────────────────────────────────────
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
  } catch (error) {
    console.error("updateNote:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ── SOFT DELETE — move to trash ───────────────────────────────────────────
export async function softDeleteNote(req, res) {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId, deleted: false },
      { deleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.status(200).json({ message: "Note moved to trash", note });
  } catch (error) {
    console.error("softDeleteNote:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ── RESTORE from trash ────────────────────────────────────────────────────
export async function restoreNote(req, res) {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId, deleted: true },
      { deleted: false, deletedAt: null },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: "Note not found in trash" });
    res.status(200).json({ message: "Note restored", note });
  } catch (error) {
    console.error("restoreNote:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ── PERMANENT DELETE (from trash only) ───────────────────────────────────
export async function permanentDelete(req, res) {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
      deleted: true,
    });
    if (!note) return res.status(404).json({ message: "Note not found in trash" });
    res.status(200).json({ message: "Note permanently deleted" });
  } catch (error) {
    console.error("permanentDelete:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ── EMPTY TRASH ────────────────────────────────────────────────────────────
export async function emptyTrash(req, res) {
  try {
    const result = await Note.deleteMany({ userId: req.userId, deleted: true });
    res.status(200).json({ message: `${result.deletedCount} notes permanently deleted` });
  } catch (error) {
    console.error("emptyTrash:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ── TOGGLE share link ─────────────────────────────────────────────────────
export async function toggleShareLink(req, res) {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.isPublic) {
      note.isPublic = false;
      note.shareId  = null;
    } else {
      note.shareId  = nanoid(12);
      note.isPublic = true;
    }

    await note.save();
    res.status(200).json({
      isPublic: note.isPublic,
      shareId:  note.shareId,
      shareUrl: note.isPublic
        ? `${process.env.FRONTEND_URL}/shared/${note.shareId}`
        : null,
    });
  } catch (error) {
    console.error("toggleShareLink:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
