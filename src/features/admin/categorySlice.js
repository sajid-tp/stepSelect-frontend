import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";


export const getCategories = createAsyncThunk(
  "adminCategories/getCategories",

  async (
    {
      search = "",
      page = 1,
      sort,
      status,
      limit
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosInstance.get(
        "/admin/categories",
        {
          params: {
            search,
            page,
            sort,
            status,
            limit
          },
        }
      );

      return res.data;

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
        "Failed to fetch categories"
      );
    }
  }
);


export const createCategory = createAsyncThunk(
  "adminCategories/createCategory",

  async (categoryData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        "/admin/categories",
        categoryData
      );

      return res.data;

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
        "Failed to create category"
      );
    }
  }
);


export const updateCategory = createAsyncThunk(
  "adminCategories/updateCategory",

  async (
    { categoryId, categoryData },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosInstance.patch(
        `/admin/categories/${categoryId}`,
        categoryData
      );

      return res.data;

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
        "Failed to update category"
      );
    }
  }
);


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


export const deleteCategory = createAsyncThunk(
  "adminCategories/deleteCategory",

  async (categoryId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(
        `/admin/categories/${categoryId}`
      );

      return res.data;

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
        "Failed to delete category"
      );
    }
  }
);


const adminCategorySlice = createSlice({

  name: "adminCategories",

  initialState: {

    categories: [],

    totalResults: 0,

    totalPages: 1,

    currentPage: 1,

    limit: 8,

    status: "idle",
    error: null,

    createStatus: "idle",
    createError: null,

    updateStatus: "idle",
    updateError: null,

    deleteStatus: "idle",
    deleteError: null,

  },


  reducers: {
    resetCategoryFormState: (state) => {
      state.createStatus = "idle";
      state.createError = null;
      state.updateStatus = "idle";
      state.updateError = null;
    },
  },


  extraReducers: (builder) => {

    builder

      .addCase(
        getCategories.pending,
        (state) => {

          state.status = "loading";
          state.error = null;

        }
      )

      .addCase(
        getCategories.fulfilled,
        (state, action) => {

          state.status = "succeeded";

          state.categories =
            action.payload.categories;
      

          state.totalResults =
            action.payload.totalResults;

          state.totalPages =
            action.payload.totalPages;

          state.currentPage =
            action.payload.page;

          state.limit =
            action.payload.limit;

        }
      )

      .addCase(
        getCategories.rejected,
        (state, action) => {

          state.status = "failed";

          state.error =
            action.payload;

        }
      )


      .addCase(
        createCategory.pending,
        (state) => {

          state.createStatus = "loading";
          state.createError = null;

        }
      )

      .addCase(
        createCategory.fulfilled,
        (state) => {

          state.createStatus = "succeeded";
          state.createError = null;

        }
      )

      .addCase(
        createCategory.rejected,
        (state, action) => {

          state.createStatus = "failed";

          state.createError =
            action.payload;

        }
      )


      .addCase(
        updateCategory.pending,
        (state) => {

          state.updateStatus = "loading";
          state.updateError = null;

        }
      )

      .addCase(
        updateCategory.fulfilled,
        (state, action) => {

          state.updateStatus = "succeeded";
          state.updateError = null;

          const updatedCategory =
            action.payload;

          const index =
            state.categories.findIndex(
              (category) =>
                category.id ===
                updatedCategory.id
            );

          if (index !== -1) {

            state.categories[index] =
              updatedCategory;

          }

        }
      )

      .addCase(
        updateCategory.rejected,
        (state, action) => {

          state.updateStatus = "failed";

          state.updateError =
            action.payload;

        }
      )


      .addCase(
        toggleCategoryStatus.pending,
        (state) => {

          state.error = null;

        }
      )

      .addCase(
        toggleCategoryStatus.fulfilled,
        (state, action) => {

          const {
            id,
            isActive,
          } = action.payload;

          const category =
            state.categories.find(
              (category) =>
                category.id === id
            );

          if (category) {

            category.isActive =
              isActive;

          }

        }
      )

      .addCase(
        toggleCategoryStatus.rejected,
        (state, action) => {

          state.error =
            action.payload;

        }
      )


      .addCase(
        deleteCategory.pending,
        (state) => {

          state.deleteStatus = "loading";
          state.deleteError = null;

        }
      )

      .addCase(
        deleteCategory.fulfilled,
        (state, action) => {

          state.deleteStatus = "succeeded";
          state.deleteError = null;

          const deletedId =
            action.payload.id;

          state.categories =
            state.categories.filter(
              (category) =>
                category.id !== deletedId
            );

          state.totalResults =
            Math.max(
              0,
              state.totalResults - 1
            );

          state.totalPages =
            Math.max(
              1,
              Math.ceil(
                state.totalResults /
                state.limit
              )
            );

        }
      )

      .addCase(
        deleteCategory.rejected,
        (state, action) => {

          state.deleteStatus = "failed";

          state.deleteError =
            action.payload;

        }
      );

  },

});


export const { resetCategoryFormState } = adminCategorySlice.actions;

export default adminCategorySlice.reducer;