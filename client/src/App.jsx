import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { ThemeContextProvider, useTheme } from './context/ThemeContext'
import { MobileProvider } from './context/MobileContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Chat from './pages/Chat'
import './utils/axios' // Configuración global de axios
import './App.css'

function AppContent() {
  const { isAuthenticated } = useAuth()
  const { theme } = useTheme()

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/chat" />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <Register /> : <Navigate to="/chat" />} 
          />
          <Route 
            path="/chat" 
            element={isAuthenticated ? <Chat /> : <Navigate to="/login" />} 
          />
          <Route path="/" element={<Navigate to="/chat" />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </ThemeProvider>
  )
}

function App() {
  return (
    <Router>
      <ThemeContextProvider>
        <MobileProvider>
          <AuthProvider>
            <SocketProvider>
              <AppContent />
            </SocketProvider>
          </AuthProvider>
        </MobileProvider>
      </ThemeContextProvider>
    </Router>
  )
}

export default App