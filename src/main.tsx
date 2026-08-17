import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './global.css';
/* The interior's colour arc. Loaded after global.css because its stops
   deliberately land on that file's paper tokens at the top of the ladder. */
import './styles/chapters.css';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element (#root) not found in index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
