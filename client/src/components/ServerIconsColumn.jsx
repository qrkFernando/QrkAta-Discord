import React, { useState } from 'react'
import {
  Box,
  List,
  ListItem,
  Avatar,
  Divider,
  Tooltip
} from '@mui/material'
import {
  Add,
  Settings
} from '@mui/icons-material'
import CreateServerDialog from './CreateServerDialog'
import JoinServerDialog from './JoinServerDialog'

const ServerIconsColumn = ({ 
  servers, 
  currentServer, 
  onServerSelect, 
  onServerCreated,
  onDMViewOpen,
  viewMode = 'servers'
}) => {
  const [createServerOpen, setCreateServerOpen] = useState(false)
  const [joinServerOpen, setJoinServerOpen] = useState(false)

  const getServerInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <Box className="server-icons-column">
      {/* Lista de servidores */}
      <List sx={{ p: 0, width: '100%' }}>
        {servers.map((server) => (
          <ListItem key={server._id} sx={{ p: 0, mb: 1, justifyContent: 'center' }}>
            <Tooltip title={server.name} placement="right">
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: (currentServer?._id === server._id && viewMode === 'servers') ? '#5865f2' : '#4f545c',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderRadius: (currentServer?._id === server._id && viewMode === 'servers') ? '16px' : '50%',
                  '&:hover': {
                    bgcolor: '#5865f2',
                    borderRadius: '16px',
                    transform: 'scale(1.05)'
                  }
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
        
        <Divider sx={{ my: 1, bgcolor: '#40444b', width: '32px', mx: 'auto' }} />
        
        {/* Botón crear servidor */}
        <ListItem sx={{ p: 0, mb: 1, justifyContent: 'center' }}>
          <Tooltip title="Crear servidor" placement="right">
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: '#43b581',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#3ca374',
                  borderRadius: '16px',
                  transform: 'scale(1.05)'
                }
              }}
              onClick={() => setCreateServerOpen(true)}
            >
              <Add />
            </Avatar>
          </Tooltip>
        </ListItem>
        
        {/* Botón unirse a servidor */}
        <ListItem sx={{ p: 0, mb: 1, justifyContent: 'center' }}>
          <Tooltip title="Unirse a servidor" placement="right">
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: '#7289da',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#677bc4',
                  borderRadius: '16px',
                  transform: 'scale(1.05)'
                }
              }}
              onClick={() => setJoinServerOpen(true)}
            >
              <Settings />
            </Avatar>
          </Tooltip>
        </ListItem>
        
        <Divider sx={{ my: 1, bgcolor: '#40444b', width: '32px', mx: 'auto' }} />
        
        {/* Botón mensajes directos */}
        <ListItem sx={{ p: 0, justifyContent: 'center' }}>
          <Tooltip title="Mensajes directos" placement="right">
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: viewMode === 'dms' ? '#5865f2' : '#f04747',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderRadius: viewMode === 'dms' ? '16px' : '50%',
                '&:hover': {
                  bgcolor: viewMode === 'dms' ? '#4752c4' : '#d63939',
                  borderRadius: '16px',
                  transform: 'scale(1.05)'
                }
              }}
              onClick={onDMViewOpen}
            >
              💬
            </Avatar>
          </Tooltip>
        </ListItem>
      </List>

      {/* Diálogos */}
      <CreateServerDialog
        open={createServerOpen}
        onClose={() => setCreateServerOpen(false)}
        onServerCreated={onServerCreated}
      />

      <JoinServerDialog
        open={joinServerOpen}
        onClose={() => setJoinServerOpen(false)}
        onServerJoined={onServerCreated}
      />
    </Box>
  )
}

export default ServerIconsColumn