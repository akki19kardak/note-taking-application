import React, { useState } from "react";
import { Tag, X } from "lucide-react";

export function TagManager({ tags, onAddTag, onRemoveTag }) {
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onAddTag(newTag.trim());
      setNewTag("");
    }
  };

  return (
    <div className="tag-manager">
      <div className="existing-tags">
        {tags.map((tag) => (
          <span key={tag} className="tag-item">
            <Tag size={14} />
            {tag}
            <button onClick={() => onRemoveTag(tag)}>
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
      <div className="add-tag">
        <input
          type="text"
          placeholder="Add tag..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
        />
        <button onClick={handleAddTag} className="add-tag-btn">
          Add
        </button>
      </div>
    </div>
  );
}