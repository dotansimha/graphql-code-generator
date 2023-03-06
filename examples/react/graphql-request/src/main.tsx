import React from 'react';
import ReactDOM from 'react-dom/client';
import './main.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('app') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
