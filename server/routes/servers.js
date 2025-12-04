const express = require('express')
const { body, validationResult } = require('express-validator')
const Server = require('../models/Server')
const Channel = require('../models/Channel')
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()

// @route   GET /api/servers
// @desc    Obtener servidores del usuario
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'servers',
      populate: {
        path: 'channels',
        select: 'name type position'
      }
    })

    res.json(user.servers)
  } catch (error) {
    console.error('Error al obtener servidores:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// @route   POST /api/servers
// @desc    Crear servidor
// @access  Private
router.post('/', [
  auth,
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('La descripción no puede tener más de 200 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Datos inválidos',
        errors: errors.array()
      })
    }

    const { name, description } = req.body

    // Crear servidor
    const server = new Server({
      name,
      description,
      owner: req.user._id,
      members: [{
        user: req.user._id,
        role: 'admin'
      }]
    })

    await server.save()

    // Crear canal general por defecto
    const generalChannel = new Channel({
      name: 'general',
      server: server._id,
      position: 0
    })

    await generalChannel.save()

    // Agregar canal al servidor
    server.channels.push(generalChannel._id)
    await server.save()

    // Agregar servidor al usuario
    const user = await User.findById(req.user._id)
    user.servers.push(server._id)
    await user.save()

    // Poblar el servidor con datos completos
    const populatedServer = await Server.findById(server._id)
      .populate('channels')
      .populate('members.user', 'username avatar status')

    res.status(201).json({
      message: 'Servidor creado exitosamente',
      server: populatedServer
    })

  } catch (error) {
    console.error('Error al crear servidor:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// @route   POST /api/servers/join
// @desc    Unirse a servidor por código de invitación
// @access  Private
router.post('/join', [
  auth,
  body('inviteCode')
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('El código de invitación debe tener 6 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Código inválido',
        errors: errors.array()
      })
    }

    const { inviteCode } = req.body

    // Buscar servidor por código
    const server = await Server.findOne({ 
      inviteCode: inviteCode.toUpperCase() 
    }).populate('channels')

    if (!server) {
      return res.status(404).json({ message: 'Código de invitación inválido' })
    }

    // Verificar si el usuario ya es miembro
    const isMember = server.members.some(
      member => member.user.toString() === req.user._id.toString()
    )

    if (isMember) {
      return res.status(400).json({ message: 'Ya eres miembro de este servidor' })
    }

    // Verificar límite de miembros
    if (server.members.length >= server.maxMembers) {
      return res.status(400).json({ message: 'El servidor ha alcanzado el límite de miembros' })
    }

    // Agregar usuario al servidor
    server.members.push({
      user: req.user._id,
      role: 'member'
    })
    await server.save()

    // Agregar servidor al usuario
    const user = await User.findById(req.user._id)
    user.servers.push(server._id)
    await user.save()

    // Poblar servidor con datos completos
    const populatedServer = await Server.findById(server._id)
      .populate('channels')
      .populate('members.user', 'username avatar status')

    res.json({
      message: `Te has unido a ${server.name}`,
      server: populatedServer
    })

  } catch (error) {
    console.error('Error al unirse al servidor:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// @route   GET /api/servers/:id
// @desc    Obtener servidor específico
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const server = await Server.findById(req.params.id)
      .populate('channels')
      .populate('members.user', 'username avatar status isOnline')

    if (!server) {
      return res.status(404).json({ message: 'Servidor no encontrado' })
    }

    // Verificar si el usuario es miembro
    const isMember = server.members.some(
      member => member.user._id.toString() === req.user._id.toString()
    )

    if (!isMember) {
      return res.status(403).json({ message: 'No tienes acceso a este servidor' })
    }

    res.json(server)
  } catch (error) {
    console.error('Error al obtener servidor:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// @route   PUT /api/servers/:id
// @desc    Actualizar servidor
// @access  Private
router.put('/:id', [
  auth,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
], async (req, res) => {
  try {
    const server = await Server.findById(req.params.id)

    if (!server) {
      return res.status(404).json({ message: 'Servidor no encontrado' })
    }

    // Verificar permisos (solo owner o admin)
    const userMember = server.members.find(
      member => member.user.toString() === req.user._id.toString()
    )

    if (!userMember || (userMember.role !== 'admin' && server.owner.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'No tienes permisos para editar este servidor' })
    }

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Datos inválidos',
        errors: errors.array()
      })
    }

    // Actualizar campos permitidos
    const { name, description } = req.body
    if (name) server.name = name
    if (description !== undefined) server.description = description

    await server.save()

    res.json({
      message: 'Servidor actualizado exitosamente',
      server
    })

  } catch (error) {
    console.error('Error al actualizar servidor:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// @route   POST /api/servers/:id/leave
// @desc    Salir de un servidor
// @access  Private
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const server = await Server.findById(req.params.id)

    if (!server) {
      return res.status(404).json({ message: 'Servidor no encontrado' })
    }

    // Verificar que el usuario sea miembro
    const memberIndex = server.members.findIndex(
      member => member.user.toString() === req.user._id.toString()
    )

    if (memberIndex === -1) {
      return res.status(400).json({ message: 'No eres miembro de este servidor' })
    }

    // Verificar que no sea el propietario
    if (server.owner.toString() === req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'El propietario no puede salir del servidor. Debes transferir la propiedad primero.' 
      })
    }

    // Remover al usuario de la lista de miembros
    server.members.splice(memberIndex, 1)
    await server.save()

    res.json({
      message: 'Has salido del servidor exitosamente',
      serverId: server._id
    })

  } catch (error) {
    console.error('Error al salir del servidor:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// @route   POST /api/servers/:id/regenerate-invite
// @desc    Regenerar código de invitación
// @access  Private (Solo owner/admin)
router.post('/:id/regenerate-invite', auth, async (req, res) => {
  try {
    const server = await Server.findById(req.params.id)
      .populate('members.user', 'username avatar')
      .populate('channels')

    if (!server) {
      return res.status(404).json({ message: 'Servidor no encontrado' })
    }

    // Verificar permisos (solo owner o admin)
    const userMember = server.members.find(
      member => member.user._id.toString() === req.user._id.toString()
    )

    const canRegenerate = server.owner.toString() === req.user._id.toString() || 
                         (userMember && userMember.role === 'admin')

    if (!canRegenerate) {
      return res.status(403).json({ 
        message: 'No tienes permisos para regenerar el código de invitación' 
      })
    }

    // Generar nuevo código único
    let newCode
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 10) {
      newCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      const existingServer = await Server.findOne({ inviteCode: newCode })
      if (!existingServer) {
        isUnique = true
      }
      attempts++
    }

    if (!isUnique) {
      return res.status(500).json({ 
        message: 'Error al generar código único. Intenta de nuevo.' 
      })
    }

    server.inviteCode = newCode
    await server.save()

    res.json({
      message: 'Código de invitación regenerado exitosamente',
      server: server
    })

  } catch (error) {
    console.error('Error al regenerar código de invitación:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

module.exports = router