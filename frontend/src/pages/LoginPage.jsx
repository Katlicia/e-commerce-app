import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, forgetPassword } from "../redux/authSlice";
import { useNavigate, Link } from "react-router-dom";

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState(null);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const result = await dispatch(loginUser(formData));
    if (result.meta.requestStatus === "fulfilled") {
      navigate("/");
    }
  }

  async function handleForgetPassword() {
    if (!formData.email) {
      setResetError("Lütfen önce e-posta adresinizi girin.");
      return;
    }
    setResetError(null);
    const result = await dispatch(forgetPassword(formData.email));
    if (forgetPassword.fulfilled.match(result)) {
      setResetSent(true);
    } else {
      setResetError(result.payload);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420, marginTop: 80 }}>
      <h4 className="fw-bold mb-4">Giriş Yap</h4>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">E-posta</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-1">
          <label className="form-label">Şifre</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="text-end mb-3">
          <button
            type="button"
            className="btn btn-link p-0 text-decoration-none"
            style={{ fontSize: 13, color: "#f83b0a" }}
            onClick={handleForgetPassword}
            disabled={loading}
          >
            Şifremi unuttum
          </button>
        </div>
        {resetError && (
          <div className="alert alert-danger py-2" style={{ fontSize: 13 }}>
            {resetError}
          </div>
        )}
        {resetSent && (
          <div className="alert alert-success py-2" style={{ fontSize: 13 }}>
            Şifre sıfırlama bağlantısı <strong>{formData.email}</strong> adresine gönderildi.
          </div>
        )}
        <button type="submit" className="btn w-100 card-button" disabled={loading}>
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
      <p className="text-center mt-3" style={{ fontSize: 13 }}>
        Hesabın yok mu? <Link to="/register">Kayıt Ol</Link>
      </p>
    </div>
  );
}

export default LoginPage;
