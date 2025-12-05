import React, { useState, useEffect } from 'react'
import { Box, Typography, Fade } from '@mui/material'
import { SwipeRight } from '@mui/icons-material'

const SwipeIndicator = ({ show = true, autoHide = true, hideDelay = 3000 }) => {
  const [visible, setVisible] = useState(show)

  useEffect(() => {
    if (autoHide && show) {
      const timer = setTimeout(() => {
        setVisible(false)
      }, hideDelay)

      return () => clearTimeout(timer)
    }
  }, [autoHide, show, hideDelay])

  useEffect(() => {
    // Mostrar solo la primera vez que el usuario entra a vista chat
    const hasSeenSwipeHint = localStorage.getItem('hasSeenSwipeHint')
    if (hasSeenSwipeHint) {
      setVisible(false)
    } else {
      localStorage.setItem('hasSeenSwipeHint', 'true')
    }
  }, [])

  return (
    <Fade in={visible} timeout={500}>
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: 16,
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          color: '#fff',
          px: 2,
          py: 1.5,
          borderRadius: 2,
          zIndex: 1300,
          animation: 'pulse 2s infinite',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(88, 101, 242, 0.3)',
          minWidth: 80
        }}
      >
        <SwipeRight sx={{ fontSize: 24, color: '#5865f2' }} />
        <Typography 
          variant="caption" 
          sx={{ 
            fontSize: 10, 
            textAlign: 'center',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}
        >
          Desliza
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            fontSize: 10, 
            textAlign: 'center',
            opacity: 0.8
          }}
        >
          para volver
        </Typography>
      </Box>
    </Fade>
  )
}

export default SwipeIndicator