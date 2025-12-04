const express = require('express')
const { body, validationResult } = require('express-validator')
const Channel = require('../models/Channel')
const Server = require('../models/Server')
const auth = require('../middleware/auth')

const router = express.Router()

// @route   GET /api/channels/server/:serverId
// @desc    Obtener canales de un servidor
// @access  Private
router.get('/server/:serverId', auth, async (req, res) => {
  try {
    const server = await Server.findById(req.params.serverId)
    
    if (!server) {
      return res.status(404).json({ message: 'Servidor no encontrado' })
    }

    // Verificar si el usuario es miembro
    const isMember = server.members.some(
      member => member.user.toString() === req.user._id.toString()
    )

    if (!isMember) {
      return res.status(403).json({ message: 'No tienes acceso a este servidor' })
    }

    const channels = await Channel.find({ server: req.params.serverId })
      .sort({ position: 1, createdAt: 1 })

    res.json(channels)
  } catch (error) {
    console.error('Error al obtener canales:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// @route   POST /api/channels
// @desc    Crear canal
// @access  Private
router.post('/', [
  auth,
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-z0-9\-_]+$/)
    .withMessage('El nombre solo puede contener letras minúsculas, números, guiones y guiones bajos'),
  body('serverId')
    .isMongoId()
    .withMessage('ID de servidor inválido'),
  body('type')
    .optional()
    .isIn(['text', 'voice'])
    .withMessage('Tipo de canal inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Datos inválidos',
        errors: errors.array()
      })
    }

    const { name, serverId, type = 'text', description } = req.body

    // Verificar servidor y permisos
    const server = await Server.findById(serverId)
    
    if (!server) {
      return res.status(404).json({ message: 'Servidor no encontrado' })
    }

    const userMember = server.members.find(
      member => member.user.toString() === req.user._id.toString()
    )

    if (!userMember || (userMember.role !== 'admin' && server.owner.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'No tienes permisos para crear canales' })
    }

    // Verificar si ya existe un canal con ese nombre
    const existingChannel = await Channel.findOne({ 
      name: name.toLowerCase(), 
      server: serverId 
    })

    if (existingChannel) {
      return res.status(400).json({ message: 'Ya existe un canal con ese nombre' })
    }

    // Obtener siguiente posición
    const channelCount = await Channel.countDocuments({ server: serverId })

    // Crear canal
    const channel = new Channel({
      name: name.toLowerCase(),
      description,
      type,
      server: serverId,
      position: channelCount
    })

    await channel.save()

    // Agregar canal al servidor
    server.channels.push(channel._id)
    await server.save()

    res.status(201).json({
      message: 'Canal creado exitosamente',
      channel
    })

  } catch (error) {
    console.error('Error al crear canal:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// @route   PUT /api/channels/:id
// @desc    Actualizar canal
// @access  Private
router.put('/:id', [
  auth,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-z0-9\-_]+$/)
    .withMessage('El nombre solo puede contener letras minúsculas, números, guiones y guiones bajos')
], async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id).populate('server')

    if (!channel) {
      return res.status(404).json({ message: 'Canal no encontrado' })
    }

    // Verificar permisos
    const userMember = channel.server.members.find(
      member => member.user.toString() === req.user._id.toString()
    )

    if (!userMember || (userMember.role !== 'admin' && channel.server.owner.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'No tienes permisos para editar este canal' })
    }

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Datos inválidos',
        errors: errors.array()
      })
    }

    const { name, description, topic, slowMode } = req.body

    // Verificar si el nuevo nombre ya existe (si se está cambiando)
    if (name && name !== channel.name) {
      const existingChannel = await Channel.findOne({
        name: name.toLowerCase(),
        server: channel.server._id,
        _id: { $ne: channel._id }
      })

      if (existingChannel) {
        return res.status(400).json({ message: 'Ya existe un canal con ese nombre' })
      }
      
      channel.name = name.toLowerCase()
    }

    if (description !== undefined) channel.description = description
    if (topic !== undefined) channel.topic = topic
    if (slowMode !== undefined) channel.slowMode = slowMode

    await channel.save()

    res.json({
      message: 'Canal actualizado exitosamente',
      channel
    })

  } catch (error) {
    console.error('Error al actualizar canal:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// @route   DELETE /api/channels/:id
// @desc    Eliminar canal
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id).populate('server')

    if (!channel) {
      return res.status(404).json({ message: 'Canal no encontrado' })
    }

    // No permitir eliminar el canal general
    if (channel.name === 'general') {
      return res.status(400).json({ message: 'No se puede eliminar el canal general' })
    }

    // Verificar permisos
    const userMember = channel.server.members.find(
      member => member.user.toString() === req.user._id.toString()
    )

    if (!userMember || (userMember.role !== 'admin' && channel.server.owner.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'No tienes permisos para eliminar este canal' })
    }

    // Remover canal del servidor
    await Server.findByIdAndUpdate(
      channel.server._id,
      { $pull: { channels: channel._id } }
    )

    // Eliminar canal
    await Channel.findByIdAndDelete(req.params.id)

    res.json({ message: 'Canal eliminado exitosamente' })

  } catch (error) {
    console.error('Error al eliminar canal:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// @route   PUT /api/channels/reorder
// @desc    Reordenar canales
// @access  Private
router.put('/reorder', [
  auth,
  body('channels')
    .isArray()
    .withMessage('Se requiere un array de canales'),
  body('serverId')
    .isMongoId()
    .withMessage('ID de servidor inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Datos inválidos',
        errors: errors.array()
      })
    }

    const { channels, serverId } = req.body

    // Verificar servidor y permisos
    const server = await Server.findById(serverId)
    
    if (!server) {
      return res.status(404).json({ message: 'Servidor no encontrado' })
    }

    const userMember = server.members.find(
      member => member.user.toString() === req.user._id.toString()
    )

    if (!userMember || (userMember.role !== 'admin' && server.owner.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'No tienes permisos para reordenar canales' })
    }

    // Actualizar posiciones
    const updatePromises = channels.map((channelData, index) => {
      return Channel.findByIdAndUpdate(channelData.id, { position: index })
    })

    await Promise.all(updatePromises)

    res.json({ message: 'Canales reordenados exitosamente' })

  } catch (error) {
    console.error('Error al reordenar canales:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

module.exports = router