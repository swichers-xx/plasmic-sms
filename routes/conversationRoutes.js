const express = require('express');
const Conversation = require('../models/Conversation');
const logger = require('../config/logger');
const router = express.Router();

router.get('/conversations/:projectId', async (req, res) => {
  logger.info(`Fetching conversations for project ${req.params.projectId}`);
  try {
    const projectId = req.params.projectId;
    const conversations = await Conversation.find({ projectId })
      .populate({
        path: 'messages',
        options: { sort: {'createdAt': 1} }
      }).exec();
    
    res.status(200).json(conversations);
  } catch (error) {
    logger.error(`Error fetching conversations for projectId ${req.params.projectId}: ${error}`, error.stack);
    res.status(500).send('Failed to fetch conversations');
  }
});

module.exports = router;