import React, { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { formatDate, getPreview, sortNotes, getAllTags } from "../utils/noteHelpers";

const SORT_OPTIONS = [
  { value: "date",      label: "Last edited" },
  { value: "created",   label: "Created" },
  { value: "title",     label: "Title A–Z" },
  { value: "wordcount", label: "Word count" },
];

export function Sidebar({
  notes, loading, searchTerm, onSearchChange,
  sortBy, onSortChange, selectedNote, onSelectNote,
  onDeleteNote, onToggleFavorite, onCreateNote,
  isOpen, onClose, trashCount, onOpenTrash,
  onOpenArchive, archivedCount, userButton,
}) {
  const [activeTag, setActiveTag] = useState(null);
  const [showFavs,  setShowFavs]  = useState(false);

  // All unique tags across notes
  const allTags = useMemo(() => getAllTags(notes), [notes]);

  // Fuse.js fuzzy search
  const fuse = useMemo(() => new Fuse(notes, {
    keys: ["title", "content", "tags"],
    threshold: 0.35,
    includeScore: true,
  }), [notes]);

  const filtered = useMemo(() => {
    let result = notes;

    // Fuzzy search
    if (searchTerm.trim()) {
      result = fuse.search(searchTerm).map((r) => r.item);
    }

    // Tag filter
    if (activeTag) result = result.filter((n) => n.tags?.includes(activeTag));

    // Favourites filter
    if (showFavs) result = result.filter((n) => n.favorite);

    return sortNotes(result, sortBy);
  }, [notes, searchTerm, activeTag, showFavs, sortBy, fuse]);

  return (
    <aside className={`sidebar${isOpen ? " open" : ""}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="var(--color-primary)" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <span>Notara</span>
        </div>
        <div style={{ display:"flex", gap:"var(--space-2)", alignItems:"center" }}>
          <button className="btn-new" onClick={onCreateNote} aria-label="New note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New
          </button>
          <button className="btn-icon sidebar-close" onClick={onClose} aria-label="Close sidebar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="sidebar-search">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className="search-input"
          placeholder="Fuzzy search…"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search notes"
        />
        {searchTerm && (
          <button className="search-clear" onClick={() => onSearchChange("")} aria-label="Clear search">×</button>
        )}
      </div>

      {/* Sort */}
      <div className="sidebar-sort">
        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort notes"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          className={`btn-fav-filter${showFavs ? " active" : ""}`}
          onClick={() => setShowFavs((v) => !v)}
          title="Show starred only"
          aria-pressed={showFavs}
        >
          <svg width="13" height="13" viewBox="0 0 24 24"
            fill={showFavs ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      </div>

      {/* Tag filter bar */}
      {allTags.length > 0 && (
        <div className="tag-filter-bar">
          <button
            className={`tag-filter-chip${!activeTag ? " active" : ""}`}
            onClick={() => setActiveTag(null)}
          >All</button>
          {allTags.map((tag) => (
            <button
              key={tag}
              className={`tag-filter-chip${activeTag === tag ? " active" : ""}`}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            >{tag}</button>
          ))}
        </div>
      )}

      {/* Notes list */}
      <div className="notes-list">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="note-card skeleton-card">
              <div className="skeleton skeleton-heading" />
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-text" style={{ width: "60%" }} />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="notes-empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <p>{searchTerm ? "No notes match your search" : "No notes yet"}</p>
            {!searchTerm && (
              <button className="empty-cta" onClick={onCreateNote}>Create one</button>
            )}
          </div>
        ) : (
          filtered.map((note) => (
            <div
              key={note._id}
              className={`note-card note-color-${note.color || "none"}${
                selectedNote?._id === note._id ? " selected" : ""
              }`}
              onClick={() => onSelectNote(note)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onSelectNote(note)}
            >
              <div className="note-card-header">
                <span className="note-card-title">{note.title || "Untitled"}</span>
                <div className="note-card-actions">
                  <button
                    className={`btn-icon-sm${note.favorite ? " starred" : ""}`}
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(note._id); }}
                    aria-label={note.favorite ? "Unstar" : "Star"}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24"
                      fill={note.favorite ? "currentColor" : "none"}
                      stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </button>
                  <button
                    className="btn-icon-sm"
                    onClick={(e) => { e.stopPropagation(); onDeleteNote(note._id); }}
                    aria-label="Delete note"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14H6L5 6"/>
                    </svg>
                  </button>
                </div>
              </div>
              <p className="note-card-preview">{getPreview(note.content)}</p>
              <div className="note-card-meta">
                <span className="note-card-date">{formatDate(note.updatedAt)}</span>
                {note.tags?.slice(0, 2).map((t) => (
                  <span key={t} className="tag-chip">{t}</span>
                ))}
                {note.tags?.length > 2 && (
                  <span className="tag-chip tag-chip-more">+{note.tags.length - 2}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div style={{ display:"flex", gap:"var(--space-2)" }}>
          <button className="sidebar-footer-btn" onClick={onOpenTrash} title="Recently Deleted">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
            Trash
            {trashCount > 0 && <span className="trash-badge">{trashCount}</span>}
          </button>
          <button className="sidebar-footer-btn" onClick={onOpenArchive} title="Archive">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <polyline points="21 8 21 21 3 21 3 8"/>
              <rect x="1" y="3" width="22" height="5"/>
              <line x1="10" y1="12" x2="14" y2="12"/>
            </svg>
            Archive
            {archivedCount > 0 && <span className="trash-badge" style={{background:"var(--color-text-muted)"}}>{archivedCount}</span>}
          </button>
        </div>
        <div className="sidebar-user">{userButton}</div>
      </div>
    </aside>
  );
}
