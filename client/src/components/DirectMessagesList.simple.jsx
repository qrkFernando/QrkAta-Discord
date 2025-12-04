import React from 'react'
import { Box, Typography } from '@mui/material'

const DirectMessagesListSimple = ({ onDMSelect, currentDM }) => {
  console.log('✅ DirectMessagesListSimple renderizado correctamente')
  
  return (
    <Box sx={{ width: '240px', bgcolor: '#2f3136', height: '100%', borderRight: '1px solid #40444b' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #40444b' }}>
        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
          Mensajes Directos (Modo Simple)
        </Typography>
      </Box>
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography sx={{ color: '#b9bbbe' }}>
          Modo debug activo - Todo funciona
        </Typography>
      </Box>
    </Box>
  )
}

export default DirectMessagesListSimple