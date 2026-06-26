import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    // ── Core ──────────────────────────────────────────────────────────────
    title:   { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    tags:    [{ type: String, trim: true }],

    // ── Owner (Clerk user ID) ─────────────────────────────────────────────
    userId: { type: String, required: true, index: true },

    // ── UI state ──────────────────────────────────────────────────────────
    favorite: { type: Boolean, default: false },
    color: {
      type: String,
      default: "none",
      enum: ["none","red","orange","yellow","green","teal","blue","purple","pink"],
    },

    // ── Soft delete / Trash ───────────────────────────────────────────────
    deleted:   { type: Boolean, default: false },
    deletedAt: { type: Date,    default: null  },

    // ── Shareable link ────────────────────────────────────────────────────
    shareId:  { type: String, default: null, unique: true, sparse: true },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-purge: notes deleted > 30 days ago are removed by MongoDB TTL index
noteSchema.index(
  { deletedAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60, partialFilterExpression: { deleted: true } }
);

const Note = mongoose.model("Note", noteSchema);
export default Note;
