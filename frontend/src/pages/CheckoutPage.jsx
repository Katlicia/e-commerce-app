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
import { FiEdit2, FiCheck, FiX } from "react-icons/fi";
import CardOutlineLogo from "../assets/Checkout/card-outline.svg";
import CardsLogo from "../assets/Checkout/cards.svg";
import HepsipayLogo from "../assets/Checkout/hepsipay.svg";
import TransferLogo from "../assets/Checkout/transfer.svg";
import coinsLogo from "../assets/Checkout/coins.png";
import "../styles/CheckoutPage.css";
import { useFormik } from "formik";
import { createOrder, resetOrderState } from "../redux/orderSlice";
import OrderModal from "../components/OrderModal";

const KARGO_OPTIONS = [
  { id: "mng", label: "Mng Kargo", price: 74.99 },
  { id: "yurtici", label: "Yurtiçi Kargo", price: 74.99 },
  { id: "sendeo", label: "Sendeo", price: 74.99 },
  { id: "hepsijet", label: "HepsiJet", price: 74.99 },
];

function CheckoutPage() {
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
  const [newAddress, setNewAddress] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("kredi");
  const [editingIndex, setEditingIndex] = useState(null);
  const [addressValue, setAddressValue] = useState("");
  const [selectedInstallment, setSelectedInstallment] = useState(0);
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

  const handleEditStart = (idx, addr) => {
    setEditingIndex(idx);
    setAddressValue(addr);
  };

  const handleEditSave = (idx) => {
    if (!addressValue.trim()) return;
    if (user) {
      dispatch(editUserAddress({ index: idx, address: addressValue }));
    } else {
      setLocalAddresses((prev) =>
        prev.map((a, i) => (i === idx ? addressValue : a)),
      );
    }
    setEditingIndex(null);
    setAddressValue("");
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setAddressValue("");
  };

  const handleAddAddress = () => {
    if (!newAddress.trim()) return;
    if (user) {
      dispatch(addUserAddress(newAddress)).then(() => {
        dispatch(getUserAddresses());
      });
    } else {
      setLocalAddresses((prev) => [...prev, newAddress]);
    }
    setNewAddress("");
    setShowAddressForm(false);
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
                <Link className="text-selected" to="/login" state={{ from: "/checkout" }}>
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
                onClick={() => setShowAddressForm((v) => !v)}
              >
                {showAddressForm ? "İptal" : "Adres Ekle"}
              </span>
            </div>

            {showAddressForm && (
              <div className="border rounded-3 p-3 mb-3 d-flex flex-column gap-2">
                <input
                  className="form-control"
                  placeholder="Adres giriniz"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                />
                <button
                  type="button"
                  className="btn orange-btn rounded-pill"
                  onClick={handleAddAddress}
                >
                  Kaydet
                </button>
              </div>
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
                  <div
                    key={idx}
                    className="checkout-address-item border rounded-3 px-3 py-2 d-flex align-items-center justify-content-between"
                    onClick={() =>
                      editingIndex !== idx && setSelectedAddressIdx(idx)
                    }
                  >
                    {editingIndex === idx ? (
                      <>
                        <input
                          className="form-control form-control-sm me-2"
                          value={addressValue}
                          onChange={(e) => setAddressValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEditSave(idx);
                            if (e.key === "Escape") handleEditCancel();
                          }}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                        <div
                          className="d-flex gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="btn p-0 text-success"
                            onClick={() => handleEditSave(idx)}
                          >
                            <FiCheck />
                          </button>
                          <button
                            type="button"
                            className="btn p-0 text-muted"
                            onClick={handleEditCancel}
                          >
                            <FiX />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="d-flex align-items-center gap-3">
                          <span
                            className={`checkout-radio-dot${selectedAddressIdx === idx ? " active" : ""}`}
                          />
                          <p className="checkout-address-text mb-0 fw-semibold">
                            {addr}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="btn p-0 text-muted"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditStart(idx, addr);
                          }}
                        >
                          <FiEdit2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                ))
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
