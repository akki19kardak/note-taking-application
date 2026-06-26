import React from "react";
import { NoteCard } from "./NoteCard";
import { filterNotes, sortNotes } from "../utils/noteHelpers";

export function Sidebar({
  notes, loading, searchTerm, onSearchChange,
  sortBy, onSortChange, selectedNote, onSelectNote,
  onDeleteNote, onToggleFavorite, onCreateNote, isOpen, onClose,
}) {
  const filtered = filterNotes(notes, searchTerm);
  const sorted = sortNotes(filtered, sortBy);

  const favorites = sorted.filter((n) => n.favorite);
  const others = sorted.filter((n) => !n.favorite);

  const ThemeToggle = () => {
    const [dark, setDark] = React.useState(
      () => document.documentElement.getAttribute("data-theme") === "dark" ||
        (!document.documentElement.getAttribute("data-theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
    const toggle = () => {
      const next = dark ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      setDark(!dark);
    };
    return (
      <button className="btn-icon" onClick={toggle} aria-label="Toggle theme">
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
  };

  return (
    <aside className={`sidebar${isOpen ? " open" : ""}`} role="navigation" aria-label="Notes sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <div className="brand-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <line x1="10" y1="9" x2="8" y2="9"/>
              </svg>
            </div>
            <span className="brand-name">Notara</span>
          </div>
          <div className="sidebar-actions">
            <ThemeToggle />
            <button className="btn-icon" aria-label="Close sidebar" onClick={onClose} style={{ display: isOpen ? undefined : "none" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="search-box" role="search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className="search-input"
            type="search"
            placeholder="Search notes…"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search notes"
          />
        </div>

        <div className="sort-row">
          <span className="sort-label">Sort</span>
          {["date", "title", "favorites"].map((s) => (
            <button
              key={s}
              className={`sort-btn${sortBy === s ? " active" : ""}`}
              onClick={() => onSortChange(s)}
              aria-pressed={sortBy === s}
            >
              {s === "date" ? "Recent" : s === "title" ? "A–Z" : "★ First"}
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-stats" aria-label="Note statistics">
        <div className="stat-item">
          <span className="stat-value">{notes.length}</span>
          <span className="stat-label">Notes</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{favorites.length}</span>
          <span className="stat-label">Starred</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {[...new Set(notes.flatMap((n) => n.tags || []))].length}
          </span>
          <span className="stat-label">Tags</span>
        </div>
      </div>

      <div className="sidebar-list" role="list" aria-label="Notes list">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-note" aria-hidden="true">
              <div className="skeleton skeleton-line w-3q" />
              <div className="skeleton skeleton-line w-full" />
              <div className="skeleton skeleton-line w-half" />
            </div>
          ))
        ) : filtered.length === 0 && searchTerm ? (
          <div className="empty-search">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <h3>No results found</h3>
            <p>Try a different search term or clear the filter.</p>
          </div>
        ) : (
          <>
            {favorites.length > 0 && (
              <>
                <p className="sidebar-section-label">Starred</p>
                {favorites.map((note, i) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    isActive={selectedNote?._id === note._id}
                    onSelect={() => onSelectNote(note)}
                    onDelete={() => onDeleteNote(note._id)}
                    onToggleFavorite={() => onToggleFavorite(note._id)}
                    style={{ animationDelay: `${i * 30}ms` }}
                  />
                ))}
              </>
            )}
            {others.length > 0 && (
              <>
                {favorites.length > 0 && <p className="sidebar-section-label">All Notes</p>}
                {others.map((note, i) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    isActive={selectedNote?._id === note._id}
                    onSelect={() => onSelectNote(note)}
                    onDelete={() => onDeleteNote(note._id)}
                    onToggleFavorite={() => onToggleFavorite(note._id)}
                    style={{ animationDelay: `${(favorites.length + i) * 30}ms` }}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>

      <button className="new-note-btn" onClick={onCreateNote} aria-label="Create new note">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        New note
      </button>
    </aside>
  );
}
