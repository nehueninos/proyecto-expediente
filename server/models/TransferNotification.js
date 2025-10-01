const mongoose = require('mongoose');

const transferNotificationSchema = new mongoose.Schema({
  expedienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expediente',
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
  toArea: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: 'pending',
    enum: ['pending', 'accepted', 'rejected']
  },
  message: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TransferNotification', transferNotificationSchema);
