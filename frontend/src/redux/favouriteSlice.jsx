import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

const getFavouritesFromStorage = () => {
  if (localStorage.getItem("favourites")) {
    return JSON.parse(localStorage.getItem("favourites"));
  }
  return [];
};

// Backend'den gelen populate edilmiş favourites item'ını Redux formatına çevirir
const mapBackendItem = (item) => item.product;

export const fetchFavourites = createAsyncThunk(
  "favourite/fetchFavourites",
  async () => {
    const { data } = await axiosInstance.get("/users/me/favourite");
    return data.map(mapBackendItem);
  },
);

export const syncAddToFavourites = createAsyncThunk(
  "favourite/syncAdd",
  async (productId) => {
    const { data } = await axiosInstance.post("/users/me/favourite", {
      productId,
    });
    return data.map(mapBackendItem);
  },
);

export const syncRemoveFromFavourites = createAsyncThunk(
  "favourite/syncRemove",
  async (productId) => {
    const { data } = await axiosInstance.delete(
      `/users/me/favourite/${productId}`,
    );
    return data.map(mapBackendItem);
  },
);

export const syncClearFavourites = createAsyncThunk(
  "favourite/syncClear",
  async () => {
    await axiosInstance.delete("/users/me/favourite");
    return [];
  },
);

const initialState = {
  favourites: getFavouritesFromStorage(),
};

const favouriteSlice = createSlice({
  name: "favourite",
  initialState,
  reducers: {
    addToFavourites: (state, action) => {
      const product = action.payload;
      const id = product._id || product.id;
      const already = state.favourites.find(
        (item) => (item._id || item.id) === id,
      );
      if (!already) {
        state.favourites.push(product);
        localStorage.setItem("favourites", JSON.stringify(state.favourites));
      }
    },

    removeFromFavourites: (state, action) => {
      const id = action.payload;
      state.favourites = state.favourites.filter(
        (item) => (item._id || item.id) !== id,
      );
      localStorage.setItem("favourites", JSON.stringify(state.favourites));
    },

    clearFavouritesLocal: (state) => {
      state.favourites = [];
      localStorage.removeItem("favourites");
    },
  },
  extraReducers: (builder) => {
    const applyFavourites = (state, action) => {
      state.favourites = action.payload;
      localStorage.setItem("favourites", JSON.stringify(state.favourites));
    };

    builder
      .addCase(fetchFavourites.fulfilled, applyFavourites)
      .addCase(syncAddToFavourites.fulfilled, applyFavourites)
      .addCase(syncRemoveFromFavourites.fulfilled, applyFavourites)
      .addCase(syncClearFavourites.fulfilled, (state) => {
        state.favourites = [];
        localStorage.removeItem("favourites");
      });
  },
});

export const { addToFavourites, removeFromFavourites, clearFavouritesLocal } =
  favouriteSlice.actions;

// Wrapper thunk'lar: local state'i anında günceller + user login ise backend'e sync eder
export const addToFavouritesWithSync = (product) => (dispatch, getState) => {
  const id = product._id || product.id;
  dispatch(addToFavourites(product));
  if (getState().auth.user) {
    dispatch(syncAddToFavourites(id));
  }
};

export const removeFromFavouritesWithSync = (id) => (dispatch, getState) => {
  dispatch(removeFromFavourites(id));
  if (getState().auth.user) {
    dispatch(syncRemoveFromFavourites(id));
  }
};

export default favouriteSlice.reducer;
