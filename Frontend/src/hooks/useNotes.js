import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api/notes";

export function useNotes() {
  const { getToken, isSignedIn } = useAuth();
  const [notes,    setNotes]    = useState([]);
  const [trash,    setTrash]    = useState([]);
  const [archived, setArchived] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const authFetch = useCallback(async (url, options = {}) => {
    const token = await getToken();
    return fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options.headers },
    });
  }, [getToken]);

  const fetchNotes = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      setLoading(true);
      const res = await authFetch(API_BASE);
      if (!res.ok) throw new Error("Failed to fetch notes");
      setNotes(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [authFetch, isSignedIn]);

  const fetchTrash = useCallback(async () => {
    if (!isSignedIn) return;
    try { const r = await authFetch(`${API_BASE}/trash`); setTrash(await r.json()); }
    catch (err) { setError(err.message); }
  }, [authFetch, isSignedIn]);

  const fetchArchived = useCallback(async () => {
    if (!isSignedIn) return;
    try { const r = await authFetch(`${API_BASE}/archive`); setArchived(await r.json()); }
    catch (err) { setError(err.message); }
  }, [authFetch, isSignedIn]);

  useEffect(() => { fetchNotes(); fetchTrash(); fetchArchived(); }, [fetchNotes, fetchTrash, fetchArchived]);

  const createNote = async (title, content, tags = [], color = "none") => {
    try {
      const res = await authFetch(API_BASE, { method: "POST", body: JSON.stringify({ title, content, tags, color, favorite: false }) });
      if (!res.ok) throw new Error("Failed to create note");
      const n = await res.json(); setNotes((p) => [n, ...p]); return n;
    } catch (err) { setError(err.message); return null; }
  };

  const updateNote = async (id, title, content, tags = [], color = "none") => {
    try {
      const res = await authFetch(`${API_BASE}/${id}`, { method: "PUT", body: JSON.stringify({ title, content, tags, color }) });
      if (!res.ok) throw new Error("Failed to update note");
      const u = await res.json(); setNotes((p) => p.map((n) => n._id === id ? u : n)); return u;
    } catch (err) { setError(err.message); return null; }
  };

  const deleteNote = async (id) => {
    try {
      const res = await authFetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      const gone = notes.find((n) => n._id === id);
      setNotes((p) => p.filter((n) => n._id !== id));
      if (gone) setTrash((p) => [{ ...gone, deleted: true, deletedAt: new Date() }, ...p]);
      return true;
    } catch (err) { setError(err.message); return false; }
  };

  const restoreNote = async (id) => {
    try {
      const res = await authFetch(`${API_BASE}/${id}/restore`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to restore");
      const { note } = await res.json();
      setTrash((p) => p.filter((n) => n._id !== id)); setNotes((p) => [note, ...p]); return note;
    } catch (err) { setError(err.message); return null; }
  };

  const permanentDelete = async (id) => {
    try {
      await authFetch(`${API_BASE}/${id}/permanent`, { method: "DELETE" });
      setTrash((p) => p.filter((n) => n._id !== id)); return true;
    } catch (err) { setError(err.message); return false; }
  };

  const emptyTrash = async () => {
    try { await authFetch(`${API_BASE}/trash/empty`, { method: "DELETE" }); setTrash([]); return true; }
    catch (err) { setError(err.message); return false; }
  };

  const toggleFavorite = async (id) => {
    const note = notes.find((n) => n._id === id); if (!note) return;
    try {
      const res = await authFetch(`${API_BASE}/${id}`, {
        method: "PUT",
        body: JSON.stringify({ title: note.title, content: note.content, tags: note.tags, color: note.color || "none", favorite: !note.favorite }),
      });
      const u = await res.json(); setNotes((p) => p.map((n) => n._id === id ? u : n)); return u;
    } catch (err) { setError(err.message); return null; }
  };

  const archiveNote = async (id) => {
    try {
      const res = await authFetch(`${API_BASE}/${id}/archive`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to archive");
      const { note } = await res.json();
      setNotes((p) => p.filter((n) => n._id !== id)); setArchived((p) => [note, ...p]); return note;
    } catch (err) { setError(err.message); return null; }
  };

  const unarchiveNote = async (id) => {
    try {
      const res = await authFetch(`${API_BASE}/${id}/unarchive`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to unarchive");
      const { note } = await res.json();
      setArchived((p) => p.filter((n) => n._id !== id)); setNotes((p) => [note, ...p]); return note;
    } catch (err) { setError(err.message); return null; }
  };

  const toggleShareLink = async (id) => {
    try {
      const res = await authFetch(`${API_BASE}/${id}/share`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to toggle share");
      const data = await res.json();
      setNotes((p) => p.map((n) => n._id === id ? { ...n, isPublic: data.isPublic, shareId: data.shareId } : n));
      return data;
    } catch (err) { setError(err.message); return null; }
  };

  return {
    notes, trash, archived, loading, error,
    createNote, updateNote, deleteNote,
    restoreNote, permanentDelete, emptyTrash,
    toggleFavorite, archiveNote, unarchiveNote,
    toggleShareLink, refetch: fetchNotes,
  };
}
