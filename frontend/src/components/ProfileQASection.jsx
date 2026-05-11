import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getUserQuestions, deleteUserQuestion } from "../redux/questionSlice";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function ProfileQASection() {
  const dispatch = useDispatch();
  const { questions, loading } = useSelector((state) => state.question);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    dispatch(getUserQuestions());
  }, []);

  const handleDelete = (productId, questionId) => {
    if (window.confirm("Bu soruyu silmek istediğinize emin misiniz?")) {
      dispatch(deleteUserQuestion({ productId, questionId }));
      if (openId === questionId) setOpenId(null);
    }
  };

  if (loading) return <p className="text-muted">Yükleniyor...</p>;

  if (questions.length === 0) {
    return (
      <p className="text-muted" style={{ fontSize: 14 }}>
        Henüz soru sormadınız. Ürün sayfasından "Soru Sor" ile başlayabilirsiniz.
      </p>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {questions.map((q) => {
        const productImg = q.product?.images?.[0]?.url;
        const isOpen = openId === q._id;

        return (
          <div
            key={q._id}
            className="border rounded p-3"
            style={{ fontSize: 14 }}
          >
            <div className="d-flex align-items-start gap-3">
              {productImg && (
                <img
                  src={productImg}
                  alt={q.product?.name}
                  style={{
                    width: 56,
                    height: 56,
                    objectFit: "contain",
                    borderRadius: 6,
                    border: "1px solid #e5e8ec",
                    flexShrink: 0,
                  }}
                />
              )}
              <div className="flex-grow-1 min-w-0">
                {q.product && (
                  <Link
                    to={`/${q.product._id}`}
                    style={{
                      fontWeight: 600,
                      color: "#212529",
                      textDecoration: "none",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    {q.product.name}
                  </Link>
                )}
                <p className="mb-1" style={{ color: "#495057" }}>
                  <strong>S:</strong> {q.question}
                </p>
                <div className="d-flex align-items-center gap-3 mt-1">
                  <span className="text-muted" style={{ fontSize: 12 }}>
                    {formatDate(q.createdAt)}
                  </span>
                  {q.isAnswered ? (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#198754",
                        background: "#d1e7dd",
                        borderRadius: 20,
                        padding: "1px 10px",
                      }}
                    >
                      Cevaplandı
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#856404",
                        background: "#fff3cd",
                        borderRadius: 20,
                        padding: "1px 10px",
                      }}
                    >
                      Beklemede
                    </span>
                  )}
                  {q.answers?.length > 0 && (
                    <button
                      className="btn btn-link p-0"
                      style={{ fontSize: 12, color: "#f83b0a" }}
                      onClick={() => setOpenId(isOpen ? null : q._id)}
                    >
                      {isOpen
                        ? "Cevapları Gizle"
                        : `${q.answers.length} Cevabı Gör`}
                    </button>
                  )}
                </div>

                {isOpen && q.answers?.length > 0 && (
                  <div
                    className="mt-3 d-flex flex-column gap-2"
                    style={{ borderLeft: "3px solid #e5e8ec", paddingLeft: 12 }}
                  >
                    {q.answers.map((a) => (
                      <div key={a._id}>
                        <p className="mb-0" style={{ color: "#343a40" }}>
                          <strong style={{ color: a.isAdmin ? "#f83b0a" : "#212529" }}>
                            {a.isAdmin
                              ? "Mağaza"
                              : `${a.name} ${a.surname}`}
                            :
                          </strong>{" "}
                          {a.answer}
                        </p>
                        <span className="text-muted" style={{ fontSize: 11 }}>
                          {formatDate(a.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                className="btn btn-sm"
                style={{ color: "#adb5bd", fontSize: 18, lineHeight: 1, flexShrink: 0 }}
                title="Soruyu sil"
                onClick={() => handleDelete(q.product?._id, q._id)}
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
