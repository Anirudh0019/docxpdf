import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { DarkModeProvider } from './DarkMode';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DarkModeProvider>
    <App />
    </DarkModeProvider>
  </StrictMode>
);