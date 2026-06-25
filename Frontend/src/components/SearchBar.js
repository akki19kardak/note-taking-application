import React from "react";
import { Search } from "lucide-react";

export function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div className="search-bar">
      <Search size={20} className="search-icon" />
      <input
        type="text"
        className="search-input"
        placeholder="Search notes by title, content, or tags..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      {searchTerm && (
        <button
          className="clear-search"
          onClick={() => onSearchChange("")}
        >
          ✕
        </button>
      )}
    </div>
  );
}