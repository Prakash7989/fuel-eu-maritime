import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './adapters/ui/App.tsx';
import './adapters/ui/index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
