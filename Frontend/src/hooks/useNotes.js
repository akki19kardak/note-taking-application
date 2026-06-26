import { useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api/notes";

export function useNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Failed to fetch notes");
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      setError(err.message);
      console.error("fetchNotes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const createNote = async (title, content, tags = []) => {
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, tags, favorite: false }),
      });
      if (!res.ok) throw new Error("Failed to create note");
      const newNote = await res.json();
      setNotes((prev) => [newNote, ...prev]);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const updateNote = async (id, title, content, tags) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, tags }),
      });
      if (!res.ok) throw new Error("Failed to update note");
      const updated = await res.json();
      setNotes((prev) => prev.map((n) => (n._id === id ? updated : n)));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const deleteNote = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete note");
      setNotes((prev) => prev.filter((n) => n._id !== id));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const toggleFavorite = async (id) => {
    const note = notes.find((n) => n._id === id);
    if (!note) return;
    return updateNote(id, note.title, note.content, note.tags, !note.favorite);
  };

  return { notes, loading, error, createNote, updateNote, deleteNote, toggleFavorite, refetch: fetchNotes };
}
