import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/theme.css'
import './styles/glass.css'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { safeLocalStorage } from './utils/safeStorage'

try {
    const raw = safeLocalStorage.getItem('c-lab-theme-settings')
    const parsed = raw ? JSON.parse(raw) : null
    const storedMode = parsed?.state?.themeMode
    const mode = storedMode === 'light'
        ? 'light'
        : storedMode === 'system'
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : 'dark'
    document.documentElement.classList.toggle('dark', mode === 'dark')
    document.documentElement.classList.toggle('light', mode === 'light')
    document.documentElement.dataset.theme = mode
} catch {
    document.documentElement.classList.add('dark')
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ThemeProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <App />
            </BrowserRouter>
        </ThemeProvider>
    </React.StrictMode>,
)
