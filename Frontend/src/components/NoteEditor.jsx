import React, { useState, useEffect, useRef, useCallback } from "react";
import { TagManager } from "./TagManager";

// ── Templates ──────────────────────────────────────────────────────────────
const today = new Date().toLocaleDateString("en-IN", {
  day: "numeric", month: "long", year: "numeric",
});

const TEMPLATES = [
  {
    label: "Meeting Notes", icon: "📋",
    title: `Meeting Notes — ${today}`,
    content: `## Attendees\n- \n\n## Agenda\n1. \n2. \n\n## Discussion\n\n## Action Items\n- [ ] \n\n## Next Meeting\n`,
  },
  {
    label: "Daily Journal", icon: "📔",
    title: `Journal — ${today}`,
    content: `## How I'm feeling today\n\n## What I accomplished\n- \n\n## What I'm grateful for\n- \n\n## Tomorrow's focus\n- \n`,
  },
  {
    label: "Todo List", icon: "✅",
    title: "Todo — [Project]",
    content: `## High Priority\n- [ ] \n\n## Medium Priority\n- [ ] \n\n## Low Priority\n- [ ] \n\n## Done\n- [x] \n`,
  },
];

const COLORS = ["none","red","orange","yellow","green","teal","blue","purple","pink"];

// ── Cloudinary upload ──────────────────────────────────────────────────────
const CLOUD_NAME     = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET  = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

async function uploadToCloudinary(file) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) return null;
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: fd });
  const data = await res.json();
  return data.secure_url || null;
}

