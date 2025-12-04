const mongoose = require('mongoose')

const reactionSchema = new mongoose.Schema({
  emoji: {
    type: String,
    required: true
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
})

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'El contenido del mensaje es obligatorio'],
    maxlength: [2000, 'El mensaje no puede tener más de 2000 caracteres']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: function() {
      return !this.directMessage
    }
  },
  directMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DirectMessage',
    required: function() {
      return !this.channel
    }
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  }],
  reactions: [reactionSchema],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  thread: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  pinned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Índices para mejorar rendimiento
messageSchema.index({ channel: 1, createdAt: -1 })
messageSchema.index({ directMessage: 1, createdAt: -1 })
messageSchema.index({ sender: 1 })

module.exports = mongoose.model('Message', messageSchema)