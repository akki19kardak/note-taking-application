import React, { useEffect, useState } from "react";

export function SharedNotePage({ shareId }) {
  const [note,    setNote]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const fetchShared = async () => {
      try {
        const base = (import.meta.env.VITE_API_URL || "http://localhost:5001/api/notes").replace("/api/notes", "");
        const r = await fetch(`${base}/api/notes/shared/${shareId}`);
        if (!r.ok) throw new Error("Note not found or no longer shared");
        setNote(await r.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchShared();
  }, [shareId]);

  if (loading) return (
    <div className="shared-page shared-loading">
      <div className="skeleton skeleton-heading" />
      <div className="skeleton skeleton-text" />
      <div className="skeleton skeleton-text" />
    </div>
  );

  if (error) return (
    <div className="shared-page shared-error">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <h2>Note not available</h2>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="shared-page">
      <header className="shared-header">
        <div className="shared-brand">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="var(--color-primary)" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <span>Notara</span>
        </div>
        <span className="shared-badge">Read-only</span>
      </header>

      <main className="shared-main">
        <h1 className="shared-title">{note.title}</h1>
        <div className="shared-meta">
          {note.tags?.map((t) => (
            <span key={t} className="tag-pill">{t}</span>
          ))}
          <time style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
            Updated {new Date(note.updatedAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </time>
        </div>
        <div
          className="shared-content rte-content"
          dangerouslySetInnerHTML={{ __html: note.content }}
        />
      </main>
    </div>
  );
}
