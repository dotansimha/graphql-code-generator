import React from 'react';
import ReactDOM from 'react-dom/client';
import { createClient, Provider } from 'urql';

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const client = createClient({
  url: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Provider value={client}>
      <App />
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
