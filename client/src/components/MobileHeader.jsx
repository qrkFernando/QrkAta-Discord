import React from 'react'
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Box,
  Tooltip
} from '@mui/material'
import {
  ArrowBack,
  Tag,
  VolumeUp,
  MoreVert,
  People
} from '@mui/icons-material'
import { useMobile } from '../context/MobileContext'

const MobileHeader = ({ 
  currentServer, 
  currentChannel, 
  currentDM, 
  viewMode, 
  user,
  onMembersToggle 
}) => {
  const { showMobileMain } = useMobile()

  const getChannelTitle = () => {
    if (viewMode === 'dms' && currentDM) {
      const otherUser = currentDM.participants?.find(p => p._id !== user._id)
      return otherUser?.username || 'Mensaje Directo'
    }
    return currentChannel?.name || 'Canal'
  }

  const getChannelIcon = () => {
    if (viewMode === 'dms') {
      return '💬'
    }
    return currentChannel?.type === 'voice' ? <VolumeUp /> : <Tag />
  }

  const getServerName = () => {
    if (viewMode === 'dms') {
      return 'Mensajes Directos'
    }
    return currentServer?.name || 'Servidor'
  }

  const getMemberCount = () => {
    if (viewMode === 'servers' && currentServer) {
      return currentServer.members?.length || 0
    }
    return null
  }

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        bgcolor: '#2f3136',
        borderBottom: '1px solid #40444b'
      }}
    >
      <Toolbar sx={{ 
        minHeight: '56px !important', 
        px: 1,
        gap: 1
      }}>
        {/* Botón atrás */}
        <IconButton
          edge="start"
          onClick={showMobileMain}
          sx={{ 
            color: 'text.secondary',
            transition: 'all 0.2s ease',
            '&:hover': { 
              color: 'primary.main',
              bgcolor: 'rgba(124, 58, 237, 0.1)',
              transform: 'scale(1.1)'
            },
            '&:active': {
              transform: 'scale(0.95)'
            }
          }}
        >
          <ArrowBack />
        </IconButton>

        {/* Información del canal/DM */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          flex: 1,
          minWidth: 0
        }}>
          {viewMode === 'dms' && currentDM ? (
            <Avatar 
              sx={{ width: 32, height: 32 }}
              src={currentDM.participants?.find(p => p._id !== user._id)?.avatar}
            >
              {currentDM.participants?.find(p => p._id !== user._id)?.username?.[0]?.toUpperCase()}
            </Avatar>
          ) : (
            <Box sx={{ 
              color: '#b9bbbe', 
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center'
            }}>
              {getChannelIcon()}
            </Box>
          )}
          
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#fff',
                fontSize: '16px',
                fontWeight: 'bold',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.2
              }}
            >
              {getChannelTitle()}
            </Typography>
            
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#b9bbbe',
                  fontSize: '12px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {getServerName()}
              </Typography>
              
              {getMemberCount() && (
                <>
                  <Box sx={{ 
                    width: 3, 
                    height: 3, 
                    borderRadius: '50%', 
                    bgcolor: '#b9bbbe' 
                  }} />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#b9bbbe',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <People sx={{ fontSize: 14 }} />
                    {getMemberCount()}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Box>

        {/* Botones de acción */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {viewMode === 'servers' && currentServer && onMembersToggle && (
            <Tooltip title="Ver miembros">
              <IconButton
                size="small"
                onClick={onMembersToggle}
                sx={{ 
                  color: 'secondary.main',
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    color: 'secondary.light',
                    bgcolor: 'rgba(6, 182, 212, 0.1)',
                    transform: 'scale(1.1)'
                  }
                }}
              >
                <People />
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title="Más opciones">
            <IconButton
              edge="end"
              sx={{ 
                color: 'text.secondary',
                transition: 'all 0.2s ease',
                '&:hover': { 
                  color: 'warning.main',
                  bgcolor: 'rgba(249, 115, 22, 0.1)',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <MoreVert />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default MobileHeader