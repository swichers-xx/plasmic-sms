const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  data: [{
    type: mongoose.Schema.Types.Mixed // Enabling dynamic column storage.
  }]
}, { timestamps: true, strict: false }); // `strict: false` allows the model to store fields not represented in the schema

module.exports = mongoose.model('Project', projectSchema);