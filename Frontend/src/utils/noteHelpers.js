// Note Helper Functions

/**
 * Format date to readable string
 */
export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Get word count from content
 */
export const getWordCount = (content) => {
  if (!content.trim()) return 0;
  return content.trim().split(/\s+/).filter((word) => word.length > 0).length;
};

/**
 * Get character count
 */
export const getCharCount = (content) => {
  return content.length;
};

/**
 * Generate note preview
 */
export const getPreview = (content, maxLength = 80) => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength).trim() + "...";
};

/**
 * Check if note is empty
 */
export const isEmptyNote = (title, content) => {
  return !title.trim() || !content.trim();
};

/**
 * Categorize note by content
 */
export const categorizeNote = (title, content) => {
  const lowerTitle = title.toLowerCase();
  const lowerContent = content.toLowerCase();

  const keywords = {
    personal: ["me", "my", "i", "feel", "thought", "life", "day"],
    work: ["project", "client", "team", "meeting", "task", "deadline"],
    learning: ["learn", "study", "course", "read", "book", "tutorial"],
    ideas: ["idea", "concept", "brainstorm", "vision"],
    quotes: ["said", "\"", "'", "quote", "wisdom"],
    todo: ["todo", "need", "must", "should", "remember", "check"],
  };

  for (const [category, words] of Object.entries(keywords)) {
    if (
      words.some((word) => lowerTitle.includes(word)) ||
      words.some((word) => lowerContent.includes(word))
    ) {
      return category;
    }
  }

  return "general";
};

/**
 * Get color for category
 */
export const getCategoryColor = (category) => {
  const colors = {
    personal: "#e8f0eb",
    work: "#f0e8e8",
    learning: "#e8eaf0",
    ideas: "#f5f0e8",
    quotes: "#f0f5f0",
    todo: "#fbe8e8",
    general: "#f6f4ef",
  };
  return colors[category] || colors.general;
};

/**
 * Search notes by title/content/tags
 */
export const searchNotes = (notes, searchTerm) => {
  if (!searchTerm.trim()) return notes;

  const term = searchTerm.toLowerCase();
  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(term) ||
      note.content.toLowerCase().includes(term) ||
      (note.tags && note.tags.some((tag) => tag.toLowerCase().includes(term)))
  );
};

/**
 * Sort notes by various criteria
 */
export const sortNotes = (notes, sortBy = "date") => {
  const sorted = [...notes];

  switch (sortBy) {
    case "date":
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case "title":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "length":
      return sorted.sort((a, b) => b.content.length - a.content.length);
    case "wordCount":
      return sorted.sort((a, b) => getWordCount(b.content) - getWordCount(a.content));
    default:
      return sorted;
  }
};

/**
 * Export notes as JSON
 */
export const exportNotes = (notes) => {
  const data = JSON.stringify(notes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  return url;
};