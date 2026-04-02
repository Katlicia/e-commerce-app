import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../redux/authSlice";
import { clearCartLocal } from "../redux/cartSlice";
import {
  getUserAddresses,
  addUserAddress,
  editUserAddress,
} from "../redux/userSlice";
import CheckoutComponent from "../components/CheckoutComponent";
import CartSummary from "../components/CartSummary";
import { FiEdit2 } from "react-icons/fi";
import CardOutlineLogo from "../assets/Checkout/card-outline.svg";
import CardsLogo from "../assets/Checkout/cards.svg";
import HepsipayLogo from "../assets/Checkout/hepsipay.svg";
import TransferLogo from "../assets/Checkout/transfer.svg";
import coinsLogo from "../assets/Checkout/coins.png";
import "../styles/CheckoutPage.css";
import { useFormik, Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createOrder, resetOrderState } from "../redux/orderSlice";
import OrderModal from "../components/OrderModal";

const addressSchema = Yup.object({
  fullName: Yup.string().required("Ad soyad zorunludur"),
  phone: Yup.string()
    .matches(/^[0-9]{10,11}$/, "Geçerli bir telefon numarası giriniz")
    .required("Telefon zorunludur"),
  city: Yup.string().required("Şehir zorunludur"),
  district: Yup.string().required("İlçe zorunludur"),
  address: Yup.string().required("Adres zorunludur"),
});

const emptyAddress = { fullName: "", phone: "", city: "", district: "", address: "" };

const KARGO_OPTIONS = [
  { id: "mng", label: "Mng Kargo", price: 74.99 },
  { id: "yurtici", label: "Yurtiçi Kargo", price: 74.99 },
  { id: "sendeo", label: "Sendeo", price: 74.99 },
  { id: "hepsijet", label: "HepsiJet", price: 74.99 },
];

function CheckoutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { addresses: apiAddresses } = useSelector((state) => state.user);
  const { totalAmount } = useSelector((state) => state.cart);
  const { cart } = useSelector((state) => state.cart);
  const {
    loading: orderLoading,
    success: orderSuccess,
    error: orderError,
  } = useSelector((state) => state.order);

  const [addressError, setAddressError] = useState("");
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
  const [selectedKargo, setSelectedKargo] = useState("yurtici");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("kredi");
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedInstallment, setSelectedInstallment] = useState(0);
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [selectedBillingIdx, setSelectedBillingIdx] = useState(0);
  const [localAddresses, setLocalAddresses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);

  const addresses = user ? apiAddresses : localAddresses;

  const formik = useFormik({
    initialValues: {
      email: "",
      agreeToTerms: false,
      cardNumber: "",
      cardHolder: "",
      expirationDate: "",
      cvv: "",
    },
    validate: (values) => {
      const errors = {};
      if (!user) {
        if (!values.email) {
          errors.email = "Mail adresi zorunludur";
        } else if (
          !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
        ) {
          errors.email = "Geçerli bir mail adresi giriniz";
        }
      }
      if (selectedPayment === "kredi") {
        if (!values.cardNumber || !/^\d{16}$/.test(values.cardNumber)) {
          errors.cardNumber = "Kart numarası 16 haneli olmalıdır";
        }
        if (!values.cardHolder) {
          errors.cardHolder = "Kart sahibi adı zorunludur";
        }
        if (
          !values.expirationDate ||
          !/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(values.expirationDate)
        ) {
          errors.expirationDate =
            "Son kullanma tarihi MM/YY formatında olmalıdır";
        }
        if (!values.cvv || !/^\d{3}$/.test(values.cvv)) {
          errors.cvv = "CVV 3 haneli olmalıdır";
        }
      }
      if (!values.agreeToTerms) {
        errors.agreeToTerms = "Sözleşmeleri kabul etmeniz gerekmektedir";
      }
      return errors;
    },
    onSubmit: (values) => {
      if (addresses.length === 0) {
        setAddressError("Lütfen en az bir teslimat adresi ekleyiniz");
        return;
      }
      setAddressError("");

      const items = cart.map((item) => ({
        product: item._id || item.id,
        price: item.discountedPrice || item.price,
        quantity: item.quantity,
      }));

      dispatch(
        createOrder({
          items,
          totalAmount,
          address: addresses[selectedAddressIdx],
          ...(!sameAsBilling && { billingAddress: addresses[selectedBillingIdx] }),
          ...(!user && { guestEmail: values.email }),
        }),
      );
    },
  });

  useEffect(() => {
    if (user) {
      dispatch(getUserAddresses());
    }
  }, [user]);

  useEffect(() => {
    if (orderSuccess) {
      dispatch(clearCartLocal());
      setModalStatus("success");
      setShowModal(true);
    }
    if (orderError) {
      setModalStatus("error");
      setShowModal(true);
    }
  }, [orderSuccess, orderError]);

  const handleAddAddress = (values, { resetForm }) => {
    if (user) {
      dispatch(addUserAddress(values)).then(() => {
        dispatch(getUserAddresses());
      });
    } else {
      setLocalAddresses((prev) => [...prev, values]);
    }
    resetForm();
    setShowAddressForm(false);
  };

  const handleEditSave = (idx, values, { resetForm }) => {
    if (user) {
      dispatch(editUserAddress({ index: idx, ...values }));
    } else {
      setLocalAddresses((prev) => prev.map((a, i) => (i === idx ? values : a)));
    }
    resetForm();
    setEditingIndex(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setModalStatus(null);
    dispatch(resetOrderState());
    formik.resetForm();
    if (modalStatus === "success") navigate(user ? "/profile" : "/");
    if (modalStatus === "error") navigate("/cart");
  };

  return (
    <div>
      <OrderModal
        show={showModal}
        status={modalStatus}
        onClose={handleModalClose}
      />
      <CheckoutComponent />
      <div className="container">
        <div className="row mt-5">
          <div className="col-12 col-lg-6">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="fw-bold mb-0">HESABINIZ</h5>
              {user ? (
                <span
                  className="text-selected"
                  role="button"
                  onClick={() => dispatch(logoutUser())}
                >
                  Çıkış Yap
                </span>
              ) : (
                <Link
                  className="text-selected"
                  to="/login"
                  state={{ from: "/checkout" }}
                >
                  Giriş Yap
                </Link>
              )}
            </div>
            <input
              className="checkout-email-input w-100 py-3 px-3 rounded mb-1"
              placeholder="Mail adresinizi giriniz"
              name="email"
              value={user ? user.email : formik.values.email}
              disabled={!!user}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-danger mb-1" style={{ fontSize: "0.8rem" }}>
                {formik.errors.email}
              </p>
            )}
            <p className="checkout-hint text-muted mb-4">
              Sipariş bilgileriniz bu mail adresi üzerinden paylaşılacaktır.
            </p>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">TESLİMAT</h5>
              <span
                className="text-selected"
                role="button"
                onClick={() => { setShowAddressForm((v) => !v); setEditingIndex(null); }}
              >
                {showAddressForm ? "İptal" : "Adres Ekle"}
              </span>
            </div>

            {showAddressForm && (
              <Formik
                initialValues={emptyAddress}
                validationSchema={addressSchema}
                onSubmit={handleAddAddress}
              >
                {({ isSubmitting }) => (
                  <Form className="border rounded-3 p-3 mb-3 d-flex flex-column gap-2">
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
                    <button type="submit" className="btn orange-btn rounded-pill" disabled={isSubmitting}>
                      Kaydet
                    </button>
                  </Form>
                )}
              </Formik>
            )}

            {addressError && (
              <p className="text-danger mb-2" style={{ fontSize: "0.8rem" }}>
                {addressError}
              </p>
            )}
            <div className="d-flex flex-column gap-2 mb-4">
              {addresses.length === 0 ? (
                <p className="checkout-hint text-muted">
                  Kayıtlı adresiniz yok.
                </p>
              ) : (
                addresses.map((addr, idx) => (
                  <div key={idx}>
                    {editingIndex === idx ? (
                      <Formik
                        initialValues={{
                          fullName: addr.fullName || "",
                          phone: addr.phone || "",
                          city: addr.city || "",
                          district: addr.district || "",
                          address: addr.address || "",
                        }}
                        validationSchema={addressSchema}
                        onSubmit={(values, helpers) => handleEditSave(idx, values, helpers)}
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
                            <div className="d-flex gap-2">
                              <button type="submit" className="btn orange-btn rounded-pill px-3">Kaydet</button>
                              <button type="button" className="btn btn-outline-secondary rounded-pill px-3" onClick={() => setEditingIndex(null)}>İptal</button>
                            </div>
                          </Form>
                        )}
                      </Formik>
                    ) : (
                      <div
                        className="checkout-address-item border rounded-3 px-3 py-2 d-flex align-items-start justify-content-between"
                        onClick={() => setSelectedAddressIdx(idx)}
                      >
                        <div className="d-flex align-items-start gap-3">
                          <span className={`checkout-radio-dot mt-1${selectedAddressIdx === idx ? " active" : ""}`} />
                          <div style={{ fontSize: "0.875rem" }}>
                            <p className="checkout-address-text mb-0 fw-semibold">{addr.fullName}</p>
                            <p className="checkout-address-text mb-0 text-muted">{addr.city} / {addr.district}</p>
                            <p className="checkout-address-text mb-0">{addr.address}</p>
                            <p className="checkout-address-text mb-0 text-muted">{addr.phone}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn p-0 text-muted flex-shrink-0"
                          onClick={(e) => { e.stopPropagation(); setEditingIndex(idx); }}
                        >
                          <FiEdit2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <h5 className="fw-bold mb-3">FATURA ADRESİ</h5>
            <div className="d-flex flex-column gap-2 mb-4">
              <div
                className="checkout-address-item border rounded-3 px-3 py-2 d-flex align-items-center gap-3"
                onClick={() => setSameAsBilling(true)}
                role="button"
              >
                <span className={`checkout-radio-dot${sameAsBilling ? " active" : ""}`} />
                <span style={{ fontSize: "0.875rem" }}>Teslimat adresiyle aynı</span>
              </div>
              <div
                className="checkout-address-item border rounded-3 px-3 py-2 d-flex align-items-center gap-3"
                onClick={() => setSameAsBilling(false)}
                role="button"
              >
                <span className={`checkout-radio-dot${!sameAsBilling ? " active" : ""}`} />
                <span style={{ fontSize: "0.875rem" }}>Farklı fatura adresi kullan</span>
              </div>
              {!sameAsBilling && (
                addresses.length === 0 ? (
                  <p className="checkout-hint text-muted">Kayıtlı adresiniz yok.</p>
                ) : (
                  addresses.map((addr, idx) => (
                    <div
                      key={idx}
                      className="checkout-address-item border rounded-3 px-3 py-2 d-flex align-items-start gap-3"
                      onClick={() => setSelectedBillingIdx(idx)}
                      role="button"
                    >
                      <span className={`checkout-radio-dot mt-1${selectedBillingIdx === idx ? " active" : ""}`} />
                      <div style={{ fontSize: "0.875rem" }}>
                        <p className="mb-0 fw-semibold">{addr.fullName}</p>
                        <p className="mb-0 text-muted">{addr.city} / {addr.district}</p>
                        <p className="mb-0">{addr.address}</p>
                        <p className="mb-0 text-muted">{addr.phone}</p>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>

            <h5 className="fw-bold mb-3">KARGO</h5>
            <div className="d-flex flex-wrap gap-2 mb-4">
              {KARGO_OPTIONS.map((k) => (
                <div
                  key={k.id}
                  className="checkout-kargo-item border rounded-3 px-3 py-2 d-flex align-items-center gap-2"
                  onClick={() => setSelectedKargo(k.id)}
                >
                  <span
                    className={`checkout-radio-dot${selectedKargo === k.id ? " active" : ""}`}
                  />
                  <div>
                    <p className="checkout-kargo-label mb-0 fw-semibold">
                      {k.label}
                    </p>
                    <p className="checkout-kargo-price mb-0 text-muted">
                      {k.price.toFixed(2)}₺
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <h5 className="fw-bold mb-3">ÖDEME</h5>
            <form onSubmit={formik.handleSubmit}>
              <div className="d-flex flex-column gap-3 mb-4">
                <div
                  className={`checkout-payment-option${selectedPayment === "kredi" ? " active" : ""}`}
                  onClick={() => setSelectedPayment("kredi")}
                >
                  <div className="checkout-payment-header">
                    <div className="d-flex align-items-center gap-3">
                      <span
                        className={`checkout-radio-dot${selectedPayment === "kredi" ? " active" : ""}`}
                      />
                      <span className="fw-semibold">Kredi Kartı</span>
                    </div>
                    <img src={CardsLogo} alt="cards" height={28} />
                  </div>
                  <div
                    className={`checkout-payment-body${selectedPayment === "kredi" ? " open" : ""}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="checkout-payment-body-inner">
                      <div className="d-flex flex-column gap-2 mt-3">
                        <div className="position-relative">
                          <input
                            className="checkout-card-input"
                            placeholder="Kart Numarası"
                            maxLength={16}
                            name="cardNumber"
                            value={formik.values.cardNumber}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                          <img
                            src={CardOutlineLogo}
                            alt=""
                            height={20}
                            className="position-absolute"
                            style={{
                              right: 12,
                              top: "50%",
                              transform: "translateY(-50%)",
                            }}
                          />
                        </div>
                        {formik.touched.cardNumber &&
                          formik.errors.cardNumber && (
                            <p
                              className="text-danger mb-0"
                              style={{ fontSize: "0.8rem" }}
                            >
                              {formik.errors.cardNumber}
                            </p>
                          )}
                        <input
                          className="checkout-card-input"
                          placeholder="Kart Üzerindeki İsim"
                          name="cardHolder"
                          value={formik.values.cardHolder}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        {formik.touched.cardHolder &&
                          formik.errors.cardHolder && (
                            <p
                              className="text-danger mb-0"
                              style={{ fontSize: "0.8rem" }}
                            >
                              {formik.errors.cardHolder}
                            </p>
                          )}
                        <div className="d-flex gap-2">
                          <div className="d-flex flex-column flex-grow-1">
                            <input
                              className="checkout-card-input"
                              placeholder="AA/YY"
                              maxLength={5}
                              name="expirationDate"
                              value={formik.values.expirationDate}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, "");
                                if (val.length > 2)
                                  val = val.slice(0, 2) + "/" + val.slice(2, 4);
                                formik.setFieldValue("expirationDate", val);
                              }}
                              onBlur={formik.handleBlur}
                            />
                            {formik.touched.expirationDate &&
                              formik.errors.expirationDate && (
                                <p
                                  className="text-danger mb-0"
                                  style={{ fontSize: "0.8rem" }}
                                >
                                  {formik.errors.expirationDate}
                                </p>
                              )}
                          </div>
                          <div className="d-flex flex-column flex-grow-1">
                            <input
                              className="checkout-card-input"
                              placeholder="CVV"
                              maxLength={3}
                              name="cvv"
                              value={formik.values.cvv}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                            {formik.touched.cvv && formik.errors.cvv && (
                              <p
                                className="text-danger mb-0"
                                style={{ fontSize: "0.8rem" }}
                              >
                                {formik.errors.cvv}
                              </p>
                            )}
                          </div>
                        </div>
                        <p
                          className="fw-semibold mb-2 mt-1"
                          style={{ fontSize: "0.9rem" }}
                        >
                          Taksit Seçenekleri
                        </p>
                        <div className="d-flex flex-column gap-2">
                          {[
                            { label: "Tek Çekim", multiplier: 1 },
                            { label: "2 Taksit", multiplier: 1.077 },
                            { label: "3 Taksit", multiplier: 1.1 },
                          ].map((opt, idx) => (
                            <div
                              key={idx}
                              className={`checkout-installment-row${selectedInstallment === idx ? " active" : ""}`}
                              onClick={() => setSelectedInstallment(idx)}
                            >
                              <span
                                className={`checkout-radio-dot${selectedInstallment === idx ? " active" : ""}`}
                              />
                              <span
                                className="mx-3 py-1"
                                style={{ fontSize: "0.9rem" }}
                              >
                                {opt.label}
                              </span>
                              <span
                                className="ms-auto"
                                style={{ fontSize: "0.9rem" }}
                              >
                                <strong>
                                  {Number(totalAmount * opt.multiplier).toFixed(
                                    2,
                                  )}
                                  ₺
                                </strong>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`checkout-payment-option${selectedPayment === "havale" ? " active" : ""}`}
                  onClick={() => setSelectedPayment("havale")}
                >
                  <div className="checkout-payment-header">
                    <div className="d-flex align-items-center gap-3">
                      <span
                        className={`checkout-radio-dot${selectedPayment === "havale" ? " active" : ""}`}
                      />
                      <span className="fw-semibold">Havale / EFT</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="checkout-eft-badge mx-3">
                        <strong>%5 İndirim</strong>
                      </span>
                      <img src={TransferLogo} alt="transfer" height={28} />
                    </div>
                  </div>
                </div>

                <div
                  className={`checkout-payment-option${selectedPayment === "hepsipay" ? " active" : ""}`}
                  onClick={() => setSelectedPayment("hepsipay")}
                >
                  <div className="checkout-payment-header">
                    <div className="d-flex align-items-center gap-3">
                      <span
                        className={`checkout-radio-dot${selectedPayment === "hepsipay" ? " active" : ""}`}
                      />
                      <span>Hepsi Pay</span>
                    </div>
                    <img src={HepsipayLogo} alt="hepsipay" height={28} />
                  </div>
                  <div
                    className={`checkout-payment-body${selectedPayment === "hepsipay" ? " open" : ""}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="checkout-payment-body-inner">
                      <div className="checkout-hepsipay-banner mt-2">
                        <img src={HepsipayLogo} alt="hepsipay" width={128} />
                        <img src={coinsLogo} alt="coins" width={80} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="sozlesme"
                  name="agreeToTerms"
                  className="checkout-checkbox"
                  checked={formik.values.agreeToTerms}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <label htmlFor="sozlesme" className="checkout-sozlesme-label">
                  <strong role="button">Gizlilik Sözleşmesini</strong> ve{" "}
                  <strong role="button">Satış Sözleşmesini</strong> okudum,
                  onaylıyorum.
                </label>
              </div>
              {formik.touched.agreeToTerms && formik.errors.agreeToTerms && (
                <p className="text-danger mb-2" style={{ fontSize: "0.8rem" }}>
                  {formik.errors.agreeToTerms}
                </p>
              )}
              <button
                type="submit"
                className="btn orange-btn w-100 rounded py-3 fw-semibold mb-5"
                disabled={orderLoading}
              >
                {orderLoading ? "İşleniyor..." : "Siparişi Tamamla"}
              </button>
            </form>
          </div>

          <div className="col-12 col-lg-6">
            <div className="d-flex flex-column gap-2 mb-4">
              {cart.flatMap((item) =>
                Array.from({ length: item.quantity }, (_, i) => (
                  <div
                    key={`${item._id || item.id}-${i}`}
                    className="d-flex align-items-center justify-content-between gap-3"
                  >
                    <img
                      src={item.images?.[0]?.url}
                      alt={item.name}
                      style={{
                        width: 64,
                        height: 64,
                        objectFit: "contain",
                        flexShrink: 0,
                      }}
                      className="rounded-2 border"
                    />
                    <p
                      className="mb-0 flex-grow-1"
                      style={{ fontSize: "0.875rem" }}
                    >
                      {item.name}
                    </p>
                    <p
                      className="mb-0 fw-semibold"
                      style={{ fontSize: "0.875rem", flexShrink: 0 }}
                    >
                      {Number(item.discountedPrice || item.price).toFixed(2)}₺
                    </p>
                  </div>
                )),
              )}
            </div>
            <hr />
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
