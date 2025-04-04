const Conversation = require('../models/Conversation');
const logger = require('../config/logger');

async function updateOrCreateConversationByPhone(contactPhone, messageId) {
  try {
    let conversation = await Conversation.findOne({ contactPhone });
    if (!conversation) {
      conversation = new Conversation({ contactPhone, messages: [messageId] });
    } else {
      conversation.messages.push(messageId);
    }
    await conversation.save();
    logger.info(`Conversation updated or created for contactPhone: ${contactPhone}`);
    return conversation;
  } catch (error) {
    logger.error(`Error updating or creating conversation for contactPhone: ${contactPhone}: ${error}`, {error: error.message, stack: error.stack});
    throw error;
  }
}

module.exports = { updateOrCreateConversationByPhone };
