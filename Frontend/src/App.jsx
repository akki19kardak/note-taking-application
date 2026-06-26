import React, { useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignIn,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import { useNotes } from "./hooks/useNotes";
import { Sidebar } from "./components/Sidebar";
import { NoteEditor } from "./components/NoteEditor";
import { DashboardPage } from "./pages/DashboardPage";
import "./App.css";

// ── Theme toggle button ──────────────────────────────────────────────────
function ThemeToggle() {
  const [dark, setDark] = useState(
    () => document.documentElement.getAttribute("data-theme") === "dark" ||
      (!document.documentElement.getAttribute("data-theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
  };
  return (
    <button data-theme-toggle onClick={toggle} aria-label="Toggle theme" title="Toggle theme">
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  );
}

// ── Trash Modal ─────────────────────────────────────────────────────
function TrashModal({ trash, onClose, onRestore, onPermanentDelete, onEmptyTrash }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Recently Deleted ({trash.length})</span>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          {trash.length === 0 ? (
            <div className="notes-empty">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              </svg>
              <p>Trash is empty</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {trash.map((note) => (
                <div key={note._id} className="note-card" style={{ border: "1px solid var(--color-border)" }}>
                  <div className="note-card-header">
                    <span className="note-card-title">{note.title || "Untitled"}</span>
                    <div className="note-card-actions" style={{ opacity: 1 }}>
                      <button className="btn-icon-sm" onClick={() => onRestore(note._id)} title="Restore">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                          <path d="M3 3v5h5"/>
                        </svg>
                      </button>
                      <button className="btn-icon-sm" onClick={() => onPermanentDelete(note._id)} title="Delete forever" style={{ color: "var(--color-error)" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="note-card-preview">{note.content?.slice(0, 80) || "No content"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        {trash.length > 0 && (
          <div className="modal-footer">
            <button className="btn-ghost" onClick={onClose}>Close</button>
            <button className="btn-danger" onClick={() => { onEmptyTrash(); }}>Empty Trash</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Archive Modal ───────────────────────────────────────────────────
function ArchiveModal({ archived, onClose, onUnarchive }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Archive ({archived.length})</span>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          {archived.length === 0 ? (
            <div className="notes-empty">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <polyline points="21 8 21 21 3 21 3 8"/>
                <rect x="1" y="3" width="22" height="5"/>
                <line x1="10" y1="12" x2="14" y2="12"/>
              </svg>
              <p>No archived notes</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {archived.map((note) => (
                <div key={note._id} className="note-card" style={{ border: "1px solid var(--color-border)" }}>
                  <div className="note-card-header">
                    <span className="note-card-title">{note.title || "Untitled"}</span>
                    <div className="note-card-actions" style={{ opacity: 1 }}>
                      <button className="btn-icon-sm" onClick={() => onUnarchive(note._id)} title="Unarchive">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                          <path d="M3 3v5h5"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="note-card-preview">{note.content?.slice(0, 80) || "No content"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────
function NotesApp() {
  const { user } = useUser();
  const {
    notes, trash, archived, loading,
    createNote, updateNote, deleteNote,
    restoreNote, permanentDelete, emptyTrash,
    toggleFavorite, unarchiveNote,
  } = useNotes();

  const [selectedNote,   setSelectedNote]   = useState(null);
  const [searchTerm,     setSearchTerm]     = useState("");
  const [sortBy,         setSortBy]         = useState("date");
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [showTrash,      setShowTrash]      = useState(false);
  const [showArchive,    setShowArchive]    = useState(false);
  const [showDashboard,  setShowDashboard]  = useState(false);
  const [isCreating,     setIsCreating]     = useState(false);

  // ── Create new note
  const handleCreateNote = async () => {
    setSelectedNote(null);
    setIsCreating(true);
    setShowDashboard(false);
    setSidebarOpen(false);
  };

  // ── Save (create OR update)
  const handleSave = async (title, content, tags, color) => {
    if (isCreating) {
      const created = await createNote(title, content, tags, color);
      if (created) { setSelectedNote(created); setIsCreating(false); }
    } else if (selectedNote) {
      const updated = await updateNote(selectedNote._id, title, content, tags, color);
      if (updated) setSelectedNote(updated);
    }
  };

  // ── Select note
  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setIsCreating(false);
    setShowDashboard(false);
    setSidebarOpen(false);
  };

  // ── Delete note
  const handleDeleteNote = async (id) => {
    await deleteNote(id);
    if (selectedNote?._id === id) { setSelectedNote(null); setIsCreating(false); }
  };

  // ── Top-bar title
  const topBarTitle = showDashboard
    ? "Dashboard"
    : isCreating
    ? "New Note"
    : selectedNote?.title || "Notara";

  return (
    <div className="app-layout">
      {/* Sidebar */}
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
        onCreateNote={handleCreateNote}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        trashCount={trash.length}
        onOpenTrash={() => { setShowTrash(true); setSidebarOpen(false); }}
        archivedCount={archived.length}
        onOpenArchive={() => { setShowArchive(true); setSidebarOpen(false); }}
        userButton={<UserButton afterSignOutUrl="/" />}
      />

      {/* Main */}
      <div className="main-content">
        {/* Top bar */}
        <header className="top-bar">
          <button
            className="btn-menu btn-icon"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6"  x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <span className="top-bar-title">{topBarTitle}</span>

          <div className="top-bar-actions">
            <button
              className={`btn-dashboard${showDashboard ? " active" : ""}`}
              onClick={() => { setShowDashboard((v) => !v); setSelectedNote(null); setIsCreating(false); }}
              title="Dashboard"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              Stats
            </button>
            <ThemeToggle />
          </div>
        </header>

        {/* Content */}
        <main className="content-area">
          {showDashboard ? (
            <DashboardPage notes={notes} />
          ) : isCreating || selectedNote ? (
            <NoteEditor
              key={selectedNote?._id || "new"}
              note={selectedNote}
              onSave={handleSave}
              onCancel={() => { setSelectedNote(null); setIsCreating(false); }}
            />
          ) : (
            <div className="empty-editor-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <p>Select a note or create a new one to get started.</p>
              <button className="btn-new-large" onClick={handleCreateNote}>
                + New Note
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Trash Modal */}
      {showTrash && (
        <TrashModal
          trash={trash}
          onClose={() => setShowTrash(false)}
          onRestore={async (id) => { await restoreNote(id); }}
          onPermanentDelete={async (id) => { await permanentDelete(id); }}
          onEmptyTrash={async () => { await emptyTrash(); setShowTrash(false); }}
        />
      )}

      {/* Archive Modal */}
      {showArchive && (
        <ArchiveModal
          archived={archived}
          onClose={() => setShowArchive(false)}
          onUnarchive={async (id) => { await unarchiveNote(id); }}
        />
      )}
    </div>
  );
}

// ── Root export ───────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <SignedOut>
        <div style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-bg)",
        }}>
          <SignIn routing="hash" />
        </div>
      </SignedOut>
      <SignedIn>
        <NotesApp />
      </SignedIn>
    </>
  );
}
