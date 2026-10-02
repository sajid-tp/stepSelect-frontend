import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/user/authSlice';
import adminAuthReducer from '../features/admin/authSlice'
import adminUserReducer from '../features/admin/userSlice'
import accountReducer from '../features/user/accountSlice'
import addressReducer from '../features/user/addressSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    account : accountReducer,
    address : addressReducer,
    adminAuth : adminAuthReducer,
    adminUsers : adminUserReducer
  }
});
