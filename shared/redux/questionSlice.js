import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

export const getUserQuestions = createAsyncThunk(
  "question/getUserQuestions",
  async () => {
    const { data } = await axiosInstance.get("/users/me/questions");
    return data;
  },
);

export const deleteUserQuestion = createAsyncThunk(
  "question/deleteUserQuestion",
  async ({ productId, questionId }) => {
    await axiosInstance.delete(`/products/${productId}/questions/${questionId}`);
    return questionId;
  },
);

const questionSlice = createSlice({
  name: "question",
  initialState: {
    questions: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUserQuestions.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserQuestions.fulfilled, (state, action) => {
        state.questions = action.payload;
        state.loading = false;
      })
      .addCase(getUserQuestions.rejected, (state) => {
        state.loading = false;
      })
      .addCase(deleteUserQuestion.fulfilled, (state, action) => {
        state.questions = state.questions.filter(
          (q) => q._id !== action.payload,
        );
      });
  },
});

export default questionSlice.reducer;
