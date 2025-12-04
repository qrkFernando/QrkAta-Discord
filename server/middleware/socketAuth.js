const jwt = require('jsonwebtoken')
const User = require('../models/User')

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token

    if (!token) {
      return next(new Error('No se proporcionó token'))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return next(new Error('Usuario no encontrado'))
    }

    socket.user = user
    next()
  } catch (error) {
    next(new Error('Token inválido'))
  }
}

module.exports = { authenticateSocket }