import { useState, useEffect, useRef } from "react";
import useLearnStore from '../store/useLearnStore';

const API = "";

const TOPICS = ["All", "Math", "Science", "History", "Language", "Programming", "Other"];

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function Notebook() {
  const [notes, setNotes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTopic, setEditTopic] = useState("Other");
  const [filterTopic, setFilterTopic] = useState("All");
  const [loading, setLoading] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiMode, setAiMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const { user } = useLearnStore();
  const userId = user?.id || "guest_user";
  const textareaRef = useRef();

  useEffect(() => { fetchNotes(); }, [filterTopic]);

  async function fetchNotes() {
    const params = new URLSearchParams({ userId });
    if (filterTopic !== "All") params.set("topic", filterTopic);
    const res = await fetch(`${API}/api/notebook?${params}`);
    const data = await res.json();
    setNotes(data);
  }

  function openNote(note) {
    setSelected(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTopic(note.topic || "Other");
    setAiMode(false);
  }

  function newNote() {
    setSelected(null);
    setEditTitle("");
    setEditContent("");
    setEditTopic("Other");
    setAiMode(false);
  }

  async function saveNote() {
    setSaving(true);
    const body = { userId, title: editTitle, content: editContent, topic: editTopic };
    if (selected) {
      await fetch(`${API}/api/notebook/${selected._id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
      });
    } else {
      await fetch(`${API}/api/notebook`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
      });
    }
    setSaving(false);
    await fetchNotes();
  }

  async function deleteNote(id) {
    await fetch(`${API}/api/notebook/${id}`, { method: "DELETE" });
    if (selected?._id === id) setSelected(null);
    fetchNotes();
  }

  async function summarizeWithAI() {
    if (!aiTopic.trim()) return;
    setLoading(true);
    const res = await fetch(`${API}/api/notebook/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: aiTopic, userId })
    });
    const note = await res.json();
    setLoading(false);
    setAiMode(false);
    setAiTopic("");
    openNote(note);
    fetchNotes();
  }

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <span style={styles.logo}>📓 Notebook</span>
          <button style={styles.newBtn} onClick={newNote}>+ New</button>
        </div>

        <input
          style={styles.searchInput}
          placeholder="Search notes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div style={styles.topicRow}>
          {TOPICS.map(t => (
            <button
              key={t}
              style={{ ...styles.topicChip, ...(filterTopic === t ? styles.topicChipActive : {}) }}
              onClick={() => setFilterTopic(t)}
            >{t}</button>
          ))}
        </div>

        <div style={styles.noteList}>
          {filtered.length === 0 && (
            <div style={styles.emptyList}>No notes yet. Create one!</div>
          )}
          {filtered.map(note => (
            <div
              key={note._id}
              style={{ ...styles.noteCard, ...(selected?._id === note._id ? styles.noteCardActive : {}) }}
              onClick={() => openNote(note)}
            >
              <div style={styles.noteCardTitle}>{note.title}</div>
              <div style={styles.noteCardMeta}>
                <span style={styles.topicBadge}>{note.topic}</span>
                <span style={styles.noteTime}>{timeAgo(note.updatedAt || note.createdAt)}</span>
              </div>
              <div style={styles.notePreview}>{note.content.slice(0, 80)}...</div>
              <button
                style={styles.deleteBtn}
                onClick={e => { e.stopPropagation(); deleteNote(note._id); }}
              >🗑</button>
            </div>
          ))}
        </div>

        <button style={styles.aiBtn} onClick={() => setAiMode(true)}>
          ✨ Generate Note with AI
        </button>
      </aside>

      {/* Editor */}
      <main style={styles.editor}>
        {aiMode ? (
          <div style={styles.aiPanel}>
            <div style={styles.aiTitle}>✨ AI Note Generator</div>
            <p style={styles.aiSubtitle}>Enter a topic and AI will generate comprehensive study notes for you.</p>
            <input
              style={styles.aiInput}
              placeholder="e.g. Photosynthesis, World War II, Python decorators..."
              value={aiTopic}
              onChange={e => setAiTopic(e.target.value)}
              onKeyDown={e => e.key === "Enter" && summarizeWithAI()}
              autoFocus
            />
            <div style={{ display: "flex", gap: 12 }}>
              <button style={styles.aiGenBtn} onClick={summarizeWithAI} disabled={loading}>
                {loading ? "Generating..." : "Generate Notes"}
              </button>
              <button style={styles.cancelBtn} onClick={() => setAiMode(false)}>Cancel</button>
            </div>
            {loading && <div style={styles.loadingDots}><span /><span /><span /></div>}
          </div>
        ) : (
          <>
            <div style={styles.editorToolbar}>
              <input
                style={styles.titleInput}
                placeholder="Note title..."
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
              />
              <select
                style={styles.topicSelect}
                value={editTopic}
                onChange={e => setEditTopic(e.target.value)}
              >
                {TOPICS.filter(t => t !== "All").map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <button style={styles.saveBtn} onClick={saveNote} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
            <textarea
              ref={textareaRef}
              style={styles.contentArea}
              placeholder="Start writing your notes here... Use markdown for formatting."
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
            />
            {selected?.aiGenerated && (
              <div style={styles.aiTag}>✨ AI Generated</div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    height: "100%",
    fontFamily: "'Georgia', serif",
    background: "#0f1117",
    color: "#e8e3d8",
    overflow: "hidden",
  },
  sidebar: {
    width: 300,
    background: "#161b27",
    borderRight: "1px solid #2a2f3e",
    display: "flex",
    flexDirection: "column",
    padding: "16px 0",
    overflowY: "auto",
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px 16px",
    borderBottom: "1px solid #2a2f3e",
  },
  logo: { fontSize: 18, fontWeight: 700, color: "#f0c96e" },
  newBtn: {
    background: "#f0c96e",
    color: "#0f1117",
    border: "none",
    borderRadius: 8,
    padding: "6px 14px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
  },
  searchInput: {
    margin: "12px 16px",
    background: "#0f1117",
    border: "1px solid #2a2f3e",
    borderRadius: 8,
    padding: "8px 12px",
    color: "#e8e3d8",
    fontSize: 13,
    outline: "none",
  },
  topicRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    padding: "0 16px 12px",
  },
  topicChip: {
    background: "#0f1117",
    border: "1px solid #2a2f3e",
    color: "#8b8fa8",
    borderRadius: 20,
    padding: "3px 10px",
    fontSize: 11,
    cursor: "pointer",
  },
  topicChipActive: {
    background: "#f0c96e22",
    border: "1px solid #f0c96e",
    color: "#f0c96e",
  },
  noteList: { flex: 1, overflowY: "auto", padding: "0 12px" },
  emptyList: { color: "#555", fontSize: 13, textAlign: "center", marginTop: 40 },
  noteCard: {
    background: "#1e2334",
    borderRadius: 10,
    padding: "12px 14px",
    marginBottom: 10,
    cursor: "pointer",
    border: "1px solid transparent",
    position: "relative",
    transition: "border 0.2s",
  },
  noteCardActive: { border: "1px solid #f0c96e" },
  noteCardTitle: { fontWeight: 700, fontSize: 14, marginBottom: 4, color: "#e8e3d8" },
  noteCardMeta: { display: "flex", justifyContent: "space-between", marginBottom: 6 },
  topicBadge: {
    background: "#f0c96e22",
    color: "#f0c96e",
    fontSize: 10,
    padding: "2px 8px",
    borderRadius: 20,
  },
  noteTime: { color: "#555", fontSize: 11 },
  notePreview: { color: "#6b7080", fontSize: 12, lineHeight: 1.5 },
  deleteBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    opacity: 0.4,
  },
  aiBtn: {
    margin: "12px 16px 0",
    background: "linear-gradient(135deg, #f0c96e22, #a78bfa22)",
    border: "1px solid #f0c96e55",
    color: "#f0c96e",
    borderRadius: 10,
    padding: "10px",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
  editor: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: 32,
    position: "relative",
  },
  editorToolbar: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  titleInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    borderBottom: "2px solid #2a2f3e",
    color: "#e8e3d8",
    fontSize: 22,
    fontFamily: "'Georgia', serif",
    fontWeight: 700,
    padding: "8px 0",
    outline: "none",
  },
  topicSelect: {
    background: "#1e2334",
    border: "1px solid #2a2f3e",
    color: "#e8e3d8",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 13,
  },
  saveBtn: {
    background: "#f0c96e",
    color: "#0f1117",
    border: "none",
    borderRadius: 8,
    padding: "8px 20px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
  },
  contentArea: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "#e8e3d8",
    fontSize: 15,
    lineHeight: 1.9,
    fontFamily: "'Georgia', serif",
    resize: "none",
    outline: "none",
  },
  aiTag: {
    position: "absolute",
    bottom: 24,
    right: 32,
    background: "#f0c96e22",
    color: "#f0c96e",
    borderRadius: 20,
    padding: "4px 14px",
    fontSize: 12,
  },
  aiPanel: {
    maxWidth: 540,
    margin: "80px auto 0",
    textAlign: "center",
  },
  aiTitle: { fontSize: 28, fontWeight: 700, color: "#f0c96e", marginBottom: 12 },
  aiSubtitle: { color: "#8b8fa8", fontSize: 15, marginBottom: 32 },
  aiInput: {
    width: "100%",
    background: "#1e2334",
    border: "1px solid #2a2f3e",
    borderRadius: 12,
    padding: "14px 18px",
    color: "#e8e3d8",
    fontSize: 15,
    outline: "none",
    marginBottom: 20,
    boxSizing: "border-box",
  },
  aiGenBtn: {
    background: "#f0c96e",
    color: "#0f1117",
    border: "none",
    borderRadius: 10,
    padding: "12px 28px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 15,
  },
  cancelBtn: {
    background: "transparent",
    color: "#8b8fa8",
    border: "1px solid #2a2f3e",
    borderRadius: 10,
    padding: "12px 20px",
    cursor: "pointer",
    fontSize: 15,
  },
  loadingDots: { marginTop: 24, display: "flex", justifyContent: "center", gap: 8 },
};