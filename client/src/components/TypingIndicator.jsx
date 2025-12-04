import React from 'react'
import { Box, Typography, Fade } from '@mui/material'

const TypingIndicator = ({ users = [] }) => {
  if (users.length === 0) {
    return null
  }

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0]} está escribiendo...`
    } else if (users.length === 2) {
      return `${users[0]} y ${users[1]} están escribiendo...`
    } else if (users.length === 3) {
      return `${users[0]}, ${users[1]} y ${users[2]} están escribiendo...`
    } else {
      return `${users.length} usuarios están escribiendo...`
    }
  }

  return (
    <Fade in={true}>
      <Box
        sx={{
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: '2px',
            alignItems: 'center'
          }}
        >
          {/* Animación de puntos */}
          {[0, 1, 2].map((dot) => (
            <Box
              key={dot}
              sx={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                bgcolor: '#b9bbbe',
                animation: 'typing 1.4s infinite',
                animationDelay: `${dot * 0.2}s`,
                '@keyframes typing': {
                  '0%, 60%, 100%': {
                    transform: 'translateY(0px)',
                    opacity: 0.5
                  },
                  '30%': {
                    transform: 'translateY(-10px)',
                    opacity: 1
                  }
                }
              }}
            />
          ))}
        </Box>
        
        <Typography 
          className="typing-indicator"
          variant="caption" 
          sx={{ 
            color: '#b9bbbe',
            fontStyle: 'italic'
          }}
        >
          {getTypingText()}
        </Typography>
      </Box>
    </Fade>
  )
}

export default TypingIndicator