import React, { useState, useEffect, useCallback, useRef } from "react";
import { TagManager } from "./TagManager";
import { useDebounce } from "../hooks/useDebounce";

export function NoteEditor({ note, onSave, onCancel }) {
  const [title, setTitle]     = useState(note?.title   || "");
  const [content, setContent] = useState(note?.content || "");
  const [tags, setTags]       = useState(note?.tags    || []);

  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error
  const isFirstRender = useRef(true);
  const lastSavedRef  = useRef({
    title:   note?.title   || "",
    content: note?.content || "",
    tags:    note?.tags    || [],
  });

  // Sync state when switching notes
  useEffect(() => {
    setTitle(note?.title   || "");
    setContent(note?.content || "");
    setTags(note?.tags    || []);
    setSaveStatus("idle");
    isFirstRender.current = true;
    lastSavedRef.current  = {
      title:   note?.title   || "",
      content: note?.content || "",
      tags:    note?.tags    || [],
    };
  }, [note?._id]);

  // Debounce all fields
  const debouncedTitle   = useDebounce(title,   2000);
  const debouncedContent = useDebounce(content, 2000);
  const debouncedTags    = useDebounce(tags,    2000);

  const hasChanges = useCallback(() => {
    const last = lastSavedRef.current;
    return (
      debouncedTitle   !== last.title   ||
      debouncedContent !== last.content ||
      JSON.stringify(debouncedTags) !== JSON.stringify(last.tags)
    );
  }, [debouncedTitle, debouncedContent, debouncedTags]);

  // Auto-save fires when debounced values settle
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!debouncedTitle.trim()) return;
    if (!hasChanges())          return;

    const autoSave = async () => {
      setSaveStatus("saving");
      try {
        await onSave(debouncedTitle.trim(), debouncedContent, debouncedTags);
        lastSavedRef.current = {
          title:   debouncedTitle,
          content: debouncedContent,
          tags:    debouncedTags,
        };
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      } catch {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    };

    autoSave();
  }, [debouncedTitle, debouncedContent, debouncedTags]);

  // Manual save — Ctrl/Cmd + S
  const handleManualSave = useCallback(async () => {
    if (!title.trim()) return;
    setSaveStatus("saving");
    try {
      await onSave(title.trim(), content, tags);
      lastSavedRef.current = { title, content, tags };
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }, [title, content, tags, onSave]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleManualSave();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handleManualSave]);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;
  const isNew     = !note;

  const statusConfig = {
    idle:   { label: "",              color: "var(--color-text-faint)" },
    saving: { label: "Saving…",       color: "var(--color-text-muted)" },
    saved:  { label: "Saved ✓",       color: "var(--color-success)"    },
    error:  { label: "Save failed ✕", color: "var(--color-error)"      },
  };

  const status = statusConfig[saveStatus];

  return (
    <div className="note-editor" role="main" aria-label="Note editor">

      {/* Toolbar */}
      <div className="editor-toolbar">
        <div className="editor-toolbar-left">
          <span className={`badge ${isNew ? "badge-new" : "badge-edit"}`}>
            {isNew ? "New note" : "Editing"}
          </span>

          {/* Live auto-save status */}
          <span className="autosave-status" style={{ color: status.color }}>
            {saveStatus === "saving" && (
              <svg
                className="spin"
                width="12" height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            )}
            {status.label}
          </span>
        </div>

        <div className="editor-toolbar-right">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button
            className="btn-save"
            onClick={handleManualSave}
            disabled={saveStatus === "saving" || !title.trim()}
            aria-label="Save note"
          >
            {saveStatus === "saving" ? "Saving…"
              : saveStatus === "saved" ? "Saved ✓"
              : "Save"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="editor-body">
        <div className="editor-title-wrap">
          <textarea
            className="editor-title-input"
            placeholder="Untitled…"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
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
            placeholder="Start writing… (auto-saves 2s after you stop typing)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            aria-label="Note content"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="editor-footer">
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-2)",
        }}>
          <TagManager tags={tags} onTagsChange={setTags} />
          <span className="editor-wordcount">
            {wordCount} {wordCount === 1 ? "word" : "words"} · {charCount} chars
          </span>
        </div>

        <p className="editor-wordcount" style={{ opacity: 0.5 }}>
          Auto-saves 2s after you stop typing &nbsp;·&nbsp;
          <kbd style={{
            padding: "1px 5px",
            borderRadius: "3px",
            border: "1px solid var(--color-border)",
            fontFamily: "var(--font-body)",
            fontSize: "0.7em",
          }}>
            Ctrl+S
          </kbd>{" "}
          to save instantly
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; display: inline-block; }
        .autosave-status {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: var(--text-xs);
          font-weight: 500;
          min-width: 72px;
          transition: color 0.3s ease;
        }
      `}</style>
    </div>
  );
}