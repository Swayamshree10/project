// components/RAGView.jsx — Engineering Tutor UI with chat + document upload
import { useState, useRef, useEffect } from 'react'
import { useRAGChat } from '../hooks/useRAGChat'

const SUGGESTIONS = [
  "What is Newton's Second Law?",
  "Explain time complexity of quicksort",
  "What is Ohm's Law?",
  "Explain normalisation in DBMS",
  "What is a deadlock in OS?",
  "Explain Bernoulli's equation",
]

const SUBJECTS = [
  'general', 'mathematics', 'physics', 'chemistry',
  'programming', 'electronics', 'networks', 'os', 'dbms', 'software_engineering',
]

export default function RAGView() {
  const { messages, loading, error, ask, clear } = useRAGChat()
  const [input, setInput] = useState('')
  const [tab, setTab] = useState('chat')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function handleSend() {
    if (!input.trim() || loading) return
    ask(input.trim())
    setInput('')
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div style={styles.wrap}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitle}>📚 Engineering Tutor</div>
          <div style={styles.headerSub}>NVIDIA NIM · Llama 3.1 · Document Q&A</div>
        </div>
        <div style={styles.headerRight}>
          <button style={{ ...styles.tabBtn, ...(tab === 'chat' ? styles.tabActive : {}) }} onClick={() => setTab('chat')}>💬 Chat</button>
          <button style={{ ...styles.tabBtn, ...(tab === 'upload' ? styles.tabActive : {}) }} onClick={() => setTab('upload')}>📤 Upload</button>
          {tab === 'chat' && messages.length > 0 && (
            <button style={styles.clearBtn} onClick={clear}>Clear</button>
          )}
        </div>
      </div>

      {/* Chat tab */}
      {tab === 'chat' && (
        <>
          <div style={styles.messages}>
            {messages.length === 0 && (
              <div style={styles.empty}>
                <div style={styles.emptyIcon}>🎓</div>
                <p style={styles.emptyText}>Ask any engineering question</p>
                <p style={styles.emptySub}>Answers are grounded in your uploaded curriculum documents</p>
                <div style={styles.suggestions}>
                  {SUGGESTIONS.map((s) => (
                    <button key={s} style={styles.suggestion} onClick={() => ask(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{ ...styles.bubble, ...(msg.role === 'user' ? styles.userBubble : styles.aiBubble) }}>
                <div style={styles.bubbleRole}>{msg.role === 'user' ? 'You' : 'Mind Trail'}</div>
                <div style={styles.bubbleText}>{msg.content}</div>
                {msg.sources && msg.sources.length > 0 && (
                  <div style={styles.sources}>
                    <div style={styles.sourcesLabel}>Sources</div>
                    {msg.sources.map((src, j) => (
                      <div key={j} style={styles.sourceItem}>
                        <span style={styles.sourceFile}>{src.source.split(/[/\\]/).pop()}</span>
                        <span style={styles.sourceSnippet}>{src.snippet}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ ...styles.bubble, ...styles.aiBubble }}>
                <div style={styles.bubbleRole}>Mind Trail</div>
                <div className="typing"><span /><span /><span /></div>
              </div>
            )}

            {error && <div style={styles.error}>{error}</div>}
            <div ref={bottomRef} />
          </div>

          <div style={styles.inputRow}>
            <textarea
              style={styles.textarea}
              placeholder="Ask an engineering question... (Enter to send)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
            />
            <button
              style={{ ...styles.sendBtn, opacity: (!input.trim() || loading) ? 0.4 : 1 }}
              onClick={handleSend}
              disabled={!input.trim() || loading}
            >
              ➤
            </button>
          </div>
        </>
      )}

      {/* Upload tab */}
      {tab === 'upload' && <UploadPanel />}
    </div>
  )
}

function UploadPanel() {
  const [subject, setSubject] = useState('general')
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    const dropped = Array.from(e.dataTransfer.files).filter(isAllowed)
    setFiles((f) => [...f, ...dropped])
  }

  function onPick(e) {
    const picked = Array.from(e.target.files).filter(isAllowed)
    setFiles((f) => [...f, ...picked])
  }

  function isAllowed(f) {
    return ['.pdf', '.txt', '.docx'].some((ext) => f.name.toLowerCase().endsWith(ext))
  }

  function removeFile(i) {
    setFiles((f) => f.filter((_, idx) => idx !== i))
  }

  async function uploadAll() {
    setUploading(true)
    setResults([])
    const newResults = []

    for (const file of files) {
      const form = new FormData()
      form.append('file', file)
      try {
        // Try RAG server first (port 8000)
        let res, data
        try {
          res = await fetch(`http://localhost:8000/upload?subject=${subject}`, {
            method: 'POST', body: form, signal: AbortSignal.timeout(4000),
          })
          data = await res.json()
        } catch {
          // Fallback to Node.js server
          const form2 = new FormData()
          form2.append('file', file)
          res = await fetch(`/api/upload?subject=${subject}`, { method: 'POST', body: form2 })
          data = await res.json()
        }
        if (res.ok) {
          newResults.push({ name: file.name, success: true, chunks: data.chunks })
        } else {
          newResults.push({ name: file.name, success: false, error: data.detail || data.error })
        }
      } catch (err) {
        newResults.push({ name: file.name, success: false, error: 'Server not reachable' })
      }
    }

    setResults(newResults)
    setFiles([])
    setUploading(false)
  }

  return (
    <div style={styles.uploadWrap}>
      <h2 style={styles.uploadTitle}>Upload Study Materials</h2>
      <p style={styles.uploadSub}>Supports PDF, TXT, DOCX — upload your study materials and ask questions about them</p>

      {/* Subject selector */}
      <div style={styles.field}>
        <label style={styles.label}>Subject folder</label>
        <select style={styles.select} value={subject} onChange={(e) => setSubject(e.target.value)}>
          {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Drop zone */}
      <div
        style={{ ...styles.dropzone, ...(dragging ? styles.dropzoneActive : {}) }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current.click()}
      >
        <div style={styles.dropIcon}>📂</div>
        <div style={styles.dropText}>Drag & drop files here or <span style={styles.dropLink}>browse</span></div>
        <div style={styles.dropHint}>PDF, TXT, DOCX accepted</div>
        <input ref={inputRef} type="file" multiple accept=".pdf,.txt,.docx" style={{ display: 'none' }} onChange={onPick} />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div style={styles.fileList}>
          {files.map((f, i) => (
            <div key={i} style={styles.fileItem}>
              <span style={styles.fileIcon}>{f.name.endsWith('.pdf') ? '📄' : f.name.endsWith('.docx') ? '📝' : '📃'}</span>
              <span style={styles.fileName}>{f.name}</span>
              <span style={styles.fileSize}>{(f.size / 1024).toFixed(1)} KB</span>
              <button style={styles.removeBtn} onClick={() => removeFile(i)}>×</button>
            </div>
          ))}
          <button
            style={{ ...styles.uploadBtn, opacity: uploading ? 0.5 : 1 }}
            onClick={uploadAll}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} file${files.length > 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div style={styles.results}>
          {results.map((r, i) => (
            <div key={i} style={{ ...styles.resultItem, borderLeft: `4px solid ${r.success ? '#22c55e' : '#ef4444'}` }}>
              <span style={styles.resultIcon}>{r.success ? '✅' : '❌'}</span>
              <div>
                <div style={styles.resultName}>{r.name}</div>
                <div style={styles.resultMsg}>
                  {r.success ? `Indexed ${r.chunks} chunks — ready to query!` : `Failed: ${r.error}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' },
  header: { padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 },
  headerTitle: { fontWeight: 700, fontSize: 16, color: '#1e293b' },
  headerSub: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  headerRight: { display: 'flex', gap: 8, alignItems: 'center' },
  tabBtn: { padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, color: '#64748b', cursor: 'pointer', fontWeight: 500 },
  tabActive: { background: '#6366f1', color: '#fff', borderColor: '#6366f1' },
  clearBtn: { background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 14px', fontSize: 12, color: '#64748b', cursor: 'pointer' },

  messages: { flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#64748b', marginBottom: 20 },
  suggestions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%', maxWidth: 520 },
  suggestion: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#6366f1', cursor: 'pointer', textAlign: 'left', fontWeight: 500 },
  bubble: { maxWidth: '78%', borderRadius: 14, padding: '12px 16px' },
  userBubble: { alignSelf: 'flex-end', background: '#6366f1', color: '#fff' },
  aiBubble: { alignSelf: 'flex-start', background: '#fff', border: '1px solid #e2e8f0', color: '#1e293b' },
  bubbleRole: { fontSize: 11, fontWeight: 600, marginBottom: 6, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 0.5 },
  bubbleText: { fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' },
  sources: { marginTop: 12, borderTop: '1px solid #f1f5f9', paddingTop: 10 },
  sourcesLabel: { fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  sourceItem: { display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 8 },
  sourceFile: { fontSize: 12, fontWeight: 600, color: '#6366f1' },
  sourceSnippet: { fontSize: 12, color: '#64748b', lineHeight: 1.5 },
  error: { color: '#ef4444', fontSize: 13, background: '#fef2f2', padding: '10px 14px', borderRadius: 8 },
  inputRow: { padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 10, background: '#fff', alignItems: 'flex-end', flexShrink: 0 },
  textarea: { flex: 1, padding: '12px 16px', borderRadius: 12, border: '2px solid #e2e8f0', fontSize: 14, resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5 },
  sendBtn: { width: 44, height: 44, borderRadius: 12, border: 'none', background: '#6366f1', color: '#fff', fontSize: 18, cursor: 'pointer', flexShrink: 0 },

  uploadWrap: { flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: 20 },
  uploadTitle: { fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 },
  uploadSub: { fontSize: 13, color: '#64748b', margin: 0 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  select: { padding: '10px 14px', borderRadius: 10, border: '2px solid #e2e8f0', fontSize: 14, outline: 'none', maxWidth: 260 },
  dropzone: { border: '2px dashed #c7d2fe', borderRadius: 14, padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', background: '#fafafe', transition: 'all 0.15s' },
  dropzoneActive: { borderColor: '#6366f1', background: '#eef2ff' },
  dropIcon: { fontSize: 36 },
  dropText: { fontSize: 15, color: '#374151', fontWeight: 500 },
  dropLink: { color: '#6366f1', textDecoration: 'underline' },
  dropHint: { fontSize: 12, color: '#94a3b8' },
  fileList: { display: 'flex', flexDirection: 'column', gap: 8 },
  fileItem: { display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px' },
  fileIcon: { fontSize: 18 },
  fileName: { flex: 1, fontSize: 13, fontWeight: 500, color: '#1e293b' },
  fileSize: { fontSize: 12, color: '#94a3b8' },
  removeBtn: { background: 'none', border: 'none', color: '#94a3b8', fontSize: 18, cursor: 'pointer', lineHeight: 1 },
  uploadBtn: { padding: '12px 24px', borderRadius: 10, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginTop: 4 },
  results: { display: 'flex', flexDirection: 'column', gap: 10 },
  resultItem: { display: 'flex', alignItems: 'flex-start', gap: 12, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px' },
  resultIcon: { fontSize: 18, flexShrink: 0 },
  resultName: { fontSize: 14, fontWeight: 600, color: '#1e293b' },
  resultMsg: { fontSize: 13, color: '#64748b', marginTop: 2 },
}
