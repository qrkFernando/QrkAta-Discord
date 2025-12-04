const mongoose = require('mongoose')

const directMessageSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Asegurar que solo haya 2 participantes
directMessageSchema.pre('validate', function() {
  if (this.participants.length !== 2) {
    throw new Error('Un mensaje directo debe tener exactamente 2 participantes')
  }
})

// Índice para búsquedas rápidas
directMessageSchema.index({ participants: 1 })

module.exports = mongoose.model('DirectMessage', directMessageSchema)