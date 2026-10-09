import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/user/authSlice";
import adminAuthReducer from "../features/admin/authSlice";
import adminUserReducer from "../features/admin/userSlice";
import accountReducer from "../features/user/accountSlice";
import addressReducer from "../features/user/addressSlice";
import productsReducer from "../features/user/productSlice";
import cartReducer from "../features/user/cartSlice";
import adminCategoryReducer from "../features/admin/categorySlice";
import adminBrandsReducer from "../features/admin/brandSlice";
import adminProductReducer from "../features/admin/productSlice";
import adminVariantReducer from "../features/admin/variantSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    account: accountReducer,
    address: addressReducer,
    products: productsReducer,
    cart: cartReducer,

    adminAuth: adminAuthReducer,
    adminUsers: adminUserReducer,
    adminCategories: adminCategoryReducer,
    adminBrands: adminBrandsReducer,
    adminProducts: adminProductReducer,
    adminVariants: adminVariantReducer,
  },
});
