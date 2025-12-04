const Message = require('../models/Message')
const Channel = require('../models/Channel')
const User = require('../models/User')
const DirectMessage = require('../models/DirectMessage')

const onlineUsers = new Map()
const typingUsers = new Map()

const handleConnection = (io, socket) => {
  const userId = socket.user._id.toString()
  
  // Agregar usuario a la lista de conectados
  onlineUsers.set(userId, {
    id: userId,
    username: socket.user.username,
    avatar: socket.user.avatar,
    socketId: socket.id
  })

  // Actualizar estado del usuario en la base de datos
  User.findByIdAndUpdate(userId, { 
    isOnline: true, 
    status: 'online',
    lastSeen: new Date()
  }).exec()

  // Notificar a todos los usuarios conectados
  io.emit('userOnline', Array.from(onlineUsers.values()))

  // Notificar a servidores que el usuario está online
  const Server = require('../models/Server')
  ;(async () => {
    try {
      const userServers = await Server.find({
        'members.user': userId
      }).select('_id members')

      userServers.forEach(server => {
        socket.join(`server-${server._id}`)
        socket.to(`server-${server._id}`).emit('memberOnline', {
          userId,
          username: socket.user.username,
          serverId: server._id
        })
      })
    } catch (error) {
      console.error('Error al unirse a salas de servidor:', error)
    }
  })()

  // Unirse a salas de mensajes directos
  ;(async () => {
    try {
      const DirectMessage = require('../models/DirectMessage')
      const userDMs = await DirectMessage.find({
        participants: userId,
        isActive: true
      })

      userDMs.forEach(dm => {
        socket.join(`dm-${dm._id}`)
        console.log(`${socket.user.username} se unió a DM sala: dm-${dm._id}`)
      })
    } catch (error) {
      console.error('Error al unirse a salas de DM:', error)
    }
  })()

  console.log(`Usuario ${socket.user.username} se conectó`)

  // Unirse a la sala de un servidor
  socket.on('joinServer', async (serverId) => {
    try {
      const server = await Server.findById(serverId)
      
      if (server) {
        // Verificar si es miembro
        const isMember = server.members.some(
          member => member.user.toString() === userId
        )

        if (isMember) {
          socket.join(`server-${serverId}`)
          console.log(`${socket.user.username} se unió a la sala del servidor ${server.name}`)
        }
      }
    } catch (error) {
      console.error('Error al unirse a servidor:', error)
    }
  })

  // Unirse a un canal
  socket.on('joinChannel', async (channelId) => {
    try {
      const channel = await Channel.findById(channelId).populate('server')
      
      if (channel) {
        // Verificar permisos
        const isMember = channel.server.members.some(
          member => member.user.toString() === userId
        )

        if (isMember) {
          socket.join(channelId)
          console.log(`${socket.user.username} se unió al canal ${channel.name}`)
        }
      }
    } catch (error) {
      console.error('Error al unirse al canal:', error)
    }
  })

  // Salir de un canal
  socket.on('leaveChannel', (channelId) => {
    socket.leave(channelId)
    console.log(`${socket.user.username} salió del canal`)
  })

  // Enviar mensaje
  socket.on('sendMessage', async (data) => {
    try {
      const { channelId, content, replyTo } = data

      const channel = await Channel.findById(channelId).populate('server')
      
      if (!channel) {
        return socket.emit('error', { message: 'Canal no encontrado' })
      }

      // Verificar permisos
      const isMember = channel.server.members.some(
        member => member.user.toString() === userId
      )

      if (!isMember) {
        return socket.emit('error', { message: 'No tienes permisos para enviar mensajes' })
      }

      // Crear mensaje
      const message = new Message({
        content,
        sender: userId,
        channel: channelId,
        replyTo: replyTo || null
      })

      await message.save()

      // Poblar mensaje con datos del sender
      await message.populate('sender', 'username avatar')
      
      if (replyTo) {
        await message.populate('replyTo')
      }

      // Actualizar último mensaje del canal
      channel.lastMessage = message._id
      await channel.save()

      // Emitir mensaje a todos en el canal
      io.to(channelId).emit('newMessage', message)

      // Detener indicador de escritura
      handleStopTyping(socket, channelId)

    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      socket.emit('error', { message: 'Error al enviar mensaje' })
    }
  })

  // Enviar mensaje directo
  socket.on('sendDirectMessage', async (data) => {
    try {
      const { recipientId, content } = data

      // Buscar o crear conversación DM
      let dm = await DirectMessage.findOne({
        participants: { $all: [userId, recipientId] }
      })

      if (!dm) {
        dm = new DirectMessage({
          participants: [userId, recipientId]
        })
        await dm.save()
      }

      // Crear mensaje
      const message = new Message({
        content,
        sender: userId,
        directMessage: dm._id
      })

      await message.save()
      await message.populate('sender', 'username avatar')

      // Actualizar última actividad
      dm.lastMessage = message._id
      dm.lastActivity = new Date()
      await dm.save()

      // Emitir a ambos usuarios
      const recipientSocket = Array.from(onlineUsers.values())
        .find(user => user.id === recipientId)

      if (recipientSocket) {
        io.to(recipientSocket.socketId).emit('newDirectMessage', message)
      }
      
      socket.emit('newDirectMessage', message)

    } catch (error) {
      console.error('Error al enviar mensaje directo:', error)
      socket.emit('error', { message: 'Error al enviar mensaje directo' })
    }
  })

  // Usuario escribiendo
  socket.on('typing', (data) => {
    const { channelId } = data
    handleStartTyping(io, socket, channelId)
  })

  // Usuario dejó de escribir
  socket.on('stopTyping', (data) => {
    const { channelId } = data
    handleStopTyping(socket, channelId)
  })

  // Editar mensaje
  socket.on('editMessage', async (data) => {
    try {
      const { messageId, newContent } = data

      const message = await Message.findById(messageId)

      if (!message) {
        return socket.emit('error', { message: 'Mensaje no encontrado' })
      }

      // Verificar que el usuario sea el autor
      if (message.sender.toString() !== userId) {
        return socket.emit('error', { message: 'No puedes editar este mensaje' })
      }

      message.content = newContent
      message.edited = true
      message.editedAt = new Date()
      await message.save()

      await message.populate('sender', 'username avatar')

      // Emitir actualización
      if (message.channel) {
        io.to(message.channel.toString()).emit('messageEdited', message)
      } else if (message.directMessage) {
        const dm = await DirectMessage.findById(message.directMessage)
        dm.participants.forEach(participantId => {
          const userSocket = Array.from(onlineUsers.values())
            .find(user => user.id === participantId.toString())
          if (userSocket) {
            io.to(userSocket.socketId).emit('messageEdited', message)
          }
        })
      }

    } catch (error) {
      console.error('Error al editar mensaje:', error)
      socket.emit('error', { message: 'Error al editar mensaje' })
    }
  })

  // Eliminar mensaje
  socket.on('deleteMessage', async (data) => {
    try {
      const { messageId } = data

      const message = await Message.findById(messageId)

      if (!message) {
        return socket.emit('error', { message: 'Mensaje no encontrado' })
      }

      // Verificar que el usuario sea el autor
      if (message.sender.toString() !== userId) {
        return socket.emit('error', { message: 'No puedes eliminar este mensaje' })
      }

      message.deleted = true
      message.deletedAt = new Date()
      message.content = '[Mensaje eliminado]'
      await message.save()

      // Emitir eliminación
      if (message.channel) {
        io.to(message.channel.toString()).emit('messageDeleted', messageId)
      } else if (message.directMessage) {
        const dm = await DirectMessage.findById(message.directMessage)
        dm.participants.forEach(participantId => {
          const userSocket = Array.from(onlineUsers.values())
            .find(user => user.id === participantId.toString())
          if (userSocket) {
            io.to(userSocket.socketId).emit('messageDeleted', messageId)
          }
        })
      }

    } catch (error) {
      console.error('Error al eliminar mensaje:', error)
      socket.emit('error', { message: 'Error al eliminar mensaje' })
    }
  })

  // Reaccionar a mensaje
  socket.on('addReaction', async (data) => {
    try {
      const { messageId, emoji } = data

      const message = await Message.findById(messageId)

      if (!message) {
        return socket.emit('error', { message: 'Mensaje no encontrado' })
      }

      // Buscar reacción existente
      let reaction = message.reactions.find(r => r.emoji === emoji)

      if (reaction) {
        // Agregar usuario a la reacción si no existe
        if (!reaction.users.includes(userId)) {
          reaction.users.push(userId)
        }
      } else {
        // Crear nueva reacción
        message.reactions.push({
          emoji,
          users: [userId]
        })
      }

      await message.save()
      await message.populate('reactions.users', 'username')

      // Emitir actualización
      if (message.channel) {
        io.to(message.channel.toString()).emit('reactionAdded', {
          messageId,
          reactions: message.reactions
        })
      }

    } catch (error) {
      console.error('Error al agregar reacción:', error)
      socket.emit('error', { message: 'Error al agregar reacción' })
    }
  })

  // Eventos para mensajes directos
  socket.on('joinDM', async (dmId) => {
    try {
      const dm = await DirectMessage.findById(dmId)
      
      if (dm && dm.participants.includes(userId)) {
        socket.join(`dm-${dmId}`)
        console.log(`${socket.user.username} se unió manualmente a DM: dm-${dmId}`)
      }
    } catch (error) {
      console.error('Error al unirse a DM:', error)
    }
  })

  socket.on('leaveDM', (dmId) => {
    socket.leave(`dm-${dmId}`)
  })

  // Indicador de escritura para DMs
  socket.on('startTypingDM', (dmId) => {
    console.log(`${socket.user.username} empezó a escribir en DM: ${dmId}`)
    socket.to(`dm-${dmId}`).emit('userStartedTypingDM', {
      userId,
      dmId,
      username: socket.user.username
    })
  })

  socket.on('stopTypingDM', (dmId) => {
    console.log(`${socket.user.username} dejó de escribir en DM: ${dmId}`)
    socket.to(`dm-${dmId}`).emit('userStoppedTypingDM', {
      userId,
      dmId,
      username: socket.user.username
    })
  })

  // Desconexión
  socket.on('disconnect', async () => {
    console.log(`Usuario ${socket.user.username} se desconectó`)
    
    // Remover de usuarios online
    onlineUsers.delete(userId)
    
    // Actualizar estado en base de datos
    await User.findByIdAndUpdate(userId, { 
      isOnline: false, 
      status: 'offline',
      lastSeen: new Date()
    })

    // Notificar a servidores que el usuario está offline
    try {
      const userServers = await Server.find({
        'members.user': userId
      }).select('_id')

      userServers.forEach(server => {
        socket.to(`server-${server._id}`).emit('memberOffline', {
          userId,
          username: socket.user.username,
          serverId: server._id
        })
      })
    } catch (error) {
      console.error('Error al notificar desconexión a servidores:', error)
    }

    // Limpiar typing indicators
    for (const [channelId, users] of typingUsers.entries()) {
      if (users.has(userId)) {
        users.delete(userId)
        socket.to(channelId).emit('userStoppedTyping', {
          userId,
          channelId,
          username: socket.user.username
        })
      }
    }

    // Notificar desconexión general
    io.emit('userOffline', Array.from(onlineUsers.values()))
  })
}

const handleStartTyping = (io, socket, channelId) => {
  const userId = socket.user._id.toString()
  
  if (!typingUsers.has(channelId)) {
    typingUsers.set(channelId, new Map())
  }
  
  const channelTyping = typingUsers.get(channelId)
  
  if (!channelTyping.has(userId)) {
    channelTyping.set(userId, setTimeout(() => {
      handleStopTyping(socket, channelId)
    }, 10000)) // Auto-stop después de 10 segundos

    socket.to(channelId).emit('userTyping', {
      userId,
      username: socket.user.username,
      channelId
    })
  }
}

const handleStopTyping = (socket, channelId) => {
  const userId = socket.user._id.toString()
  
  if (typingUsers.has(channelId)) {
    const channelTyping = typingUsers.get(channelId)
    
    if (channelTyping.has(userId)) {
      const timeout = channelTyping.get(userId)
      clearTimeout(timeout)
      channelTyping.delete(userId)

      socket.to(channelId).emit('userStoppedTyping', {
        userId,
        channelId,
        username: socket.user.username
      })

      if (channelTyping.size === 0) {
        typingUsers.delete(channelId)
      }
    }
  }
}

module.exports = {
  handleConnection,
  onlineUsers
}