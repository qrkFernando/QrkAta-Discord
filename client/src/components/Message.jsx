import React, { useState } from 'react'
import {
  Box,
  Typography,
  Avatar,
  ListItem,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Paper,
  Dialog,
  DialogContent,
  TextField,
  DialogActions,
  Button
} from '@mui/material'
import {
  MoreVert,
  Reply,
  Edit,
  Delete,
  EmojiEmotions,
  ContentCopy
} from '@mui/icons-material'
import { useSocket } from '../context/SocketContext'
import { formatDistance } from 'date-fns'
import { es } from 'date-fns/locale'

const Message = ({ message, currentUser, onReply, showAvatar = true }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const [showReactions, setShowReactions] = useState(false)
  
  const { socket } = useSocket()
  const isOwnMessage = message.sender._id === currentUser._id

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleEdit = () => {
    setEditContent(message.content)
    setEditDialogOpen(true)
    handleMenuClose()
  }

  const handleEditSave = () => {
    if (editContent.trim() && editContent !== message.content) {
      socket?.emit('editMessage', {
        messageId: message._id,
        newContent: editContent.trim()
      })
    }
    setEditDialogOpen(false)
  }

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
      socket?.emit('deleteMessage', { messageId: message._id })
    }
    handleMenuClose()
  }

  const handleReply = () => {
    onReply(message)
    handleMenuClose()
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    handleMenuClose()
  }

  const handleReaction = (emoji) => {
    socket?.emit('addReaction', {
      messageId: message._id,
      emoji
    })
    setShowReactions(false)
  }

  const formatMessageTime = (date) => {
    return formatDistance(new Date(date), new Date(), { 
      addSuffix: true, 
      locale: es 
    })
  }

  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👎', '🎉']

  return (
    <>
      <ListItem
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          py: showAvatar ? 1 : 0.5,
          px: 2,
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.02)'
          },
          '&:hover .message-actions': {
            opacity: 1
          }
        }}
      >
        <Box sx={{ display: 'flex', width: '100%', gap: 1 }}>
          {/* Avatar */}
          <Box sx={{ width: 40, display: 'flex', justifyContent: 'center' }}>
            {showAvatar ? (
              <Avatar 
                sx={{ width: 32, height: 32 }}
                src={message.sender.avatar}
              >
                {message.sender.username[0]?.toUpperCase()}
              </Avatar>
            ) : (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: '10px',
                  lineHeight: '20px',
                  opacity: 0,
                  '&:hover': { opacity: 1 }
                }}
              >
                {new Date(message.createdAt).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            )}
          </Box>

          {/* Contenido del mensaje */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Header del mensaje (solo si se muestra avatar) */}
            {showAvatar && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: isOwnMessage ? 'primary.main' : 'text.primary'
                  }}
                >
                  {message.sender.username}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatMessageTime(message.createdAt)}
                </Typography>
                {message.edited && (
                  <Chip 
                    label="editado" 
                    size="small" 
                    variant="outlined"
                    sx={{ height: 16, fontSize: '10px' }}
                  />
                )}
              </Box>
            )}

            {/* Mensaje de respuesta */}
            {message.replyTo && (
              <Paper 
                sx={{ 
                  p: 1, 
                  mb: 1, 
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  borderLeft: '2px solid #5865f2'
                }}
              >
                <Typography variant="caption" sx={{ color: '#5865f2' }}>
                  {message.replyTo.sender?.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {message.replyTo.content}
                </Typography>
              </Paper>
            )}

            {/* Contenido */}
            <Typography 
              variant="body1" 
              sx={{ 
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
                opacity: message.deleted ? 0.6 : 1,
                fontStyle: message.deleted ? 'italic' : 'normal'
              }}
            >
              {message.content}
            </Typography>

            {/* Archivos adjuntos */}
            {message.attachments && message.attachments.length > 0 && (
              <Box sx={{ mt: 1 }}>
                {message.attachments.map((attachment, index) => (
                  <Paper 
                    key={index}
                    sx={{ 
                      p: 2, 
                      display: 'inline-block', 
                      mr: 1,
                      cursor: 'pointer'
                    }}
                  >
                    <Typography variant="body2">
                      📎 {attachment.originalName}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            )}

            {/* Reacciones */}
            {message.reactions && message.reactions.length > 0 && (
              <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {message.reactions.map((reaction, index) => (
                  <Chip
                    key={index}
                    label={`${reaction.emoji} ${reaction.users.length}`}
                    size="small"
                    onClick={() => handleReaction(reaction.emoji)}
                    sx={{
                      bgcolor: reaction.users.some(u => u._id === currentUser._id) 
                        ? 'primary.dark' 
                        : 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        bgcolor: 'primary.main'
                      }
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* Acciones del mensaje */}
          <Box 
            className="message-actions"
            sx={{ 
              opacity: 0,
              transition: 'opacity 0.2s',
              display: 'flex',
              gap: 0.5
            }}
          >
            <IconButton 
              size="small"
              onClick={() => setShowReactions(true)}
              sx={{ bgcolor: 'background.paper' }}
            >
              <EmojiEmotions fontSize="small" />
            </IconButton>
            
            <IconButton 
              size="small"
              onClick={handleReply}
              sx={{ bgcolor: 'background.paper' }}
            >
              <Reply fontSize="small" />
            </IconButton>
            
            <IconButton 
              size="small"
              onClick={handleMenuClick}
              sx={{ bgcolor: 'background.paper' }}
            >
              <MoreVert fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </ListItem>

      {/* Menu contextual */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleReply}>
          <Reply sx={{ mr: 1 }} /> Responder
        </MenuItem>
        <MenuItem onClick={handleCopy}>
          <ContentCopy sx={{ mr: 1 }} /> Copiar texto
        </MenuItem>
        {isOwnMessage && !message.deleted && (
          <MenuItem onClick={handleEdit}>
            <Edit sx={{ mr: 1 }} /> Editar
          </MenuItem>
        )}
        {isOwnMessage && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} /> Eliminar
          </MenuItem>
        )}
      </Menu>

      {/* Selector de reacciones */}
      <Dialog
        open={showReactions}
        onClose={() => setShowReactions(false)}
      >
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {commonEmojis.map(emoji => (
              <IconButton
                key={emoji}
                onClick={() => handleReaction(emoji)}
                sx={{ fontSize: '24px' }}
              >
                {emoji}
              </IconButton>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Diálogo de edición */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Editar mensaje..."
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleEditSave}
            variant="contained"
            disabled={!editContent.trim()}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Message