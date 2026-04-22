import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";
import { storage } from "../utils/storage";

const getCartFromStorage = () => {
  const raw = storage.getItem("cart");
  return raw ? JSON.parse(raw) : [];
};

const calcTotal = (cart) =>
  cart.reduce(
    (sum, item) =>
      sum + parseFloat(item.discountedPrice || item.price) * item.quantity,
    0,
  );

const mapBackendItem = (item) => {
  const product = item.product;
  const skuId = item.skuId ?? null;

  let price = product.price;
  let discountedPrice = product.discountedPrice;

  if (product.hasVariants && skuId && Array.isArray(product.skus)) {
    const sku = product.skus.find(
      (s) => s._id?.toString() === skuId?.toString(),
    );
    if (sku) {
      price = sku.price;
      discountedPrice = product.discountPercent
        ? +(sku.price * (1 - product.discountPercent / 100)).toFixed(2)
        : undefined;
    }
  }

  return {
    ...product,
    price,
    discountedPrice,
    quantity: item.quantity,
    skuId,
    selectedVariants: item.selectedVariants
      ? Object.fromEntries(item.selectedVariants)
      : {},
  };
};

export const fetchCart = createAsyncThunk("cart/fetchCart", async () => {
  const { data } = await axiosInstance.get("/users/me/cart");
  return data.map(mapBackendItem);
});

export const syncAddToCart = createAsyncThunk(
  "cart/syncAdd",
  async ({ productId, quantity, skuId, selectedVariants }) => {
    const { data } = await axiosInstance.post("/users/me/cart", {
      productId,
      quantity,
      skuId,
      selectedVariants,
    });
    return data.map(mapBackendItem);
  },
);

export const syncUpdateCart = createAsyncThunk(
  "cart/syncUpdate",
  async ({ productId, quantity, skuId }) => {
    const { data } = await axiosInstance.put(`/users/me/cart/${productId}`, {
      quantity,
      skuId,
    });
    return data.map(mapBackendItem);
  },
);

export const syncRemoveFromCart = createAsyncThunk(
  "cart/syncRemove",
  async ({ productId, skuId }) => {
    const { data } = await axiosInstance.delete(`/users/me/cart/${productId}`, {
      data: { skuId },
    });
    return data.map(mapBackendItem);
  },
);

export const syncClearCart = createAsyncThunk("cart/syncClear", async () => {
  await axiosInstance.delete("/users/me/cart");
  return [];
});

