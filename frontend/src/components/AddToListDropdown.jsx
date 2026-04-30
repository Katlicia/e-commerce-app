import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createList, addProductToList } from "../redux/listSlice";

const DEFAULT_LIST_NAME = "Alışveriş Listesi";

export default function AddToListDropdown({ product, open, onClose }) {
  const dispatch = useDispatch();
  const { lists } = useSelector((state) => state.list);
  const { user } = useSelector((state) => state.auth);

  const [newListName, setNewListName] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) {
      setShowInput(false);
      setNewListName("");
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open || !user) return null;

  const productId = product?._id;

  const isInList = (list) =>
    list.products?.some((p) => (p._id || p) === productId);

  const handleAddToList = async (listId) => {
    setLoadingId(listId);
    await dispatch(addProductToList({ listId, productId }));
    setLoadingId(null);
    onClose();
  };

  const handleAddToDefault = async () => {
    setCreating(true);
    let target = lists.find((l) => l.name === DEFAULT_LIST_NAME);
    if (!target) {
      const res = await dispatch(createList(DEFAULT_LIST_NAME));
      target = res.payload;
    }
    await dispatch(addProductToList({ listId: target._id, productId }));
    setCreating(false);
    onClose();
  };

  const handleCreateAndAdd = async () => {
    const name = newListName.trim();
    if (!name) return;
    setCreating(true);
    const res = await dispatch(createList(name));
    const newList = res.payload;
    await dispatch(addProductToList({ listId: newList._id, productId }));
    setNewListName("");
    setShowInput(false);
    setCreating(false);
    onClose();
  };

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        background: "#fff",
        border: "1px solid #e5e8ec",
        borderRadius: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        width: 280,
        padding: "8px 0",
      }}
    >
      <p
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#212529",
          padding: "6px 16px 10px",
          margin: 0,
          borderBottom: "1px solid #e5e8ec",
        }}
      >
        Listeye Ekle
      </p>

      {/* Default list */}
      <button
        onClick={handleAddToDefault}
        disabled={creating}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          padding: "10px 16px",
          border: "none",
          background: "#fff8f6",
          cursor: "pointer",
          borderBottom: "1px solid #e5e8ec",
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: 16 }}>🛒</span>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#ff4d2d" }}>
            {DEFAULT_LIST_NAME}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: "#6c757d" }}>Varsayılan liste</p>
        </div>
        {creating ? (
          <span style={{ fontSize: 11, color: "#6c757d" }}>Ekleniyor...</span>
        ) : (
          <span style={{ fontSize: 18, color: "#ff4d2d" }}>+</span>
        )}
      </button>

      {/* Other lists */}
      <div style={{ maxHeight: 200, overflowY: "auto" }}>
        {lists.map((list) => {
          const inList = isInList(list);
          return (
            <button
              key={list._id}
              onClick={() => !inList && handleAddToList(list._id)}
              disabled={inList || loadingId === list._id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "10px 16px",
                border: "none",
                background: "#fff",
                cursor: inList ? "default" : "pointer",
                borderBottom: "1px solid #f0f0f0",
                textAlign: "left",
                opacity: inList ? 0.6 : 1,
              }}
            >
              <span style={{ fontSize: 16 }}>📋</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#212529" }}>
                  {list.name}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: "#6c757d" }}>
                  {list.products?.length || 0} ürün
                </p>
              </div>
              {loadingId === list._id ? (
                <span style={{ fontSize: 11, color: "#6c757d" }}>Ekleniyor...</span>
              ) : inList ? (
                <span style={{ fontSize: 16, color: "#adb5bd" }}>✓</span>
              ) : (
                <span style={{ fontSize: 18, color: "#6c757d" }}>+</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Create new */}
      <div style={{ padding: "8px 16px" }}>
        {showInput ? (
          <div style={{ display: "flex", gap: 6 }}>
            <input
              autoFocus
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateAndAdd()}
              placeholder="Liste adı..."
              style={{
                flex: 1,
                border: "1px solid #dee2e6",
                borderRadius: 8,
                padding: "6px 10px",
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              onClick={handleCreateAndAdd}
              disabled={creating || !newListName.trim()}
              style={{
                background: "#ff4d2d",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {creating ? "..." : "Oluştur"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "none",
              padding: "4px 0",
              fontSize: 13,
              color: "#6c757d",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 16 }}>＋</span> Yeni liste oluştur
          </button>
        )}
      </div>
    </div>
  );
}