import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  createList,
  deleteList,
  removeProductFromList,
} from "../redux/listSlice";

export default function ProfileListsSection() {
  const dispatch = useDispatch();
  const { lists, loading } = useSelector((state) => state.list);

  const [newListName, setNewListName] = useState("");
  const [creating, setCreating] = useState(false);
  const [openListId, setOpenListId] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    const name = newListName.trim();
    if (!name) return;
    setCreating(true);
    await dispatch(createList(name));
    setNewListName("");
    setCreating(false);
  };

  const handleDelete = (listId) => {
    if (window.confirm("Bu listeyi silmek istediğinize emin misiniz?")) {
      dispatch(deleteList(listId));
      if (openListId === listId) setOpenListId(null);
    }
  };

  const handleRemoveProduct = (listId, productId) => {
    dispatch(removeProductFromList({ listId, productId }));
  };

  const openList = lists.find((l) => l._id === openListId);

  if (loading) return <p className="text-muted">Yükleniyor...</p>;

  if (openList) {
    return (
      <div>
        <button
          className="btn p-0 mb-3 d-flex align-items-center gap-1"
          style={{ fontSize: 14, color: "#6c757d" }}
          onClick={() => setOpenListId(null)}
        >
          ← Listelerime Geri Dön
        </button>

        <div className="d-flex align-items-center justify-content-between mb-4">
          <h6 className="fw-bold mb-0">{openList.name}</h6>
          <button
            className="btn btn-outline-danger btn-sm rounded-pill px-3"
            onClick={() => handleDelete(openList._id)}
          >
            Listeyi Sil
          </button>
        </div>

        {openList.products.length === 0 ? (
          <p className="text-muted" style={{ fontSize: 14 }}>
            Bu listede henüz ürün yok.
          </p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {openList.products.map((product) => {
              const img = product.images?.[0]?.url;
              const price =
                product.discountPercent > 0
                  ? product.discountedPrice
                  : product.price;
              return (
                <div
                  key={product._id}
                  className="d-flex align-items-center gap-3 border rounded p-3"
                >
                  {img && (
                    <img
                      src={img}
                      alt={product.name}
                      style={{
                        width: 64,
                        height: 64,
                        objectFit: "contain",
                        borderRadius: 8,
                        border: "1px solid #e5e8ec",
                      }}
                    />
                  )}
                  <div className="flex-grow-1">
                    <Link
                      to={`/${product._id}`}
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#212529",
                        textDecoration: "none",
                      }}
                    >
                      {product.name}
                    </Link>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#f83b0a" }}>
                        {Number(price).toFixed(2).replace(".", ",")}₺
                      </span>
                      {product.discountPercent > 0 && (
                        <del style={{ fontSize: 12, color: "#6c757d" }}>
                          {Number(product.price).toFixed(2).replace(".", ",")}₺
                        </del>
                      )}
                    </div>
                  </div>
                  <button
                    className="btn btn-sm"
                    style={{ color: "#adb5bd", fontSize: 18, lineHeight: 1 }}
                    title="Listeden çıkar"
                    onClick={() => handleRemoveProduct(openList._id, product._id)}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleCreate} className="d-flex gap-2 mb-4">
        <input
          type="text"
          className="form-control"
          style={{ fontSize: 14 }}
          placeholder="Yeni liste adı..."
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
        />
        <button
          type="submit"
          className="btn rounded-pill px-4"
          style={{
            background: "#ff7700",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
          disabled={creating || !newListName.trim()}
        >
          {creating ? "Oluşturuluyor..." : "Liste Oluştur"}
        </button>
      </form>

      {lists.length === 0 ? (
        <p className="text-muted" style={{ fontSize: 14 }}>
          Henüz listeniz yok. Ürün sayfasından "Listeye Ekle" ile
          oluşturabilirsiniz.
        </p>
      ) : (
        <div className="d-flex flex-column gap-2">
          {lists.map((list) => (
            <div
              key={list._id}
              className="d-flex align-items-center gap-3 border rounded p-3"
              style={{ cursor: "pointer" }}
              onClick={() => setOpenListId(list._id)}
            >
              <span style={{ fontSize: 22 }}>📋</span>
              <div className="flex-grow-1">
                <p className="mb-0 fw-semibold" style={{ fontSize: 14 }}>
                  {list.name}
                </p>
                <p className="mb-0 text-muted" style={{ fontSize: 12 }}>
                  {list.products?.length || 0} ürün
                </p>
              </div>
              <button
                className="btn btn-sm"
                style={{ color: "#adb5bd", fontSize: 18 }}
                title="Sil"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(list._id);
                }}
              >
                ×
              </button>
              <span style={{ color: "#adb5bd", fontSize: 18 }}>›</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}