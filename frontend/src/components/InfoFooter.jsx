import { useState } from "react";
import logo from "../assets/Footer/logo.svg";
import appStoreIcon from "../assets/Footer/app-store.png";
import googlePlayIcon from "../assets/Footer/google-play.png";
import qrCode from "../assets/Footer/qr-code.png";
import encryptionLogo from "../assets/Footer/256bit.png";
import bgLogo from "../assets/Footer/bg-logo.png";
import "../styles/InfoFooter.css";

const sections = [
  {
    title: "KİŞİSEL VERİLERİN KORUNMASI",
    links: [
      "Açık Rıza Metni",
      "Ticari İleti Açık Rıza Metni",
      "Çerez Aydınlatma Metni",
      "Üye Müşteri Aydınlatma Metni",
      "Mesafeli Satış Sözleşmesi",
    ],
  },
  {
    title: "KURUMSAL",
    links: [
      "Hakkında",
      "Bize Ulaşın",
      "İnsan Kaynakları",
      "Müşteri Hizmetleri",
      "İptal İade",
    ],
  },
  {
    title: "KURUMSAL",
    links: [
      "Hakkında",
      "Bize Ulaşın",
      "İnsan Kaynakları",
      "Müşteri Hizmetleri",
      "İptal İade",
    ],
  },
];

function AccordionSection({ title, links }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="info-footer-accordion">
      <button
        className="info-footer-accordion-btn"
        onClick={() => setOpen(!open)}
      >
        <span className="info-footer-col-title mb-0">{title}</span>
        <span>{open ? "−" : "+"}</span>
      </button>
      <div className={`info-footer-accordion-body ${open ? "open" : ""}`}>
        {links.map((link, i) => (
          <a key={i} href="#0" className="info-footer-link">
            {link}
          </a>
        ))}
      </div>
    </div>
  );
}

function InfoFooter() {
  return (
    <div className="info-footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-12 col-md-3 text-center text-md-start">
            <img src={logo} className="info-footer-logo" />
            <p className="info-footer-address mb-1">
              Yardıma mı ihtiyacınız var?
            </p>
            <p className="info-footer-phone">444 56 50</p>
            <p className="info-footer-address">
              Sarımeşe Mah. Bağdat Cad. No:316 Kartepe/Kocaeli
              <br />
              destek@listensi.com
              <br />
              listensi@hs01.kep.tr
            </p>
          </div>

          {sections.map((section, i) => (
            <div key={i} className="col-12 col-md-2">
              <div className="d-none d-md-block">
                <p className="info-footer-col-title">{section.title}</p>
                {section.links.map((link, j) => (
                  <a key={j} href="#0" className="info-footer-link">
                    {link}
                  </a>
                ))}
              </div>
              <div className="d-md-none">
                <AccordionSection title={section.title} links={section.links} />
              </div>
            </div>
          ))}

          <div className="col-12 col-md-3 d-flex flex-column align-items-center align-items-md-start">
            <div className="d-flex gap-3 align-items-center">
              <div className="d-flex flex-column gap-2">
                <img
                  src={appStoreIcon}
                  alt="App Store"
                  className="info-footer-store-img"
                />
                <img
                  src={googlePlayIcon}
                  alt="Google Play"
                  className="info-footer-store-img"
                />
              </div>
              <img src={qrCode} alt="QR Code" className="info-footer-qr" />
            </div>
            <div className="w-75 d-flex justify-content-center">
              <img
                src={encryptionLogo}
                alt="256 Bit SSL"
                className="info-footer-encryption"
              />
            </div>
          </div>
        </div>
      </div>
      <img src={bgLogo} className="bg-logo" />
    </div>
  );
}

export default InfoFooter;
