import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket debe ser usado dentro de SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [notifications, setNotifications] = useState([])
  const [typingUsers, setTypingUsers] = useState({})
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        }
      })

      newSocket.on('connect', () => {
        console.log('Conectado al servidor')
      })

      newSocket.on('userOnline', (users) => {
        setOnlineUsers(users)
      })

      newSocket.on('userOffline', (users) => {
        setOnlineUsers(users)
      })

      newSocket.on('newMessage', (message) => {
        // Notificación si no estamos en el canal actual
        if (message.sender._id !== user._id) {
          toast.success(`Nuevo mensaje de ${message.sender.username}`)
          setNotifications(prev => [...prev, message])
        }
      })

      newSocket.on('userTyping', ({ userId, username, channelId }) => {
        setTypingUsers(prev => ({
          ...prev,
          [channelId]: { ...prev[channelId], [userId]: username }
        }))
      })

      newSocket.on('userStoppedTyping', ({ userId, channelId }) => {
        setTypingUsers(prev => {
          const updated = { ...prev }
          if (updated[channelId]) {
            delete updated[channelId][userId]
            if (Object.keys(updated[channelId]).length === 0) {
              delete updated[channelId]
            }
          }
          return updated
        })
      })

      newSocket.on('messageEdited', (updatedMessage) => {
        // Manejar mensaje editado
      })

      newSocket.on('messageDeleted', (messageId) => {
        // Manejar mensaje eliminado
      })

      newSocket.on('disconnect', () => {
        console.log('Desconectado del servidor')
      })

      setSocket(newSocket)

      return () => {
        newSocket.disconnect()
        setSocket(null)
      }
    }
  }, [isAuthenticated, user])

  const joinChannel = (channelId) => {
    if (socket) {
      socket.emit('joinChannel', channelId)
    }
  }

  const leaveChannel = (channelId) => {
    if (socket) {
      socket.emit('leaveChannel', channelId)
    }
  }

  const joinDM = (dmId) => {
    if (socket) {
      console.log('Uniéndose a DM:', dmId)
      socket.emit('joinDM', dmId)
    }
  }

  const leaveDM = (dmId) => {
    if (socket) {
      socket.emit('leaveDM', dmId)
    }
  }

  const sendMessage = (channelId, content) => {
    if (socket) {
      socket.emit('sendMessage', { channelId, content })
    }
  }

  const startTyping = (channelId) => {
    if (socket) {
      socket.emit('typing', { channelId })
    }
  }

  const stopTyping = (channelId) => {
    if (socket) {
      socket.emit('stopTyping', { channelId })
    }
  }

  const startTypingDM = (dmId) => {
    if (socket) {
      console.log('Empezando a escribir en DM:', dmId)
      socket.emit('startTypingDM', dmId)
    }
  }

  const stopTypingDM = (dmId) => {
    if (socket) {
      socket.emit('stopTypingDM', dmId)
    }
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const value = {
    socket,
    onlineUsers,
    notifications,
    typingUsers,
    joinChannel,
    leaveChannel,
    joinDM,
    leaveDM,
    sendMessage,
    startTyping,
    stopTyping,
    startTypingDM,
    stopTypingDM,
    clearNotifications
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}