// ── Markdown renderer (lazy CDN) ───────────────────────────────────────────
function renderMarkdown(md) {
  // Very lightweight inline renderer — no external dep needed for basic MD
  return md
    .replace(/^#{6}\s(.+)$/gm, "<h6>$1</h6>")
    .replace(/^#{5}\s(.+)$/gm, "<h5>$1</h5>")
    .replace(/^#{4}\s(.+)$/gm, "<h4>$1</h4>")
    .replace(/^#{3}\s(.+)$/gm, "<h3>$1</h3>")
    .replace(/^#{2}\s(.+)$/gm, "<h2>$1</h2>")
    .replace(/^#{1}\s(.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^```([\w]*)\n([\s\S]*?)```$/gm, (_, lang, code) =>
      `<pre class="code-block language-${lang || 'text'}"><code>${code.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</code></pre>`
    )
    .replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:6px;margin:8px 0" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/^- \[x\] (.+)$/gm, '<li class="task done"><input type="checkbox" checked disabled /> $1</li>')
    .replace(/^- \[ \] (.+)$/gm, '<li class="task"><input type="checkbox" disabled /> $1</li>')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^---$/gm, "<hr />")
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br />")
    .replace(/^(?!<[a-z])(.+)$/gm, (m) => m.startsWith("<") ? m : `<p>${m}</p>`);
}

// ── useDebounce ────────────────────────────────────────────────────────────
function useDebounce(fn, delay) {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

// ── Component ──────────────────────────────────────────────────────────────
export function NoteEditor({ note, onSave, onCancel }) {
  const [title,     setTitle]     = useState(note?.title   || "");
  const [content,   setContent]   = useState(note?.content || "");
  const [tags,      setTags]      = useState(note?.tags    || []);
  const [color,     setColor]     = useState(note?.color   || "none");
  const [preview,   setPreview]   = useState(false);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved
  const [showTpl,   setShowTpl]   = useState(!note);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef(null);

  // Sync when switching notes
  useEffect(() => {
    setTitle(note?.title   || "");
    setContent(note?.content || "");
    setTags(note?.tags    || []);
    setColor(note?.color  || "none");
    setPreview(false);
    setShowTpl(!note);
    setSaveState("idle");
  }, [note?._id]);

  // ── Auto-save ────────────────────────────────────────────────────────────
  const doSave = useCallback(async (t, c, tg, cl) => {
    if (!t.trim()) return;
    setSaveState("saving");
    await onSave(t, c, tg, cl);
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 2000);
  }, [onSave]);

  const debouncedSave = useDebounce(doSave, 2000);

  const triggerSave = (t, c, tg, cl) => {
    setSaveState("idle");
    debouncedSave(t, c, tg, cl);
  };

  const handleTitleChange = (v) => { setTitle(v);   triggerSave(v, content, tags, color); };
  const handleContentChange = (v) => { setContent(v); triggerSave(title, v, tags, color); };
  const handleTagChange = (tg)    => { setTags(tg);   if (title.trim()) triggerSave(title, content, tg, color); };
  const handleColorChange = (cl)  => { setColor(cl);  if (title.trim()) triggerSave(title, content, tags, cl); };

  // ── Template ─────────────────────────────────────────────────────────────
  const applyTemplate = (tpl) => {
    setTitle(tpl.title); setContent(tpl.content); setShowTpl(false);
    debouncedSave(tpl.title, tpl.content, tags, color);
  };

  // ── Image upload ─────────────────────────────────────────────────────────
  const insertImage = async (file) => {
    if (!file) return;
    setUploading(true);
    const url = await uploadToCloudinary(file);
    setUploading(false);
    if (!url) return;
    const md = `\n![image](${url})\n`;
    const el  = textareaRef.current;
    const pos = el?.selectionStart ?? content.length;
    const next = content.slice(0, pos) + md + content.slice(pos);
    setContent(next);
    triggerSave(title, next, tags, color);
  };

  const handlePaste = async (e) => {
    const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith("image/"));
    if (!item) return;
    e.preventDefault();
    await insertImage(item.getAsFile());
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = [...(e.dataTransfer?.files || [])].find((f) => f.type.startsWith("image/"));
    await insertImage(file);
  };

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "p") { e.preventDefault(); setPreview((v) => !v); }
    if (e.key === "Tab") {
      e.preventDefault();
      const el = textareaRef.current;
      const s  = el.selectionStart;
      const next = content.slice(0, s) + "  " + content.slice(el.selectionEnd);
      setContent(next);
      setTimeout(() => { el.selectionStart = el.selectionEnd = s + 2; }, 0);
    }
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  return (
    <div className="note-editor">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <div className="color-picker">
            {COLORS.map((c) => (
              <button key={c}
                className={`color-dot color-dot-${c}${color === c ? " active" : ""}`}
                onClick={() => handleColorChange(c)}
                aria-label={`Color ${c}`} title={c}
              />
            ))}
          </div>
        </div>
        <div className="toolbar-right">
          <span className={`save-indicator save-${saveState}`}>
            {saveState === "saving" && "Saving…"}
            {saveState === "saved"  && "✓ Saved"}
          </span>
          <button
            className={`btn-toolbar${preview ? " active" : ""}`}
            onClick={() => setPreview((v) => !v)}
            title="Toggle preview (Ctrl+P)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            {preview ? "Edit" : "Preview"}
          </button>
        </div>
      </div>

      {/* Template picker */}
      {showTpl && (
        <div className="template-picker">
          <span className="template-label">Start with a template:</span>
          <div className="template-list">
            {TEMPLATES.map((tpl) => (
              <button key={tpl.label} className="template-btn" onClick={() => applyTemplate(tpl)}>
                <span>{tpl.icon}</span>{tpl.label}
              </button>
            ))}
            <button className="template-btn template-btn-blank" onClick={() => setShowTpl(false)}>Blank</button>
          </div>
        </div>
      )}

      {/* Title */}
      <input
        className="note-title-input"
        placeholder="Note title…"
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
      />

      {/* Editor / Preview */}
      <div className="editor-body">
        {preview ? (
          <div
            className="markdown-preview"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content || "*Nothing to preview yet…*") }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            className={`note-content-input${uploading ? " uploading" : ""}`}
            placeholder={uploading ? "Uploading image…" : "Write in Markdown… paste or drop images"}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            spellCheck
          />
        )}
      </div>

      {/* Footer */}
      <div className="editor-footer">
        <TagManager tags={tags} onChange={handleTagChange} />
        <span className="word-count">{wordCount} words · {charCount} chars</span>
      </div>
    </div>
  );
}
