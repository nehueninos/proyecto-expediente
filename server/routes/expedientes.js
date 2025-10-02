const express = require('express');
const Expediente = require('../models/Expediente');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { search, estado } = req.query;

    const query = { area: req.user.area };

    if (search) {
      query.$or = [
        { numero: { $regex: search, $options: 'i' } },
        { titulo: { $regex: search, $options: 'i' } },
        { descripcion: { $regex: search, $options: 'i' } }
      ];
    }

    if (estado && estado !== 'all') {
      query.estado = estado;
    }

    const expedientes = await Expediente.find(query)
      .populate('userId', 'username name area')
      .populate('createdBy', 'username name')
      .sort({ createdAt: -1 });

    const formattedExpedientes = expedientes.map(exp => ({
      _id: exp._id,
      id: exp._id,
      numero: exp.numero,
      titulo: exp.titulo,
      descripcion: exp.descripcion,
      area: exp.area,
      estado: exp.estado,
      prioridad: exp.prioridad,
      articulo: exp.articulo,
      user: exp.userId,
      creator: exp.createdBy,
      created_at: exp.createdAt,
      updated_at: exp.updatedAt
    }));

    res.json(formattedExpedientes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { numero, titulo, descripcion, estado, prioridad, articulo } = req.body;

    const existingExpediente = await Expediente.findOne({ numero });
    if (existingExpediente) {
      return res.status(400).json({ message: 'El número de expediente ya existe' });
    }

    if (!articulo) {
      return res.status(400).json({ message: 'El artículo de la Ley 24.240 es requerido' });
    }

    const expediente = new Expediente({
      numero,
      titulo,
      descripcion,
      area: req.user.area,
      estado: estado || 'pendiente',
      prioridad: prioridad || 'media',
      articulo,
      userId: req.user._id,
      createdBy: req.user._id
    });

    await expediente.save();

    const populatedExpediente = await Expediente.findById(expediente._id)
      .populate('userId', 'username name area')
      .populate('createdBy', 'username name');

    res.status(201).json(populatedExpediente);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
