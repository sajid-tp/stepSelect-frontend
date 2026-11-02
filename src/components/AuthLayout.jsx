import { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

// Shared split-screen shell for Signup / Login / Forgot Password / Update
// Password — image + overlay caption on the left, form content (passed as
// children) on the right.

function AuthLayout({ imageSrc, overlayTitle, children }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="flex flex-1 flex-col md:flex-row">
        <div className="relative hidden bg-[#2b2b2b] md:block md:w-1/2">
          {!imageFailed && (
            <img
              src={imageSrc}
              alt=""
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-10 left-10 max-w-xs text-3xl font-bold leading-tight text-white">
            {overlayTitle}
          </div>
        </div>

        <div className="flex w-full items-center justify-center px-6 py-14 md:w-1/2 md:px-16">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default AuthLayout;
