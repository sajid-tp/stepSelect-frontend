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

axiosInstance.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

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

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const message = error.response?.data?.message || 'Something went wrong';
    const status = error.response?.status;

    if (
      status === 403 &&
      error.response?.data?.code === 'USER_BLOCKED'
    ) {
      notifyBlocked();
      return Promise.reject({ ...error, message });
    }

    const isAdminRequest =
      originalRequest?.url?.includes('/admin') ||
      window.location.pathname.startsWith('/admin');

    if (status === 401 && isAdminRequest) {
      if (window.location.pathname !== '/admin/auth/login') {
        window.location.href = '/admin/auth/login';
      }
      return Promise.reject({ ...error, message });
    }

    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/signup');

    if (status === 401 && !originalRequest?._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        processQueue(null);

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);

        if (refreshError.response?.data?.code === 'USER_BLOCKED') {
          notifyBlocked();
          return Promise.reject({
            ...refreshError,
            message: 'Your account has been blocked',
          });
        }

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

    return Promise.reject({ ...error, message });
  }
);

export default axiosInstance;