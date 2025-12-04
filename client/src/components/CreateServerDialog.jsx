import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Avatar,
  IconButton,
  Alert
} from '@mui/material'
import { PhotoCamera, Close } from '@mui/icons-material'
import axios from 'axios'
import toast from 'react-hot-toast'

const CreateServerDialog = ({ open, onClose, onServerCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [icon, setIcon] = useState(null)
  const [iconPreview, setIconPreview] = useState('')

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleIconChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('El archivo no puede ser mayor a 5MB')
        return
      }
      
      setIcon(file)
      const reader = new FileReader()
      reader.onload = (e) => setIconPreview(e.target.result)
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const serverData = {
        name: formData.name.trim(),
        description: formData.description.trim()
      }

      const response = await axios.post('/api/servers', serverData)
      
      toast.success(`Servidor "${formData.name}" creado exitosamente`)
      onServerCreated(response.data.server)
      handleClose()
      
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear el servidor'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ name: '', description: '' })
    setIcon(null)
    setIconPreview('')
    setError('')
    onClose()
  }

  const getServerInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Crear tu servidor
        <IconButton onClick={handleClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Crea tu propio servidor para chatear con amigos. ¡Es completamente gratis!
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box 
          component="form" 
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
        >
          {/* Icono del servidor */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: '#5865f2',
                fontSize: '24px',
                cursor: 'pointer'
              }}
              src={iconPreview}
              onClick={() => document.getElementById('icon-upload').click()}
            >
              {iconPreview ? null : getServerInitials(formData.name || 'Mi Servidor')}
            </Avatar>
            
            <input
              id="icon-upload"
              type="file"
              accept="image/*"
              onChange={handleIconChange}
              style={{ display: 'none' }}
            />
            
            <Button
              variant="outlined"
              startIcon={<PhotoCamera />}
              onClick={() => document.getElementById('icon-upload').click()}
            >
              Subir icono
            </Button>
            
            <Typography variant="caption" color="text.secondary">
              Recomendado: 512x512px, PNG o JPG
            </Typography>
          </Box>

          {/* Nombre del servidor */}
          <TextField
            name="name"
            label="Nombre del servidor"
            value={formData.name}
            onChange={handleChange}
            required
            fullWidth
            inputProps={{ maxLength: 50 }}
            helperText={`${formData.name.length}/50 caracteres`}
          />

          {/* Descripción */}
          <TextField
            name="description"
            label="Descripción (opcional)"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            inputProps={{ maxLength: 200 }}
            helperText={`${formData.description.length}/200 caracteres`}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.name.trim()}
        >
          {loading ? 'Creando...' : 'Crear servidor'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateServerDialog