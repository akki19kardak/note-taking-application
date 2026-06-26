import React, { useState } from "react";

export function TagManager({ tags, onTagsChange }) {
  const [input, setInput] = useState("");

  const addTag = (val) => {
    const tag = val.trim().toLowerCase().replace(/\s+/g, "-");
    if (tag && !tags.includes(tag)) {
      onTagsChange([...tags, tag]);
    }
    setInput("");
  };

  const removeTag = (tag) => {
    onTagsChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="tag-manager" role="group" aria-label="Tags">
      <span className="tag-manager-label">Tags</span>
      {tags.map((tag) => (
        <span key={tag} className="tag-manager-pill">
          {tag}
          <button
            className="tag-manager-remove"
            onClick={() => removeTag(tag)}
            aria-label={`Remove tag ${tag}`}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </span>
      ))}
      <input
        className="tag-manager-input"
        type="text"
        placeholder="Add tag…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input && addTag(input)}
        aria-label="Add a tag"
      />
    </div>
  );
}
