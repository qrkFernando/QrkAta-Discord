const express = require('express')
const { body, validationResult } = require('express-validator')
const Message = require('../models/Message')
const Channel = require('../models/Channel')
const DirectMessage = require('../models/DirectMessage')
const auth = require('../middleware/auth')

const router = express.Router()

// @route   GET /api/messages/channel/:channelId
// @desc    Obtener mensajes de un canal
// @access  Private
router.get('/channel/:channelId', auth, async (req, res) => {
  try {
    const { channelId } = req.params
    const { page = 1, limit = 50 } = req.query

    // Verificar que el canal existe y el usuario tiene acceso
    const channel = await Channel.findById(channelId).populate('server')
    
    if (!channel) {
      return res.status(404).json({ message: 'Canal no encontrado' })
    }

    // Verificar si el usuario es miembro del servidor
    const isMember = channel.server.members.some(
      member => member.user.toString() === req.user._id.toString()
    )

    if (!isMember) {
      return res.status(403).json({ message: 'No tienes acceso a este canal' })
    }

    // Obtener mensajes
    const messages = await Message.find({ 
      channel: channelId, 
      deleted: { $ne: true } 
    })
      .populate('sender', 'username avatar')
      .populate('replyTo', 'content sender')
      .populate('reactions.users', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean()

    // Revertir orden para mostrar cronológicamente
    messages.reverse()

    res.json(messages)
  } catch (error) {
    console.error('Error al obtener mensajes:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// @route   GET /api/messages/dm/:dmId
// @desc    Obtener mensajes de una conversación directa
// @access  Private
router.get('/dm/:dmId', auth, async (req, res) => {
  try {
    const { dmId } = req.params
    const { page = 1, limit = 50 } = req.query

    // Verificar que la conversación existe y el usuario participa
    const dm = await DirectMessage.findById(dmId)
    
    if (!dm) {
      return res.status(404).json({ message: 'Conversación no encontrada' })
    }

    // Verificar si el usuario participa en la conversación
    const isParticipant = dm.participants.some(
      participant => participant.toString() === req.user._id.toString()
    )

    if (!isParticipant) {
      return res.status(403).json({ message: 'No tienes acceso a esta conversación' })
    }

    // Obtener mensajes
    const messages = await Message.find({ 
      directMessage: dmId, 
      deleted: { $ne: true } 
    })
      .populate('sender', 'username avatar')
      .populate('replyTo', 'content sender')
      .populate('reactions.users', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean()

    // Revertir orden para mostrar cronológicamente
    messages.reverse()

    res.json(messages)
  } catch (error) {
    console.error('Error al obtener mensajes:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// @route   POST /api/messages
// @desc    Enviar mensaje (REST endpoint de respaldo)
// @access  Private
router.post('/', [
  auth,
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('El mensaje debe tener entre 1 y 2000 caracteres'),
  body('channelId')
    .optional()
    .isMongoId()
    .withMessage('ID de canal inválido'),
  body('directMessageId')
    .optional()
    .isMongoId()
    .withMessage('ID de conversación directa inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Datos inválidos',
        errors: errors.array()
      })
    }

    const { content, channelId, directMessageId, replyTo } = req.body

    if (!channelId && !directMessageId) {
      return res.status(400).json({ 
        message: 'Debes especificar un canal o conversación directa' 
      })
    }

    let message

    if (channelId) {
      // Verificar canal y permisos
      const channel = await Channel.findById(channelId).populate('server')
      
      if (!channel) {
        return res.status(404).json({ message: 'Canal no encontrado' })
      }

      const isMember = channel.server.members.some(
        member => member.user.toString() === req.user._id.toString()
      )

      if (!isMember) {
        return res.status(403).json({ message: 'No tienes permisos para enviar mensajes' })
      }

      message = new Message({
        content,
        sender: req.user._id,
        channel: channelId,
        replyTo: replyTo || null
      })
    } else {
      // Verificar conversación directa y permisos
      const dm = await DirectMessage.findById(directMessageId)
      
      if (!dm) {
        return res.status(404).json({ message: 'Conversación no encontrada' })
      }

      const isParticipant = dm.participants.some(
        participant => participant.toString() === req.user._id.toString()
      )

      if (!isParticipant) {
        return res.status(403).json({ message: 'No tienes acceso a esta conversación' })
      }

      message = new Message({
        content,
        sender: req.user._id,
        directMessage: directMessageId,
        replyTo: replyTo || null
      })
    }

    await message.save()
    await message.populate('sender', 'username avatar')
    
    if (replyTo) {
      await message.populate('replyTo')
    }

    res.status(201).json({
      message: 'Mensaje enviado exitosamente',
      data: message
    })

  } catch (error) {
    console.error('Error al enviar mensaje:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// @route   PUT /api/messages/:id
// @desc    Editar mensaje
// @access  Private
router.put('/:id', [
  auth,
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('El mensaje debe tener entre 1 y 2000 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Datos inválidos',
        errors: errors.array()
      })
    }

    const { content } = req.body
    const message = await Message.findById(req.params.id)

    if (!message) {
      return res.status(404).json({ message: 'Mensaje no encontrado' })
    }

    // Verificar que el usuario sea el autor
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No puedes editar este mensaje' })
    }

    if (message.deleted) {
      return res.status(400).json({ message: 'No puedes editar un mensaje eliminado' })
    }

    message.content = content
    message.edited = true
    message.editedAt = new Date()
    await message.save()

    await message.populate('sender', 'username avatar')

    res.json({
      message: 'Mensaje editado exitosamente',
      data: message
    })

  } catch (error) {
    console.error('Error al editar mensaje:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// @route   DELETE /api/messages/:id
// @desc    Eliminar mensaje
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)

    if (!message) {
      return res.status(404).json({ message: 'Mensaje no encontrado' })
    }

    // Verificar que el usuario sea el autor
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No puedes eliminar este mensaje' })
    }

    message.deleted = true
    message.deletedAt = new Date()
    message.content = '[Mensaje eliminado]'
    await message.save()

    res.json({ message: 'Mensaje eliminado exitosamente' })

  } catch (error) {
    console.error('Error al eliminar mensaje:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// @route   POST /api/messages/:id/reactions
// @desc    Agregar reacción a mensaje
// @access  Private
router.post('/:id/reactions', [
  auth,
  body('emoji')
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Emoji inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Datos inválidos',
        errors: errors.array()
      })
    }

    const { emoji } = req.body
    const message = await Message.findById(req.params.id)

    if (!message) {
      return res.status(404).json({ message: 'Mensaje no encontrado' })
    }

    // Buscar reacción existente
    let reaction = message.reactions.find(r => r.emoji === emoji)

    if (reaction) {
      // Toggle: agregar o quitar usuario de la reacción
      const userIndex = reaction.users.indexOf(req.user._id)
      if (userIndex > -1) {
        reaction.users.splice(userIndex, 1)
        // Si no quedan usuarios, eliminar la reacción
        if (reaction.users.length === 0) {
          message.reactions = message.reactions.filter(r => r.emoji !== emoji)
        }
      } else {
        reaction.users.push(req.user._id)
      }
    } else {
      // Crear nueva reacción
      message.reactions.push({
        emoji,
        users: [req.user._id]
      })
    }

    await message.save()
    await message.populate('reactions.users', 'username')

    res.json({
      message: 'Reacción actualizada',
      reactions: message.reactions
    })

  } catch (error) {
    console.error('Error al agregar reacción:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// @route   POST /api/messages/direct-message/:dmId
// @desc    Enviar mensaje a conversación directa
// @access  Private
router.post('/direct-message/:dmId', auth, async (req, res) => {
  try {
    const DirectMessage = require('../models/DirectMessage')
    const { content, replyTo } = req.body

    // Verificar que el usuario sea participante de la conversación
    const dm = await DirectMessage.findById(req.params.dmId)
    
    if (!dm) {
      return res.status(404).json({ message: 'Conversación no encontrada' })
    }

    if (!dm.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'No tienes acceso a esta conversación' })
    }

    // Crear el mensaje
    const message = new Message({
      content,
      sender: req.user._id,
      directMessage: req.params.dmId,
      replyTo: replyTo || null
    })

    await message.save()

    // Poblar datos del mensaje
    await message.populate('sender', 'username avatar')
    if (replyTo) {
      await message.populate('replyTo')
    }

    // Actualizar último mensaje en la conversación
    dm.lastMessage = message._id
    dm.lastActivity = new Date()
    await dm.save()

    // Emitir el mensaje via Socket.IO
    const io = req.app.get('io')
    
    if (io) {
      console.log(`Enviando mensaje DM a sala: dm-${req.params.dmId}`)
      // Enviar a la sala del DM
      io.to(`dm-${req.params.dmId}`).emit('newDMMessage', {
        message,
        dmId: req.params.dmId
      })
    } else {
      console.error('Socket.IO no disponible')
    }

    res.status(201).json(message)

  } catch (error) {
    console.error('Error al enviar mensaje DM:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

module.exports = router