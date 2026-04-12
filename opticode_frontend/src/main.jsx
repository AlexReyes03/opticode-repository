import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

import 'bootstrap/dist/css/bootstrap.min.css'
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'

/** API global para Modal/Offcanvas usada vía window (p. ej. Sidebar, modales). Vite no siempre expone el UMD en window. */
if (typeof window !== 'undefined') {
  window.bootstrap = bootstrap?.default ?? bootstrap
}

import './assets/css/global-styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
