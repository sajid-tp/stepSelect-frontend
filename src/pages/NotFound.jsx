import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Shown for any address that does not match a page (mistyped URL, old link, footer link to a page
// that does not exist yet). Without this, React Router renders a completely blank screen.
function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex w-full flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#f4511e]">Error 404</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Page not found
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted sm:text-[15px]">
            Sorry, we could not find the page you were looking for. It may have been moved, or the
            address may be mistyped.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/"
              className="rounded-md bg-[#f4511e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d84315]"
            >
              Back to home
            </Link>
            <Link to="/shop" className="text-sm font-semibold underline">
              Continue shopping
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default NotFound;
