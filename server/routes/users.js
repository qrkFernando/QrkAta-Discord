const express = require('express')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const DirectMessage = require('../models/DirectMessage')
const auth = require('../middleware/auth')

const router = express.Router()

// @route   GET /api/users/me/direct-messages
// @desc    Obtener conversaciones directas del usuario
// @access  Private
router.get('/me/direct-messages', auth, async (req, res) => {
  try {
    const directMessages = await DirectMessage.find({
      participants: req.user._id,
      isActive: true
    })
      .populate('participants', 'username avatar status isOnline')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'username'
        }
      })
      .sort({ lastActivity: -1 })

    res.json(directMessages)
  } catch (error) {
    console.error('Error al obtener conversaciones directas:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// @route   POST /api/users/direct-message
// @desc    Iniciar conversación directa
// @access  Private
router.post('/direct-message', [
  auth,
  body('recipientId')
    .isMongoId()
    .withMessage('ID de usuario inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Datos inválidos',
        errors: errors.array()
      })
    }

    const { recipientId } = req.body

    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ message: 'No puedes enviarte mensajes a ti mismo' })
    }

    // Verificar que el destinatario existe
    const recipient = await User.findById(recipientId)
    if (!recipient) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    // Buscar conversación existente
    let dm = await DirectMessage.findOne({
      participants: { $all: [req.user._id, recipientId] }
    })
      .populate('participants', 'username avatar status isOnline')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'username'
        }
      })

    if (!dm) {
      // Crear nueva conversación
      dm = new DirectMessage({
        participants: [req.user._id, recipientId]
      })
      await dm.save()
      await dm.populate('participants', 'username avatar status isOnline')
    } else {
      // Reactivar conversación si estaba inactiva
      dm.isActive = true
      await dm.save()
    }

    res.json(dm)
  } catch (error) {
    console.error('Error al iniciar conversación directa:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// @route   GET /api/users/search
// @desc    Buscar usuarios
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'La búsqueda debe tener al menos 2 caracteres' })
    }

    const searchTerm = q.trim()
    const regex = new RegExp(searchTerm, 'i')

    const users = await User.find({
      $or: [
        { username: regex },
        { email: regex }
      ],
      _id: { $ne: req.user._id } // Excluir al usuario actual
    })
      .select('username avatar status isOnline')
      .limit(parseInt(limit))

    res.json(users)
  } catch (error) {
    console.error('Error al buscar usuarios:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})



// @route   PUT /api/users/me
// @desc    Actualizar perfil del usuario
// @access  Private
router.put('/me', [
  auth,
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('El nombre de usuario debe tener entre 3 y 20 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),
  body('status')
    .optional()
    .isIn(['online', 'away', 'busy', 'offline'])
    .withMessage('Estado inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Datos inválidos',
        errors: errors.array()
      })
    }

    const { username, status } = req.body
    const user = await User.findById(req.user._id)

    // Verificar si el username ya existe (si se está cambiando)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: req.user._id } 
      })

      if (existingUser) {
        return res.status(400).json({ message: 'El nombre de usuario ya está en uso' })
      }
      
      user.username = username
    }

    if (status) {
      user.status = status
    }

    await user.save()

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: user.toPublic()
    })

  } catch (error) {
    console.error('Error al actualizar perfil:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// @route   PUT /api/users/me/status
// @desc    Actualizar estado del usuario
// @access  Private
router.put('/me/status', [
  auth,
  body('status')
    .isIn(['online', 'away', 'busy', 'offline'])
    .withMessage('Estado inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Datos inválidos',
        errors: errors.array()
      })
    }

    const { status } = req.body
    
    await User.findByIdAndUpdate(req.user._id, { 
      status,
      lastSeen: new Date()
    })

    res.json({ message: 'Estado actualizado exitosamente' })

  } catch (error) {
    console.error('Error al actualizar estado:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// @route   GET /api/users/online
// @desc    Obtener usuarios en línea
// @access  Private
router.get('/online', auth, async (req, res) => {
  try {
    const onlineUsers = await User.find({ 
      isOnline: true,
      _id: { $ne: req.user._id }
    })
      .select('username avatar status')
      .limit(50)

    res.json(onlineUsers)
  } catch (error) {
    console.error('Error al obtener usuarios en línea:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// @route   GET /api/users/direct-messages
// @desc    Obtener conversaciones directas del usuario
// @access  Private
router.get('/direct-messages', auth, async (req, res) => {
  try {
    console.log('📋 Obteniendo DMs para usuario:', req.user.username)
    const DirectMessage = require('../models/DirectMessage')
    
    const dms = await DirectMessage.find({
      participants: req.user._id
    })
    .populate('participants', 'username avatar isOnline status')
    .populate('lastMessage.sender', 'username')
    .sort({ updatedAt: -1 })

    console.log('✅ DMs encontrados:', dms.length)
    res.json(dms)
  } catch (error) {
    console.error('❌ Error al obtener DMs:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// @route   GET /api/users/direct-messages/:dmId/messages
// @desc    Obtener mensajes de una conversación DM
// @access  Private
router.get('/direct-messages/:dmId/messages', auth, async (req, res) => {
  try {
    const DirectMessage = require('../models/DirectMessage')
    const Message = require('../models/Message')
    
    // Verificar que el usuario sea participante de la conversación
    const dm = await DirectMessage.findById(req.params.dmId)
    
    if (!dm) {
      return res.status(404).json({ message: 'Conversación no encontrada' })
    }

    if (!dm.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'No tienes acceso a esta conversación' })
    }

    // Obtener mensajes de la conversación
    const messages = await Message.find({ 
      directMessage: req.params.dmId 
    })
    .populate('sender', 'username avatar')
    .populate('replyTo')
    .sort({ createdAt: 1 })

    res.json(messages)
  } catch (error) {
    console.error('Error al obtener mensajes DM:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// @route   GET /api/users/:id
// @desc    Obtener perfil de usuario
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -email')

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    res.json(user)
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

module.exports = router