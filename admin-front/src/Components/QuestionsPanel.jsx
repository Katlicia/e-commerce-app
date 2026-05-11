import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

function QuestionsPanel() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answerTexts, setAnswerTexts] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [error, setError] = useState("");

  const fetchQuestions = async () => {
    try {
      const { data } = await axiosInstance.get("/admin/questions");
      setQuestions(data);
    } catch {
      setError("Sorular yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAnswer = async (q) => {
    const text = answerTexts[q._id]?.trim();
    if (!text) return;
    setSubmitting((s) => ({ ...s, [q._id]: true }));
    try {
      await axiosInstance.post(
        `/products/${q.product._id}/questions/${q._id}/answers`,
        { answer: text },
      );
      setAnswerTexts((s) => ({ ...s, [q._id]: "" }));
      fetchQuestions();
    } catch {
      alert("Cevap gönderilemedi.");
    } finally {
      setSubmitting((s) => ({ ...s, [q._id]: false }));
    }
  };

  const handleDeleteQuestion = async (q) => {
    if (!window.confirm("Bu soruyu silmek istediğinizden emin misiniz?"))
      return;
    try {
      await axiosInstance.delete(
        `/products/${q.product._id}/questions/${q._id}`,
      );
      fetchQuestions();
    } catch {
      alert("Soru silinemedi.");
    }
  };

  const handleDeleteAnswer = async (q, answerId) => {
    if (!window.confirm("Bu cevabı silmek istediğinizden emin misiniz?"))
      return;
    try {
      await axiosInstance.delete(
        `/products/${q.product._id}/questions/${q._id}/answers/${answerId}`,
      );
      fetchQuestions();
    } catch {
      alert("Cevap silinemedi.");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "32px", textAlign: "center", color: "#888" }}>
        Yükleniyor...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "32px", textAlign: "center", color: "#e53e3e" }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <h4 style={{ fontWeight: 700, marginBottom: "20px", color: "#1a1a1a" }}>
        Soru &amp; Cevap Yönetimi
      </h4>

      {questions.length === 0 && (
        <div style={{ color: "#888", textAlign: "center", marginTop: "48px" }}>
          Henüz soru yok.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {questions.map((q) => (
          <div
            key={q._id}
            style={{
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
              padding: "20px",
            }}
          >
            {/* Question header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "12px",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "inline-block",
                    background: "#fff3e0",
                    color: "#e65100",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "2px 8px",
                    marginBottom: "6px",
                  }}
                >
                  {q.product?.name || "Ürün silinmiş"}
                </div>
                <p
                  style={{
                    fontWeight: 600,
                    margin: "0 0 4px",
                    color: "#1a1a1a",
                  }}
                >
                  {q.question}
                </p>
                <span style={{ fontSize: "12px", color: "#888" }}>
                  {q.name} {q.surname} &mdash;{" "}
                  {new Date(q.createdAt).toLocaleDateString("tr-TR")}
                </span>
              </div>
              <button
                onClick={() => handleDeleteQuestion(q)}
                style={{
                  background: "#ffebee",
                  border: "none",
                  borderRadius: "6px",
                  color: "#c62828",
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "6px 12px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Soruyu Sil
              </button>
            </div>

            {/* Existing answers */}
            {q.answers.length > 0 && (
              <div
                style={{
                  marginTop: "12px",
                  borderLeft: "3px solid #ff6a00",
                  paddingLeft: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {q.answers.map((a) => (
                  <div
                    key={a._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          margin: "0 0 2px",
                          color: "#222",
                          fontSize: "14px",
                        }}
                      >
                        {a.answer}
                      </p>
                      <span style={{ fontSize: "11px", color: "#888" }}>
                        {a.name} {a.surname} &mdash;{" "}
                        {new Date(a.createdAt).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteAnswer(q, a._id)}
                      style={{
                        background: "none",
                        border: "1px solid #e0e0e0",
                        borderRadius: "4px",
                        color: "#999",
                        fontSize: "11px",
                        padding: "3px 8px",
                        cursor: "pointer",
                      }}
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Answer input */}
            <div
              style={{
                marginTop: "14px",
                display: "flex",
                gap: "8px",
                alignItems: "flex-end",
              }}
            >
              <textarea
                rows={2}
                placeholder="Cevap yaz..."
                value={answerTexts[q._id] || ""}
                onChange={(e) =>
                  setAnswerTexts((s) => ({ ...s, [q._id]: e.target.value }))
                }
                style={{
                  flex: 1,
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                  padding: "8px 12px",
                  fontSize: "13px",
                  resize: "none",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <button
                onClick={() => handleAnswer(q)}
                disabled={submitting[q._id] || !answerTexts[q._id]?.trim()}
                style={{
                  background: "#ff6a00",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 18px",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                  opacity:
                    submitting[q._id] || !answerTexts[q._id]?.trim() ? 0.5 : 1,
                }}
              >
                {submitting[q._id] ? "..." : "Yanıtla"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuestionsPanel;
