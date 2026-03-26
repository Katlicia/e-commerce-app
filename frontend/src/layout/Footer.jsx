import ReliabilitySection from "../components/ReliabilitySection";
import footerIcon from "../assets/Footer/footer.png";
import "../styles/Footer.css";
import InfoFooter from "../components/InfoFooter";
import Brands from "../components/Brands";
import PopularLinks from "../components/PopularLinks";

function Footer() {
  return (
    <div>
      <Brands />
      <PopularLinks />
      <ReliabilitySection />
      <InfoFooter />
      <div className="border-top py-3">
        <div className="container d-flex align-items-center justify-footer  flex-wrap gap-2">
          <p className="mb-0 text-muted" style={{ fontSize: "13px" }}>
            <span style={{ color: "black" }}>Copyright ©</span> 2025. LİSTENSİ
            OFİS MALZEMELERİ VE TEDARİK HİZMETLERİ TİCARET LIMITED ŞİRKETİ
          </p>
          <img
            src={footerIcon}
            className="img-fluid"
            style={{ maxHeight: "28px" }}
          />
        </div>
      </div>
    </div>
  );
}

export default Footer;
