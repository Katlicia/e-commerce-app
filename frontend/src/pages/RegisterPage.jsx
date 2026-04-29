import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../redux/authSlice";
import { useNavigate, Link } from "react-router-dom";

function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    credential: "",
    password: "",
  });
  const [credentialError, setCredentialError] = useState("");

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "credential") setCredentialError("");
  }

  function parseCredential(value) {
    const trimmed = value.trim();
    if (trimmed.includes("@")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) return { error: "Geçersiz e-posta adresi." };
      return { email: trimmed };
    }
    const digits = trimmed.replace(/[\s\-().+]/g, "");
    if (!/^\d+$/.test(digits) || digits.length < 10 || digits.length > 13) {
      return { error: "Geçerli bir e-posta veya telefon numarası girin." };
    }
    return { phone: trimmed };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    const parsed = parseCredential(formData.credential);
    if (parsed.error) {
      setCredentialError(parsed.error);
      return;
    }
    const result = await dispatch(registerUser({
      name: capitalize(formData.name),
      surname: capitalize(formData.surname),
      password: formData.password,
      ...parsed,
    }));
    if (result.meta.requestStatus === "fulfilled") {
      navigate("/");
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420, marginTop: 80 }}>
      <h4 className="fw-bold mb-4">Kayıt Ol</h4>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Ad</label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Soyad</label>
          <input
            type="text"
            name="surname"
            className="form-control"
            value={formData.surname}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">E-posta veya Telefon</label>
          <input
            type="text"
            name="credential"
            className={`form-control ${credentialError ? "is-invalid" : ""}`}
            placeholder="E-posta veya telefon numarası"
            value={formData.credential}
            onChange={handleChange}
            required
          />
          {credentialError && (
            <div className="invalid-feedback">{credentialError}</div>
          )}
        </div>
        <div className="mb-3">
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
        <button type="submit" className="btn w-100 card-button" disabled={loading}>
          {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
        </button>
      </form>
      <p className="text-center mt-3" style={{ fontSize: 13 }}>
        Zaten hesabın var mı? <Link to="/login">Giriş Yap</Link>
      </p>
    </div>
  );
}

export default RegisterPage;
