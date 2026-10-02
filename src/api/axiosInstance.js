import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,

});


let store;
export const injectStore = (s) => {
  store = s;
};

const notifyBlocked = () => {
  store?.dispatch({ type: 'auth/setBlocked' });
};

// Request interceptor: If the body is FormData, make sure no JSON Content-Type is forced
axiosInstance.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// Token refresh synchronization state (Used only for regular user access tokens)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Response interceptor: handles blocked users, error extraction, 401 recovery, and refresh rotation
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const message = error.response?.data?.message || 'Something went wrong';
    const status = error.response?.status;

    // Blocked user: show the global "account blocked" modal, skip the refresh flow
    if (
      status === 403 &&
      error.response?.data?.code === 'USER_BLOCKED'
    ) {
      notifyBlocked();
      return Promise.reject({ ...error, message });
    }

    // 1. ADMIN HANDLING:
    // Admin routes do not use refresh tokens. If an admin request is rejected (401/403),
    // redirect directly to the admin login page and bypass customer refresh logic.
    const isAdminRequest =
      originalRequest?.url?.includes('/admin') ||
      window.location.pathname.startsWith('/admin');

    if (status === 401 && isAdminRequest) {
      if (window.location.pathname !== '/admin/auth/login') {
        window.location.href = '/admin/auth/login';
      }
      return Promise.reject({ ...error, message });
    }

    // 2. USER REFRESH FLOW:
    // Endpoints that should never trigger an automatic refresh retry
    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/signup');

    // Handle standard user 401 Unauthorized
    if (status === 401 && !originalRequest?._retry && !isAuthRoute) {
      if (isRefreshing) {
        // If a refresh request is already pending, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call backend refresh endpoint (browser automatically sends the httpOnly refreshToken cookie)
        await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Notify queued requests that the new access token cookie is set
        processQueue(null);

        // Re-execute original failed request with the new cookie in place
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Reject all queued requests if refresh fails
        processQueue(refreshError);

        // Blocked user: let the modal show; it clears the session and redirects on OK
        if (refreshError.response?.data?.code === 'USER_BLOCKED') {
          notifyBlocked();
          return Promise.reject({
            ...refreshError,
            message: 'Your account has been blocked',
          });
        }

        // Regular customer session expired: clear user storage and redirect to customer login
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }

        const refreshMessage =
          refreshError.response?.data?.message || 'Session expired. Please log in again.';
        return Promise.reject({ ...refreshError, message: refreshMessage });
      } finally {
        isRefreshing = false;
      }
    }

    // Default error return maintaining your custom message structure
    return Promise.reject({ ...error, message });
  }
);

export default axiosInstance;