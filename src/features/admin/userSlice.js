// src/features/admin/users/adminUsersSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const getUsers = createAsyncThunk(
  'adminUsers/getUsers',
  async ({ search = '', page = 1}, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/admin/users', {
        params: { search, page},
      });

      return res.data; // { users, totalPages, currentPage, totalUsers }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const toggleBlockUser = createAsyncThunk(
  'adminUsers/toggleBlockUser',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/admin/users/${userId}/status`);
      console.log('the blocked data is',res.data)
      return res.data; // updated user with new isBlocked value
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

const adminUsersSlice = createSlice({
  name: 'adminUsers',
  initialState: {
    users: [],
    totalPages: 1,
    currentPage: 1,
    totalUsers: 0,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload.users;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.page;
        state.totalUsers = action.payload.totalCustomers;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
     .addCase(toggleBlockUser.fulfilled, (state, action) => {
            const { id, isBlocked } = action.payload;
            const user = state.users.find((u) => u.id === id);
                     if (user) user.isBlocked = isBlocked;
});
  },
});

export default adminUsersSlice.reducer;