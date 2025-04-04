const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { sendSMS, sendSingleSMS, sendMMS } = require('../services/twilioService'); // Assuming sendMMS is exported from twilioService
const { getNextTwilioNumber } = require('../utils/numberRotation');
const logger = require('../config/logger');
const MessageStatus = require('../models/MessageStatus'); // Import MessageStatus model
const validateSendMMSRequest = require('../middleware/validateSendMMSRequest');

router.post('/send-sms', async (req, res) => {
  try {
    logger.info('Send SMS - processing request');
    const { projectId, messageTemplate } = req.body;
    const project = await Project.findById(projectId);
    if (!project) {
      logger.warn('Send SMS - project not found');
      return res.status(404).send('Project not found');
    }

    for (const data of project.data) {
      const personalizedMessage = messageTemplate.replace(/{(.+?)}/g, (match, p1) => data[p1.trim()] || match);
      const fromNumber = getNextTwilioNumber();
      await sendSMS(data.phone, personalizedMessage, fromNumber, projectId);
      logger.info(`SMS sent successfully to ${data.phone} with message: ${personalizedMessage}`);
    }
    logger.info('Send SMS - All messages sent successfully');
    return res.status(200).send('SMS sent successfully');
  } catch (error) {
    logger.error('Error sending SMS:', { message: error.message, stack: error.stack });
    return res.status(500).send('Failed to send SMS');
  }
});

router.post('/send-single-sms', async (req, res) => {
  const { contactId, projectId, message } = req.body;

  if (!contactId || !projectId || !message) {
    logger.warn('Send Single SMS - Missing required fields');
    return res.status(400).send('Missing required fields: contactId, projectId, and message.');
  }

  try {
    logger.info('Send Single SMS - Processing request');
    const project = await Project.findById(projectId);
    if (!project) {
      logger.warn('Send Single SMS - Project not found');
      return res.status(404).send('Project not found.');
    }

    const contact = project.data.find(c => c._id.toString() === contactId);
    if (!contact) {
      logger.warn('Send Single SMS - Contact not found within project');
      return res.status(404).send('Contact not found within project.');
    }

    const fromNumber = getNextTwilioNumber();
    try {
      logger.info(`Original Message: ${message}`); // gpt_pilot_debugging_log
      logger.info(`Contact Data: ${JSON.stringify(contact)}`); // gpt_pilot_debugging_log

      const personalizedMessage = message.replace(/{(.+?)}/g, (match, p1) => contact[p1.trim()] || match);
      await sendSingleSMS(contact.phone, personalizedMessage, fromNumber, projectId);
      logger.info(`Processed personalized message: ${personalizedMessage}`);
      logger.info(`Send Single SMS - SMS to ${contact.phone} queued for sending`);
      return res.status(200).send(`SMS to ${contact.phone} queued for sending: [Message] ${personalizedMessage}`);
    } catch (error) {
      logger.error(`Error processing message for contact ${contactId}:`, error, error.stack);
      return res.status(500).send('Failed to process message template');
    }
  } catch (error) {
    logger.error('Error sending single SMS:', error, error.stack);
    return res.status(500).send('Failed to send single SMS');
  }
});

router.post('/send-mms', validateSendMMSRequest, async (req, res) => {
  const { projectId, contactId, message, mediaUrl } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      logger.error('Send MMS - Project not found');
      return res.status(404).send('Project not found');
    }

    const contact = project.data.find(contact => contact._id.toString() === contactId);
    if (!contact) {
      logger.error('Send MMS - Contact not found within project');
      return res.status(404).send('Contact not found within project.');
    }

    const fromNumber = getNextTwilioNumber();
    const sentMessage = await sendMMS(contact.phone, message, fromNumber, projectId, mediaUrl);

    logger.info(`MMS sent successfully to ${contact.phone} with SID: ${sentMessage.messageSid}`);
    res.status(200).json({
      message: 'MMS sent successfully',
      messageId: sentMessage._id,
      messageSid: sentMessage.messageSid
    });
  } catch (error) {
    logger.error(`Error sending MMS: ${error}`, { error: error.message, stack: error.stack });
    res.status(500).send('Failed to send MMS');
  }
});

module.exports = router;