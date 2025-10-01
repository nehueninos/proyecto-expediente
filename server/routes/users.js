const express = require('express');
const User = require('../models/User');
const ExpedienteHistory = require('../models/ExpedienteHistory');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/by-area/:area', auth, async (req, res) => {
  try {
    const users = await User.find({ area: req.params.area })
      .select('id username name area')
      .sort({ name: 1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/history/:expedienteId', auth, async (req, res) => {
  try {
    const history = await ExpedienteHistory.find({ expedienteId: req.params.expedienteId })
      .populate('fromUserId', 'username name')
      .populate('toUserId', 'username name')
      .sort({ createdAt: -1 });

    const formattedHistory = history.map(record => ({
      id: record._id,
      expediente_id: record.expedienteId,
      from_area: record.fromArea,
      to_area: record.toArea,
      from_user: record.fromUserId,
      to_user: record.toUserId,
      observaciones: record.observaciones,
      created_at: record.createdAt
    }));

    res.json(formattedHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
