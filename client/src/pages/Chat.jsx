import React, { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import Sidebar from '../components/Sidebar'
import MainContent from '../components/MainContent'
import MembersList from '../components/MembersList'
import DirectMessagesList from '../components/DirectMessagesList'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import axios from 'axios'

const Chat = () => {
  const [servers, setServers] = useState([])
  const [currentServer, setCurrentServer] = useState(null)
  const [currentChannel, setCurrentChannel] = useState(null)
  const [currentDM, setCurrentDM] = useState(null)
  const [viewMode, setViewMode] = useState('servers') // 'servers' or 'dms'
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { socket, joinDM } = useSocket()

  useEffect(() => {
    loadServers()
  }, [])

  useEffect(() => {
    if (socket) {
      // Escuchar eventos del socket
      socket.on('serverUpdated', (updatedServer) => {
        setServers(prev => prev.map(s => s._id === updatedServer._id ? updatedServer : s))
      })

      socket.on('channelCreated', (channel) => {
        if (currentServer && channel.server === currentServer._id) {
          setCurrentServer(prev => ({
            ...prev,
            channels: [...prev.channels, channel].sort((a, b) => a.position - b.position)
          }))
        }
      })

      socket.on('channelUpdated', (updatedChannel) => {
        if (currentServer && updatedChannel.server === currentServer._id) {
          setCurrentServer(prev => ({
            ...prev,
            channels: prev.channels.map(c => c._id === updatedChannel._id ? updatedChannel : c)
          }))
        }
      })

      socket.on('channelDeleted', (channelId) => {
        if (currentServer) {
          setCurrentServer(prev => ({
            ...prev,
            channels: prev.channels.filter(c => c._id !== channelId)
          }))
          
          if (currentChannel && currentChannel._id === channelId) {
            // Cambiar al canal general si se elimina el actual
            const generalChannel = currentServer.channels.find(c => c.name === 'general')
            if (generalChannel) {
              setCurrentChannel(generalChannel)
            }
          }
        }
      })

      return () => {
        socket.off('serverUpdated')
        socket.off('channelCreated')
        socket.off('channelUpdated')
        socket.off('channelDeleted')
      }
    }
  }, [socket, currentServer, currentChannel])

  const loadServers = async () => {
    try {
      const response = await axios.get('/api/servers')
      setServers(response.data)
      
      // Seleccionar primer servidor por defecto
      if (response.data.length > 0) {
        handleServerSelect(response.data[0])
      }
    } catch (error) {
      console.error('Error al cargar servidores:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleServerSelect = async (server) => {
    try {
      // Obtener datos completos del servidor
      const response = await axios.get(`/api/servers/${server._id}`)
      setCurrentServer(response.data)
      setCurrentDM(null) // Limpiar DM actual
      setViewMode('servers')
      
      // Seleccionar canal general por defecto
      const generalChannel = response.data.channels.find(c => c.name === 'general')
      if (generalChannel) {
        setCurrentChannel(generalChannel)
      } else if (response.data.channels.length > 0) {
        setCurrentChannel(response.data.channels[0])
      }
    } catch (error) {
      console.error('Error al seleccionar servidor:', error)
    }
  }

  const handleDMSelect = (dm) => {
    setCurrentDM(dm)
    setCurrentServer(null) // Limpiar servidor actual
    setCurrentChannel(null) // Limpiar canal actual
    setViewMode('dms')
    
    // Unirse a la sala del DM
    if (joinDM && dm._id) {
      joinDM(dm._id)
    }
  }

  const handleDMViewOpen = () => {
    console.log('DM View - Usuario:', user?.username, 'ViewMode será:', 'dms')
    setCurrentServer(null)
    setCurrentChannel(null)
    setCurrentDM(null)
    setViewMode('dms')
  }

  const handleChannelSelect = (channel) => {
    setCurrentChannel(channel)
  }

  const handleServerCreated = (newServer) => {
    if (newServer.action === 'left') {
      // Usuario salió del servidor
      setServers(prev => prev.filter(s => s._id !== newServer._id))
      
      // Si era el servidor actual, cambiar a otro
      if (currentServer?._id === newServer._id) {
        const remainingServers = servers.filter(s => s._id !== newServer._id)
        if (remainingServers.length > 0) {
          handleServerSelect(remainingServers[0])
        } else {
          setCurrentServer(null)
          setCurrentChannel(null)
          setViewMode('dms')
        }
      }
    } else {
      // Servidor nuevo creado
      setServers(prev => [...prev, newServer])
      handleServerSelect(newServer)
    }
  }

  const handleChannelCreated = (newChannel) => {
    if (currentServer) {
      setCurrentServer(prev => ({
        ...prev,
        channels: [...prev.channels, newChannel].sort((a, b) => a.position - b.position)
      }))
    }
  }

  if (loading) {
    return (
      <Box 
        sx={{ 
          height: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        Cargando...
      </Box>
    )
  }

  return (
    <Box className="chat-container">
      <Sidebar
        servers={servers}
        currentServer={currentServer}
        currentChannel={currentChannel}
        onServerSelect={handleServerSelect}
        onChannelSelect={handleChannelSelect}
        onServerCreated={handleServerCreated}
        onChannelCreated={handleChannelCreated}
        onDMViewOpen={handleDMViewOpen}
        viewMode={viewMode}
      />
      
      {viewMode === 'dms' && (
        <DirectMessagesList
          onDMSelect={handleDMSelect}
          currentDM={currentDM}
        />
      )}
      
      <MainContent
        currentServer={currentServer}
        currentChannel={currentChannel}
        currentDM={currentDM}
        viewMode={viewMode}
        user={user}
      />
      
      {viewMode === 'servers' && currentServer && (
        <MembersList
          server={currentServer}
          currentUser={user}
        />
      )}
    </Box>
  )
}

export default Chat