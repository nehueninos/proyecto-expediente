const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  area: {
    type: String,
    required: true,
    enum: ['mesa_entrada', 'area_legal', 'area_tecnica', 'area_administrativa', 'direccion']
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
