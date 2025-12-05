import React, { createContext, useContext, useState, useEffect } from 'react'
import { createTheme } from '@mui/material/styles'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de ThemeProvider')
  }
  return context
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7c3aed', // Violeta principal
      light: '#a855f7',
      dark: '#5b21b6',
    },
    secondary: {
      main: '#06b6d4', // Cyan complementario
      light: '#22d3ee',
      dark: '#0891b2',
    },
    tertiary: {
      main: '#f97316', // Naranja análogo
      light: '#fb923c',
      dark: '#ea580c',
    },
    success: {
      main: '#10b981', // Verde esmeralda
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b', // Ámbar
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444', // Rojo coral
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6', // Azul índigo
      light: '#60a5fa',
      dark: '#2563eb',
    },
    background: {
      default: '#1e1b2e', // Púrpura muy oscuro
      paper: '#2a2438', // Púrpura oscuro
      accent: '#362d4a', // Púrpura medio
    },
    text: {
      primary: '#e2e8f0', // Slate claro
      secondary: '#cbd5e1', // Slate medio
      accent: '#a855f7', // Violeta para acentos
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
})

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#8b5cf6', // Violeta claro
      light: '#a78bfa',
      dark: '#7c3aed',
    },
    secondary: {
      main: '#0891b2', // Cyan oscuro
      light: '#06b6d4',
      dark: '#0e7490',
    },
    tertiary: {
      main: '#ea580c', // Naranja oscuro
      light: '#f97316',
      dark: '#c2410c',
    },
    success: {
      main: '#059669', // Verde esmeralda oscuro
      light: '#10b981',
      dark: '#047857',
    },
    warning: {
      main: '#d97706', // Ámbar oscuro
      light: '#f59e0b',
      dark: '#b45309',
    },
    error: {
      main: '#dc2626', // Rojo coral oscuro
      light: '#ef4444',
      dark: '#b91c1c',
    },
    info: {
      main: '#2563eb', // Azul índigo oscuro
      light: '#3b82f6',
      dark: '#1d4ed8',
    },
    background: {
      default: '#f8fafc', // Slate muy claro
      paper: '#ffffff', // Blanco puro
      accent: '#f1f5f9', // Slate claro
    },
    text: {
      primary: '#1e293b', // Slate oscuro
      secondary: '#475569', // Slate medio
      accent: '#7c3aed', // Violeta para acentos
    },
  },
})

export const ThemeContextProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode')
    if (savedTheme !== null) {
      setIsDarkMode(JSON.parse(savedTheme))
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem('darkMode', JSON.stringify(newTheme))
  }

  const theme = isDarkMode ? darkTheme : lightTheme

  const value = {
    isDarkMode,
    toggleTheme,
    theme
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}