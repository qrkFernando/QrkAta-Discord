import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  TextField
} from '@mui/material'
import { Warning, ExitToApp } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

const LeaveServerDialog = ({ open, onClose, server, onServerLeft }) => {
  const [loading, setLoading] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const { user } = useAuth()

  if (!server) return null

  const isOwner = server.owner === user._id
  const confirmationText = server.name

  const handleLeaveServer = async () => {
    setLoading(true)
    try {
      await axios.post(`/api/servers/${server._id}/leave`)
      
      toast.success(`Has salido del servidor "${server.name}"`)
      
      if (onServerLeft) {
        onServerLeft(server._id)
      }
      
      onClose()
    } catch (error) {
      console.error('Error al salir del servidor:', error)
      toast.error('Error al salir del servidor')
    } finally {
      setLoading(false)
    }
  }

  const canConfirm = confirmText === confirmationText

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
        <Warning />
        Salir del Servidor
      </DialogTitle>

      <DialogContent>
        {isOwner ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              ⚠️ Eres el propietario de este servidor
            </Typography>
            <Typography variant="body2">
              Como propietario, no puedes salir del servidor. Debes transferir la propiedad 
              a otro miembro o eliminar el servidor completamente.
            </Typography>
          </Alert>
        ) : (
          <>
            <Typography variant="body1" sx={{ mb: 2 }}>
              ¿Estás seguro de que quieres salir de <strong>"{server.name}"</strong>?
            </Typography>
            
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                • Perderás acceso a todos los canales y mensajes
              </Typography>
              <Typography variant="body2">
                • Necesitarás un nuevo código de invitación para volver
              </Typography>
              <Typography variant="body2">
                • Esta acción no se puede deshacer
              </Typography>
            </Alert>

            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Para confirmar, escribe el nombre del servidor:
            </Typography>
            
            <TextField
              fullWidth
              placeholder={`Escribe "${confirmationText}"`}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              error={confirmText.length > 0 && confirmText !== confirmationText}
              helperText={
                confirmText.length > 0 && confirmText !== confirmationText
                  ? `Debe coincidir exactamente: "${confirmationText}"`
                  : `Escribe: ${confirmationText}`
              }
              sx={{ mb: 2 }}
            />
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancelar
        </Button>
        
        {!isOwner && (
          <Button
            onClick={handleLeaveServer}
            variant="contained"
            color="error"
            disabled={loading || !canConfirm}
            startIcon={<ExitToApp />}
          >
            {loading ? 'Saliendo...' : 'Salir del Servidor'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default LeaveServerDialog