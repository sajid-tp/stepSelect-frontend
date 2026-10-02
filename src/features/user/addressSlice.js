import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Normalize Mongo's _id -> id so the UI doesn't break regardless of field name
const normalize = (addr) => ({ ...addr, id: addr._id ?? addr.id });

export const fetchAddresses = createAsyncThunk(
  'address/fetchAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/addresses');
      return (res.data.data || []).map(normalize);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const addAddress = createAsyncThunk(
  'address/addAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/addresses', addressData);
      return normalize(res.data.data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateAddress = createAsyncThunk(
  'address/updateAddress',
  async ({ id, ...changes }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/addresses/${id}`, changes);
      return normalize(res.data.data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'address/deleteAddress',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/addresses/${id}`);
      // Re-fetch to ensure default address re-assignment syncs from backend
      dispatch(fetchAddresses());
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const addressSlice = createSlice({
  name: 'address',
  initialState: {
    list: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    clearAddressError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchAddresses.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Add
      .addCase(addAddress.pending, (state) => {
        state.error = null;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        if (action.payload.isDefault) {
          state.list.forEach((a) => (a.isDefault = false));
        }
        state.list.unshift(action.payload);
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update
      .addCase(updateAddress.pending, (state) => {
        state.error = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        if (action.payload.isDefault) {
          state.list.forEach((a) => (a.isDefault = false));
        }
        const targetId = action.payload.id || action.payload._id;
        const idx = state.list.findIndex(
          (a) => (a.id || a._id) === targetId
        );
        if (idx !== -1) {
          state.list[idx] = action.payload;
        }
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.list = state.list.filter(
          (a) => a.id !== action.payload && a._id !== action.payload
        );
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearAddressError } = addressSlice.actions;
export default addressSlice.reducer;