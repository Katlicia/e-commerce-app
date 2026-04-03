import { createSlice } from "@reduxjs/toolkit";

let nextId = 0;

const initialState = {
  items: [],
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.items.push({
        id: nextId++,
        message: action.payload.message,
        type: action.payload.type ?? "success",
      });
    },
    removeNotification: (state, action) => {
      state.items = state.items.filter((n) => n.id !== action.payload);
    },
  },
});

export const { addNotification, removeNotification } =
  notificationSlice.actions;
export default notificationSlice.reducer;
