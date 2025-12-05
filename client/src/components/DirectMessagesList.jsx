import React, { useState, useEffect } from 'react'
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  Message,
  Add,
  Circle
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import axios from 'axios'
import DirectMessagesDialog from './DirectMessagesDialog'

const DirectMessagesList = ({ onDMSelect, currentDM }) => {
  const [dms, setDms] = useState([])
  const [dmDialogOpen, setDmDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()
  const { onlineUsers, socket } = useSocket()

  console.log('🎯 DirectMessagesList renderizado para:', user?.username, 'DMs actuales:', dms.length)

  const fetchDMs = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Cargando DMs para usuario:', user?.username)
      const response = await axios.get('/api/users/direct-messages')
      console.log('✅ DMs cargados:', response.data)
      setDms(response.data)
    } catch (error) {
      console.error('❌ Error al obtener DMs:', error)
      console.error('❌ Error completo:', error.response?.data || error.message)
      setError(error.message)
      setDms([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDMs()

    if (socket) {
      socket.on('newDMMessage', ({ message, dmId }) => {
        // Actualizar la lista para mostrar el nuevo mensaje
        setDms(prevDms => {
          const updatedDms = prevDms.map(dm => {
            if (dm._id === dmId) {
              return {
                ...dm,
                lastMessage: {
                  content: message.content,
                  sender: message.sender,
                  createdAt: message.createdAt
                },
                updatedAt: new Date()
              }
            }
            return dm
          })
          
          // Ordenar por fecha de actualización más reciente
          return updatedDms.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        })
      })

      return () => {
        socket.off('newDMMessage')
      }
    }
  }, [socket])

  const getOtherUser = (dm) => {
    if (!dm || !dm.participants || !Array.isArray(dm.participants) || !user?._id) {
      console.warn('❌ getOtherUser: datos inválidos', { dm, user: user?._id })
      return { _id: 'unknown', username: 'Usuario desconocido', avatar: null, isOnline: false }
    }
    
    const otherUser = dm.participants.find(p => p && p._id && p._id !== user._id)
    if (!otherUser) {
      console.warn('❌ getOtherUser: no se encontró otro usuario', { participants: dm.participants, currentUser: user._id })
      return { _id: 'unknown', username: 'Usuario no encontrado', avatar: null, isOnline: false }
    }
    
    return otherUser
  }

  const isUserOnline = (userId) => {
    if (!userId || !onlineUsers || !Array.isArray(onlineUsers)) return false
    return onlineUsers.some(u => u && u.id === userId)
  }

  const formatLastMessage = (lastMessage) => {
    if (!lastMessage || !lastMessage.content) return 'Sin mensajes'
    
    const maxLength = 30
    const content = lastMessage.content.length > maxLength 
      ? lastMessage.content.substring(0, maxLength) + '...'
      : lastMessage.content
    
    const senderName = lastMessage.sender?.username || 'Usuario'
    return `${senderName}: ${content}`
  }

  // Manejo de estados de error y loading
  if (loading) {
    return (
      <Box className="server-panel">
        <Box className="server-header">
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>
            Mensajes Directos
          </Typography>
        </Box>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography sx={{ color: '#b9bbbe' }}>
            Cargando conversaciones...
          </Typography>
        </Box>
      </Box>
    )
  }

  if (error) {
    return (
      <Box className="server-panel">
        <Box className="server-header">
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>
            Mensajes Directos
          </Typography>
        </Box>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography sx={{ color: '#f04747' }}>
            Error al cargar DMs
          </Typography>
          <Typography variant="caption" sx={{ color: '#b9bbbe' }}>
            {error}
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box className="server-panel">
      {/* Header */}
      <Box className="server-header">
        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>
          Mensajes Directos
        </Typography>
        <Tooltip title="Nuevo mensaje">
          <IconButton 
            size="small" 
            sx={{ 
              color: '#b9bbbe',
              '&:hover': { color: '#fff', bgcolor: 'rgba(88, 101, 242, 0.1)' }
            }}
            onClick={() => setDmDialogOpen(true)}
          >
            <Add />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Lista de DMs */}
      <List sx={{ py: 1 }}>
        {dms.length === 0 ? (
          <ListItem>
            <ListItemText
              primary={
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No tienes conversaciones aún
                </Typography>
              }
            />
          </ListItem>
        ) : (
          // Filtrar elementos válidos y eliminar duplicados por _id
          dms.filter(dm => dm && dm._id)
            .filter((dm, index, self) => index === self.findIndex(d => d._id === dm._id))
            .map((dm, index) => {
            try {
              const otherUser = getOtherUser(dm)
              const isOnline = isUserOnline(otherUser._id)
              const isSelected = currentDM?._id === dm._id

              return (
              <ListItem key={`dm-${dm._id}-${index}`} sx={{ px: 1, py: 0 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => onDMSelect(dm)}
                  sx={{
                    borderRadius: 1,
                    bgcolor: isSelected ? 'rgba(88, 101, 242, 0.1)' : 'transparent',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)'
                    },
                    '&.Mui-selected': {
                      bgcolor: 'rgba(88, 101, 242, 0.2)',
                      '&:hover': {
                        bgcolor: 'rgba(88, 101, 242, 0.3)'
                      }
                    }
                  }}
                >
                  <ListItemAvatar sx={{ position: 'relative' }}>
                    <Avatar 
                      src={otherUser.avatar}
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: isOnline ? 'success.main' : 'grey.500'
                      }}
                    >
                      {otherUser.username[0]?.toUpperCase()}
                    </Avatar>
                    {isOnline && (
                      <Circle
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          fontSize: 12,
                          color: 'success.main',
                          bgcolor: '#2f3136',
                          borderRadius: '50%'
                        }}
                      />
                    )}
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: isSelected ? '#fff' : '#dcddde',
                          fontWeight: isSelected ? 'bold' : 'normal'
                        }}
                      >
                        {otherUser.username}
                      </Typography>
                    }
                    secondary={
                      dm.lastMessage && (
                        <Typography variant="caption" sx={{ color: '#72767d' }}>
                          {formatLastMessage(dm.lastMessage)}
                        </Typography>
                      )
                    }
                  />
                </ListItemButton>
              </ListItem>
              )
            } catch (error) {
              console.error('❌ Error renderizando DM:', error, dm)
              return (
                <ListItem key={`error-dm-${dm._id || index}`}>
                  <ListItemText 
                    primary="Error al cargar conversación"
                    sx={{ color: '#f04747' }}
                  />
                </ListItem>
              )
            }
          })
        )}
      </List>

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
      </Box>

      <DirectMessagesDialog
        open={dmDialogOpen}
        onClose={() => setDmDialogOpen(false)}
        onStartDM={(newDM) => {
          setDmDialogOpen(false)
          fetchDMs() // Actualizar lista
          onDMSelect(newDM) // Seleccionar el nuevo DM
        }}
      />
    </Box>
  )
}

export default DirectMessagesList