import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import { injectStore } from './api/axiosInstance';
import "@fortawesome/fontawesome-free/css/all.min.css";
injectStore(store);
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    
<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <Provider store={store}>
      <App />
    </Provider>
</GoogleOAuthProvider>
    
  </React.StrictMode>
);
