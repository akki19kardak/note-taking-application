import React, { useState, useEffect, useCallback } from "react";
import { TagManager } from "./TagManager";

export function NoteEditor({ note, onSave, onCancel }) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [tags, setTags] = useState(note?.tags || []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setTitle(note?.title || "");
    setContent(note?.content || "");
    setTags(note?.tags || []);
    setSaved(false);
  }, [note]);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  const handleSave = useCallback(async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onSave(title.trim(), content, tags);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [title, content, tags, onSave]);

  // Ctrl/Cmd + S to save
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handleSave]);

  const isNew = !note;

  return (
    <div className="note-editor" role="main" aria-label="Note editor">
      <div className="editor-toolbar">
        <div className="editor-toolbar-left">
          <span className={`badge ${isNew ? "badge-new" : "badge-edit"}`}>
            {isNew ? "New note" : "Editing"}
          </span>
          {!title.trim() && (
            <span className="editor-label">Enter a title to save</span>
          )}
        </div>
        <div className="editor-toolbar-right">
          <button className="btn-cancel" onClick={onCancel} aria-label="Cancel editing">
            Cancel
          </button>
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={saving || !title.trim()}
            aria-label="Save note"
          >
            {saving ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Saving…
              </>
            ) : saved ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Saved
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Save
              </>
            )}
          </button>
        </div>
      </div>

      <div className="editor-body">
        <div className="editor-title-wrap">
          <textarea
            className="editor-title-input"
            placeholder="Untitled…"
            value={title}
            onChange={(e) => { setTitle(e.target.value); e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
            onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
            rows={1}
            maxLength={200}
            aria-label="Note title"
            autoFocus={isNew}
          />
        </div>

        <div className="editor-divider" aria-hidden="true" />

        <div className="editor-content-wrap">
          <textarea
            className="editor-content-input"
            placeholder="Start writing…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            aria-label="Note content"
          />
        </div>
      </div>

      <div className="editor-footer">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <TagManager tags={tags} onTagsChange={setTags} />
          <span className="editor-wordcount">
            {wordCount} {wordCount === 1 ? "word" : "words"} · {charCount} chars
          </span>
        </div>
        <p className="editor-wordcount" style={{ opacity: 0.6 }}>
          Tip: Press <kbd style={{ padding: "1px 4px", borderRadius: "3px", border: "1px solid var(--color-border)", fontFamily: "var(--font-body)", fontSize: "0.7em" }}>Ctrl+S</kbd> to save
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  );
}
