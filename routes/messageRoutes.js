const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { sendSMS, sendSingleSMS } = require('../services/twilioService');
const { getNextTwilioNumber } = require('../utils/numberRotation');
const logger = require('../config/logger');
const { updateOrCreateConversationByPhone } = require('../utils/conversations');

router.get('/inbox', async (req, res) => {
  try {
    const messages = await Message.find({}).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error(`Error getting inbox messages: ${error}`, error.stack); // gpt_pilot_debugging_log
    res.status(500).send('Failed to get inbox messages');
  }
});

router.post('/inbox', async (req, res) => {
  const { From, To, Body, MessageSid } = req.body;
  if (!From || !To || !Body || !MessageSid) {
    logger.warn(`Required fields missing. From: ${From}, To: ${To}, Body: ${Body}, MessageSid: ${MessageSid}`);
    return res.status(400).send('Missing required fields: From, To, Body, MessageSid.');
  }
  try {
    const newMessage = new Message({ from: From, to: To, body: Body, messageSid: MessageSid, projectId: null });
    await newMessage.save();
    logger.info(`New message saved with SID ${newMessage.messageSid}`);

    console.log(`Broadcasting message. From: ${From}, To: ${To}, Body: ${Body}, MessageSid: ${MessageSid}`); // gpt_pilot_debugging_log

    global.broadcastMessage({ from: From, to: To, body: Body, messageSid: MessageSid });
    logger.info(`Broadcasted message from ${From} to ${To}`);

    res.status(201).send('Message stored');
  } catch (error) {
    logger.error(`Error storing incoming message: ${error}`, error.stack);
    res.status(500).send('Failed to store message');
  }
});

router.post('/reply', async (req, res) => {
  const { messageId, response } = req.body;
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      logger.error(`Message not found: ${messageId}`);
      return res.status(404).send('Message not found');
    }
    const fromNumber = getNextTwilioNumber();
    await sendSMS(message.from, response, fromNumber);
    await Message.findByIdAndUpdate(messageId, { replied: true });
    logger.info(`Reply sent successfully for message: ${messageId}`);
    res.send('Reply sent successfully');
  } catch (error) {
    logger.error(`Error sending reply: ${error}`, { error: error.message, stack: error.stack });
    res.status(500).send('Failed to send reply');
  }
});

router.post('/start-conversation', async (req, res) => {
  try {
    const { projectId, contactPhone, messageBody } = req.body;
    if (!projectId || !contactPhone || !messageBody) {
      return res.status(400).send('Missing required fields');
    }
    let conversation = await Conversation.findOne({ contactPhone, projectId });
    if (!conversation) {
      conversation = new Conversation({
        contactPhone,
        projectId,
        messages: []
      });
    }
    const fromNumber = getNextTwilioNumber();
    const messageDocument = await sendSingleSMS(contactPhone, messageBody, fromNumber, projectId);
    await updateOrCreateConversation(projectId, contactPhone, messageDocument._id);
    conversation.messages.push(messageDocument._id);
    await conversation.save();
    logger.info(`Conversation saved successfully for contactPhone: ${contactPhone} with conversationId: ${conversation._id}`);
    res.status(201).json({ message: 'Conversation started successfully', conversationId: conversation._id });
  } catch (error) {
    logger.error(`Error starting new conversation: ${error}`, { error: error.message, stack: error.stack });
    res.status(500).send('Failed to start conversation');
  }
});

module.exports = router;