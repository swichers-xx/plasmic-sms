const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  contactPhone: {
    type: String,
    required: true,
    index: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    required: true,
  }]
}, { timestamps: true });

conversationSchema.post('save', function(doc) {
  console.log(`Conversation with ID ${doc._id} saved, linked to project ID ${doc.projectId}.`);
}).post('save', function(error, doc, next) {
  if (error) {
    console.error(`Error saving conversation linked to project ID ${doc.projectId}: ${error}`, error.stack);
    next(error);
  } else {
    next();
  }
});

module.exports = mongoose.model('Conversation', conversationSchema);