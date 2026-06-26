import React, { useMemo, useEffect, useRef } from "react";
import { wordCount, calcStreak, notesPerWeek, topTags } from "../utils/noteHelpers";

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="dash-stat-card">
      <span className="dash-stat-icon">{icon}</span>
      <div>
        <div className="dash-stat-value">{value}</div>
        <div className="dash-stat-label">{label}</div>
        {sub && <div className="dash-stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

function BarChart({ data, colorVar = "--color-primary" }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="bar-chart">
      {data.map((d) => (
        <div key={d.label} className="bar-col">
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ height: `${(d.count / max) * 100}%`, background: `var(${colorVar})` }}
            />
          </div>
          <span className="bar-label">{d.label}</span>
          <span className="bar-count">{d.count}</span>
        </div>
      ))}
    </div>
  );
}

function TagBar({ tag, count, max }) {
  return (
    <div className="tag-bar-row">
      <span className="tag-bar-name">{tag}</span>
      <div className="tag-bar-track">
        <div className="tag-bar-fill" style={{ width: `${(count / max) * 100}%` }} />
      </div>
      <span className="tag-bar-count">{count}</span>
    </div>
  );
}

export function DashboardPage({ notes }) {
  const totalWords  = useMemo(() => notes.reduce((s, n) => s + wordCount(n.content), 0), [notes]);
  const streak      = useMemo(() => calcStreak(notes), [notes]);
  const weekly      = useMemo(() => notesPerWeek(notes), [notes]);
  const tags        = useMemo(() => topTags(notes, 8), [notes]);
  const tagMax      = tags[0]?.count || 1;

  const topByWords  = useMemo(
    () => [...notes].sort((a, b) => wordCount(b.content) - wordCount(a.content)).slice(0, 8),
    [notes]
  );
  const wMax = wordCount(topByWords[0]?.content || "") || 1;

  const avgWords = notes.length ? Math.round(totalWords / notes.length) : 0;
  const allTagCount = useMemo(() => {
    const s = new Set(); notes.forEach((n) => n.tags?.forEach((t) => s.add(t))); return s.size;
  }, [notes]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Your Writing Stats</h1>
        <p className="dashboard-sub">Insights across all {notes.length} notes</p>
      </div>

      {/* Stat cards */}
      <div className="dash-stats-grid">
        <StatCard icon="📝" label="Total Notes" value={notes.length} />
        <StatCard icon="✍️" label="Total Words" value={totalWords.toLocaleString()} />
        <StatCard icon="🔥" label="Writing Streak" value={`${streak}d`} sub={streak > 0 ? "Keep it up!" : "Write today to start"} />
        <StatCard icon="📊" label="Avg Words/Note" value={avgWords} />
        <StatCard icon="🏷️" label="Unique Tags" value={allTagCount} />
        <StatCard icon="⭐" label="Starred" value={notes.filter((n) => n.favorite).length} />
      </div>

      <div className="dash-charts-row">
        {/* Weekly activity */}
        <div className="dash-chart-card">
          <h2 className="dash-chart-title">Notes per Week</h2>
          <BarChart data={weekly} colorVar="--color-primary" />
        </div>

        {/* Top tags */}
        <div className="dash-chart-card">
          <h2 className="dash-chart-title">Top Tags</h2>
          {tags.length === 0 ? (
            <p className="dash-empty">No tags yet — add tags to your notes!</p>
          ) : (
            <div className="tag-bars">
              {tags.map((t) => (
                <TagBar key={t.tag} tag={t.tag} count={t.count} max={tagMax} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Word count per note */}
      <div className="dash-chart-card dash-chart-full">
        <h2 className="dash-chart-title">Longest Notes</h2>
        {topByWords.length === 0 ? (
          <p className="dash-empty">No notes yet.</p>
        ) : (
          <div className="note-word-bars">
            {topByWords.map((n) => {
              const wc = wordCount(n.content);
              return (
                <div key={n._id} className="note-word-row">
                  <span className="note-word-title" title={n.title}>
                    {n.title || "Untitled"}
                  </span>
                  <div className="note-word-track">
                    <div
                      className="note-word-fill"
                      style={{ width: `${(wc / wMax) * 100}%` }}
                    />
                  </div>
                  <span className="note-word-count">{wc}w</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
