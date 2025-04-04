const dotenv = require('dotenv');
const logger = require('../config/logger'); // Importing logger for logging

dotenv.config();
let currentIndex = 0;
let messageCount = 0; // Keep track of the number of messages sent
const twilioNumbers = JSON.parse(process.env.TWILIO_NUMBERS);

const getNextTwilioNumber = () => {
  const number = twilioNumbers[currentIndex];
  currentIndex = (currentIndex + 1) % twilioNumbers.length;
  logger.info(`Rotating to the next Twilio number: ${number}`);
  return number;
};

const rotateEveryXMessages = (x) => {
  if (x <= 0) {
    logger.error(`Invalid rotation interval: ${x}. Cannot rotate every X messages.`);
    throw new Error(`Invalid rotation interval: ${x}. Must be a positive integer.`);
  }
  messageCount = (messageCount + 1) % x;
  if (messageCount === 0) {
    getNextTwilioNumber(); // Update currentIndex to the next number
  }
  logger.info(`Rotating every ${x} messages. Current twilio number: ${twilioNumbers[currentIndex]}`);
  return twilioNumbers[currentIndex];
};

const rotateEveryOtherMessage = () => {
  logger.info('Rotating every other message.');
  return rotateEveryXMessages(2);
};

const selectRandomNumber = () => {
  currentIndex = Math.floor(Math.random() * twilioNumbers.length);
  const randomTwilioNumber = twilioNumbers[currentIndex];
  logger.info(`Selected random Twilio number: ${randomTwilioNumber}`);
  return randomTwilioNumber;
};

module.exports = { getNextTwilioNumber, rotateEveryXMessages, rotateEveryOtherMessage, selectRandomNumber };