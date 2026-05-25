// index.tsx - The entry point of the React app
// This is the first file that runs when the app starts
// It connects our React app to the HTML file (public/index.html)

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Find the <div id="root"> in public/index.html
// and render our App component inside it
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
