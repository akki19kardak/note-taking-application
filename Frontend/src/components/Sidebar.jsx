import React from "react";
import { NoteCard } from "./NoteCard";
import { SearchBar } from "./SearchBar";
import { Search, Star, Plus } from "lucide-react";
import { searchNotes, sortNotes } from "../utils/noteHelpers";

export function Sidebar({
  notes,
  loading,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  selectedNote,
  onSelectNote,
  onDeleteNote,
  onToggleFavorite,
  onCreateNote,
}) {
  const filteredNotes = searchNotes(notes, searchTerm);
  const sortedNotes = sortNotes(filteredNotes, sortBy);
  const favoriteNotes = sortedNotes.filter(n => n.isFavorite);
  const allNotes = sortedNotes.filter(n => !n.isFavorite);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="app-title">Notes ✨</h1>
        <p className="app-subtitle">Organize your thoughts</p>
      </div>

      <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />

      <div className="sort-controls">
        <label>Sort by:</label>
        <select value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
          <option value="date">Date</option>
          <option value="title">Title</option>
          <option value="length">Length</option>
          <option value="wordCount">Word Count</option>
        </select>
      </div>

      <div className="notes-section">
        {favoriteNotes.length > 0 && (
          <div className="section">
            <div className="section-header">
              <Star size={18} color="#2d6a4f" />
              <h2>Favorites</h2>
            </div>
            <div className="notes-list">
              {favoriteNotes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  isActive={selectedNote?._id === note._id}
                  onSelect={onSelectNote}
                  onDelete={onDeleteNote}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          </div>
        )}

        <div className="section">
          <div className="section-header">
            <Plus size={18} />
            <h2>All Notes</h2>
          </div>
          {loading ? (
            <div className="loading-state">Loading...</div>
          ) : allNotes.length === 0 ? (
            <div className="empty-state">
              <p>No notes yet. Create your first note!</p>
            </div>
          ) : (
            <div className="notes-list">
              {allNotes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  isActive={selectedNote?._id === note._id}
                  onSelect={onSelectNote}
                  onDelete={onDeleteNote}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}