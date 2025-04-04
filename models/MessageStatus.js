const mongoose = require('mongoose');

const messageStatusSchema = new mongoose.Schema({
  messageSid: {
    type: String,
    required: [true, 'Message SID is required'],
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
  },
  to: {
    type: String,
    required: [true, 'Recipient phone number is required'],
  }
}, { timestamps: true });

messageStatusSchema.post('save', function(doc) {
  console.log(`Message status with SID ${doc.messageSid} saved`);
}).post('save', function(error, doc, next) {
  if (error) {
    console.error(`Error saving message status for SID ${doc.messageSid}: ${error}`, error.stack);
    next(error);
  } else {
    next();
  }
});

module.exports = mongoose.model('MessageStatus', messageStatusSchema);