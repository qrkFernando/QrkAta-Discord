import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress
} from '@mui/material'
import {
  Close,
  Search,
  Message,
  Person
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

const DirectMessagesDialog = ({ open, onClose, onStartDM }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const searchUsers = async (query) => {
    if (query.trim().length < 2) {
      setUsers([])
      return
    }

    setLoading(true)
    try {
      const response = await axios.get(`/api/users/search?q=${encodeURIComponent(query)}`)
      setUsers(response.data)
    } catch (error) {
      console.error('Error al buscar usuarios:', error)
      toast.error('Error al buscar usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchUsers(searchTerm)
    }, 300) // Delay para evitar muchas consultas

    return () => clearTimeout(delayedSearch)
  }, [searchTerm])

  const handleStartDM = async (targetUser) => {
    try {
      const response = await axios.post('/api/users/direct-message', {
        recipientId: targetUser._id
      })
      
      toast.success(`Conversación iniciada con ${targetUser.username}`)
      
      if (onStartDM) {
        onStartDM(response.data)
      }
      
      onClose()
    } catch (error) {
      console.error('Error al iniciar DM:', error)
      toast.error('Error al iniciar conversación')
    }
  }

  const handleClose = () => {
    setSearchTerm('')
    setUsers([])
    onClose()
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Message />
          Iniciar Mensaje Directo
        </Box>
        <IconButton onClick={handleClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          placeholder="Buscar usuario por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: loading && (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            )
          }}
          sx={{ mb: 2 }}
        />

        {searchTerm.trim().length < 2 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Escribe al menos 2 caracteres para buscar usuarios
            </Typography>
          </Box>
        )}

        {searchTerm.trim().length >= 2 && users.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No se encontraron usuarios con "{searchTerm}"
            </Typography>
          </Box>
        )}

        <List>
          {users.map((targetUser) => (
            <ListItem key={targetUser._id} sx={{ px: 0 }}>
              <ListItemButton
                onClick={() => handleStartDM(targetUser)}
                sx={{
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'rgba(88, 101, 242, 0.1)'
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    src={targetUser.avatar}
                    sx={{
                      bgcolor: targetUser.isOnline ? 'success.main' : 'grey.500'
                    }}
                  >
                    {targetUser.username[0]?.toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {targetUser.username}
                      </Typography>
                      {targetUser.isOnline && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'success.main'
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {targetUser.isOnline ? 'En línea' : 'Desconectado'}
                      {targetUser.status && ` • ${targetUser.status}`}
                    </Typography>
                  }
                />
                
                <IconButton edge="end" color="primary">
                  <Message />
                </IconButton>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  )
}

export default DirectMessagesDialog