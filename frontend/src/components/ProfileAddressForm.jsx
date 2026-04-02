import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { getUserAddresses, addUserAddress, editUserAddress } from "../redux/userSlice";
import { FiPlus, FiEdit2 } from "react-icons/fi";

const addressSchema = Yup.object({
  fullName: Yup.string().required("Ad soyad zorunludur"),
  phone: Yup.string()
    .matches(/^[0-9]{10,11}$/, "Geçerli bir telefon numarası giriniz")
    .required("Telefon zorunludur"),
  city: Yup.string().required("Şehir zorunludur"),
  district: Yup.string().required("İlçe zorunludur"),
  address: Yup.string().required("Adres zorunludur"),
});

const emptyValues = {
  fullName: "",
  phone: "",
  city: "",
  district: "",
  address: "",
};

function AddressForm({ initialValues, onSubmit, onCancel, loading }) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={addressSchema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {() => (
        <Form className="border rounded-3 p-3 d-flex flex-column gap-2">
          <div className="row g-2">
            <div className="col-12 col-sm-6">
              <Field name="fullName" className="form-control form-control-sm" placeholder="Ad Soyad" />
              <ErrorMessage name="fullName" component="div" className="text-danger" style={{ fontSize: "0.78rem" }} />
            </div>
            <div className="col-12 col-sm-6">
              <Field name="phone" className="form-control form-control-sm" placeholder="Telefon" />
              <ErrorMessage name="phone" component="div" className="text-danger" style={{ fontSize: "0.78rem" }} />
            </div>
            <div className="col-12 col-sm-6">
              <Field name="city" className="form-control form-control-sm" placeholder="Şehir" />
              <ErrorMessage name="city" component="div" className="text-danger" style={{ fontSize: "0.78rem" }} />
            </div>
            <div className="col-12 col-sm-6">
              <Field name="district" className="form-control form-control-sm" placeholder="İlçe" />
              <ErrorMessage name="district" component="div" className="text-danger" style={{ fontSize: "0.78rem" }} />
            </div>
            <div className="col-12">
              <Field name="address" as="textarea" rows={2} className="form-control form-control-sm" placeholder="Açık Adres" />
              <ErrorMessage name="address" component="div" className="text-danger" style={{ fontSize: "0.78rem" }} />
            </div>
          </div>
          <div className="d-flex gap-2 mt-1">
            <button type="submit" className="btn orange-btn rounded-pill px-3" disabled={loading}>
              {loading ? "..." : "Kaydet"}
            </button>
            <button type="button" className="btn btn-outline-secondary rounded-pill px-3" onClick={onCancel}>
              İptal
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

function ProfileAddressForm() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { addresses, loading } = useSelector((state) => state.user);

  const [showAdd, setShowAdd] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    if (user) dispatch(getUserAddresses());
  }, [user]);

  const handleAdd = (values, { resetForm }) => {
    dispatch(addUserAddress(values)).then(() => {
      resetForm();
      setShowAdd(false);
    });
  };

  const handleEdit = (values, { resetForm }) => {
    dispatch(editUserAddress({ index: editingIndex, ...values })).then(() => {
      resetForm();
      setEditingIndex(null);
    });
  };

  return (
    <div className="d-flex flex-column gap-2">
      {addresses.length === 0 && !loading && (
        <p className="text-muted" style={{ fontSize: "0.9rem" }}>
          Kayıtlı adresiniz yok.
        </p>
      )}

      {addresses.map((addr, idx) => (
        <div key={idx}>
          {editingIndex === idx ? (
            <AddressForm
              initialValues={{
                fullName: addr.fullName || "",
                phone: addr.phone || "",
                city: addr.city || "",
                district: addr.district || "",
                address: addr.address || "",
                }}
              onSubmit={handleEdit}
              onCancel={() => setEditingIndex(null)}
              loading={loading}
            />
          ) : (
            <div className="d-flex align-items-start justify-content-between border rounded-3 px-3 py-2 gap-2">
              <div style={{ fontSize: "0.9rem" }}>
                <div className="fw-semibold">{addr.fullName}</div>
                <div className="text-muted">{addr.city} / {addr.district}</div>
                <div>{addr.address}</div>
                <div className="text-muted">{addr.phone}</div>
              </div>
              <button className="btn p-0 text-muted flex-shrink-0" onClick={() => setEditingIndex(idx)}>
                <FiEdit2 />
              </button>
            </div>
          )}
        </div>
      ))}

      {showAdd ? (
        <AddressForm
          initialValues={emptyValues}
          onSubmit={handleAdd}
          onCancel={() => setShowAdd(false)}
          loading={loading}
        />
      ) : (
        <button
          className="btn rounded-pill d-flex align-items-center gap-2 mt-1"
          style={{ borderColor: "#f83b0a", color: "#f83b0a" }}
          onClick={() => setShowAdd(true)}
        >
          <FiPlus />
          <span>Yeni Adres Ekle</span>
        </button>
      )}
    </div>
  );
}

export default ProfileAddressForm;
