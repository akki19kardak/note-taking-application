import React, { useState, useRef } from "react";

export function TagManager({ tags = [], onChange }) {
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  const normalise = (t) =>
    t.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const addTag = (raw) => {
    const tag = normalise(raw);
    if (!tag || tags.includes(tag)) return;
    onChange([...tags, tag]);
    setInput("");
  };

  const removeTag = (tag) => onChange(tags.filter((t) => t !== tag));

  const handleKey = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(input); }
    if (e.key === "Backspace" && !input && tags.length) removeTag(tags[tags.length - 1]);
  };

  return (
    <div className="tag-manager" onClick={() => inputRef.current?.focus()}>
      {tags.map((t) => (
        <span key={t} className="tag-pill">
          {t}
          <button className="tag-remove"
            onClick={(e) => { e.stopPropagation(); removeTag(t); }}
            aria-label={`Remove tag ${t}`}>×</button>
        </span>
      ))}
      <input
        ref={inputRef}
        className="tag-input"
        placeholder={tags.length === 0 ? "Add tags…" : ""}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => input && addTag(input)}
      />
    </div>
  );
}
