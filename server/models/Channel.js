const mongoose = require('mongoose')

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del canal es obligatorio'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  description: {
    type: String,
    maxlength: [200, 'La descripción no puede tener más de 200 caracteres']
  },
  type: {
    type: String,
    enum: ['text', 'voice'],
    default: 'text'
  },
  server: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Server',
    required: true
  },
  position: {
    type: Number,
    default: 0
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  allowedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  topic: {
    type: String,
    maxlength: [100, 'El tema no puede tener más de 100 caracteres']
  },
  slowMode: {
    type: Number,
    default: 0 // Segundos entre mensajes
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Channel', channelSchema)