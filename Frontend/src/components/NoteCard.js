import React from "react";
import { formatDate, getPreview, categorizeNote, getCategoryColor } from "../utils/noteHelpers";
import { Star, Trash2, Tag } from "lucide-react";

export function NoteCard({ note, isActive, onSelect, onDelete, onToggleFavorite }) {
  const category = note.category || categorizeNote(note.title, note.content);
  const categoryColor = getCategoryColor(category);

  return (
    <div
      className={`note-card ${isActive ? "active" : ""}`}
      onClick={() => onSelect(note)}
    >
      <div className="note-card-header">
        <div className="note-title-section">
          <h3 className="note-title">{note.title}</h3>
          <span className="category-badge" style={{ background: categoryColor }}>
            {category}
          </span>
        </div>
        <div className="note-actions">
          <button
            className="action-btn favorite-btn"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(note);
            }}
          >
            <Star
              size={16}
              fill={note.isFavorite ? "currentColor" : "none"}
              color={note.isFavorite ? "#2d6a4f" : "currentColor"}
            />
          </button>
          <button
            className="action-btn delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note._id);
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <p className="note-preview">{getPreview(note.content)}</p>

      <div className="note-meta">
        {note.tags && note.tags.length > 0 && (
          <div className="note-tags">
            {note.tags.map((tag) => (
              <span key={tag} className="tag">
                <Tag size={12} />
                {tag}
              </span>
            ))}
          </div>
        )}
        <span className="note-date">{formatDate(note.createdAt)}</span>
      </div>
    </div>
  );
}