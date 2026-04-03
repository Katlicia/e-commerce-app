import { FaMinus, FaPlus } from "react-icons/fa6";

function FilterSection({ title, open, onToggle, children }) {
  return (
    <div className="mb-2">
      <div
        className="d-flex justify-content-between align-items-center py-2"
        style={{ cursor: "pointer", borderBottom: "1px solid #dee2e6" }}
        onClick={onToggle}
      >
        <h6 className="fw-bold mb-0" style={{ fontSize: "0.8rem" }}>
          {title}
        </h6>
        <span style={{ fontSize: "0.7rem", color: "#6c757d" }}>
          {open ? <FaMinus /> : <FaPlus />}
        </span>
      </div>
      {open && <div className="pt-2">{children}</div>}
    </div>
  );
}

export default FilterSection;
