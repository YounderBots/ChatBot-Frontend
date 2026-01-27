import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
// Bootstrap JS
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import './index.css';

import App from './App.jsx';
import { AuthProvider } from './Context/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
