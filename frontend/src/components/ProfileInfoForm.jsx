import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../redux/userSlice";

function ProfileInfoForm() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading, error } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    surname: user?.surname || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateUser({ userId: user._id, formData }));
    if (result.meta.requestStatus === "fulfilled") {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      {success && (
        <div className="alert alert-success py-2">
          Bilgileriniz güncellendi.
        </div>
      )}

      <div className="row g-3">
        <div className="col-12 col-sm-6">
          <label
            className="form-label text-muted"
            style={{ fontSize: "0.85rem" }}
          >
            Ad
          </label>
          <input
            className="form-control"
            name="name"
            value={formData.name}
            disabled
          />
        </div>
        <div className="col-12 col-sm-6">
          <label
            className="form-label text-muted"
            style={{ fontSize: "0.85rem" }}
          >
            Soyad
          </label>
          <input
            className="form-control"
            name="surname"
            value={formData.surname}
            disabled
          />
        </div>
        <div className="col-12 col-sm-6">
          <label
            className="form-label text-muted"
            style={{ fontSize: "0.85rem" }}
          >
            E-posta
          </label>
          <input
            className="form-control"
            name="email"
            type="text"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="col-12 col-sm-6">
          <label
            className="form-label text-muted"
            style={{ fontSize: "0.85rem" }}
          >
            Telefon
          </label>
          <input
            className="form-control"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
      </div>

      <button
        type="submit"
        className="btn orange-btn rounded-pill px-4 mt-4"
        disabled={loading}
      >
        {loading ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </form>
  );
}

export default ProfileInfoForm;
