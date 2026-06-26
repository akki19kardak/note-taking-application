import React, { useState } from "react";
import { useNotes } from "./hooks/useNotes";
import { Sidebar } from "./components/Sidebar";
import { NoteEditor } from "./components/NoteEditor";
import { formatDate } from "./utils/noteHelpers";
import "./App.css";

function App() {
  const { notes, loading, createNote, updateNote, deleteNote, toggleFavorite } = useNotes();
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [isEditing, setIsEditing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleCreateNote = async (title, content, tags) => {
    const success = await createNote(title, content, tags);
    if (success) { setSelectedNote(null); setIsEditing(false); }
  };

  const handleUpdateNote = async (title, content, tags) => {
    if (!selectedNote) return;
    const success = await updateNote(selectedNote._id, title, content, tags);
    if (success) { setSelectedNote(null); setIsEditing(false); }
  };

  const handleDeleteNote = async (id) => {
    await deleteNote(id);
    if (selectedNote?._id === id) setSelectedNote(null);
  };

  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setIsEditing(false);
    setSidebarOpen(false);
  };

  return (
    <div className="app">
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay${sidebarOpen ? " visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <Sidebar
        notes={notes}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        selectedNote={selectedNote}
        onSelectNote={handleSelectNote}
        onDeleteNote={handleDeleteNote}
        onToggleFavorite={toggleFavorite}
        onCreateNote={() => { setSelectedNote(null); setIsEditing(true); setSidebarOpen(false); }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="editor-panel">
        {/* Mobile top bar */}
        <div className="mobile-topbar">
          <button
            className="btn-icon"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-base)" }}>Notara</span>
        </div>

        {selectedNote || isEditing ? (
          <NoteEditor
            note={selectedNote}
            onSave={selectedNote ? handleUpdateNote : handleCreateNote}
            onCancel={() => { setSelectedNote(null); setIsEditing(false); }}
            isEditing={isEditing || !!selectedNote}
          />
        ) : (
          <div className="empty-editor">
            <div className="empty-editor-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
            </div>
            <h2>Your notes, beautifully kept</h2>
            <p>Select a note to read it, or start a new one.</p>
            <button
              className="empty-editor-cta"
              onClick={() => setIsEditing(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New note
            </button>
          </div>
        )}

        {selectedNote && !isEditing && (
          <div className="note-details">
            <div className="details-meta">
              <span className="detail-item">Created {formatDate(selectedNote.createdAt)}</span>
              <span className="detail-item">Updated {formatDate(selectedNote.updatedAt)}</span>
            </div>
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
