import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Divider,
  Collapse,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material'
import {
  ExpandMore,
  ExpandLess,
  AdminPanelSettings,
  Shield,
  Person,
  Message,
  MoreVert
} from '@mui/icons-material'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

const MembersList = ({ server, currentUser }) => {
  const [onlineExpanded, setOnlineExpanded] = useState(true)
  const [offlineExpanded, setOfflineExpanded] = useState(false)
  const [contextMenu, setContextMenu] = useState(null)
  const [selectedMember, setSelectedMember] = useState(null)
  const [localOnlineUsers, setLocalOnlineUsers] = useState(new Set())
  
  const { onlineUsers, socket } = useSocket()
  const { user } = useAuth()

  // Escuchar actualizaciones de miembros en tiempo real
  useEffect(() => {
    if (socket && server) {
      // Unirse a la sala del servidor para recibir actualizaciones
      socket.emit('joinServer', server._id)

      // Escuchar eventos de miembros
      socket.on('memberOnline', (data) => {
        if (data.serverId === server._id) {
          setLocalOnlineUsers(prev => new Set([...prev, data.userId]))
        }
      })

      socket.on('memberOffline', (data) => {
        if (data.serverId === server._id) {
          setLocalOnlineUsers(prev => {
            const newSet = new Set(prev)
            newSet.delete(data.userId)
            return newSet
          })
        }
      })

      // Limpiar al desmontar
      return () => {
        socket.off('memberOnline')
        socket.off('memberOffline')
      }
    }
  }, [socket, server])

  // Sincronizar con onlineUsers globales
  useEffect(() => {
    if (server) {
      const serverMemberIds = server.members.map(m => m.user._id)
      const onlineServerMembers = onlineUsers
        .filter(user => serverMemberIds.includes(user.id))
        .map(user => user.id)
      
      setLocalOnlineUsers(new Set(onlineServerMembers))
    }
  }, [onlineUsers, server])

  if (!server || !server.members) {
    return null
  }

  // Separar miembros online y offline usando el estado local
  const onlineMembers = server.members.filter(member => 
    localOnlineUsers.has(member.user._id)
  )
  
  const offlineMembers = server.members.filter(member => 
    !localOnlineUsers.has(member.user._id)
  )

  // Ordenar por rol
  const sortMembersByRole = (members) => {
    const roleOrder = { admin: 0, moderator: 1, member: 2 }
    return members.sort((a, b) => {
      const roleA = roleOrder[a.role] || 2
      const roleB = roleOrder[b.role] || 2
      if (roleA === roleB) {
        return a.user.username.localeCompare(b.user.username)
      }
      return roleA - roleB
    })
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <AdminPanelSettings sx={{ color: '#f04747', fontSize: 16 }} />
      case 'moderator':
        return <Shield sx={{ color: '#5865f2', fontSize: 16 }} />
      default:
        return null
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return '#f04747'
      case 'moderator':
        return '#5865f2'
      default:
        return '#b9bbbe'
    }
  }

  const handleContextMenu = (event, member) => {
    event.preventDefault()
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4
    })
    setSelectedMember(member)
  }

  const handleCloseContextMenu = () => {
    setContextMenu(null)
    setSelectedMember(null)
  }

  const handleSendDM = async () => {
    try {
      const response = await axios.post('/api/users/direct-message', {
        recipientId: selectedMember.user._id
      })
      
      toast.success(`Conversación iniciada con ${selectedMember.user.username}`)
      
      // TODO: Implementar navegación a la conversación DM
      console.log('DM iniciado:', response.data)
      
    } catch (error) {
      console.error('Error al iniciar DM:', error)
      toast.error('Error al iniciar conversación')
    }
    
    handleCloseContextMenu()
  }

  const canManageMember = (member) => {
    if (user._id === server.owner) return true
    
    const currentUserMember = server.members.find(m => m.user._id === user._id)
    if (!currentUserMember) return false
    
    if (currentUserMember.role === 'admin') {
      return member.role !== 'admin' && member.user._id !== server.owner
    }
    
    return false
  }

  const MemberItem = ({ member, isOnline }) => (
    <ListItem 
      key={member.user._id} 
      sx={{ py: 0.5, px: 1 }}
      onContextMenu={(e) => handleContextMenu(e, member)}
    >
      <ListItemButton
        sx={{
          borderRadius: 1,
          py: 0.5,
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <ListItemAvatar sx={{ minWidth: 40 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: isOnline ? '#43b581' : '#747f8d',
                  border: '2px solid #2f3136'
                }}
              />
            }
          >
            <Avatar 
              sx={{ width: 32, height: 32 }}
              src={member.user.avatar}
            >
              {member.user.username[0]?.toUpperCase()}
            </Avatar>
          </Badge>
        </ListItemAvatar>
        
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                variant="body2"
                sx={{
                  color: getRoleColor(member.role),
                  fontWeight: member.role !== 'member' ? 'bold' : 'normal'
                }}
              >
                {member.user.username}
              </Typography>
              {getRoleIcon(member.role)}
            </Box>
          }
          secondary={
            isOnline && member.user.status ? (
              <Typography variant="caption" sx={{ color: '#b9bbbe' }}>
                {member.user.status === 'online' && 'En línea'}
                {member.user.status === 'away' && 'Ausente'}
                {member.user.status === 'busy' && 'No molestar'}
              </Typography>
            ) : null
          }
        />
      </ListItemButton>
    </ListItem>
  )

  return (
    <Box className="members-panel">
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
          Miembros — {server.members.length}
        </Typography>
      </Box>

      <List sx={{ px: 1 }}>
        {/* Miembros en línea */}
        <ListItem sx={{ py: 0 }}>
          <ListItemButton 
            onClick={() => setOnlineExpanded(!onlineExpanded)}
            sx={{ py: 0.5, borderRadius: 1 }}
          >
            {onlineExpanded ? <ExpandLess /> : <ExpandMore />}
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#b9bbbe', 
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                ml: 1
              }}
            >
              En línea — {onlineMembers.length}
            </Typography>
          </ListItemButton>
        </ListItem>

        <Collapse in={onlineExpanded} timeout="auto" unmountOnExit>
          {sortMembersByRole(onlineMembers).map(member => (
            <MemberItem key={member.user._id} member={member} isOnline={true} />
          ))}
        </Collapse>

        {/* Miembros fuera de línea */}
        {offlineMembers.length > 0 && (
          <>
            <ListItem sx={{ py: 0, mt: 1 }}>
              <ListItemButton 
                onClick={() => setOfflineExpanded(!offlineExpanded)}
                sx={{ py: 0.5, borderRadius: 1 }}
              >
                {offlineExpanded ? <ExpandLess /> : <ExpandMore />}
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#b9bbbe', 
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    ml: 1
                  }}
                >
                  Fuera de línea — {offlineMembers.length}
                </Typography>
              </ListItemButton>
            </ListItem>

            <Collapse in={offlineExpanded} timeout="auto" unmountOnExit>
              {sortMembersByRole(offlineMembers).map(member => (
                <MemberItem key={member.user._id} member={member} isOnline={false} />
              ))}
            </Collapse>
          </>
        )}
      </List>

      {/* Menu contextual */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {selectedMember && selectedMember.user._id !== user._id && (
          <MenuItem onClick={handleSendDM}>
            <Message sx={{ mr: 1 }} />
            Enviar mensaje
          </MenuItem>
        )}
        
        {selectedMember && canManageMember(selectedMember) && (
          <>
            <Divider />
            <MenuItem onClick={handleCloseContextMenu}>
              <Person sx={{ mr: 1 }} />
              Ver perfil
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  )
}

export default MembersList