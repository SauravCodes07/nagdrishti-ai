import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './css/globals.css';
import App from './App.tsx';
import Spinner from './views/spinner/Spinner.tsx';
import { ThemeProvider } from './context/theme/ThemeContext.tsx';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider defaultTheme="system" storageKey="nagdrishti-theme">
    <Suspense fallback={<Spinner />}>
      <App />
    </Suspense>
  </ThemeProvider>,
);
