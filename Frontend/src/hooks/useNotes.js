import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api/notes";

export function useNotes() {
  const { getToken, isSignedIn } = useAuth();
  const [notes,   setNotes]   = useState([]);
  const [trash,   setTrash]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // ── Authenticated fetch helper ─────────────────────────────────────────
  const authFetch = useCallback(async (url, options = {}) => {
    const token = await getToken();
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  }, [getToken]);

  // ── Fetch active notes ─────────────────────────────────────────────────
  const fetchNotes = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      setLoading(true);
      const res = await authFetch(API_BASE);
      if (!res.ok) throw new Error("Failed to fetch notes");
      setNotes(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch, isSignedIn]);

  // ── Fetch trash ────────────────────────────────────────────────────────
  const fetchTrash = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const res = await authFetch(`${API_BASE}/trash`);
      if (!res.ok) throw new Error("Failed to fetch trash");
      setTrash(await res.json());
    } catch (err) {
      setError(err.message);
    }
  }, [authFetch, isSignedIn]);

  useEffect(() => {
    fetchNotes();
    fetchTrash();
  }, [fetchNotes, fetchTrash]);

  // ── Create ─────────────────────────────────────────────────────────────
  const createNote = async (title, content, tags = [], color = "none") => {
    try {
      const res = await authFetch(API_BASE, {
        method: "POST",
        body: JSON.stringify({ title, content, tags, color, favorite: false }),
      });
      if (!res.ok) throw new Error("Failed to create note");
      const newNote = await res.json();
      setNotes((prev) => [newNote, ...prev]);
      return newNote;
    } catch (err) { setError(err.message); return null; }
  };

  // ── Update ─────────────────────────────────────────────────────────────
  const updateNote = async (id, title, content, tags = [], color = "none") => {
    try {
      const res = await authFetch(`${API_BASE}/${id}`, {
        method: "PUT",
        body: JSON.stringify({ title, content, tags, color }),
      });
      if (!res.ok) throw new Error("Failed to update note");
      const updated = await res.json();
      setNotes((prev) => prev.map((n) => (n._id === id ? updated : n)));
      return updated;
    } catch (err) { setError(err.message); return null; }
  };

  // ── Soft delete → trash ────────────────────────────────────────────────
  const deleteNote = async (id) => {
    try {
      const res = await authFetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete note");
      const deletedNote = notes.find((n) => n._id === id);
      setNotes((prev) => prev.filter((n) => n._id !== id));
      if (deletedNote) {
        setTrash((prev) => [
          { ...deletedNote, deleted: true, deletedAt: new Date() },
          ...prev,
        ]);
      }
      return true;
    } catch (err) { setError(err.message); return false; }
  };

  // ── Restore from trash ─────────────────────────────────────────────────
  const restoreNote = async (id) => {
    try {
      const res = await authFetch(`${API_BASE}/${id}/restore`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to restore note");
      const { note } = await res.json();
      setTrash((prev) => prev.filter((n) => n._id !== id));
      setNotes((prev) => [note, ...prev]);
      return note;
    } catch (err) { setError(err.message); return null; }
  };

  // ── Permanent delete ───────────────────────────────────────────────────
  const permanentDelete = async (id) => {
    try {
      const res = await authFetch(`${API_BASE}/${id}/permanent`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to permanently delete");
      setTrash((prev) => prev.filter((n) => n._id !== id));
      return true;
    } catch (err) { setError(err.message); return false; }
  };

  // ── Empty trash ────────────────────────────────────────────────────────
  const emptyTrash = async () => {
    try {
      const res = await authFetch(`${API_BASE}/trash/empty`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to empty trash");
      setTrash([]);
      return true;
    } catch (err) { setError(err.message); return false; }
  };

  // ── Toggle favorite ────────────────────────────────────────────────────
  const toggleFavorite = async (id) => {
    const note = notes.find((n) => n._id === id);
    if (!note) return;
    try {
      const res = await authFetch(`${API_BASE}/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          title:    note.title,
          content:  note.content,
          tags:     note.tags,
          color:    note.color || "none",
          favorite: !note.favorite,
        }),
      });
      if (!res.ok) throw new Error("Failed to toggle favorite");
      const updated = await res.json();
      setNotes((prev) => prev.map((n) => (n._id === id ? updated : n)));
      return updated;
    } catch (err) { setError(err.message); return null; }
  };

  // ── Toggle share link ──────────────────────────────────────────────────
  const toggleShareLink = async (id) => {
    try {
      const res = await authFetch(`${API_BASE}/${id}/share`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to toggle share link");
      const data = await res.json();
      setNotes((prev) =>
        prev.map((n) =>
          n._id === id
            ? { ...n, isPublic: data.isPublic, shareId: data.shareId }
            : n
        )
      );
      return data;
    } catch (err) { setError(err.message); return null; }
  };

  return {
    notes, trash, loading, error,
    createNote, updateNote, deleteNote,
    restoreNote, permanentDelete, emptyTrash,
    toggleFavorite, toggleShareLink,
    refetch: fetchNotes,
  };
}
