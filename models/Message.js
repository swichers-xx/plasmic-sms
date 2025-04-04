const mongoose = require('mongoose');
const logger = require('../config/logger'); // Import logger configuration

const messageSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: false
  },
  replied: {
    type: Boolean,
    default: false
  },
  messageSid: {
    type: String,
    required: true
  },
  mediaUrl: {
    type: String,
    required: false // This field is not required for all messages, only MMS
  },
  deliveryStatus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MessageStatus'
  }
}, { timestamps: true });

messageSchema.post('save', (doc, next) => {
  logger.info(`Message with SID ${doc.messageSid} saved successfully.`); // Logging after saving a document
  next();
});

messageSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    logger.error(`Error saving message with SID ${doc.messageSid}: Duplicate Key Error`, { error: error.message, stack: error.stack }); // Logging in case of duplicate key error
    next(new Error('There was a duplicate key error'));
  } else if (error) {
    logger.error(`Error saving message with SID ${doc.messageSid}: ${error}`, { error: error.message, stack: error.stack }); // Logging general errors
    next(error);
  } else {
    next();
  }
});

module.exports = mongoose.model('Message', messageSchema);
