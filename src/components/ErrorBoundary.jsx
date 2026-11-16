import { Component } from "react";

/*
| Catches unexpected render errors anywhere in the app so the customer / admin
| sees a friendly page instead of a blank white screen.
*/
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unexpected UI error:", error, info?.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fff1ec] text-[#ff5722]">
            <svg
              className="h-9 w-9"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>

          <h1 className="mt-6 text-xl font-bold text-gray-900">
            Something went wrong
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            An unexpected error occurred. Please reload the page or head back
            to the home page.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full rounded-lg bg-[#ff5722] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#f4511e] sm:w-auto"
            >
              Reload page
            </button>

            <a
              href="/"
              className="w-full rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:w-auto"
            >
              Go to home
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
