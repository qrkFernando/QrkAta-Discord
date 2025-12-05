import React, { useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Tooltip
} from '@mui/material'
import {
  Add,
  Settings,
  Logout,
  DarkMode,
  LightMode
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import CreateChannelDialog from './CreateChannelDialog'
import ServerSettingsDialog from './ServerSettingsDialog'
import DraggableChannelList from './DraggableChannelList'

const ServerPanel = ({ 
  currentServer, 
  currentChannel, 
  onChannelSelect,
  onChannelCreated,
  onServerCreated
}) => {
  const [createChannelOpen, setCreateChannelOpen] = useState(false)
  const [serverSettingsOpen, setServerSettingsOpen] = useState(false)
  
  const { user, logout } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <Box 
      className="server-panel"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {currentServer ? (
        <>
          {/* Header del servidor */}
          <Box className="server-header">
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#fff', 
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'color 0.2s',
                '&:hover': { color: '#5865f2' }
              }}
              onClick={() => setServerSettingsOpen(true)}
            >
              {currentServer.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Configuración del servidor">
                <IconButton 
                  size="small" 
                  sx={{ 
                    color: 'info.main',
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                      color: 'info.light', 
                      bgcolor: 'rgba(59, 130, 246, 0.1)',
                      transform: 'scale(1.1)'
                    }
                  }}
                  onClick={() => setServerSettingsOpen(true)}
                >
                  <Settings />
                </IconButton>
              </Tooltip>
              <Tooltip title="Crear canal">
                <IconButton 
                  size="small" 
                  sx={{ 
                    color: 'success.main',
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                      color: 'success.light', 
                      bgcolor: 'rgba(16, 185, 129, 0.1)',
                      transform: 'scale(1.1)'
                    }
                  }}
                  onClick={() => setCreateChannelOpen(true)}
                >
                  <Add />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Área de canales */}
          <Box 
            className="channels-area"
            sx={{
              flex: 1,
              overflow: 'auto'
            }}
          >
            <DraggableChannelList
              channels={currentServer.channels || []}
              currentChannel={currentChannel}
              onChannelSelect={onChannelSelect}
              serverId={currentServer._id}
              canManageChannels={
                currentServer.owner === user._id || 
                currentServer.members?.find(m => m.user._id === user._id)?.role === 'admin'
              }
            />
          </Box>
        </>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          p: 3,
          textAlign: 'center' 
        }}>
          <Typography sx={{ color: '#b9bbbe', fontSize: '14px' }}>
            Selecciona un servidor para ver los canales
          </Typography>
        </Box>
      )}

      {/* Panel de usuario */}
      <Box className="user-panel">
        <Avatar 
          sx={{ width: 32, height: 32 }}
          src={user?.avatar}
        >
          {user?.username?.[0]?.toUpperCase()}
        </Avatar>
        
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ 
            color: '#fff', 
            fontSize: '14px', 
            fontWeight: 'bold',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {user?.username}
          </Typography>
          <Typography sx={{ 
            color: '#43b581', 
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}>
            <Box 
              sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                bgcolor: '#43b581',
                boxShadow: '0 0 6px rgba(67, 181, 129, 0.6)'
              }} 
            />
            En línea
          </Typography>
        </Box>

        <Tooltip title={isDarkMode ? "Modo claro" : "Modo oscuro"}>
          <IconButton 
            size="small" 
            onClick={toggleTheme}
            sx={{ 
              color: '#b9bbbe',
              '&:hover': { color: '#fff', bgcolor: 'rgba(185, 187, 190, 0.1)' }
            }}
          >
            {isDarkMode ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Cerrar sesión">
          <IconButton 
            size="small" 
            onClick={logout}
            sx={{ 
              color: '#b9bbbe',
              '&:hover': { color: '#f04747', bgcolor: 'rgba(240, 71, 71, 0.1)' }
            }}
          >
            <Logout />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Diálogos */}
      <CreateChannelDialog
        open={createChannelOpen}
        onClose={() => setCreateChannelOpen(false)}
        serverId={currentServer?._id}
        onChannelCreated={onChannelCreated}
      />

      <ServerSettingsDialog
        open={serverSettingsOpen}
        onClose={() => setServerSettingsOpen(false)}
        server={currentServer}
        onServerLeft={(serverId) => {
          if (onServerCreated) {
            onServerCreated({ _id: serverId, action: 'left' })
          }
          setServerSettingsOpen(false)
        }}
      />
    </Box>
  )
}

export default ServerPanel