const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const connectDB = require('./config/database')
const authRoutes = require('./routes/auth')
const serverRoutes = require('./routes/servers')
const channelRoutes = require('./routes/channels')
const messageRoutes = require('./routes/messages')
const userRoutes = require('./routes/users')

const { authenticateSocket } = require('./middleware/socketAuth')
const socketHandlers = require('./controllers/socketController')

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

// Conectar a MongoDB
connectDB()

// Middleware de seguridad
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests por IP
})
app.use('/api/', limiter)

// CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'))

// Rutas de la API
app.use('/api/auth', authRoutes)
app.use('/api/servers', serverRoutes)
app.use('/api/channels', channelRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/users', userRoutes)

// Hacer que io esté disponible en las rutas
app.set('io', io)

// Middleware de autenticación para Socket.IO
io.use(authenticateSocket)

// Manejar conexiones de Socket.IO
io.on('connection', (socket) => {
  console.log(`Usuario conectado: ${socket.user.username}`)
  socketHandlers.handleConnection(io, socket)
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})