import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { syncClearCart, addToCartWithSync } from "../redux/cartSlice";
import toast from "react-hot-toast";

export const useReorder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleReorder = async (order) => {
    const outOfStock = [];
    const limited = [];

    order.items.forEach(({ product, quantity, skuId }) => {
      if (!product) return;

      if (product.hasVariants && skuId) {
        const sku = (product.skus || []).find(
          (s) => s._id?.toString() === skuId?.toString(),
        );
        const stock = sku?.stock ?? 0;
        if (stock <= 0) {
          outOfStock.push(product.name);
        } else if (stock < quantity) {
          limited.push(`${product.name} (${quantity} yerine ${stock} adet)`);
        }
      } else {
        const stock = product.stock ?? Infinity;
        if (stock <= 0) {
          outOfStock.push(product.name);
        } else if (stock < quantity) {
          limited.push(`${product.name} (${quantity} yerine ${stock} adet)`);
        }
      }
    });

    const addableItems = order.items.filter(({ product, skuId }) => {
      if (!product) return false;
      if (product.hasVariants && skuId) {
        const sku = (product.skus || []).find(
          (s) => s._id?.toString() === skuId?.toString(),
        );
        return (sku?.stock ?? 0) > 0;
      }
      return (product.stock ?? 1) > 0;
    });

    if (addableItems.length === 0) {
      toast.error("Siparişinizdeki ürünler şu an stokta bulunmamaktadır.");
      return;
    }

    if (outOfStock.length > 0) {
      toast.error(
        `Stokta olmadığı için eklenemeyen ürünler:\n• ${outOfStock.join("\n• ")}`,
        { style: { whiteSpace: "pre-line" } },
      );
    }
    if (limited.length > 0) {
      toast(
        `Sınırlı stok nedeniyle adet güncellenen ürünler:\n• ${limited.join("\n• ")}\n\nDiğer ürünler sepete eklenecek.`,
        { icon: "⚠️", style: { whiteSpace: "pre-line" } },
      );
    }

    await dispatch(syncClearCart());

    addableItems.forEach(({ product, quantity, skuId, selectedVariants }) => {
      let addCount;
      if (product.hasVariants && skuId) {
        const sku = (product.skus || []).find(
          (s) => s._id?.toString() === skuId?.toString(),
        );
        addCount = Math.min(quantity, sku?.stock ?? quantity);
      } else {
        addCount = Math.min(quantity, product.stock ?? quantity);
      }

      const variants = selectedVariants
        ? selectedVariants instanceof Map
          ? Object.fromEntries(selectedVariants)
          : selectedVariants
        : {};

      let productToAdd = product;
      if (product.hasVariants && skuId) {
        const sku = (product.skus || []).find(
          (s) => s._id?.toString() === skuId?.toString(),
        );
        if (sku) {
          const skuDiscountedPrice = product.discountPercent
            ? +(sku.price * (1 - product.discountPercent / 100)).toFixed(2)
            : undefined;
          productToAdd = {
            ...product,
            price: sku.price,
            discountedPrice: skuDiscountedPrice,
          };
        }
      }

      for (let i = 0; i < addCount; i++) {
        dispatch(addToCartWithSync(productToAdd, variants, skuId ?? null));
      }
    });

    navigate("/checkout");
  };

  return { handleReorder };
};
