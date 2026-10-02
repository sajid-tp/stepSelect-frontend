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
import AdminDashboard from './pages/admin/adminDashboard';
import BlockedModal from './components/BlockedModal';
import AdminProtectedRoute from './components/AdminProtectedRoute';


function App() {
  return (
    <BrowserRouter>
    <BlockedModal/>
      <Routes>
        {/* User routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/profile" element={<AccountOverview />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/profile/change-email" element={<ChangeEmail/>} />
        <Route path="/profile/addresses" element={<Addresses />} />
        <Route path="/profile/addresses/new" element={<AddressForm />} />
        <Route path="/profile/addresses/edit/:id" element={<AddressForm />} />

       {/* Admin routes */}
        <Route path="/admin/auth/login" element={<AdminLogin/>}/>
       <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<Users />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;


//this is my step select project 
// feature branch testing 
// new feature branch