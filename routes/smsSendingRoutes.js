const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { sendMMS } = require('../services/twilioService');
const { getNextTwilioNumber } = require('../utils/numberRotation');
const logger = require('../config/logger');
const validateSendMMSRequest = require('../middleware/validateSendMMSRequest');

router.post('/send-mms', validateSendMMSRequest, async (req, res) => {
  logger.info(`Received request to /send-mms with body: ${JSON.stringify(req.body)}`); // gpt_pilot_debugging_log
  const { projectId, contactId, message, mediaUrl } = req.body;
  logger.info(`Attempting to send MMS - Project ID: ${projectId}, Contact ID: ${contactId}, Media URL: ${mediaUrl}`);
  
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      logger.warn('Send MMS - project not found');
      return res.status(404).send('Project not found');
    }
  
    const contact = project.data.find(contact => contact._id.toString() === contactId);
    if (!contact) {
      logger.warn('Send MMS - Contact not found within project');
      return res.status(404).send('Contact not found within project.');
    }
  
    const fromNumber = getNextTwilioNumber();
    const sentMessage = await sendMMS(contact.phone, message, fromNumber, projectId, mediaUrl);
    logger.info(`MMS sent successfully to ${contact.phone} with SID ${sentMessage.messageSid}`);
    res.status(200).json({ message: 'MMS sent successfully', messageId: sentMessage._id });
  } catch (error) {
    logger.error('Error sending MMS:', { message: error.message, stack: error.stack });
    res.status(500).send('Failed to send MMS');
  }
});

module.exports = router;