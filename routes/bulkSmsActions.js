const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { sendMMS } = require('../services/twilioService');
const logger = require('../config/logger');

router.post('/send-bulk-mms', async (req, res) => {
  const { projectId, contactIds, message, mediaUrl } = req.body;
  if (!projectId || !contactIds || !Array.isArray(contactIds) || contactIds.length === 0 || !message || !mediaUrl) {
    return res.status(400).send({ error: "Missing required fields: projectId, contactIds, message, or mediaUrl." });
  }

  try {
    const project = await Project.findById(projectId).exec();
    if (!project) {
      return res.status(404).send({ error: "Project not found." });
    }

    const contactsToSend = project.data.filter(contact => contactIds.includes(contact._id.toString()));
    const sendMmsPromises = contactsToSend.map(contact => sendMMS(contact.phone, message, projectId, mediaUrl));

    const results = await Promise.allSettled(sendMmsPromises);

    const summary = results.reduce((acc, result) => {
      if (result.status === 'fulfilled') {
        acc.success.push(result.value);
      } else {
        logger.error('Failed to send MMS:', { error: result.reason });
        acc.failed.push(result.reason);
      }
      return acc;
    }, { success: [], failed: [] });

    logger.info(`Bulk MMS send operation completed. Success: ${summary.success.length}, Failed: ${summary.failed.length}`);
    res.status(200).send(summary);
  } catch (error) {
    logger.error('Error sending bulk MMS:', { message: error.message, stack: error.stack });
    res.status(500).send({ error: "Failed to send bulk MMS." });
  }
});

module.exports = router;
