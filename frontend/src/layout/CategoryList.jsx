import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../redux/productSlice.jsx";
import ProductCard from "../components/ProductCard.jsx";

function CategoryList() {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.product);
  const { keyword } = useSelector((state) => state.general);

  useEffect(() => {
    dispatch(getProducts({ keyword }));
  }, [dispatch, keyword]);

  return (
    <div className="container py-4">
      <div className="row">
        <aside className="col-12 col-lg-3 mb-4">
          <div className="border rounded-3 p-3">
            <h6 className="fw-bold mb-3">Filtreler</h6>
            <p className="text-muted" style={{ fontSize: "0.875rem" }}>
              Filtreler yakında eklenecek.
            </p>
          </div>
        </aside>

        {/* Sağ ürün listesi */}
        <main className="col-12 col-lg-9">
          {/* Üst bar: sonuç sayısı + sıralama */}
          <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
            <span className="text-muted" style={{ fontSize: "0.875rem" }}>
              {keyword ? (
                <>
                  <strong>"{keyword}"</strong> için {products.length} sonuç
                  bulundu
                </>
              ) : (
                <>{products.length} ürün listeleniyor</>
              )}
            </span>
            <select
              className="form-select w-auto"
              style={{ fontSize: "0.875rem" }}
            >
              <option>Önerilen Sıralama</option>
              <option>En Düşük Fiyat</option>
              <option>En Yüksek Fiyat</option>
              <option>En Çok Satan</option>
              <option>En Yeni</option>
            </select>
          </div>

          {/* Ürün grid */}
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-secondary" role="status" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p className="fs-5">Ürün bulunamadı.</p>
              {keyword && (
                <p style={{ fontSize: "0.875rem" }}>
                  "<strong>{keyword}</strong>" için sonuç yok.
                </p>
              )}
            </div>
          ) : (
            <div className="row row-cols-2 row-cols-md-3 row-cols-xl-4 g-3">
              {products.map((product) => (
                <div className="col" key={product._id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default CategoryList;
