import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../redux/authSlice";

function ResetPasswordPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams();
  const { loading, error } = useSelector((state) => state.auth);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [validationError, setValidationError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setValidationError(null);

    if (password.length < 6) {
      setValidationError("Şifre en az 6 karakter olmalıdır.");
      return;
    }
    if (password !== confirm) {
      setValidationError("Şifreler eşleşmiyor.");
      return;
    }

    const result = await dispatch(resetPassword({ token, password }));
    if (resetPassword.fulfilled.match(result)) {
      navigate("/");
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420, marginTop: 80 }}>
      <h4 className="fw-bold mb-4">Yeni Şifre Belirle</h4>
      {(validationError || error) && (
        <div className="alert alert-danger py-2">{validationError || error}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Yeni Şifre</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Şifre Tekrar</label>
          <input
            type="password"
            className="form-control"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn w-100 card-button" disabled={loading}>
          {loading ? "Kaydediliyor..." : "Şifremi Güncelle"}
        </button>
      </form>
    </div>
  );
}

export default ResetPasswordPage;
