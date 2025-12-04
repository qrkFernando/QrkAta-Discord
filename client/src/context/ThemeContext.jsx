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
      main: '#5865f2',
    },
    secondary: {
      main: '#57f287',
    },
    background: {
      default: '#36393f',
      paper: '#2f3136',
    },
    text: {
      primary: '#dcddde',
      secondary: '#b9bbbe',
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
      main: '#5865f2',
    },
    secondary: {
      main: '#57f287',
    },
    background: {
      default: '#ffffff',
      paper: '#f6f6f6',
    },
    text: {
      primary: '#2e3338',
      secondary: '#5c6371',
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