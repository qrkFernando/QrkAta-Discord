import React, { useState } from 'react'
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Avatar,
  IconButton,
  Divider,
  Tooltip
} from '@mui/material'
import {
  Add,
  Settings,
  Tag,
  VolumeUp,
  Logout,
  DarkMode,
  LightMode
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import CreateServerDialog from './CreateServerDialog'
import CreateChannelDialog from './CreateChannelDialog'
import JoinServerDialog from './JoinServerDialog'
import DraggableChannelList from './DraggableChannelList'
import ServerSettingsDialog from './ServerSettingsDialog'
import DirectMessagesDialog from './DirectMessagesDialog'

const Sidebar = ({ 
  servers, 
  currentServer, 
  currentChannel, 
  onServerSelect, 
  onChannelSelect,
  onServerCreated,
  onChannelCreated,
  onDMViewOpen,
  viewMode = 'servers'
}) => {
  const [createServerOpen, setCreateServerOpen] = useState(false)
  const [createChannelOpen, setCreateChannelOpen] = useState(false)
  const [joinServerOpen, setJoinServerOpen] = useState(false)
  const [serverSettingsOpen, setServerSettingsOpen] = useState(false)
  const [dmDialogOpen, setDmDialogOpen] = useState(false)
  
  const { user, logout } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()

  const getServerInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <Box className="sidebar-left">
      {/* Lista de servidores */}
      <Box sx={{ width: 72, bgcolor: '#202225', borderRight: '1px solid #40444b' }}>
        <List sx={{ p: 1 }}>
          {servers.map((server) => (
            <ListItem key={server._id} sx={{ p: 0, mb: 1 }}>
              <Tooltip title={server.name} placement="right">
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: (currentServer?._id === server._id && viewMode === 'servers') ? 'primary.main' : '#5865f2',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'primary.main'
                    },
                    borderRadius: (currentServer?._id === server._id && viewMode === 'servers') ? '16px' : '24px',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => onServerSelect(server)}
                >
                  {server.icon ? (
                    <img src={server.icon} alt={server.name} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    getServerInitials(server.name)
                  )}
                </Avatar>
              </Tooltip>
            </ListItem>
          ))}
          
          <Divider sx={{ my: 1, bgcolor: '#40444b' }} />
          
          <ListItem sx={{ p: 0 }}>
            <Tooltip title="Crear servidor" placement="right">
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: '#43b581',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: '#3ca374'
                  }
                }}
                onClick={() => setCreateServerOpen(true)}
              >
                <Add />
              </Avatar>
            </Tooltip>
          </ListItem>
          
          <ListItem sx={{ p: 0, mt: 1 }}>
            <Tooltip title="Unirse a servidor" placement="right">
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: '#7289da',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: '#677bc4'
                  }
                }}
                onClick={() => setJoinServerOpen(true)}
              >
                <Settings />
              </Avatar>
            </Tooltip>
          </ListItem>
          
          <Divider sx={{ my: 1, bgcolor: '#40444b' }} />
          
          <ListItem sx={{ p: 0 }}>
            <Tooltip title="Mensajes directos" placement="right">
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: viewMode === 'dms' ? '#5865f2' : '#f04747',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: viewMode === 'dms' ? '#4752c4' : '#d63939'
                  }
                }}
                onClick={onDMViewOpen}
              >
                💬
              </Avatar>
            </Tooltip>
          </ListItem>
        </List>
      </Box>

      {/* Canales y configuración */}
      <Box sx={{ flex: 1, bgcolor: '#2f3136' }}>
        {currentServer ? (
          <>
            {/* Header del servidor */}
            <Box 
              sx={{ 
                p: 2, 
                borderBottom: '1px solid #40444b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#fff', 
                  fontWeight: 'bold',
                  cursor: 'pointer',
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
                    sx={{ color: '#b9bbbe' }}
                    onClick={() => setServerSettingsOpen(true)}
                  >
                    <Settings />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Crear canal">
                  <IconButton 
                    size="small" 
                    sx={{ color: '#b9bbbe' }}
                    onClick={() => setCreateChannelOpen(true)}
                  >
                    <Add />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Lista de canales */}
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
          </>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography sx={{ color: '#b9bbbe' }}>
              Selecciona un servidor para ver los canales
            </Typography>
          </Box>
        )}

        {/* Panel de usuario */}
        <Box 
          sx={{ 
            position: 'absolute',
            bottom: 0,
            left: 72,
            right: 0,
            height: 52,
            bgcolor: '#292b2f',
            display: 'flex',
            alignItems: 'center',
            px: 1,
            gap: 1
          }}
        >
          <Avatar 
            sx={{ width: 32, height: 32 }}
            src={user?.avatar}
          >
            {user?.username?.[0]?.toUpperCase()}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>
              {user?.username}
            </Typography>
            <Typography sx={{ color: '#b9bbbe', fontSize: '12px' }}>
              En línea
            </Typography>
          </Box>

          <IconButton 
            size="small" 
            onClick={toggleTheme}
            sx={{ color: '#b9bbbe' }}
          >
            {isDarkMode ? <LightMode /> : <DarkMode />}
          </IconButton>

          <IconButton 
            size="small" 
            onClick={logout}
            sx={{ color: '#b9bbbe' }}
          >
            <Logout />
          </IconButton>
        </Box>
      </Box>

      {/* Diálogos */}
      <CreateServerDialog
        open={createServerOpen}
        onClose={() => setCreateServerOpen(false)}
        onServerCreated={onServerCreated}
      />

      <CreateChannelDialog
        open={createChannelOpen}
        onClose={() => setCreateChannelOpen(false)}
        serverId={currentServer?._id}
        onChannelCreated={onChannelCreated}
      />

      <JoinServerDialog
        open={joinServerOpen}
        onClose={() => setJoinServerOpen(false)}
        onServerJoined={onServerCreated}
      />

      <ServerSettingsDialog
        open={serverSettingsOpen}
        onClose={() => setServerSettingsOpen(false)}
        server={currentServer}
        onServerLeft={(serverId) => {
          // Notificar al componente padre para actualizar la lista
          if (onServerCreated) {
            // Usar el mismo callback para forzar actualización
            onServerCreated({ _id: serverId, action: 'left' })
          }
          setServerSettingsOpen(false)
        }}
      />


    </Box>
  )
}

export default Sidebar