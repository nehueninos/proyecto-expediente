const mongoose = require('mongoose');

const expedienteHistorySchema = new mongoose.Schema({
  expedienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expediente',
    required: true
  },
  fromArea: {
    type: String,
    required: true
  },
  toArea: {
    type: String,
    required: true
  },
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  observaciones: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ExpedienteHistory', expedienteHistorySchema);
