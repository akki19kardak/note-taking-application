import React, { useState } from "react";

function daysLeft(deletedAt) {
  const diff = 30 - Math.floor((Date.now() - new Date(deletedAt)) / 86400000);
  return Math.max(0, diff);
}

export function TrashPanel({ trash, onRestore, onPermanentDelete, onEmptyTrash, onClose }) {
  const [confirmEmpty, setConfirmEmpty] = useState(false);

  return (
    <div className="trash-panel" role="dialog" aria-label="Recently Deleted">
      <div className="trash-header">
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
          <span>Recently Deleted</span>
          <span className="trash-count">{trash.length}</span>
        </div>
        <button className="btn-icon" onClick={onClose} aria-label="Close trash">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {trash.length === 0 ? (
        <div className="trash-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/>
          </svg>
          <p>Trash is empty</p>
        </div>
      ) : (
        <>
          <p className="trash-hint">
            Notes are permanently deleted after 30 days.
          </p>
          <div className="trash-list">
            {trash.map((note) => (
              <div key={note._id} className="trash-item">
                <div className="trash-item-info">
                  <span className="trash-item-title">{note.title || "Untitled"}</span>
                  <span className="trash-item-days">
                    {daysLeft(note.deletedAt)} days left
                  </span>
                </div>
                <div className="trash-item-actions">
                  <button
                    className="btn-restore"
                    onClick={() => onRestore(note._id)}
                    title="Restore note"
                  >
                    Restore
                  </button>
                  <button
                    className="btn-perm-delete"
                    onClick={() => onPermanentDelete(note._id)}
                    title="Delete forever"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="trash-footer">
            {confirmEmpty ? (
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <button className="btn-perm-delete-all" onClick={() => { onEmptyTrash(); setConfirmEmpty(false); }}>
                  Yes, delete all
                </button>
                <button className="btn-cancel" onClick={() => setConfirmEmpty(false)}>
                  Cancel
                </button>
              </div>
            ) : (
              <button className="btn-empty-trash" onClick={() => setConfirmEmpty(true)}>
                Empty Trash
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
