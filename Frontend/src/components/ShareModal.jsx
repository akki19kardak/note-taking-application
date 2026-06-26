import React, { useState } from "react";

export function ShareModal({ note, onToggle, onClose }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = note.shareId
    ? `${import.meta.env.VITE_FRONTEND_URL}/#/shared/${note.shareId}`
    : null;

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Share Note</h3>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <p className="modal-body">
          {note.isPublic
            ? "Anyone with the link can view this note (read-only)."
            : "Generate a public read-only link to share this note."}
        </p>

        {note.isPublic && shareUrl && (
          <div className="share-url-row">
            <input
              className="share-url-input"
              readOnly
              value={shareUrl}
              onFocus={(e) => e.target.select()}
              aria-label="Share URL"
            />
            <button className="btn-copy" onClick={handleCopy}>
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>
        )}

        <div className="modal-footer">
          <button
            className={note.isPublic ? "btn-cancel" : "btn-save"}
            onClick={onToggle}
          >
            {note.isPublic ? "Disable Link" : "Generate Link"}
          </button>
        </div>
      </div>
    </div>
  );
}
