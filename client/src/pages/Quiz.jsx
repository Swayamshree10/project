import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";
const userId = "user_1"; // replace with your auth system

const DIFFICULTY = ["Easy", "Medium", "Hard"];
const QUESTION_COUNTS = [3, 5, 10];

export default function Quiz() {
  const [view, setView] = useState("home"); // home | quiz | result | progress
  const [topic, setTopic] = useState("");
  const [numQ, setNumQ] = useState(5);
  const [quizData, setQuizData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (view === "progress") fetchProgress();
  }, [view]);

  async function generateQuiz() {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/quiz/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, userId, numQuestions: numQ }),
      });
      const data = await res.json();
      setQuizData(data);
      setAnswers({});
      setCurrent(0);
      setResult(null);
      setView("quiz");
    } catch (e) {
      alert("Failed to generate quiz. Make sure your server is running.");
    }
    setLoading(false);
  }

  async function submitQuiz() {
    const res = await fetch(`${API}/api/quiz/${quizData._id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: Object.values(answers), userId }),
    });
    const data = await res.json();
    setResult(data);
    setView("result");
  }

  async function fetchProgress() {
    const res = await fetch(`${API}/api/quiz/progress?userId=${userId}`);
    const data = await res.json();
    setProgress(data);
  }

  const percent = result ? Math.round((result.score / result.total) * 100) : 0;
  const grade = percent >= 90 ? "A" : percent >= 75 ? "B" : percent >= 60 ? "C" : percent >= 40 ? "D" : "F";
  const gradeColor = percent >= 75 ? "#4ade80" : percent >= 60 ? "#f0c96e" : "#f87171";

  return (
    <div style={s.page}>
      {/* Top Nav */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.logo}>🧪 Testbook</span>
        </div>
        <nav style={s.nav}>
          {["home", "progress"].map(v => (
            <button
              key={v}
              style={{ ...s.navBtn, ...(view === v ? s.navBtnActive : {}) }}
              onClick={() => setView(v)}
            >
              {v === "home" ? "Take Quiz" : "My Progress"}
            </button>
          ))}
        </nav>
      </header>

      <main style={s.main}>

        {/* HOME — generate quiz */}
        {view === "home" && (
          <div style={s.card}>
            <div style={s.cardIcon}>🧠</div>
            <h2 style={s.cardTitle}>Generate a Quiz</h2>
            <p style={s.cardSub}>Enter any topic and AI will create a custom MCQ test for you</p>

            <input
              style={s.topicInput}
              placeholder="e.g. The French Revolution, Recursion in Python, Photosynthesis..."
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === "Enter" && generateQuiz()}
            />

            <div style={s.optRow}>
              <div>
                <label style={s.label}>Questions</label>
                <div style={s.pillRow}>
                  {QUESTION_COUNTS.map(n => (
                    <button
                      key={n}
                      style={{ ...s.pill, ...(numQ === n ? s.pillActive : {}) }}
                      onClick={() => setNumQ(n)}
                    >{n}</button>
                  ))}
                </div>
              </div>
            </div>

            <button style={s.genBtn} onClick={generateQuiz} disabled={loading || !topic.trim()}>
              {loading ? (
                <span style={s.loadRow}>
                  <span style={s.spinner} /> Generating Quiz...
                </span>
              ) : "Generate Quiz →"}
            </button>
          </div>
        )}

        {/* QUIZ — question by question */}
        {view === "quiz" && quizData && (
          <div style={s.quizWrap}>
            {/* Progress bar */}
            <div style={s.progressBar}>
              <div style={{ ...s.progressFill, width: `${((current + 1) / quizData.questions.length) * 100}%` }} />
            </div>

            <div style={s.quizMeta}>
              <span style={s.topicTag}>{quizData.topic}</span>
              <span style={s.qCount}>Question {current + 1} of {quizData.questions.length}</span>
            </div>

            {/* Question card */}
            <div style={s.questionCard}>
              <p style={s.questionText}>{quizData.questions[current].question}</p>
              <div style={s.optionList}>
                {quizData.questions[current].options.map((opt, i) => (
                  <button
                    key={i}
                    style={{
                      ...s.option,
                      ...(answers[current] === i ? s.optionSelected : {}),
                    }}
                    onClick={() => setAnswers(a => ({ ...a, [current]: i }))}
                  >
                    <span style={s.optLetter}>{["A", "B", "C", "D"][i]}</span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div style={s.navRow}>
              <button
                style={s.navPrev}
                disabled={current === 0}
                onClick={() => setCurrent(c => c - 1)}
              >← Previous</button>

              {current < quizData.questions.length - 1 ? (
                <button
                  style={s.navNext}
                  disabled={answers[current] === undefined}
                  onClick={() => setCurrent(c => c + 1)}
                >Next →</button>
              ) : (
                <button
                  style={s.submitBtn}
                  disabled={Object.keys(answers).length < quizData.questions.length}
                  onClick={submitQuiz}
                >Submit Quiz ✓</button>
              )}
            </div>

            {/* Dots */}
            <div style={s.dots}>
              {quizData.questions.map((_, i) => (
                <div
                  key={i}
                  style={{
                    ...s.dot,
                    background: answers[i] !== undefined ? "#f0c96e" : "#2a2f3e",
                    outline: current === i ? "2px solid #f0c96e" : "none",
                  }}
                  onClick={() => setCurrent(i)}
                />
              ))}
            </div>
          </div>
        )}

        {/* RESULT */}
        {view === "result" && result && (
          <div style={s.resultWrap}>
            <div style={{ ...s.gradeBadge, color: gradeColor, borderColor: gradeColor }}>
              {grade}
            </div>
            <h2 style={s.scoreText}>
              {result.score} / {result.total} Correct
            </h2>
            <div style={s.percentBar}>
              <div style={{ ...s.percentFill, width: `${percent}%`, background: gradeColor }} />
            </div>
            <p style={{ color: "#8b8fa8", marginBottom: 32 }}>{percent}% score</p>

            <div style={s.resultList}>
              {quizData.questions.map((q, i) => {
                const r = result.results[i];
                return (
                  <div key={i} style={{ ...s.resultItem, borderColor: r.correct ? "#4ade8033" : "#f8717133" }}>
                    <div style={s.resultHeader}>
                      <span style={{ color: r.correct ? "#4ade80" : "#f87171", fontSize: 18 }}>
                        {r.correct ? "✓" : "✗"}
                      </span>
                      <span style={s.resultQ}>{q.question}</span>
                    </div>
                    {!r.correct && (
                      <p style={s.wrongAns}>
                        Your answer: <b style={{ color: "#f87171" }}>{q.options[answers[i]]}</b>
                        {" → "}Correct: <b style={{ color: "#4ade80" }}>{q.options[r.correctAnswer]}</b>
                      </p>
                    )}
                    <p style={s.explanation}>💡 {r.explanation}</p>
                  </div>
                );
              })}
            </div>

            <div style={s.resultActions}>
              <button style={s.retryBtn} onClick={() => { setView("home"); setQuizData(null); }}>
                Try Another Topic
              </button>
              <button style={s.retryBtn2} onClick={() => {
                setAnswers({}); setCurrent(0); setResult(null); setView("quiz");
              }}>
                Retry Same Quiz
              </button>
            </div>
          </div>
        )}

        {/* PROGRESS */}
        {view === "progress" && (
          <div style={s.progressWrap}>
            <h2 style={s.progressTitle}>📊 My Progress</h2>
            {progress.length === 0 ? (
              <div style={s.emptyProgress}>No quizzes taken yet. Start learning!</div>
            ) : (
              <div style={s.progressGrid}>
                {progress.map((p, i) => {
                  const best = Math.round((p.bestScore / p.total) * 100);
                  const col = best >= 75 ? "#4ade80" : best >= 50 ? "#f0c96e" : "#f87171";
                  return (
                    <div key={i} style={s.progressCard}>
                      <div style={s.progressCardTop}>
                        <span style={s.progressTopic}>{p.topic}</span>
                        <span style={{ ...s.bestScore, color: col }}>{best}%</span>
                      </div>
                      <div style={s.progressBarSmall}>
                        <div style={{ ...s.progressFillSmall, width: `${best}%`, background: col }} />
                      </div>
                      <div style={s.progressMeta}>
                        <span>{p.attempts} attempt{p.attempts !== 1 ? "s" : ""}</span>
                        <span>Best: {p.bestScore}/{p.total}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#0f1117",
    color: "#e8e3d8",
    fontFamily: "'Georgia', serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 32px",
    borderBottom: "1px solid #2a2f3e",
    background: "#161b27",
  },
  headerLeft: {},
  logo: { fontSize: 20, fontWeight: 700, color: "#f0c96e" },
  nav: { display: "flex", gap: 8 },
  navBtn: {
    background: "transparent",
    border: "1px solid transparent",
    color: "#8b8fa8",
    borderRadius: 8,
    padding: "7px 18px",
    cursor: "pointer",
    fontSize: 14,
  },
  navBtnActive: {
    background: "#f0c96e22",
    border: "1px solid #f0c96e55",
    color: "#f0c96e",
  },
  main: {
    maxWidth: 680,
    margin: "0 auto",
    padding: "48px 24px",
  },
  card: {
    background: "#161b27",
    borderRadius: 20,
    padding: "48px 40px",
    border: "1px solid #2a2f3e",
    textAlign: "center",
  },
  cardIcon: { fontSize: 48, marginBottom: 16 },
  cardTitle: { fontSize: 28, fontWeight: 700, color: "#e8e3d8", margin: "0 0 8px" },
  cardSub: { color: "#8b8fa8", marginBottom: 32, fontSize: 15 },
  topicInput: {
    width: "100%",
    background: "#0f1117",
    border: "1px solid #2a2f3e",
    borderRadius: 12,
    padding: "14px 18px",
    color: "#e8e3d8",
    fontSize: 15,
    outline: "none",
    marginBottom: 24,
    boxSizing: "border-box",
    textAlign: "left",
  },
  optRow: { display: "flex", gap: 32, justifyContent: "center", marginBottom: 32 },
  label: { display: "block", color: "#8b8fa8", fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 },
  pillRow: { display: "flex", gap: 8 },
  pill: {
    background: "#0f1117",
    border: "1px solid #2a2f3e",
    color: "#8b8fa8",
    borderRadius: 8,
    padding: "6px 16px",
    cursor: "pointer",
    fontSize: 14,
  },
  pillActive: {
    background: "#f0c96e22",
    border: "1px solid #f0c96e",
    color: "#f0c96e",
  },
  genBtn: {
    background: "#f0c96e",
    color: "#0f1117",
    border: "none",
    borderRadius: 12,
    padding: "14px 36px",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
    opacity: 1,
  },
  loadRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10 },
  spinner: {
    display: "inline-block",
    width: 16,
    height: 16,
    border: "2px solid #0f111799",
    borderTop: "2px solid #0f1117",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  quizWrap: { display: "flex", flexDirection: "column", gap: 24 },
  progressBar: { height: 4, background: "#2a2f3e", borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", background: "#f0c96e", borderRadius: 2, transition: "width 0.4s" },
  quizMeta: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  topicTag: {
    background: "#f0c96e22",
    color: "#f0c96e",
    borderRadius: 20,
    padding: "4px 14px",
    fontSize: 13,
  },
  qCount: { color: "#8b8fa8", fontSize: 13 },
  questionCard: {
    background: "#161b27",
    borderRadius: 16,
    padding: "32px",
    border: "1px solid #2a2f3e",
  },
  questionText: { fontSize: 19, fontWeight: 600, lineHeight: 1.6, marginBottom: 24 },
  optionList: { display: "flex", flexDirection: "column", gap: 12 },
  option: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "#0f1117",
    border: "1px solid #2a2f3e",
    borderRadius: 10,
    padding: "14px 18px",
    color: "#e8e3d8",
    fontSize: 15,
    cursor: "pointer",
    textAlign: "left",
    transition: "border 0.2s",
  },
  optionSelected: {
    border: "1px solid #f0c96e",
    background: "#f0c96e11",
  },
  optLetter: {
    background: "#2a2f3e",
    borderRadius: 6,
    width: 28,
    height: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
  },
  navRow: { display: "flex", justifyContent: "space-between" },
  navPrev: {
    background: "transparent",
    border: "1px solid #2a2f3e",
    color: "#8b8fa8",
    borderRadius: 10,
    padding: "10px 22px",
    cursor: "pointer",
    fontSize: 14,
  },
  navNext: {
    background: "#f0c96e",
    border: "none",
    color: "#0f1117",
    borderRadius: 10,
    padding: "10px 22px",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
  },
  submitBtn: {
    background: "#4ade80",
    border: "none",
    color: "#0f1117",
    borderRadius: 10,
    padding: "10px 22px",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
  },
  dots: { display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" },
  dot: { width: 10, height: 10, borderRadius: "50%", cursor: "pointer", transition: "background 0.2s" },

  // Result
  resultWrap: { textAlign: "center" },
  gradeBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
    borderRadius: "50%",
    border: "3px solid",
    fontSize: 36,
    fontWeight: 900,
    marginBottom: 16,
  },
  scoreText: { fontSize: 28, fontWeight: 700, margin: "0 0 16px" },
  percentBar: {
    height: 8,
    background: "#2a2f3e",
    borderRadius: 4,
    overflow: "hidden",
    margin: "0 auto 8px",
    maxWidth: 400,
  },
  percentFill: { height: "100%", borderRadius: 4, transition: "width 1s" },
  resultList: { textAlign: "left", display: "flex", flexDirection: "column", gap: 16, margin: "32px 0" },
  resultItem: {
    background: "#161b27",
    borderRadius: 12,
    padding: "18px 20px",
    border: "1px solid",
  },
  resultHeader: { display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 8 },
  resultQ: { fontSize: 15, fontWeight: 600, lineHeight: 1.5 },
  wrongAns: { fontSize: 13, color: "#8b8fa8", marginBottom: 8 },
  explanation: { fontSize: 13, color: "#8b8fa8", lineHeight: 1.6 },
  resultActions: { display: "flex", gap: 12, justifyContent: "center", marginTop: 8 },
  retryBtn: {
    background: "#f0c96e",
    color: "#0f1117",
    border: "none",
    borderRadius: 10,
    padding: "12px 24px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 15,
  },
  retryBtn2: {
    background: "transparent",
    color: "#e8e3d8",
    border: "1px solid #2a2f3e",
    borderRadius: 10,
    padding: "12px 24px",
    cursor: "pointer",
    fontSize: 15,
  },

  // Progress
  progressWrap: {},
  progressTitle: { fontSize: 24, fontWeight: 700, marginBottom: 24 },
  emptyProgress: { color: "#8b8fa8", textAlign: "center", marginTop: 60 },
  progressGrid: { display: "flex", flexDirection: "column", gap: 14 },
  progressCard: {
    background: "#161b27",
    borderRadius: 14,
    padding: "20px 24px",
    border: "1px solid #2a2f3e",
  },
  progressCardTop: { display: "flex", justifyContent: "space-between", marginBottom: 12 },
  progressTopic: { fontWeight: 700, fontSize: 16 },
  bestScore: { fontWeight: 900, fontSize: 20 },
  progressBarSmall: { height: 6, background: "#2a2f3e", borderRadius: 3, overflow: "hidden", marginBottom: 10 },
  progressFillSmall: { height: "100%", borderRadius: 3 },
  progressMeta: { display: "flex", justifyContent: "space-between", color: "#8b8fa8", fontSize: 13 },
};