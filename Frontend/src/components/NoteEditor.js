import React from "react";
import { Note } from "../utils/noteHelpers";
import { TagManager } from "./TagManager";
import { Pencil, Save, X } from "lucide-react";

export function NoteEditor({ note, onSave, onCancel, isEditing }) {
  const [title, setTitle] = React.useState(note?.title || "");
  const [content, setContent] = React.useState(note?.content || "");
  const [tags, setTags] = React.useState(note?.tags || []);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    onSave(title, content, tags);
  };

  const handleAddTag = (tag) => {
    setTags([...tags, tag]);
  };

  const handleRemoveTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <div className="note-editor">
      <div className="editor-header">
        <h2>{note ? "Edit Note" : "Create New Note"}</h2>
        {note && (
          <button onClick={onCancel} className="cancel-btn">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="editor-form">
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            className="title-input"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Content</label>
          <textarea
            className="content-input"
            placeholder="Write your note here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
          />
        </div>

        <div className="form-group">
          <label>Tags</label>
          <TagManager
            tags={tags}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
          />
        </div>

        <div className="editor-actions">
          <button
            onClick={handleSave}
            className="save-btn"
            disabled={!title.trim() || !content.trim()}
          >
            <Save size={18} />
            {isEditing ? "Save Changes" : "Create Note"}
          </button>
        </div>
      </div>
    </div>
  );
}