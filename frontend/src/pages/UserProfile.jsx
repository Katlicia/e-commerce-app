import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import HeaderLinks from "../components/HeaderLinks";
import { FiChevronDown, FiUser } from "react-icons/fi";
import "../styles/UserProfile.css";
import ProfileOrderCard from "../components/ProfileOrderCard";
import ProfileInfoForm from "../components/ProfileInfoForm";
import ProfileAddressForm from "../components/ProfileAddressForm";
import ProfilePasswordForm from "../components/ProfilePasswordForm";
import { getUserOrders } from "../redux/orderSlice";
import ProfileOrderDetails from "../components/ProfileOrderDetails";
import arrowIcon from "../assets/Profile/arrow.svg";

const CONTENT_TITLES = {
  siparisler: "Siparişlerim",
  "uyelik-bilgilerim": "Üyelik Bilgilerim",
  "iletisim-izinleri": "İletişim İzinleri",
  listelerim: "Listelerim",
  adreslerim: "Adreslerim",
  mesajlar: "Mesajlar",
  "soru-cevap": "Soru Cevap",
  "fiyat-alarmlari": "Fiyat Alarmlarım",
  kurumsal: "Kurumsal Teklifler",
  "sifre-degistir": "Şifre Değiştir",
};

function UserProfile() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const dispatch = useDispatch();
  const { orders, loading: ordersLoading } = useSelector(
    (state) => state.order,
  );
  const [activeNav, setActiveNav] = useState("siparisler");
  const [activeTab, setActiveTab] = useState("siparisler");
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "iptallerim") return o.status === "İptal Edildi";
    if (activeTab === "iadelerim") return o.status === "İade Edildi";
    return o.status !== "İptal Edildi" && o.status !== "İade Edildi";
  });

  useEffect(() => {
    dispatch(getUserOrders());
  }, []);

  const toggleDropdown = (id, e) => {
    e.stopPropagation();
    setOpenDropdowns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const navItem = (id, label, isOrange = false) => (
    <div
      className={`d-flex align-items-center gap-2 dot-border${activeNav === id ? " nav-active" : ""}`}
      onClick={() => setActiveNav(id)}
    >
      <FiUser />
      <span className={isOrange ? "orange-text" : ""}>
        <strong>{label}</strong>
      </span>
    </div>
  );

  return (
    <>
      <HeaderLinks />
      <div className="container my-4">
        <div className="pd-breadcrumb mb-4">
          <Link to="/">Anasayfa</Link>
          {" / "}
          <span style={{ color: "black" }}>Profiliniz</span>
        </div>

        <div className="row g-4 align-items-start">
          <div className="col-12 col-lg-3">
            <div className="profile-sidebar">
              <div className="d-flex flex-column px-4">
                <div className={"dot-border"}>
                  <span className={activeNav === "ozet" ? "orange-text" : ""}>
                    <strong>Özet</strong>
                  </span>
                </div>

                <div className="dot-border">
                  <div
                    className="d-flex align-items-center gap-2"
                    onClick={(e) => toggleDropdown("hesap", e)}
                  >
                    <FiUser />
                    <span>
                      <strong>Hesap Yönetimi</strong>
                    </span>
                    <FiChevronDown
                      size={14}
                      className={`profile-dropdown-icon ms-auto${openDropdowns["hesap"] ? " open" : ""}`}
                    />
                  </div>
                  <div
                    className={`profile-sub-list${openDropdowns["hesap"] ? " open" : ""}`}
                  >
                    <div className="profile-sub-list-inner">
                      {[
                        { id: "uyelik-bilgilerim", label: "Üyelik Bilgilerim" },
                        { id: "iletisim-izinleri", label: "İletişim İzinleri" },
                        { id: "listelerim", label: "Listelerim" },
                        { id: "adreslerim", label: "Adreslerim" },
                      ].map((s) => (
                        <div
                          key={s.id}
                          className={`profile-sub-item${activeNav === s.id ? " active" : ""}`}
                          onClick={() => setActiveNav(s.id)}
                        >
                          {s.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {navItem("siparisler", "Siparişler")}

                <div className="dot-border">
                  <div
                    className="d-flex align-items-center gap-2"
                    onClick={(e) => toggleDropdown("musteri", e)}
                  >
                    <FiUser />
                    <span>
                      <strong>Müşteri İlişkileri</strong>
                    </span>
                    <FiChevronDown
                      size={14}
                      className={`profile-dropdown-icon ms-auto${openDropdowns["musteri"] ? " open" : ""}`}
                    />
                  </div>
                  <div
                    className={`profile-sub-list${openDropdowns["musteri"] ? " open" : ""}`}
                  >
                    <div className="profile-sub-list-inner">
                      {[
                        { id: "mesajlar", label: "Mesajlar" },
                        { id: "soru-cevap", label: "Soru Cevap" },
                      ].map((s) => (
                        <div
                          key={s.id}
                          className={`profile-sub-item${activeNav === s.id ? " active" : ""}`}
                          onClick={() => setActiveNav(s.id)}
                        >
                          {s.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {navItem("fiyat-alarmlari", "Fiyat Alarmlarım")}
                {navItem("kurumsal", "Kurumsal Teklifler", true)}
                {navItem("sifre-degistir", "Şifre Değiştir")}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-9">
            {!(activeNav === "siparisler" && selectedOrder) && (
              <h5 className="fw-bold mb-3">{CONTENT_TITLES[activeNav]}</h5>
            )}

            {activeNav === "siparisler" && (
              <>
                {selectedOrder ? (
                  <button
                    className="btn p-0 mb-3 d-flex align-items-center gap-1"
                    onClick={() => setSelectedOrder(null)}
                  >
                    <img src={arrowIcon} alt="Geri" />
                    Siparişlerime Geri Dön
                  </button>
                ) : (
                  <div className="d-flex border-bottom mb-4">
                    {["siparisler", "iptallerim", "iadelerim"].map((tab) => (
                      <button
                        key={tab}
                        className={`profile-tab${activeTab === tab ? " active" : ""}`}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab === "siparisler"
                          ? "Siparişler"
                          : tab === "iptallerim"
                            ? "İptallerim"
                            : "İadelerim"}
                      </button>
                    ))}
                  </div>
                )}
                {selectedOrder ? (
                  <ProfileOrderDetails order={selectedOrder} />
                ) : ordersLoading ? (
                  <p className="text-muted">Yükleniyor...</p>
                ) : orders.length === 0 ? (
                  <p className="text-muted">Henüz siparişiniz yok.</p>
                ) : (
                  filteredOrders.map((order) => (
                    <ProfileOrderCard
                      key={order._id}
                      order={order}
                      onDetailClick={() => setSelectedOrder(order)}
                    />
                  ))
                )}
              </>
            )}

            {activeNav === "uyelik-bilgilerim" && <ProfileInfoForm />}
            {activeNav === "adreslerim" && <ProfileAddressForm />}
            {activeNav === "sifre-degistir" && <ProfilePasswordForm />}

            {![
              "siparisler",
              "uyelik-bilgilerim",
              "adreslerim",
              "sifre-degistir",
            ].includes(activeNav) && (
              <p className="text-muted">Bu bölüm yakında aktif olacak.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default UserProfile;
