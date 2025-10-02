const mongoose = require('mongoose');

const expedienteSchema = new mongoose.Schema({
  numero: {
    type: String,
    required: true,
    unique: true
  },
  titulo: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    default: ''
  },
  area: {
    type: String,
    required: true,
    enum: ['mesa_entrada', 'area_legal', 'area_tecnica', 'area_administrativa', 'direccion']
  },
  estado: {
    type: String,
    required: true,
    default: 'pendiente',
    enum: ['pendiente', 'en_proceso', 'resuelto']
  },
  prioridad: {
    type: String,
    required: true,
    default: 'media',
    enum: ['baja', 'media', 'alta']
  },
  articulo: {
    type: String,
    required: true,
    enum: ['1', '2', '3', '4', '5', '6']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expediente', expedienteSchema);
