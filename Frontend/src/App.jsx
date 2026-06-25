import React, { useState } from "react";
import { useNotes } from "./hooks/useNotes";
import { Sidebar } from "./components/Sidebar";
import { NoteEditor } from "./components/NoteEditor";
import { formatDate } from "./utils/noteHelpers";
import "./App.css";

function App() {
  const {
    notes,
    loading,
    createNote,
    updateNote,
    deleteNote,
    toggleFavorite,
  } = useNotes();

  const [selectedNote, setSelectedNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [isEditing, setIsEditing] = useState(false);

  const handleCreateNote = async (title, content, tags) => {
    const success = await createNote(title, content, tags);
    if (success) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  const handleUpdateNote = async (title, content, tags) => {
    if (!selectedNote) return;
    const success = await updateNote(selectedNote._id, title, content, tags);
    if (success) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  const handleDeleteNote = async (id) => {
    await deleteNote(id);
    if (selectedNote?._id === id) {
      setSelectedNote(null);
    }
  };

  return (
    <div className="app">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="gradient-orb orb-4"></div>
        <div className="noise-overlay"></div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <Sidebar
          notes={notes}
          loading={loading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          selectedNote={selectedNote}
          onSelectNote={setSelectedNote}
          onDeleteNote={handleDeleteNote}
          onToggleFavorite={toggleFavorite}
          onCreateNote={() => setIsEditing(true)}
        />

        <div className="editor-panel">
          {selectedNote || isEditing ? (
            <NoteEditor
              note={selectedNote}
              onSave={selectedNote ? handleUpdateNote : handleCreateNote}
              onCancel={() => {
                setSelectedNote(null);
                setIsEditing(false);
              }}
              isEditing={isEditing || selectedNote}
            />
          ) : (
            <div className="empty-editor">
              <h2>Welcome to Notes ✨</h2>
              <p>Select a note from the sidebar or create a new one</p>
            </div>
          )}

          {selectedNote && !isEditing && (
            <div className="note-details">
              <div className="details-meta">
                <span className="detail-item">
                  Created: {formatDate(selectedNote.createdAt)}
                </span>
                <span className="detail-item">
                  Updated: {formatDate(selectedNote.updatedAt)}
                </span>
              </div>
              <button
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                Edit Note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;