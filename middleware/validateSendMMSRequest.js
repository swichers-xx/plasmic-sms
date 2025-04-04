const logger = require('../config/logger');

const validateSendMMSRequest = (req, res, next) => {
  const { projectId, contactId, message, mediaUrl } = req.body;

  let missingFields = [];
  if (!projectId) missingFields.push('projectId');
  if (!contactId) missingFields.push('contactId');
  if (!message) missingFields.push('message');
  if (!mediaUrl) missingFields.push('mediaUrl');

  if (missingFields.length > 0) {
    logger.warn(`Validation failed for sending MMS: Missing required fields: ${missingFields.join(', ')} in request ${JSON.stringify(req.body)}`);
    return res.status(400).send(`Missing required fields: ${missingFields.join(', ')}.`);
  }

  next();
};

module.exports = validateSendMMSRequest;