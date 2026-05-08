import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";
import { storage } from "../utils/storage";

const getCartFromStorage = () => {
  const raw = storage.getItem("cart");
  return raw ? JSON.parse(raw) : [];
};

const getBundleDiscountsFromStorage = () => {
  const raw = storage.getItem("bundleDiscounts");
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
    selectedVariants: item.selectedVariants instanceof Map
      ? Object.fromEntries(item.selectedVariants)
      : (item.selectedVariants ?? {}),
  };
};

// Removes bundle discounts whose required products are no longer fully in cart
function validateBundleDiscounts(state) {
  const before = state.bundleDiscounts.length;
  state.bundleDiscounts = state.bundleDiscounts.filter((bundle) =>
    bundle.requiredProducts.every((req) => {
      const item = state.cart.find((c) => (c._id || c.id) === req.productId);
      return item && item.quantity >= req.quantity;
    }),
  );
  if (state.bundleDiscounts.length !== before) {
    storage.setItem("bundleDiscounts", JSON.stringify(state.bundleDiscounts));
  }
}

export const fetchCart = createAsyncThunk("cart/fetchCart", async () => {
  const { data } = await axiosInstance.get("/users/me/cart");
  return data.map(mapBackendItem);
});

export const hydrateCartFromStorage = createAsyncThunk("cart/hydrate", async () => {
  try {
    const cartRaw = await storage.getItem("cart");
    const bundleRaw = await storage.getItem("bundleDiscounts");
    return {
      cart: cartRaw ? JSON.parse(cartRaw) : [],
      bundleDiscounts: bundleRaw ? JSON.parse(bundleRaw) : [],
    };
  } catch {
    return { cart: [], bundleDiscounts: [] };
  }
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

const _initialCart = getCartFromStorage();
const initialState = {
  cart: _initialCart,
  totalAmount: calcTotal(_initialCart),
  appliedCoupon: null, // { couponId, code, discount }
  bundleDiscounts: getBundleDiscountsFromStorage(), // [{ listId, name, percent, requiredProducts }]
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
      validateBundleDiscounts(state);
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
      validateBundleDiscounts(state);
    },

    calculateCart: (state) => {
      state.totalAmount = calcTotal(state.cart);
    },

    clearCartLocal: (state) => {
      state.cart = [];
      state.totalAmount = 0;
      state.appliedCoupon = null;
      state.bundleDiscounts = [];
      storage.removeItem("cart");
      storage.removeItem("bundleDiscounts");
    },

    setAppliedCoupon: (state, action) => {
      state.appliedCoupon = action.payload; // { couponId, code, discount }
    },

    clearAppliedCoupon: (state) => {
      state.appliedCoupon = null;
    },

    addBundleDiscount: (state, action) => {
      const { listId, name, percent, requiredProducts } = action.payload;
      // Replace if same list already applied
      state.bundleDiscounts = state.bundleDiscounts.filter(
        (b) => b.listId !== listId,
      );
      state.bundleDiscounts.push({ listId, name, percent, requiredProducts });
      storage.setItem("bundleDiscounts", JSON.stringify(state.bundleDiscounts));
    },

    removeBundleDiscount: (state, action) => {
      state.bundleDiscounts = state.bundleDiscounts.filter(
        (b) => b.listId !== action.payload,
      );
      storage.setItem("bundleDiscounts", JSON.stringify(state.bundleDiscounts));
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
      .addCase(fetchCart.fulfilled, (state, action) => {
        applyCart(state, action);
        action.payload.forEach((i) => {
          _syncedItems.add(`${i._id || i.id}|${i.skuId ?? ""}`);
        });
      })
      .addCase(hydrateCartFromStorage.fulfilled, (state, action) => {
        const { cart, bundleDiscounts } = action.payload;
        if (cart.length > 0 && state.cart.length === 0) {
          applyCart(state, { payload: cart });
        }
        if (bundleDiscounts.length > 0 && state.bundleDiscounts.length === 0) {
          state.bundleDiscounts = bundleDiscounts;
        }
      })
      .addCase(syncAddToCart.fulfilled, (state, action) => {
        // Apply only for new items — subsequent updates use debounced PUT
        // whose response we discard since local state is already correct.
        applyCart(state, action);
      })
      // syncUpdateCart and syncRemoveFromCart: local state is already correct
      // (debounce sends the final quantity; remove is applied instantly locally).
      // Applying the server response would cause flicker on rapid operations.
      .addCase(syncClearCart.fulfilled, (state) => {
        state.cart = [];
        state.totalAmount = 0;
        state.appliedCoupon = null;
        state.bundleDiscounts = [];
        storage.removeItem("cart");
        storage.removeItem("bundleDiscounts");
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
  addBundleDiscount,
  removeBundleDiscount,
} = cartSlice.actions;

// Items confirmed to exist on the server (initialized from localStorage so
// items carried over from a previous session are treated as already synced).
const _syncedItems = new Set(
  getCartFromStorage().map((i) => `${i._id || i.id}|${i.skuId ?? ""}`),
);

// Debounce timers per item key. Fires 400 ms after the LAST press so that
// a rapid burst sends only one PUT with the final quantity.
const _syncTimers = Object.create(null);

function _scheduleSyncUpdate(dispatch, getState, productId, skuId) {
  const key = `${productId}|${skuId ?? ""}`;
  clearTimeout(_syncTimers[key]);
  _syncTimers[key] = setTimeout(() => {
    delete _syncTimers[key];
    const state = getState();
    if (!state.auth.user) return;
    const item = state.cart.cart.find((c) => {
      if ((c._id || c.id) !== productId) return false;
      if (skuId) return c.skuId === skuId;
      return !c.skuId;
    });
    if (!item) {
      _syncedItems.delete(key);
      dispatch(syncRemoveFromCart({ productId, skuId }));
    } else {
      // PUT → sets the exact quantity, never increments
      dispatch(syncUpdateCart({ productId, quantity: item.quantity, skuId }));
    }
  }, 400);
}

// Wrapper thunks: local state updates are instant; server sync is debounced.
export const addToCartWithSync =
  (product, selectedVariants, skuId) => (dispatch, getState) => {
    const id = product._id || product.id;
    const key = `${id}|${skuId ?? ""}`;
    const isNewItem = !_syncedItems.has(key);

    dispatch(addToCart({ ...product, selectedVariants, skuId }));

    if (!getState().auth.user) return;

    if (isNewItem) {
      // First add: POST creates the item on the server, mark as synced.
      _syncedItems.add(key);
      clearTimeout(_syncTimers[key]);
      delete _syncTimers[key];
      dispatch(syncAddToCart({ productId: id, quantity: 1, skuId, selectedVariants }));
    } else {
      // Item already exists on server: debounce a PUT with the final quantity.
      _scheduleSyncUpdate(dispatch, getState, id, skuId);
    }
  };

export const removeFromCartWithSync = (id, skuId) => (dispatch, getState) => {
  const key = `${id}|${skuId ?? ""}`;
  _syncedItems.delete(key);
  clearTimeout(_syncTimers[key]);
  delete _syncTimers[key];
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
  dispatch(decreaseCart({ id, skuId }));
  if (getState().auth.user) {
    _scheduleSyncUpdate(dispatch, getState, id, skuId);
  }
};

export default cartSlice.reducer;
