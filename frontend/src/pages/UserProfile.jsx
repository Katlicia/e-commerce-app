import { useState } from "react";
import { Link } from "react-router-dom";
import HeaderLinks from "../components/HeaderLinks";
import { FiChevronDown, FiUser } from "react-icons/fi";
import "../styles/UserProfile.css";
import ProfileOrderCard from "../components/ProfileOrderCard";
import ProfileInfoForm from "../components/ProfileInfoForm";
import ProfileAddressForm from "../components/ProfileAddressForm";
import ProfilePasswordForm from "../components/ProfilePasswordForm";

const MOCK_ORDERS = [
  {
    _id: "1",
    date: "09 Eylül 2024 Cuma 15:00",
    orderNo: "#456456",
    status: "Teslim Edildi",
    total: 345.65,
    images: [],
    extraCount: 5,
  },
  {
    _id: "2",
    date: "09 Eylül 2024 Cuma 15:00",
    orderNo: "#456456",
    status: "Hazırlanıyor",
    total: 345.65,
    images: [],
    extraCount: 0,
  },
  {
    _id: "3",
    date: "09 Eylül 2024 Cuma 15:00",
    orderNo: "#456456",
    status: "Teslim Edildi",
    total: 345.65,
    images: [],
    extraCount: 0,
  },
];

const CONTENT_TITLES = {
  ozet: "Özet",
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
  const [activeNav, setActiveNav] = useState("siparisler");
  const [activeTab, setActiveTab] = useState("siparisler");
  const [openDropdowns, setOpenDropdowns] = useState({});

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
          {/* Sidebar */}
          <div className="col-12 col-lg-3">
            <div className="profile-sidebar">
              <div className="d-flex flex-column px-4">
                {/* Özet */}
                <div
                  className={`dot-border${activeNav === "ozet" ? " nav-active" : ""}`}
                  onClick={() => setActiveNav("ozet")}
                >
                  <span className={activeNav === "ozet" ? "orange-text" : ""}>
                    <strong>Özet</strong>
                  </span>
                </div>

                {/* Hesap Yönetimi */}
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

                {/* Siparişler */}
                {navItem("siparisler", "Siparişler")}

                {/* Müşteri İlişkileri */}
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

          {/* Content */}
          <div className="col-12 col-lg-9">
            <h5 className="fw-bold mb-3">{CONTENT_TITLES[activeNav]}</h5>

            {activeNav === "siparisler" && (
              <>
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
                {MOCK_ORDERS.map((order) => (
                  <ProfileOrderCard key={order._id} order={order} />
                ))}
              </>
            )}

            {activeNav === "uyelik-bilgilerim" && <ProfileInfoForm />}
            {activeNav === "adreslerim" && <ProfileAddressForm />}
            {activeNav === "sifre-degistir" && <ProfilePasswordForm />}

            {!["siparisler", "uyelik-bilgilerim", "adreslerim", "sifre-degistir"].includes(activeNav) && (
              <p className="text-muted">Bu bölüm yakında aktif olacak.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default UserProfile;
