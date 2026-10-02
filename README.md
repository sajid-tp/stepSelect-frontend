# Step Select — Frontend

Vite + React scaffold: Home, Signup, Login, Forgot Password, Verify
OTP, and Update Password — routed with `react-router-dom`, styled
with Tailwind, wired up ready for your axios/dispatch logic.

## Folder structure

```
src/
  api/
    axiosInstance.js   # axios client, withCredentials: true for the httpOnly cookie
  app/
    store.js           # RTK store
  features/
    auth/
      authSlice.js      # loginUser/signupUser thunks — add forgotPassword/
                         # verifyOtp/resendOtp/resetPassword thunks here
  pages/
    Home.jsx
    Signup.jsx
    Login.jsx
    ForgotPassword.jsx
    VerifyOtp.jsx        # its own layout — minimal header, no split image
    UpdatePassword.jsx
  components/
    Navbar.jsx           # uses react-router Link/NavLink
    PromoBar.jsx
    Hero.jsx
    CategoryBanner.jsx
    ShopByType.jsx
    CuratedReleases.jsx
    Footer.jsx
    AuthLayout.jsx        # shared split-screen shell for the 4 auth pages
    FormField.jsx         # reusable labeled input, uncontrolled by design
  App.jsx                 # BrowserRouter + Routes
  main.jsx
  index.css
tailwind.config.js
postcss.config.js
```

## Routes

| Path | Page |
|---|---|
| `/` | Home |
| `/signup` | Signup |
| `/login` | Login |
| `/forgot-password` | Forgot Password |
| `/verify-otp` | Verify OTP |
| `/update-password` | Update Password |

Navbar's Login/Sign Up buttons and Home link use `Link`/`NavLink`, so
they navigate client-side. Shop/About/Contact are still plain `<a>`
tags since those pages don't exist yet.

## Getting started

```bash
npm install
cp .env.example .env      # then set VITE_API_BASE_URL to your backend
npm run dev
```

## What's stubbed vs. what's real

- **Real:** routing between all 6 pages, the layouts, the form
  markup/styling, `axiosInstance`, the RTK store, and the
  `loginUser`/`signupUser` thunks (already wired to your backend's
  `/login` and `/signup`).
- **Stubbed — this is where you add logic:** every form's
  `handleSubmit` currently just reads the field values with
  `new FormData(e.target)` and `console.log`s them. Each has a `TODO`
  comment marking exactly what to dispatch and where to navigate
  next. You'll need three more thunks in `authSlice.js` that don't
  exist yet: `forgotPassword`, `verifyOtp`/`resendOtp`, and
  `resetPassword` (matching the backend `resetPassword` endpoint from
  earlier).
- **Known gap to solve yourself:** `VerifyOtp` needs to know which
  email it's verifying, and `UpdatePassword` needs the reset token
  from the OTP step. Neither is wired up — pass them via
  `navigate(path, { state: {...} })` and read them with
  `useLocation().state`, or store them in the auth slice, whichever
  fits how you're structuring things.
