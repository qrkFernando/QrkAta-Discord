const mongoose = require('mongoose')

const serverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del servidor es obligatorio'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  description: {
    type: String,
    maxlength: [200, 'La descripción no puede tener más de 200 caracteres']
  },
  icon: {
    type: String,
    default: null
  },
  inviteCode: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      return Math.random().toString(36).substring(2, 8).toUpperCase()
    }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  channels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel'
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  maxMembers: {
    type: Number,
    default: 100
  }
}, {
  timestamps: true
})

// Generar código de invitación único si no existe
serverSchema.pre('validate', function() {
  if (!this.inviteCode) {
    this.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()
  }
})

module.exports = mongoose.model('Server', serverSchema)