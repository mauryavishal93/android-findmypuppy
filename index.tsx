import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AdminApp } from './admin/AdminApp';
import { registerSW } from 'virtual:pwa-register'

// Register the PWA service worker (skip on admin to avoid cache conflicts)
if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin')) {
  registerSW({
    onNeedRefresh() {
      if (confirm('New content available. Reload?')) {
        window.location.reload()
      }
    },
    onOfflineReady() {
      console.log('App ready to work offline')
    },
  })
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {isAdmin ? <AdminApp /> : <App />}
  </React.StrictMode>
);