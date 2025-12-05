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
                  background: (currentServer?._id === server._id && viewMode === 'servers') 
                    ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
                    : 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderRadius: (currentServer?._id === server._id && viewMode === 'servers') ? '16px' : '50%',
                  boxShadow: (currentServer?._id === server._id && viewMode === 'servers') 
                    ? '0 4px 20px rgba(124, 58, 237, 0.4)' : 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
                    borderRadius: '16px',
                    transform: 'scale(1.1) rotate(2deg)',
                    boxShadow: '0 8px 25px rgba(6, 182, 212, 0.4)'
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
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  borderRadius: '16px',
                  transform: 'scale(1.1) rotate(-2deg)',
                  boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)'
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
                background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                  borderRadius: '16px',
                  transform: 'scale(1.1) rotate(2deg)',
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)'
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
                background: viewMode === 'dms' 
                  ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
                  : 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: viewMode === 'dms' ? '16px' : '50%',
                boxShadow: viewMode === 'dms' 
                  ? '0 4px 20px rgba(124, 58, 237, 0.4)' : 'none',
                '&:hover': {
                  background: viewMode === 'dms' 
                    ? 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)'
                    : 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)',
                  borderRadius: '16px',
                  transform: 'scale(1.1) rotate(-2deg)',
                  boxShadow: viewMode === 'dms' 
                    ? '0 8px 25px rgba(124, 58, 237, 0.4)' 
                    : '0 8px 25px rgba(239, 68, 68, 0.4)'
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