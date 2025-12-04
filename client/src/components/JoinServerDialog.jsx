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
  IconButton,
  Alert,
  Divider
} from '@mui/material'
import { Close, Link } from '@mui/icons-material'
import axios from 'axios'
import toast from 'react-hot-toast'

const JoinServerDialog = ({ open, onClose, onServerJoined }) => {
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const cleanCode = inviteCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
      
      if (cleanCode.length !== 6) {
        setError('El código de invitación debe tener 6 caracteres')
        setLoading(false)
        return
      }

      const response = await axios.post('/api/servers/join', {
        inviteCode: cleanCode
      })
      
      toast.success(`Te has unido a "${response.data.server.name}"`)
      onServerJoined(response.data.server)
      handleClose()
      
    } catch (error) {
      const message = error.response?.data?.message || 'Error al unirse al servidor'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setInviteCode('')
    setError('')
    onClose()
  }

  const handleInviteCodeChange = (e) => {
    // Solo permitir letras y números, máximo 6 caracteres
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
    setInviteCode(value)
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Unirse a un servidor
        <IconButton onClick={handleClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Introduce el código de invitación de 6 caracteres para unirte a un servidor existente.
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
          <TextField
            label="Código de invitación"
            value={inviteCode}
            onChange={handleInviteCodeChange}
            required
            fullWidth
            placeholder="ABC123"
            inputProps={{ 
              maxLength: 6,
              style: { 
                textAlign: 'center', 
                fontSize: '24px', 
                fontWeight: 'bold',
                letterSpacing: '4px'
              }
            }}
            InputProps={{
              startAdornment: <Link sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            helperText="El código debe tener exactamente 6 caracteres"
          />

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              ¿Cómo obtener un código de invitación?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              1. Pide a un amigo que ya esté en el servidor que te invite
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              2. Los administradores pueden crear códigos de invitación desde la configuración del servidor
            </Typography>
            <Typography variant="body2" color="text.secondary">
              3. Cada servidor tiene un código único de 6 caracteres
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              💡 <strong>Tip:</strong> Los códigos de invitación no distinguen entre mayúsculas y minúsculas.
            </Typography>
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || inviteCode.length !== 6}
        >
          {loading ? 'Uniéndose...' : 'Unirse al servidor'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default JoinServerDialog