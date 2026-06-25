import { useState, useEffect, useCallback } from "react";

const API_BASE = "http://localhost:5001/api/notes";

export function useNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all notes
  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Failed to fetch notes");
      const data = await res.json();
      setNotes(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create note
  const createNote = useCallback(async (title, content, tags = []) => {
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, tags }),
      });
      if (!res.ok) throw new Error("Failed to create note");
      await fetchNotes();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [fetchNotes]);

  // Update note
  const updateNote = useCallback(async (id, title, content, tags = []) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, tags }),
      });
      if (!res.ok) throw new Error("Failed to update note");
      await fetchNotes();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [fetchNotes]);

  // Delete note
  const deleteNote = useCallback(async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete note");
      await fetchNotes();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [fetchNotes]);

  // Toggle favorite
  const toggleFavorite = useCallback(async (note) => {
    const updated = {
      ...note,
      isFavorite: !note.isFavorite,
    };
    return await updateNote(note._id, note.title, note.content, note.tags || [], updated.isFavorite);
  }, [updateNote]);

  // Add tag
  const addTag = useCallback(async (note, tag) => {
    if (!tag.trim()) return false;
    const existingTags = note.tags || [];
    if (existingTags.includes(tag)) return true;
    return await updateNote(note._id, note.title, note.content, [...existingTags, tag]);
  }, [updateNote]);

  // Remove tag
  const removeTag = useCallback(async (note, tag) => {
    const updatedTags = note.tags?.filter(t => t !== tag) || [];
    return await updateNote(note._id, note.title, note.content, updatedTags);
  }, [updateNote]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return {
    notes,
    loading,
    error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    toggleFavorite,
    addTag,
    removeTag,
  };
}