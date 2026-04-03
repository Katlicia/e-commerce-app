import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { syncClearCart, addToCartWithSync } from "../redux/cartSlice";

export const useReorder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleReorder = async (order) => {
    const outOfStock = [];
    const limited = [];

    order.items.forEach(({ product, quantity }) => {
      if (!product) return;
      const stock = product.stock ?? Infinity;

      if (stock <= 0) {
        outOfStock.push(product.name);
      } else if (stock < quantity) {
        limited.push(`${product.name} (${quantity} yerine ${stock} adet)`);
      }
    });

    const addableItems = order.items.filter(
      ({ product }) => product && (product.stock ?? 1) > 0,
    );

    if (addableItems.length === 0) {
      alert("Siparişinizdeki tüm ürünler şu an stokta bulunmamaktadır.");
      return;
    }

    if (outOfStock.length > 0 || limited.length > 0) {
      let msg = "";
      if (outOfStock.length > 0)
        msg += `Stokta olmadığı için eklenemeyen ürünler:\n• ${outOfStock.join("\n• ")}\n\n`;
      if (limited.length > 0)
        msg += `Sınırlı stok nedeniyle adet güncellenen ürünler:\n• ${limited.join("\n• ")}\n\n`;
      msg += "Diğer ürünler sepete eklenecek.";
      alert(msg);
    }

    await dispatch(syncClearCart());

    addableItems.forEach(({ product, quantity }) => {
      const addCount = Math.min(quantity, product.stock ?? quantity);
      for (let i = 0; i < addCount; i++) {
        dispatch(addToCartWithSync(product));
      }
    });

    navigate("/checkout");
  };

  return { handleReorder };
};
