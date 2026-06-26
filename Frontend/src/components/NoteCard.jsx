import React from "react";
import { formatDate, getPreview } from "../utils/noteHelpers";

export function NoteCard({ note, isActive, onSelect, onDelete, onToggleFavorite, style }) {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Delete "' + note.title + '"?')) onDelete();
  };

  const handleFav = (e) => {
    e.stopPropagation();
    onToggleFavorite();
  };

  return (
    <article
      className={`note-card${isActive ? " active" : ""}`}
      onClick={onSelect}
      role="listitem"
      tabIndex={0}
      style={style}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(); }}
      aria-label={`Note: ${note.title}`}
      aria-current={isActive ? "true" : undefined}
    >
      <div className="note-card-top">
        <h3 className="note-card-title">{note.title || "Untitled"}</h3>
        <div className="note-card-actions" aria-label="Note actions">
          <button
            className={`note-card-action fav${note.favorite ? " on" : ""}`}
            onClick={handleFav}
            aria-label={note.favorite ? "Remove from starred" : "Add to starred"}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill={note.favorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </button>
          <button className="note-card-action del" onClick={handleDelete} aria-label="Delete note">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </div>

      {note.content && (
        <p className="note-card-preview">{getPreview(note.content)}</p>
      )}

      <div className="note-card-footer">
        <time className="note-card-date" dateTime={note.updatedAt}>
          {formatDate(note.updatedAt)}
        </time>
        {note.tags?.length > 0 && (
          <div className="note-card-tags">
            {note.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag-pill">{tag}</span>
            ))}
            {note.tags.length > 3 && (
              <span className="tag-pill">+{note.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
