import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";

function CategoryNode({ cat, level, selectedCategory, onSelect }) {
  const [open, setOpen] = useState(false);
  const hasChildren = cat.children && cat.children.length > 0;
  const isSelected = Array.isArray(selectedCategory)
    ? selectedCategory.includes(cat._id.toString())
    : selectedCategory === cat._id.toString();

  return (
    <div>
      <div
        className="d-flex align-items-center py-1 rounded"
        style={{ paddingLeft: `${4 + level * 12}px` }}
      >
        <input
          type="checkbox"
          checked={isSelected}
          style={{
            accentColor: "#dc3545",
            marginRight: 6,
            cursor: "pointer",
            flexShrink: 0,
          }}
          onChange={() => onSelect(cat._id.toString())}
        />
        <span
          className={`flex-grow-1 ${isSelected ? "text-danger fw-semibold" : ""}`}
          style={{ fontSize: "0.875rem", cursor: "pointer" }}
          onClick={() => onSelect(cat._id.toString())}
        >
          {cat.name}
        </span>
        {hasChildren && (
          <span
            style={{
              cursor: "pointer",
              color: "#adb5bd",
              fontSize: "0.7rem",
              marginLeft: 4,
              flexShrink: 0,
            }}
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        )}
      </div>
      {open &&
        hasChildren &&
        cat.children.map((child) => (
          <CategoryNode
            key={child._id}
            cat={child}
            level={level + 1}
            selectedCategory={selectedCategory}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
}

export default CategoryNode;
