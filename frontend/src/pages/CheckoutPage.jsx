import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { logoutUser } from "../redux/authSlice";
import { getUserAddresses, addUserAddress } from "../redux/userSlice";
import CheckoutComponent from "../components/CheckoutComponent";
import { FiEdit2 } from "react-icons/fi";
import CardOutlineLogo from "../assets/Checkout/card-outline.svg";
import CardsLogo from "../assets/Checkout/cards.svg";
import HepsipayLogo from "../assets/Checkout/hepsipay.svg";
import TransferLogo from "../assets/Checkout/transfer.svg";
import WalletLogo from "../assets/Checkout/wallet.svg";
import coinsLogo from "../assets/Checkout/coins.png";
import "../styles/CheckoutPage.css";

const KARGO_OPTIONS = [
  { id: "mng", label: "Mng Kargo", price: 74.99 },
  { id: "yurtici", label: "Yurtiçi Kargo", price: 74.99 },
  { id: "sendeo", label: "Sendeo", price: 74.99 },
  { id: "hepsijet", label: "HepsiJet", price: 74.99 },
];

function CheckoutPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { addresses: apiAddresses } = useSelector((state) => state.user);
  const { totalAmount } = useSelector((state) => state.cart);

  const [email, setEmail] = useState("");
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
  const [selectedKargo, setSelectedKargo] = useState("yurtici");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("kredi");
  const [cardInfo, setCardInfo] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [selectedInstallment, setSelectedInstallment] = useState(0);
  const [localAddresses, setLocalAddresses] = useState([]);

  const addresses = user ? apiAddresses : localAddresses;

  useEffect(() => {
    if (user) {
      dispatch(getUserAddresses());
    }
  }, [user]);

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

  return (
    <div>
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
                <Link className="text-selected" to="/login">
                  Giriş Yap
                </Link>
              )}
            </div>
            <input
              className="checkout-email-input w-100 py-3 px-3 rounded mb-1"
              placeholder="Mail adresinizi giriniz"
              value={user ? user.email : email}
              disabled={!!user}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
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
                  className="btn orange-btn rounded-pill"
                  onClick={handleAddAddress}
                >
                  Kaydet
                </button>
              </div>
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
                    onClick={() => setSelectedAddressIdx(idx)}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <span
                        className={`checkout-radio-dot${selectedAddressIdx === idx ? " active" : ""}`}
                      />
                      <p className="checkout-address-text mb-0 fw-semibold">
                        {addr}
                      </p>
                    </div>
                    <FiEdit2 size={16} className="text-muted" />
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
                          maxLength={19}
                          value={cardInfo.number}
                          onChange={(e) =>
                            setCardInfo({ ...cardInfo, number: e.target.value })
                          }
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
                      <input
                        className="checkout-card-input"
                        placeholder="Kart Üzerindeki İsim"
                        value={cardInfo.name}
                        onChange={(e) =>
                          setCardInfo({ ...cardInfo, name: e.target.value })
                        }
                      />
                      <div className="d-flex gap-2">
                        <input
                          className="checkout-card-input"
                          placeholder="Ay/Yıl"
                          maxLength={5}
                          value={cardInfo.expiry}
                          onChange={(e) =>
                            setCardInfo({ ...cardInfo, expiry: e.target.value })
                          }
                        />
                        <input
                          className="checkout-card-input"
                          placeholder="CVV"
                          maxLength={3}
                          value={cardInfo.cvv}
                          onChange={(e) =>
                            setCardInfo({ ...cardInfo, cvv: e.target.value })
                          }
                        />
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
                    {/* <img src={HepsipayLogo} alt="hepsipay" height={20} /> */}
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
                className="checkout-checkbox"
              />
              <label htmlFor="sozlesme" className="checkout-sozlesme-label">
                <strong role="button">Gizlilik Sözleşmesini</strong> ve{" "}
                <strong role="button">Satış Sözleşmesini</strong> okudum,
                onaylıyorum.
              </label>
            </div>
            <button className="btn orange-btn w-100 rounded py-3 fw-semibold mb-5">
              Siparişi Tamamla
            </button>
          </div>

          <div className="col-12 col-lg-6"></div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
