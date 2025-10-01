const express = require('express');
const Expediente = require('../models/Expediente');
const User = require('../models/User');
const TransferNotification = require('../models/TransferNotification');
const ExpedienteHistory = require('../models/ExpedienteHistory');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/request', auth, async (req, res) => {
  try {
    const { expedienteId, toUserId, message } = req.body;

    const expediente = await Expediente.findById(expedienteId);
    if (!expediente) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }

    if (expediente.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No tienes permisos para transferir este expediente' });
    }

    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return res.status(404).json({ message: 'Usuario destinatario no encontrado' });
    }

    const notification = new TransferNotification({
      expedienteId,
      fromUserId: req.user._id,
      toUserId,
      toArea: toUser.area,
      message: message || '',
      status: 'pending'
    });

    await notification.save();

    const populatedNotification = await TransferNotification.findById(notification._id)
      .populate('expedienteId')
      .populate('fromUserId', 'username name area')
      .populate('toUserId', 'username name area');

    res.status(201).json(populatedNotification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/notifications', auth, async (req, res) => {
  try {
    const notifications = await TransferNotification.find({
      toUserId: req.user._id,
      status: 'pending'
    })
      .populate('expedienteId')
      .populate('fromUserId', 'username name area')
      .sort({ createdAt: -1 });

    const formattedNotifications = notifications.map(notif => ({
      id: notif._id,
      expediente: notif.expedienteId,
      from_user: notif.fromUserId,
      to_user_id: notif.toUserId,
      to_area: notif.toArea,
      status: notif.status,
      message: notif.message,
      created_at: notif.createdAt,
      updated_at: notif.updatedAt
    }));

    res.json(formattedNotifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/accept/:notificationId', auth, async (req, res) => {
  try {
    const notification = await TransferNotification.findById(req.params.notificationId)
      .populate('expedienteId');

    if (!notification) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    if (notification.toUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No tienes permisos para aceptar esta transferencia' });
    }

    notification.status = 'accepted';
    await notification.save();

    const expediente = notification.expedienteId;
    const oldArea = expediente.area;

    expediente.userId = req.user._id;
    expediente.area = req.user.area;
    await expediente.save();

    const history = new ExpedienteHistory({
      expedienteId: expediente._id,
      fromArea: oldArea,
      toArea: req.user.area,
      fromUserId: notification.fromUserId,
      toUserId: req.user._id,
      observaciones: notification.message
    });

    await history.save();

    res.json({ success: true, message: 'Transferencia aceptada' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/reject/:notificationId', auth, async (req, res) => {
  try {
    const notification = await TransferNotification.findById(req.params.notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    if (notification.toUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No tienes permisos para rechazar esta transferencia' });
    }

    notification.status = 'rejected';
    await notification.save();

    res.json({ success: true, message: 'Transferencia rechazada' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
