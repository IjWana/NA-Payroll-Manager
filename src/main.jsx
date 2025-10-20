import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { SearchProvider } from './context/SearchContext.jsx';
import { NotificationsProvider } from './context/NotificationsContext.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NotificationsProvider>
    <SearchProvider>
       <BrowserRouter>
          <App />
       </BrowserRouter>
    </SearchProvider>
    </NotificationsProvider>
  </React.StrictMode>
);
