import { useState, useEffect } from "react";
import "../styles/Chances.css";

const TARGET = new Date(Date.now() + 11 * 3600 * 1000 + 43 * 60 * 1000 + 35 * 1000);

function getTimeLeft() {
  const diff = Math.max(0, TARGET - Date.now());
  return {
    saat: Math.floor(diff / 3600000),
    dakika: Math.floor((diff % 3600000) / 60000),
    saniye: Math.floor((diff % 60000) / 1000),
  };
}

function Chances() {
  const [time, setTime] = useState(getTimeLeft());

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { value: time.saat, label: "Saat" },
    { value: time.dakika, label: "Dakika" },
    { value: time.saniye, label: "Saniye" },
  ];

  return (
    <div className="chances-bar container d-flex justify-content-between align-items-center">
      <h2 className="chances-title">Kaçırılmayacak Fırsatlar</h2>
      <div className="chances-timer">
        {units.map((u) => (
          <div key={u.label} className="chances-box">
            <span className="chances-value">{String(u.value).padStart(2, "0")}</span>
            <span className="chances-label">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Chances;
