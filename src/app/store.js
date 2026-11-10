import { configureStore, combineReducers } from "@reduxjs/toolkit";

import authReducer from "../features/user/authSlice";
import adminAuthReducer from "../features/admin/authSlice";
import adminUserReducer from "../features/admin/userSlice";
import accountReducer from "../features/user/accountSlice";
import addressReducer from "../features/user/addressSlice";
import productsReducer from "../features/user/productSlice";
import cartReducer from "../features/user/cartSlice";
import checkoutReducer from "../features/user/checkoutSlice"
import wishlistReducer from "../features/user/wishlistSlice";
import ordersReducer from "../features/user/orderSlice";
import paymentReducer from "../features/user/paymentSlice";
import walletReducer from "../features/user/walletSlice";
import referralReducer from "../features/user/referralSlice";

import adminCategoryReducer from "../features/admin/categorySlice";
import adminBrandsReducer from "../features/admin/brandSlice";
import adminProductReducer from "../features/admin/productSlice";
import adminVariantReducer from "../features/admin/variantSlice";
import adminCouponReducer from "../features/admin/couponSlice";
import adminOrderReducer from "../features/admin/orderSlice";
import adminInventoryReducer from "../features/admin/inventorySlice";
import adminOfferReducer from "../features/admin/offerSlice";
import adminSalesReportReducer from "../features/admin/salesReportSlice";
import adminDashboardReducer from "../features/admin/dashboardSlice";
import adminBannerReducer from "../features/admin/bannerSlice";

const appReducer = combineReducers({
  auth: authReducer,
  account: accountReducer,
  address: addressReducer,
  products: productsReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  checkout: checkoutReducer,
  orders: ordersReducer,
  payment: paymentReducer,
  wallet: walletReducer,
  referral: referralReducer,

  adminAuth: adminAuthReducer,
  adminUsers: adminUserReducer,
  adminCategories: adminCategoryReducer,
  adminBrands: adminBrandsReducer,
  adminProducts: adminProductReducer,
  adminVariants: adminVariantReducer,
  adminCoupons: adminCouponReducer,
  adminOrders: adminOrderReducer,
  adminInventory: adminInventoryReducer,
  adminOffers: adminOfferReducer,
  adminSalesReport: adminSalesReportReducer,
  adminDashboard: adminDashboardReducer,
  adminBanners: adminBannerReducer,
});

const USER_LOGOUT_ACTIONS = ['auth/logout', 'auth/logout/fulfilled', 'auth/logout/rejected'];
const ADMIN_LOGOUT_ACTIONS = ['adminAuth/logout', 'adminAuth/logout/fulfilled', 'adminAuth/logout/rejected'];

const USER_DATA_SLICES = [
  'account', 'address', 'cart', 'wishlist', 'checkout', 'orders', 'payment', 'wallet', 'referral',
];
const ADMIN_DATA_SLICES = [
  'adminUsers', 'adminCategories', 'adminBrands', 'adminProducts', 'adminVariants', 'adminCoupons',
  'adminOrders', 'adminInventory', 'adminOffers', 'adminSalesReport', 'adminDashboard', 'adminBanners',
];

const without = (state, keys) => {
  const next = { ...state };
  keys.forEach((key) => delete next[key]);
  return next;
};

const rootReducer = (state, action) => {
  if (state && USER_LOGOUT_ACTIONS.includes(action.type)) {
    return appReducer(without(state, USER_DATA_SLICES), action);
  }
  if (state && ADMIN_LOGOUT_ACTIONS.includes(action.type)) {
    return appReducer(without(state, ADMIN_DATA_SLICES), action);
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});
