const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password, name, area } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'El nombre de usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
      name,
      area,
      role: 'user'
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        area: user.area,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        area: user.area,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Sesión cerrada exitosamente' });
});

module.exports = router;
