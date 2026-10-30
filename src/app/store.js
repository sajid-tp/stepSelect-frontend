import { configureStore } from "@reduxjs/toolkit";

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

export const store = configureStore({
  reducer: {
    auth: authReducer,
    account: accountReducer,
    address: addressReducer,
    products: productsReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    checkout : checkoutReducer,
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
  },
});
