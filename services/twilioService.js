const twilio = require('twilio');
const dotenv = require('dotenv');
const Message = require('../models/Message'); 
const { rotateEveryXMessages, rotateEveryOtherMessage, selectRandomNumber, getNextTwilioNumber } = require('../utils/numberRotation');
const logger = require('../config/logger');
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

function getFromNumber() {
  const strategy = process.env.NUMBER_ROTATION_STRATEGY;
  const interval = parseInt(process.env.NUMBER_ROTATION_INTERVAL) || 10;

  switch (strategy) {
    case 'rotateEveryXMessages':
      return rotateEveryXMessages(interval);
    case 'rotateEveryOtherMessage':
      return rotateEveryOtherMessage();
    case 'selectRandomNumber':
      return selectRandomNumber();
    default:
      logger.warn(`Invalid or undefined rotation strategy '${strategy}'. Falling back to 'getNextTwilioNumber'`);
      return getNextTwilioNumber();
  }
}

const sendSMS = async (to, bodyTemplate, projectId, data) => {
  console.log(`sendSMS called with to: ${to}, projectId: ${projectId}`); // gpt_pilot_debugging_log
  try {
    const from = getFromNumber();
    const body = bodyTemplate.replace(/\{(\w+?)\}/g, (match, key) => data[key.trim()] || match);
    const messageResponse = await client.messages.create({
      body,
      to,  
      from,
    });
    logger.info(`SMS Sent: ${messageResponse.sid}`);
    const message = new Message({
      from, to, body, projectId,
      messageSid: messageResponse.sid,
    });
    await message.save();
    logger.info(`SMS saved with SID: ${messageResponse.sid}`);
    return message;
  } catch (error) {
    logger.error(`Error sending SMS: ${error.message}`, { errorStack: error.stack });
    throw new Error('Failed to send SMS');
  }
}

const sendSingleSMS = async (to, body, projectId) => {
  try {
    const from = getFromNumber(); // Use dynamic from number 
    const messageResponse = await client.messages.create({
      body,
      to,
      from,
    });
    logger.info(`Single SMS Sent successfully with SID: ${messageResponse.sid}`);
    const message = new Message({
      from, to, body, projectId,
      messageSid: messageResponse.sid,
    });
    await message.save();
    logger.info(`SMS saved with SID: ${messageResponse.sid}`);
    return message;
  } catch (error) {
    logger.error(`Error in sending single SMS: ${error.message}`, { errorStack: error.stack });
    throw new Error(`Failed to send single SMS due to error: ${error}`);
  }
};

const sendMMS = async (to, body, projectId, mediaUrl) => {
  try {
    const from = getFromNumber(); // Use dynamic from number 
    const messageResponse = await client.messages.create({
      body: body,
      to: to,
      from: from,
      mediaUrl: [mediaUrl],
    });
    logger.info(`MMS Sent: ${messageResponse.sid}`);
    const message = new Message({
      from, to, body, projectId,
      messageSid: messageResponse.sid,
      mediaUrl,
    });
    await message.save();
    logger.info(`MMS saved with SID: ${messageResponse.sid}`);
    return message;
  } catch (error) {
    logger.error(`Error sending MMS: ${error.message}`, { cause: error.stack });
    throw new Error('Failed to send MMS');
  }
};

module.exports = {
  sendSMS,
  sendSingleSMS,
  sendMMS,
};