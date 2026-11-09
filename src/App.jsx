import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOtp from './pages/VerifyOtp';
import UpdatePassword from './pages/UpdatePassword';
import AdminLogin from './pages/admin/adminLogin';
import Users from './pages/admin/userManagement';
import AccountOverview from './pages/AccountOverview';
import EditProfile from './pages/EditProfile';
import ChangeEmail from './pages/ChangeEmail';
import AddressForm from './pages/AddressForm';
import Addresses from './pages/Addresses';
import Wallet from './pages/Wallet';
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import AdminDashboard from './pages/admin/AdminDashboard';
import BlockedModal from './components/BlockedModal';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import TabIdentity from './components/TabIdentity';
import Categories from "./pages/admin/Categories";
import CategoryForm from "./pages/admin/CategoryForm";
import Brands from "./pages/admin/Brands";
import BrandForm from "./pages/admin/BrandForm";
import Shop from "./pages/Shop";
import GuestRoute from './components/GuestRoute';
import ProtectedRoute from './components/ProtectedRoute';
import SessionGuard from './components/SessionGuard';
import ProductDetailsPage from "./pages/ProductDetails"
import Coupons from "./pages/admin/Coupons";
import Offers from "./pages/admin/Offers";
import InviteRedirect from "./pages/InviteRedirect";
import CouponForm from "./pages/admin/CouponForm";
import AdminOrders from "./pages/admin/Orders";
import AdminOrderEdit from "./pages/admin/OrderEdit";
import AdminInventory from "./pages/admin/Inventory";
import SalesReport from "./pages/admin/SalesReport";
import Banners from "./pages/admin/Banners";
import Checkout from './pages/CheckOut';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailedPage from './pages/PaymentFailedPage';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import DemoRazorpayHost from './components/DemoRazorpayHost';
import PaymentFailureModal from './components/PaymentFailureModal';
import Products
  from "./pages/admin/Products";

import ProductDetails
  from "./pages/admin/ProductDetails";

import ProductForm
  from "./pages/admin/ProductForm";

function App() {
  return (
    <BrowserRouter>
    <TabIdentity />
    <SessionGuard />
    <BlockedModal/>
    <DemoRazorpayHost />
    <PaymentFailureModal />
      <Routes>
        {/* User routes */}
        <Route path="/" element={<Home />} />
          <Route element={<GuestRoute />}>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        {/* Guest-only: a signed-in user who hits Back to the OTP page is sent home */}
        <Route path="/verify-otp" element={<VerifyOtp />} />
         </Route>
        <Route path="/invite/:token" element={<InviteRedirect />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/shop" element={<Shop />} />
        {/* Customer-only pages: redirect to /login when signed out */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<AccountOverview />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/profile/change-email" element={<ChangeEmail/>} />
          <Route path="/profile/addresses" element={<Addresses />} />
          <Route path="/profile/wallet" element={<Wallet />} />
          <Route path="/profile/addresses/new" element={<AddressForm />} />
          <Route path="/profile/addresses/edit/:id" element={<AddressForm />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route
    path="/order-success/:orderNumber"
    element={<OrderSuccess />}
  />
          <Route path="/payment-success/:orderNumber" element={<PaymentSuccessPage />} />
          <Route path="/payment-failed/:orderNumber" element={<PaymentFailedPage />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:orderNumber" element={<OrderDetails />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Route>
        <Route
  path="/products/:productId"
  element={<ProductDetailsPage />}
/>
 
       {/* Admin routes */}
        <Route path="/admin/auth/login" element={<AdminLogin/>}/>
       <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<Users />} />
          <Route
  path="/admin/categories"
  element={<Categories />}
/>
<Route
  path="/admin/categories/new"
  element={<CategoryForm />}
/>
<Route
  path="/admin/categories/edit/:categoryId"
  element={<CategoryForm />}

  />
<Route
  path="/admin/brands"
  element={ <Brands />}
/>

<Route
  path="/admin/brands/new"
  element={

      <BrandForm />

  }
/>

<Route
  path="/admin/brands/edit/:brandId"
  element={
      <BrandForm />
  }

/>

<Route path="/admin/offers" element={<Offers />} />
<Route path="/admin/coupons" element={<Coupons />} />
<Route path="/admin/coupons/new" element={<CouponForm />} />
<Route path="/admin/coupons/edit/:couponId" element={<CouponForm />} />

<Route path="/admin/orders" element={<AdminOrders />} />
<Route path="/admin/orders/:orderId" element={<AdminOrderEdit />} />
<Route path="/admin/inventory" element={<AdminInventory />} />
<Route path="/admin/sales-report" element={<SalesReport />} />
<Route path="/admin/banners" element={<Banners />} />

<Route
  path="/admin/products"
  element={<Products />}
/>

<Route
  path="/admin/products/new"
  element={<ProductForm />}
/>

<Route
  path="/admin/products/:productId"
  element={<ProductDetails />}
/>

<Route
  path="/admin/products/edit/:productId"
  element={<ProductForm />}
/>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;


//this is my step select project 
// feature branch testing 
// I am now in main branch
// new feature branch
