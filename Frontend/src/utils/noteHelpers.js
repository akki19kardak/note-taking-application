// ── Date formatting ────────────────────────────────────────────────────────
export function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now  = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60)        return "Just now";
  if (diff < 3600)      return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)     return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 2) return "Yesterday";
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ── Word count ─────────────────────────────────────────────────────────────
export function wordCount(content) {
  return (content || "").trim().split(/\s+/).filter(Boolean).length;
}

// ── Preview (strip markdown) ───────────────────────────────────────────────
export function getPreview(content, maxLen = 120) {
  const plain = (content || "")
    .replace(/#{1,6}\s/g, "")
    .replace(/[*_`~]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[.*?\]\(.*?\)/g, "[image]")
    .replace(/\n+/g, " ").trim();
  return plain.length > maxLen ? plain.slice(0, maxLen) + "…" : plain;
}

// ── Filter (search + tag) ──────────────────────────────────────────────────
export function filterNotes(notes, searchTerm, activeTag) {
  let result = notes;
  if (activeTag) result = result.filter((n) => n.tags?.includes(activeTag));
  if (searchTerm.trim()) {
    const q = searchTerm.toLowerCase();
    result = result.filter(
      (n) =>
        n.title?.toLowerCase().includes(q) ||
        n.content?.toLowerCase().includes(q) ||
        n.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }
  return result;
}

// ── Sort ───────────────────────────────────────────────────────────────────
export function sortNotes(notes, sortBy) {
  const copy = [...notes];
  switch (sortBy) {
    case "date":      return copy.sort((a, b) => new Date(b.updatedAt)  - new Date(a.updatedAt));
    case "created":   return copy.sort((a, b) => new Date(b.createdAt)  - new Date(a.createdAt));
    case "title":     return copy.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    case "wordcount": return copy.sort((a, b) => wordCount(b.content)   - wordCount(a.content));
    default:          return copy;
  }
}

// ── Group by tag ───────────────────────────────────────────────────────────
export function groupByTag(notes) {
  const map = {};
  notes.forEach((note) => {
    const tags = note.tags?.length ? note.tags : ["Untagged"];
    tags.forEach((tag) => { if (!map[tag]) map[tag] = []; map[tag].push(note); });
  });
  return map;
}

// ── All unique tags ────────────────────────────────────────────────────────
export function getAllTags(notes) {
  const set = new Set();
  notes.forEach((n) => n.tags?.forEach((t) => set.add(t)));
  return [...set].sort();
}

// ── Writing streak ─────────────────────────────────────────────────────────
export function calcStreak(notes) {
  if (!notes.length) return 0;
  const days = new Set(notes.map((n) => new Date(n.updatedAt).toDateString()));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (days.has(d.toDateString())) streak++;
    else break;
  }
  return streak;
}

// ── Notes per week (last 8 weeks) ─────────────────────────────────────────
export function notesPerWeek(notes) {
  return Array.from({ length: 8 }, (_, i) => {
    const end   = new Date(); end.setDate(end.getDate() - i * 7);
    const start = new Date(end); start.setDate(start.getDate() - 6);
    return {
      label: `W-${i === 0 ? "now" : i}`,
      count: notes.filter((n) => { const d = new Date(n.updatedAt); return d >= start && d <= end; }).length,
    };
  }).reverse();
}

// ── Top tags ───────────────────────────────────────────────────────────────
export function topTags(notes, limit = 8) {
  const freq = {};
  notes.forEach((n) => n.tags?.forEach((t) => { freq[t] = (freq[t] || 0) + 1; }));
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([tag, count]) => ({ tag, count }));
}
