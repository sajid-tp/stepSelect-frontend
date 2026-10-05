import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";


// ================= GET CATEGORIES =================

export const getCategories = createAsyncThunk(
  "adminCategories/getCategories",

  async ({ search = "", page = 1 }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/categories", {
        params: {
          search,
          page,
        },
      });

      return res.data;

    } catch (error) {

      return rejectWithValue(
        error.response?.data?.error?.message ||
        "Failed to fetch categories"
      );
    }
  }
);


// ================= TOGGLE CATEGORY STATUS =================

export const toggleCategoryStatus = createAsyncThunk(
  "adminCategories/toggleCategoryStatus",

  async (categoryId, { rejectWithValue }) => {
    try {

      const res = await axiosInstance.patch(
        `/admin/categories/${categoryId}/status`
      );

      return res.data;

    } catch (error) {

      return rejectWithValue(
        error.response?.data?.error?.message ||
        "Failed to update category status"
      );
    }
  }
);


// ================= SLICE =================

const adminCategorySlice = createSlice({
  name: "adminCategories",

  initialState: {
    categories: [],

    totalResults: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 5,

    status: "idle",
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {

    builder

      // ================= GET CATEGORIES =================

      .addCase(getCategories.pending, (state) => {

        state.status = "loading";
        state.error = null;

      })

      .addCase(getCategories.fulfilled, (state, action) => {

        state.status = "succeeded";

        state.categories = action.payload.categories;

        state.totalResults = action.payload.totalResults;

        state.totalPages = action.payload.totalPages;

        state.currentPage = action.payload.page;

        state.limit = action.payload.limit;

      })

      .addCase(getCategories.rejected, (state, action) => {

        state.status = "failed";

        state.error = action.payload;

      })


      // ================= TOGGLE STATUS =================

      .addCase(toggleCategoryStatus.pending, (state) => {

        state.error = null;

      })

      .addCase(
        toggleCategoryStatus.fulfilled,
        (state, action) => {

          const {
            id,
            isActive,
          } = action.payload;

          const category = state.categories.find(
            (category) => category.id === id
          );

          if (category) {
            category.isActive = isActive;
          }

        }
      )

      .addCase(
        toggleCategoryStatus.rejected,
        (state, action) => {

          state.error = action.payload;

        }
      );
  },
});


export default adminCategorySlice.reducer;