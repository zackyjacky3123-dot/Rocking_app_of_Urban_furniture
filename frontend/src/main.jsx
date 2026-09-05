import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(10, 13, 28, 0.9)',
              backdropFilter: 'blur(12px)',
              color: '#f9fafb',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '0.9rem',
              fontSize: '0.875rem',
              boxShadow: '0 12px 40px -10px rgba(0,0,0,0.5)',
            },
            success: {
              iconTheme: { primary: '#22d3ee', secondary: '#0a0d1c' },
            },
            error: {
              iconTheme: { primary: '#fb7185', secondary: '#0a0d1c' },
            },
          }}
        />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
