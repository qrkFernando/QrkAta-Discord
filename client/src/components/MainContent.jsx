import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  Avatar,
  Paper,
  Chip,
  Badge
} from '@mui/material'
import {
  Send,
  EmojiEmotions,
  AttachFile,
  Notifications,
  NotificationsOff,
  Tag
} from '@mui/icons-material'
import { useSocket } from '../context/SocketContext'
import Message from './Message'
import TypingIndicator from './TypingIndicator'
import axios from 'axios'

const MainContent = ({ currentServer, currentChannel, currentDM, viewMode, user }) => {
  // Debug específico para problema de pantalla blanca
  if (viewMode === 'dms') {
    console.log('MainContent DM:', { user: user?.username, viewMode, currentDM: currentDM?._id })
  }
  
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [replyTo, setReplyTo] = useState(null)
  const [typingUsersDM, setTypingUsersDM] = useState([])
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const { 
    socket, 
    joinChannel, 
    leaveChannel, 
    joinDM,
    leaveDM,
    sendMessage, 
    startTyping, 
    stopTyping,
    startTypingDM,
    stopTypingDM,
    typingUsers,
    notifications,
    clearNotifications
  } = useSocket()

  useEffect(() => {
    if (currentChannel && viewMode === 'servers') {
      loadMessages()
      joinChannel(currentChannel._id)
      clearNotifications()

      return () => {
        if (currentChannel) {
          leaveChannel(currentChannel._id)
        }
      }
    } else if (currentDM && viewMode === 'dms') {
      loadDMMessages()
      joinDM(currentDM._id)
      clearNotifications()

      return () => {
        if (currentDM) {
          leaveDM(currentDM._id)
        }
      }
    }
  }, [currentChannel, currentDM, viewMode])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', (message) => {
        if (message.channel === currentChannel?._id) {
          setMessages(prev => [...prev, message])
        }
      })

      socket.on('messageEdited', (updatedMessage) => {
        if (updatedMessage.channel === currentChannel?._id) {
          setMessages(prev => prev.map(msg => 
            msg._id === updatedMessage._id ? updatedMessage : msg
          ))
        }
      })

      socket.on('messageDeleted', (messageId) => {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId ? { ...msg, deleted: true, content: '[Mensaje eliminado]' } : msg
        ))
      })

      socket.on('reactionAdded', ({ messageId, reactions }) => {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId ? { ...msg, reactions } : msg
        ))
      })

      socket.on('newDMMessage', ({ message, dmId }) => {
        console.log('Nuevo mensaje DM recibido:', { message, dmId, currentDM: currentDM?._id })
        if (currentDM && dmId === currentDM._id) {
          setMessages(prev => [...prev, message])
        }
      })

      socket.on('userStartedTypingDM', ({ userId, dmId, username }) => {
        console.log('Usuario empezó a escribir DM:', { userId, dmId, username })
        if (currentDM && dmId === currentDM._id && userId !== user._id) {
          setTypingUsersDM(prev => [...prev.filter(u => u.id !== userId), { id: userId, username }])
        }
      })

      socket.on('userStoppedTypingDM', ({ userId, dmId }) => {
        if (currentDM && dmId === currentDM._id) {
          setTypingUsersDM(prev => prev.filter(u => u.id !== userId))
        }
      })

      return () => {
        socket.off('newMessage')
        socket.off('messageEdited')
        socket.off('messageDeleted')
        socket.off('reactionAdded')
        socket.off('newDMMessage')
        socket.off('userStartedTypingDM')
        socket.off('userStoppedTypingDM')
      }
    }
  }, [socket, currentChannel, currentDM, user, viewMode])

  const loadMessages = async () => {
    if (!currentChannel) return

    setLoading(true)
    try {
      const response = await axios.get(`/api/messages/channel/${currentChannel._id}`)
      setMessages(response.data)
    } catch (error) {
      console.error('Error al cargar mensajes:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDMMessages = async () => {
    if (!currentDM) return
    
    setLoading(true)
    try {
      const response = await axios.get(`/api/users/direct-messages/${currentDM._id}/messages`)
      setMessages(response.data)
    } catch (error) {
      console.error('Error al cargar mensajes DM:', error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = () => {
    if (!messageInput.trim()) return
    
    if (viewMode === 'servers' && currentChannel) {
      sendMessage(currentChannel._id, messageInput, replyTo?._id)
      stopTyping(currentChannel._id)
    } else if (viewMode === 'dms' && currentDM) {
      sendDMMessage(currentDM._id, messageInput, replyTo?._id)
      stopTypingDM(currentDM._id)
    }
    
    setMessageInput('')
    setReplyTo(null)
  }

  const getOtherUser = (dm) => {
    if (!dm || !dm.participants) return null
    return dm.participants.find(p => p._id !== user._id)
  }

  const sendDMMessage = async (dmId, content, replyToId = null) => {
    try {
      await axios.post(`/api/messages/direct-message/${dmId}`, {
        content,
        replyTo: replyToId
      })
    } catch (error) {
      console.error('Error al enviar mensaje DM:', error)
    }
  }

  const handleInputChange = (e) => {
    setMessageInput(e.target.value)

    // Manejar indicador de escritura
    if (viewMode === 'servers' && currentChannel) {
      startTyping(currentChannel._id)
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(currentChannel._id)
      }, 3000)
    } else if (viewMode === 'dms' && currentDM) {
      startTypingDM(currentDM._id)
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      typingTimeoutRef.current = setTimeout(() => {
        stopTypingDM(currentDM._id)
      }, 3000)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleReply = (message) => {
    setReplyTo(message)
  }

  const cancelReply = () => {
    setReplyTo(null)
  }

  const getTypingUsers = () => {
    if (viewMode === 'servers' && currentChannel) {
      if (!typingUsers[currentChannel._id]) {
        return []
      }
      
      return Object.entries(typingUsers[currentChannel._id])
        .filter(([userId]) => userId !== user._id)
        .map(([userId, username]) => username)
    } else if (viewMode === 'dms' && currentDM) {
      return typingUsersDM
        .filter(u => u.id !== user._id)
        .map(u => u.username)
    }
    
    return []
  }

  if (viewMode === 'servers' && (!currentServer || !currentChannel)) {
    return (
      <Box 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: 'background.default'
        }}
      >
        <Typography variant="h6" color="text.secondary">
          {viewMode === 'servers' 
            ? 'Selecciona un canal para comenzar a chatear'
            : 'Selecciona una conversación o inicia una nueva'
          }
        </Typography>
      </Box>
    )
  }

  return (
    <Box className="main-content">
      {/* Header del canal */}
      <Box 
        sx={{ 
          height: 48,
          display: 'flex',
          alignItems: 'center',
          px: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        {viewMode === 'servers' && currentChannel && (
          <>
            <Tag sx={{ mr: 1, color: '#b9bbbe' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {currentChannel.name}
            </Typography>
            
            {currentChannel.description && (
              <>
                <Box sx={{ mx: 2, height: 24, width: 1, bgcolor: 'divider' }} />
                <Typography variant="body2" color="text.secondary">
                  {currentChannel.description}
                </Typography>
              </>
            )}
          </>
        )}
        
        {viewMode === 'dms' && currentDM && (
          <>
            <Avatar
              sx={{ mr: 1, width: 24, height: 24 }}
              src={getOtherUser(currentDM)?.avatar}
            >
              {getOtherUser(currentDM)?.username[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {getOtherUser(currentDM)?.username}
            </Typography>
          </>
        )}
        
        {viewMode === 'dms' && !currentDM && (
          <>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              💬 Mensajes Directos
            </Typography>
          </>
        )}

        <Box sx={{ ml: 'auto' }}>
          <Badge badgeContent={notifications.length} color="primary">
            <IconButton>
              {notifications.length > 0 ? <Notifications /> : <NotificationsOff />}
            </IconButton>
          </Badge>
        </Box>
      </Box>

      {/* Lista de mensajes */}
      <Box 
        sx={{ 
          flex: 1,
          overflow: 'auto',
          bgcolor: 'background.default'
        }}
      >
        {loading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography>Cargando mensajes...</Typography>
          </Box>
        ) : viewMode === 'dms' && !currentDM ? (
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              p: 3
            }}
          >
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
              💬 Mensajes Directos
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
              Selecciona una conversación existente desde el panel izquierdo
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              O inicia una nueva conversación haciendo clic en "Buscar Usuario" 👆
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 1 }}>
            {messages.map((message, index) => (
              <Message
                key={message._id}
                message={message}
                currentUser={user}
                onReply={handleReply}
                showAvatar={
                  index === 0 || 
                  messages[index - 1].sender._id !== message.sender._id ||
                  new Date(message.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() > 300000
                }
              />
            ))}
            
            <TypingIndicator users={getTypingUsers()} />
            
            <div ref={messagesEndRef} />
          </List>
        )}
      </Box>

      {/* Input de mensaje */}
      {(viewMode === 'servers' && currentChannel) || (viewMode === 'dms' && currentDM) ? (
        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        {replyTo && (
          <Paper 
            sx={{ 
              p: 1, 
              mb: 1, 
              bgcolor: 'rgba(88, 101, 242, 0.1)',
              borderLeft: '4px solid #5865f2'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#5865f2' }}>
                Respondiendo a {replyTo.sender.username}
              </Typography>
              <IconButton size="small" onClick={cancelReply}>
                ×
              </IconButton>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {replyTo.content.substring(0, 100)}
              {replyTo.content.length > 100 && '...'}
            </Typography>
          </Paper>
        )}

        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder={
              viewMode === 'servers' && currentChannel
                ? `Enviar mensaje a #${currentChannel.name}`
                : viewMode === 'dms' && currentDM
                ? `Enviar mensaje a ${getOtherUser(currentDM)?.username}`
                : 'Enviar mensaje'
            }
            value={messageInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.default'
              }
            }}
          />
          
          <IconButton color="primary">
            <EmojiEmotions />
          </IconButton>
          
          <IconButton>
            <AttachFile />
          </IconButton>
          
          <IconButton 
            color="primary"
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
          >
            <Send />
          </IconButton>
        </Box>
      </Box>
      ) : null}
    </Box>
  )
}

export default MainContent