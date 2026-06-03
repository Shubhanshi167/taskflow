import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'

import App from './App.jsx'

import { AuthProvider } from './context/AuthContext'

import './index.css'
import './styles/tokens.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>

    <AuthProvider>

      <App />

      <Toaster
        position="bottom-right"
        reverseOrder={false}
        gutter={12}
        toastOptions={{

          duration: 3000,

          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '14px 18px',
            fontSize: '14px',
            fontWeight: '500',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.45)',
          },

          success: {
            iconTheme: {
              primary: '#6366f1',
              secondary: '#ffffff',
            },
          },

          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },

        }}
      />

    </AuthProvider>

  </StrictMode>,
)