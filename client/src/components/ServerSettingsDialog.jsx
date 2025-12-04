import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Divider,
  Chip
} from '@mui/material'
import {
  Close,
  ContentCopy,
  Refresh,
  Share,
  People,
  Settings as SettingsIcon,
  ExitToApp
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import LeaveServerDialog from './LeaveServerDialog'

const ServerSettingsDialog = ({ open, onClose, server, onServerLeft }) => {
  const [loading, setLoading] = useState(false)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [currentInviteCode, setCurrentInviteCode] = useState('')
  const { user } = useAuth()

  // Actualizar código cuando cambie el servidor
  React.useEffect(() => {
    if (server) {
      setCurrentInviteCode(server.inviteCode)
    }
  }, [server])

  if (!server) return null

  const isOwner = server.owner === user._id
  const isAdmin = server.members?.find(m => m.user._id === user._id)?.role === 'admin'
  const canManage = isOwner || isAdmin

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(currentInviteCode)
      toast.success('¡Código de invitación copiado al portapapeles!')
    } catch (error) {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = currentInviteCode
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success('¡Código de invitación copiado!')
    }
  }

  const generateNewInviteCode = async () => {
    if (!canManage) {
      toast.error('No tienes permisos para generar un nuevo código')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`/api/servers/${server._id}/regenerate-invite`)
      toast.success('¡Nuevo código de invitación generado!')
      
      // Actualizar el código localmente
      setCurrentInviteCode(response.data.server.inviteCode)
      
    } catch (error) {
      toast.error('Error al generar nuevo código')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const shareServer = async () => {
    const shareText = `¡Únete a mi servidor "${server.name}" en QrkAta!\n\nCódigo de invitación: ${currentInviteCode}\n\n¡Te esperamos! 🎮`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Únete a ${server.name}`,
          text: shareText
        })
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyInviteCode()
        }
      }
    } else {
      copyInviteCode()
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={() => onClose()}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon />
          Configuración del Servidor
        </Box>
        <IconButton onClick={() => onClose()}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <People />
            Invitar Personas
          </Typography>
          
          <Paper 
            sx={{ 
              p: 3, 
              bgcolor: 'rgba(88, 101, 242, 0.1)',
              border: '1px solid rgba(88, 101, 242, 0.3)'
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Comparte este código para que otros se unan a tu servidor:
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              bgcolor: 'background.paper',
              p: 2,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  color: 'primary.main',
                  letterSpacing: '2px',
                  flex: 1,
                  textAlign: 'center'
                }}
              >
                {currentInviteCode}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<ContentCopy />}
                onClick={copyInviteCode}
                fullWidth
              >
                Copiar Código
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Share />}
                onClick={shareServer}
                fullWidth
              >
                Compartir
              </Button>
            </Box>
          </Paper>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Información del Servidor
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Nombre del servidor
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {server.name}
              </Typography>
            </Box>
            
            {server.description && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Descripción
                </Typography>
                <Typography variant="body1">
                  {server.description}
                </Typography>
              </Box>
            )}
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Miembros
              </Typography>
              <Typography variant="body1">
                {server.members?.length || 0} miembro{server.members?.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Canales
              </Typography>
              <Typography variant="body1">
                {server.channels?.length || 0} canal{server.channels?.length !== 1 ? 'es' : ''}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />
        
        <Box>
          <Typography variant="h6" sx={{ mb: 2, color: 'error.main' }}>
            Zona de Peligro
          </Typography>
          
          {canManage && (
            <>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<Refresh />}
                onClick={generateNewInviteCode}
                disabled={loading}
                fullWidth
                sx={{ mb: 2 }}
              >
                {loading ? 'Generando...' : 'Regenerar Código de Invitación'}
              </Button>
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                ⚠️ Esto invalidará el código actual. Los enlaces existentes dejarán de funcionar.
              </Typography>
            </>
          )}
          
          {!isOwner && (
            <>
              <Button
                variant="outlined"
                color="error"
                startIcon={<ExitToApp />}
                onClick={() => setLeaveDialogOpen(true)}
                fullWidth
              >
                Salir del Servidor
              </Button>
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                ⚠️ Esta acción no se puede deshacer. Necesitarás un nuevo código de invitación para volver.
              </Typography>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => onClose()}>
          Cerrar
        </Button>
      </DialogActions>
      
      <LeaveServerDialog
        open={leaveDialogOpen}
        onClose={() => setLeaveDialogOpen(false)}
        server={server}
        onServerLeft={onServerLeft}
      />
    </Dialog>
  )
}

export default ServerSettingsDialog