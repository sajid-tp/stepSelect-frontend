import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { downloadBlob } from "../../utils/downloadFile";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  error?.message ||
  fallback;

const getBlobErrorMessage = async (error, fallback) => {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      return parsed?.error?.message || parsed?.message || fallback;
    } catch {
      return fallback;
    }
  }
  return getErrorMessage(error, fallback);
};

const buildParams = ({ period = "daily", from = "", to = "", search = "" }) => {
  const params = { period };
  if (period === "custom") {
    params.from = from;
    params.to = to;
  }
  if (search) params.search = search;
  return params;
};

export const getSalesReport = createAsyncThunk(
  "adminSalesReport/getSalesReport",
  async ({ page = 1, limit = 10, ...filters } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/admin/sales-report", {
        params: { ...buildParams(filters), page, limit },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to load the sales report.")
      );
    }
  }
);

const FILES = {
  pdf: { type: "application/pdf", ext: "pdf" },
  excel: {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ext: "xlsx",
  },
};

export const downloadSalesReport = createAsyncThunk(
  "adminSalesReport/downloadSalesReport",
  async ({ format, ...filters }, { rejectWithValue }) => {
    try {
      const file = FILES[format];
      const response = await axiosInstance.get("/admin/sales-report/export", {
        params: { ...buildParams(filters), format },
        responseType: "blob",
      });

      const stamp = new Date().toISOString().slice(0, 10);
      downloadBlob(
        new Blob([response.data], { type: file.type }),
        `sales-report-${stamp}.${file.ext}`
      );
      return format;
    } catch (error) {
      return rejectWithValue(
        await getBlobErrorMessage(error, "We couldn't download the report.")
      );
    }
  }
);

const initialState = {
  report: null,
  status: "idle",
  error: null,

  exporting: null,
  exportError: null,
};

const adminSalesReportSlice = createSlice({
  name: "adminSalesReport",
  initialState,

  reducers: {
    clearSalesExportError: (state) => {
      state.exportError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getSalesReport.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getSalesReport.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.report = action.payload;
      })
      .addCase(getSalesReport.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.status = "failed";
        state.error = action.payload || "Failed to load the sales report.";
      })

      .addCase(downloadSalesReport.pending, (state, action) => {
        state.exporting = action.meta.arg.format;
        state.exportError = null;
      })
      .addCase(downloadSalesReport.fulfilled, (state) => {
        state.exporting = null;
      })
      .addCase(downloadSalesReport.rejected, (state, action) => {
        state.exporting = null;
        state.exportError =
          action.payload || "We couldn't download the report.";
      });
  },
});

export const { clearSalesExportError } = adminSalesReportSlice.actions;

export default adminSalesReportSlice.reducer;
