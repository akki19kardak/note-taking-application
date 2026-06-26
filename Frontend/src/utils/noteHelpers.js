/**
 * Format a date string into a human-readable relative or absolute date.
 */
export function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: days > 365 ? "numeric" : undefined });
}

/**
 * Get a plain-text preview of note content (strips whitespace/newlines).
 */
export function getPreview(content, maxChars = 120) {
  if (!content) return "";
  return content.replace(/\s+/g, " ").trim().slice(0, maxChars) + (content.length > maxChars ? "…" : "");
}

/**
 * Filter notes by search term (title + content + tags).
 */
export function filterNotes(notes, searchTerm) {
  if (!searchTerm?.trim()) return notes;
  const q = searchTerm.toLowerCase();
  return notes.filter(
    (n) =>
      n.title?.toLowerCase().includes(q) ||
      n.content?.toLowerCase().includes(q) ||
      n.tags?.some((t) => t.toLowerCase().includes(q))
  );
}

/**
 * Sort notes by the given key: "date" | "title" | "favorites".
 */
export function sortNotes(notes, sortBy) {
  const copy = [...notes];
  if (sortBy === "date") {
    return copy.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }
  if (sortBy === "title") {
    return copy.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  }
  if (sortBy === "favorites") {
    return copy.sort((a, b) => Number(b.favorite) - Number(a.favorite) || new Date(b.updatedAt) - new Date(a.updatedAt));
  }
  return copy;
}

/**
 * Group notes by their first tag (or "Untagged").
 */
export function groupByTag(notes) {
  return notes.reduce((acc, note) => {
    const key = note.tags?.[0] || "Untagged";
    (acc[key] = acc[key] || []).push(note);
    return acc;
  }, {});
}
