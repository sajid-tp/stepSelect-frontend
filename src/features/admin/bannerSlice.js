import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  error?.message ||
  fallback;

const toFormData = ({ title, link, displayOrder, isActive, image }) => {
  const form = new FormData();
  form.append("title", title);
  form.append("link", link || "");
  form.append("displayOrder", String(displayOrder));
  form.append("isActive", String(Boolean(isActive)));
  if (image) form.append("image", image);
  return form;
};

export const getAdminBanners = createAsyncThunk(
  "adminBanners/getAdminBanners",
  async (
    { search = "", status = "all", page = 1, limit = 10 } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (status && status !== "all") params.status = status;

      const response = await axiosInstance.get("/admin/banners", { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load banners."));
    }
  }
);

export const createAdminBanner = createAsyncThunk(
  "adminBanners/createAdminBanner",
  async (values, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/admin/banners",
        toFormData(values)
      );
      return { message: response.data.message, banner: response.data.data };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to create the banner."));
    }
  }
);

export const updateAdminBanner = createAsyncThunk(
  "adminBanners/updateAdminBanner",
  async ({ bannerId, ...values }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/admin/banners/${bannerId}`,
        toFormData(values)
      );
      return { message: response.data.message, banner: response.data.data };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update the banner."));
    }
  }
);

export const toggleAdminBannerStatus = createAsyncThunk(
  "adminBanners/toggleAdminBannerStatus",
  async ({ bannerId, isActive }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/admin/banners/${bannerId}/status`,
        { isActive }
      );
      return { message: response.data.message, banner: response.data.data };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to change the banner."));
    }
  }
);

export const deleteAdminBanner = createAsyncThunk(
  "adminBanners/deleteAdminBanner",
  async (bannerId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/admin/banners/${bannerId}`);
      return { message: response.data.message, bannerId };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete the banner."));
    }
  }
);

const initialState = {
  banners: [],
  pagination: { page: 1, limit: 10, totalItems: 0, totalPages: 1 },
  status: "idle",
  error: null,

  togglingId: null,
};

const adminBannerSlice = createSlice({
  name: "adminBanners",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(getAdminBanners.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getAdminBanners.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.banners = action.payload.banners || [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(getAdminBanners.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.status = "failed";
        state.error = action.payload || "Failed to load banners.";
      })

      .addCase(toggleAdminBannerStatus.pending, (state, action) => {
        state.togglingId = action.meta.arg.bannerId;
      })
      .addCase(toggleAdminBannerStatus.fulfilled, (state, action) => {
        state.togglingId = null;
        const updated = action.payload.banner;
        state.banners = state.banners.map((b) => (b.id === updated.id ? updated : b));
      })
      .addCase(toggleAdminBannerStatus.rejected, (state) => {
        state.togglingId = null;
      });
  },
});

export default adminBannerSlice.reducer;
