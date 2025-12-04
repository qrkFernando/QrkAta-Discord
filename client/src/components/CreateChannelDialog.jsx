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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Alert,
  Switch
} from '@mui/material'
import { Close, Tag, VolumeUp } from '@mui/icons-material'
import axios from 'axios'
import toast from 'react-hot-toast'

const CreateChannelDialog = ({ open, onClose, serverId, onChannelCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'text',
    topic: '',
    isPrivate: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleNameChange = (e) => {
    // Convertir a formato de canal (minúsculas, sin espacios)
    let value = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9\-_]/g, '')
      .slice(0, 50)
    
    setFormData(prev => ({
      ...prev,
      name: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const channelData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        serverId,
        topic: formData.topic.trim(),
        isPrivate: formData.isPrivate
      }

      const response = await axios.post('/api/channels', channelData)
      
      toast.success(`Canal "#${formData.name}" creado exitosamente`)
      onChannelCreated(response.data.channel)
      handleClose()
      
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear el canal'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      type: 'text',
      topic: '',
      isPrivate: false
    })
    setError('')
    onClose()
  }

  if (!serverId) return null

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Crear canal
        <IconButton onClick={handleClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Los canales son donde tu comunidad se reúne para hablar. Son mejores cuando están organizados por temas específicos.
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
          {/* Tipo de canal */}
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ mb: 1 }}>
              Tipo de canal
            </FormLabel>
            <RadioGroup
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <FormControlLabel 
                value="text" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tag />
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        Canal de texto
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Envía mensajes, imágenes, GIFs, emojis y más
                      </Typography>
                    </Box>
                  </Box>
                }
              />
              <FormControlLabel 
                value="voice" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VolumeUp />
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        Canal de voz
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Habla por voz con tus amigos
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>

          {/* Nombre del canal */}
          <TextField
            name="name"
            label="Nombre del canal"
            value={formData.name}
            onChange={handleNameChange}
            required
            fullWidth
            placeholder="nuevo-canal"
            InputProps={{
              startAdornment: formData.type === 'text' ? '#' : '🔊'
            }}
            helperText="Solo letras minúsculas, números, guiones y guiones bajos. Sin espacios."
          />

          {/* Descripción */}
          <TextField
            name="description"
            label="Descripción del canal (opcional)"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
            inputProps={{ maxLength: 200 }}
            helperText={`${formData.description.length}/200 caracteres`}
          />

          {/* Tema del canal (solo para canales de texto) */}
          {formData.type === 'text' && (
            <TextField
              name="topic"
              label="Tema del canal (opcional)"
              value={formData.topic}
              onChange={handleChange}
              fullWidth
              inputProps={{ maxLength: 100 }}
              helperText={`Aparece en la parte superior del canal. ${formData.topic.length}/100 caracteres`}
            />
          )}

          {/* Canal privado */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" fontWeight="bold">
                🔒 Canal privado
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Solo los miembros seleccionados y los roles pueden ver este canal
              </Typography>
            </Box>
            <Switch
              name="isPrivate"
              checked={formData.isPrivate}
              onChange={handleChange}
            />
          </Box>
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
          {loading ? 'Creando...' : 'Crear canal'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateChannelDialog