import satelliteIcon from "../assets/Reliability/satellite.svg";
import walletIcon from "../assets/Reliability/wallet.svg";
import priceIcon from "../assets/Reliability/price.svg";
import customerIcon from "../assets/Reliability/customer.svg";
import notepadIcon from "../assets/Reliability/notepad.svg";
import "../styles/ReliabilitySection.css";

const items = [
  {
    icon: satelliteIcon,
    title: "HIZLI TESLİMAT",
    desc: "Ürünleriniz aynı gün kargoya verilir",
  },
  {
    icon: walletIcon,
    title: "GÜVENLİ ÖDEME",
    desc: "256bit SSL ile tüm bilgileriniz korunur",
  },
  {
    icon: priceIcon,
    title: "FİYAT GARANTİSİ",
    desc: "Listensi en iyi fiyat garantisi sunar",
  },
  {
    icon: customerIcon,
    title: "MÜŞTERİ TEMSİLCİSİ",
    desc: "Günün her saati doğrudan temsilci ile görüşün",
  },
  {
    icon: notepadIcon,
    title: "LİSTELİ ÜRÜNLER",
    desc: "Tekrarlı alışverişlerinizi jet hızıyla yapın",
  },
];

function ReliabilitySection() {
  return (
    <div className="border-top py-4 reliability">
      <div className="container">
        <div className="row row-cols-2 row-cols-md-5 g-3">
          {items.map((item, i) => (
            <div
              key={i}
              className={`col d-flex flex-column align-items-center text-center gap-2 ${i < items.length - 1 ? "border-end" : ""}`}
            >
              <img src={item.icon} width="32px" />
              <p className="fw-bold mb-0" style={{ fontSize: "13px" }}>
                {item.title}
              </p>
              <p
                className="text-muted mb-3"
                style={{ fontSize: "12px", maxWidth: "150px" }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
        <hr className="text-muted"></hr>
      </div>
    </div>
  );
}

export default ReliabilitySection;
