const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    logger.info('Attempting user registration');
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      logger.warn('Registration attempted with existing username or email');
      return res.status(400).send('User already exists');
    }

    const user = new User({ username, email, password });
    await user.save();

    logger.info('User created successfully');
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    logger.error('Error during user registration:', { error: error.message, stack: error.stack });
    next(error); // Propagate the error to the error handling middleware
  }
});

router.post('/login', async (req, res, next) => {
  try {
    logger.info('Attempting user login');
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      logger.warn('Login attempted with non-existent username');
      return res.status(400).send('User does not exist');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn('Invalid password attempt for user login');
      return res.status(400).send('Invalid password');
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });

    logger.info('User logged in successfully');
    res.json({ token });
  } catch (error) {
    logger.error('Error during user login:', { error: error.message, stack: error.stack });
    next(error); // Propagate the error to the error handling middleware
  }
});

module.exports = router;