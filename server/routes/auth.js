const express = require('express')
const { body, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()

// Generar JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  })
}

// @route   POST /api/auth/register
// @desc    Registrar usuario
// @access  Public
router.post('/register', [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('El nombre de usuario debe tener entre 3 y 20 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Datos inválidos',
        errors: errors.array()
      })
    }

    const { username, email, password } = req.body

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    })

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email 
          ? 'El email ya está registrado'
          : 'El nombre de usuario ya existe'
      })
    }

    // Crear usuario
    const user = new User({ username, email, password })
    await user.save()

    // Generar token
    const token = generateToken(user._id)

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      token,
      user: user.toPublic()
    })

  } catch (error) {
    console.error('Error en registro:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// @route   POST /api/auth/login
// @desc    Iniciar sesión
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es obligatoria')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Datos inválidos',
        errors: errors.array()
      })
    }

    const { email, password } = req.body

    // Buscar usuario
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas' })
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' })
    }

    // Actualizar estado a online
    user.status = 'online'
    user.isOnline = true
    user.lastSeen = new Date()
    await user.save()

    // Generar token
    const token = generateToken(user._id)

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: user.toPublic()
    })

  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// @route   GET /api/auth/me
// @desc    Obtener usuario actual
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('servers', 'name icon')
      .select('-password')

    res.json(user.toPublic())
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// @route   POST /api/auth/logout
// @desc    Cerrar sesión
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    user.status = 'offline'
    user.isOnline = false
    user.lastSeen = new Date()
    await user.save()

    res.json({ message: 'Sesión cerrada exitosamente' })
  } catch (error) {
    console.error('Error en logout:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

module.exports = router