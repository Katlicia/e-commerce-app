import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changePassword } from "../redux/userSlice";

function ProfilePasswordForm() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.user);

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (form.newPassword.length < 6) {
      setError("Yeni şifre en az 6 karakter olmalıdır.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("Yeni şifreler eşleşmiyor.");
      return;
    }

    const result = await dispatch(
      changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
    );

    if (changePassword.fulfilled.match(result)) {
      setSuccess("Şifreniz başarıyla güncellendi.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.payload);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
      {error && <div className="alert alert-danger py-2" style={{ fontSize: "0.9rem" }}>{error}</div>}
      {success && <div className="alert alert-success py-2" style={{ fontSize: "0.9rem" }}>{success}</div>}

      <div className="mb-3">
        <label className="form-label">Mevcut Şifre</label>
        <input
          type="password"
          name="currentPassword"
          className="form-control"
          value={form.currentPassword}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Yeni Şifre</label>
        <input
          type="password"
          name="newPassword"
          className="form-control"
          value={form.newPassword}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label className="form-label">Yeni Şifre Tekrar</label>
        <input
          type="password"
          name="confirmPassword"
          className="form-control"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit" className="btn orange-btn rounded-pill px-4" disabled={loading}>
        {loading ? "Kaydediliyor..." : "Şifreyi Güncelle"}
      </button>
    </form>
  );
}

export default ProfilePasswordForm;
