import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import icon from "./icon_logo.png";

const setFavicon = (faviconUrl) => {
  const link =
    document.querySelector("link[rel~='icon']") || document.createElement('link');
  link.rel = 'icon';
  link.href = faviconUrl;
  document.getElementsByTagName('head')[0].appendChild(link);
};

setFavicon(icon);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
