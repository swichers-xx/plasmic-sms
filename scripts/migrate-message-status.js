const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Message = require('../models/Message');
const MessageStatus = require('../models/MessageStatus');

async function migrateData() {
  dotenv.config();
  await mongoose.connect(process.env.DB_URI);

  const messages = await Message.find({});

  for (const message of messages) {
    const messageStatus = await MessageStatus.findOne({ messageSid: message.messageSid });
    if (messageStatus) {
      message.deliveryStatus = messageStatus._id;
      await message.save().catch(err => console.log(`Error updating message ${message._id}:`, err));
      console.log(`Updated message ${message._id} with delivery status ${messageStatus._id}`);
    }
  }

  console.log('Migration completed');
  process.exit(0);
}

migrateData().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});