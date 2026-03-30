import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserAddresses,
  addUserAddress,
  editUserAddress,
} from "../redux/userSlice";
import { FiPlus, FiEdit2, FiCheck, FiX } from "react-icons/fi";

function ProfileAddressForm() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { addresses, loading } = useSelector((state) => state.user);

  const [newAddress, setNewAddress] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    if (user) dispatch(getUserAddresses());
  }, [user]);

  const handleAdd = () => {
    if (!newAddress.trim()) return;
    dispatch(addUserAddress(newAddress));
    setNewAddress("");
    setShowInput(false);
  };

  const handleEditStart = (idx, addr) => {
    setEditingIndex(idx);
    setEditValue(addr);
  };

  const handleEditSave = (idx) => {
    if (!editValue.trim()) return;
    dispatch(editUserAddress({ index: idx, address: editValue }));
    setEditingIndex(null);
    setEditValue("");
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  return (
    <div>
      <div className="d-flex flex-column gap-2 mb-3">
        {addresses.length === 0 && !loading && (
          <p className="text-muted" style={{ fontSize: "0.9rem" }}>
            Kayıtlı adresiniz yok.
          </p>
        )}
        {addresses.map((addr, idx) => (
          <div
            key={idx}
            className="d-flex align-items-center justify-content-between border rounded-3 px-3 py-2 gap-2"
          >
            {editingIndex === idx ? (
              <>
                <input
                  className="form-control form-control-sm"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEditSave(idx);
                    if (e.key === "Escape") handleEditCancel();
                  }}
                  autoFocus
                />
                <div className="d-flex gap-1">
                  <button
                    className="btn p-0 text-success"
                    onClick={() => handleEditSave(idx)}
                    disabled={loading}
                  >
                    <FiCheck />
                  </button>
                  <button
                    className="btn p-0 text-muted"
                    onClick={handleEditCancel}
                  >
                    <FiX />
                  </button>
                </div>
              </>
            ) : (
              <>
                <span style={{ fontSize: "0.9rem" }}>{addr}</span>
                <div className="d-flex gap-2">
                  <button
                    className="btn p-0 text-muted"
                    onClick={() => handleEditStart(idx, addr)}
                  >
                    <FiEdit2 />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {showInput ? (
        <div className="d-flex gap-2">
          <input
            className="form-control"
            placeholder="Yeni adres giriniz"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            autoFocus
          />
          <button
            className="btn orange-btn rounded-pill px-3"
            onClick={handleAdd}
            disabled={loading}
          >
            {loading ? "..." : "Ekle"}
          </button>
          <button
            className="btn btn-outline-secondary rounded-pill px-3"
            onClick={() => {
              setShowInput(false);
              setNewAddress("");
            }}
          >
            İptal
          </button>
        </div>
      ) : (
        <button
          className="btn rounded-pill d-flex align-items-center gap-2"
          style={{ borderColor: "#f83b0a", color: "#f83b0a" }}
          onClick={() => setShowInput(true)}
        >
          <FiPlus />
          <span>Yeni Adres Ekle</span>
        </button>
      )}
    </div>
  );
}

export default ProfileAddressForm;
