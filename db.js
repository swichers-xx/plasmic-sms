const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const dbURI = process.env.DB_URI;

mongoose.connect(dbURI)
  .then(() => {
    console.log('MongoDB Connected...');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.error('Error trace:', err.stack);
  });