const initialState = {
  cart: getCartFromStorage(),
  totalAmount: 0,
  appliedCoupon: null, // { couponId, code, discount }
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { selectedVariants, skuId, ...rest } = action.payload;
      const product = { ...rest, _id: rest._id || rest.id };
      const id = product._id;
      const existing = state.cart.find((item) => {
        if ((item._id || item.id) !== id) return false;
        if (skuId) return item.skuId === skuId;
        return !item.skuId;
      });
      if (existing) {
        if (existing.quantity >= (product.stock ?? Infinity)) return;
        existing.quantity += 1;
      } else {
        if ((product.stock ?? 1) <= 0) return;
        state.cart.push({
          ...product,
          quantity: 1,
          skuId: skuId ?? null,
          selectedVariants: selectedVariants ?? {},
        });
      }
      state.totalAmount = calcTotal(state.cart);
      storage.setItem("cart", JSON.stringify(state.cart));
    },

    removeFromCart: (state, action) => {
      const { id, skuId } = action.payload;
      state.cart = state.cart.filter((item) => {
        if ((item._id || item.id) !== id) return true;
        if (skuId) return item.skuId !== skuId;
        return !!item.skuId;
      });
      state.totalAmount = calcTotal(state.cart);
      storage.setItem("cart", JSON.stringify(state.cart));
    },

    decreaseCart: (state, action) => {
      const { id, skuId } = action.payload;
      const existing = state.cart.find((item) => {
        if ((item._id || item.id) !== id) return false;
        if (skuId) return item.skuId === skuId;
        return !item.skuId;
      });
      if (existing && existing.quantity > 1) {
        existing.quantity -= 1;
      } else {
        state.cart = state.cart.filter((item) => {
          if ((item._id || item.id) !== id) return true;
          if (skuId) return item.skuId !== skuId;
          return !!item.skuId;
        });
      }
      state.totalAmount = calcTotal(state.cart);
      storage.setItem("cart", JSON.stringify(state.cart));
    },

    calculateCart: (state) => {
      state.totalAmount = calcTotal(state.cart);
    },

    clearCartLocal: (state) => {
      state.cart = [];
      state.totalAmount = 0;
      state.appliedCoupon = null;
      storage.removeItem("cart");
    },

    setAppliedCoupon: (state, action) => {
      state.appliedCoupon = action.payload; // { couponId, code, discount }
    },

    clearAppliedCoupon: (state) => {
      state.appliedCoupon = null;
    },
  },
  extraReducers: (builder) => {
    const applyCart = (state, action) => {
      const seen = new Set();
      state.cart = action.payload
        .map((item) => ({ ...item, _id: item._id || item.id }))
        .filter((item) => {
          const key = `${item._id}-${item.skuId ?? ""}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      state.totalAmount = calcTotal(state.cart);
      storage.setItem("cart", JSON.stringify(state.cart));
    };

    builder
      .addCase(fetchCart.fulfilled, applyCart)
      .addCase(syncAddToCart.fulfilled, applyCart)
      .addCase(syncUpdateCart.fulfilled, applyCart)
      .addCase(syncRemoveFromCart.fulfilled, applyCart)
      .addCase(syncClearCart.fulfilled, (state) => {
        state.cart = [];
        state.totalAmount = 0;
        state.appliedCoupon = null;
        storage.removeItem("cart");
      });
  },
});

export const {
  addToCart,
  decreaseCart,
  removeFromCart,
  calculateCart,
  clearCartLocal,
  setAppliedCoupon,
  clearAppliedCoupon,
} = cartSlice.actions;

// Wrapper thunk's: update local state and if user is logged in sync on server
export const addToCartWithSync =
  (product, selectedVariants, skuId) => (dispatch, getState) => {
    const id = product._id || product.id;
    dispatch(addToCart({ ...product, selectedVariants, skuId }));
    if (getState().auth.user) {
      dispatch(
        syncAddToCart({ productId: id, quantity: 1, skuId, selectedVariants }),
      );
    }
  };

export const removeFromCartWithSync = (id, skuId) => (dispatch, getState) => {
  dispatch(removeFromCart({ id, skuId }));
  if (getState().auth.user) {
    dispatch(syncRemoveFromCart({ productId: id, skuId }));
  }
};

export const mergeCartOnLogin = () => async (dispatch, getState) => {
  const localCart = getState().cart.cart;
  await dispatch(fetchCart());
  const backendCart = getState().cart.cart;

  for (const localItem of localCart) {
    const id = localItem._id || localItem.id;
    const inBackend = backendCart.find((i) => (i._id || i.id) === id);
    if (inBackend) {
      await dispatch(
        syncUpdateCart({
          productId: id,
          quantity: inBackend.quantity + localItem.quantity,
        }),
      );
    } else {
      await dispatch(
        syncAddToCart({ productId: id, quantity: localItem.quantity }),
      );
    }
  }
};

export const decreaseCartWithSync = (id, skuId) => (dispatch, getState) => {
  const currentQty =
    getState().cart.cart.find((item) => {
      if ((item._id || item.id) !== id) return false;
      if (skuId) return item.skuId === skuId;
      return !item.skuId;
    })?.quantity ?? 0;
  dispatch(decreaseCart({ id, skuId }));
  if (getState().auth.user) {
    if (currentQty <= 1) {
      dispatch(syncRemoveFromCart({ productId: id, skuId }));
    } else {
      dispatch(
        syncUpdateCart({ productId: id, quantity: currentQty - 1, skuId }),
      );
    }
  }
};

export default cartSlice.reducer;
