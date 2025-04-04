const express = require('express');
const router = express.Router();
const MessageStatus = require('../models/MessageStatus');
const logger = require('../config/logger');

router.post('/delivery-status', async (req, res) => {
  const { MessageSid, MessageStatus: status, To } = req.body;

  if (!MessageSid || !status || !To) {
    logger.error('Delivery Status Update - Missing required fields', { error: 'Missing MessageSid, MessageStatus, or To.' });
    return res.status(400).send({ error: 'Missing required fields: MessageSid, MessageStatus, and To.' });
  }

  try {
    const messageStatus = new MessageStatus({
      messageSid: MessageSid,
      status,
      to: To,
    });
    await messageStatus.save();
    
    logger.info(`Delivery Status Received and saved - SID: ${MessageSid}, Status: ${status}, To: ${To}`);
    res.status(200).send({ message: 'Delivery status received and saved successfully.' });
  } catch (error) {
    logger.error(`Error processing delivery status: ${error}`, { error: error.message, stack: error.stack });
    res.status(500).send({ error: 'Failed to process delivery status update.' });
  }
});

module.exports = router;