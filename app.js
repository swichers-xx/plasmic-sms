const express = require('express');
const WebSocket = require('ws'); // WebSocket package added
require('./db'); // MongoDB connection initialization
const app = express();
const port = 3001;
const http = require('http');
const server = http.createServer(app);
const logger = require('./config/logger');

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Enable URL-encoded body parsing

// Serving static files from 'public' directory
app.use(express.static('public')); // This line enables Express to serve the files located in the 'public' directory.
logger.info("Serving static files from 'public' directory."); // Log serving static files

app.get('/ping', (req, res) => {
  res.status(200).send('Server is up and running');
  logger.info('Ping endpoint was called, server confirmed running.'); // Log ping endpoint call
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const projectRoutes = require('./routes/projectRoutes');
app.use('/api/projects', projectRoutes);

const smsRoutes = require('./routes/smsRoutes');
app.use('/api/sms', smsRoutes);

const messageRoutes = require('./routes/messageRoutes');
app.use('/api/messages', messageRoutes);

const analyticsRoutes = require('./routes/analyticsRoutes');
app.use('/api/analytics', analyticsRoutes);

const conversationRoutes = require('./routes/conversationRoutes');
app.use('/api', conversationRoutes);

const smsSendingRoutes = require('./routes/smsSendingRoutes');
app.use('/api/sms', smsSendingRoutes); // Log mounting smsSendingRoutes
logger.info('smsSendingRoutes mounted on /api/sms');

const bulkSmsActionsRoutes = require('./routes/bulkSmsActions');
app.use('/api', bulkSmsActionsRoutes); // Log mounting bulkSmsActionsRoutes
logger.info('Bulk SMS actions routes mounted on /api');

// Debugging log before initializing WebSocket Server
console.log('Initializing WebSocket Server'); // gpt_pilot_debugging_log
// WebSocket server initialization
const wss = new WebSocket.Server({ server });
// Debugging log after initializing WebSocket Server
console.log('WebSocket Server Initialized'); // gpt_pilot_debugging_log
global.clients = []; // Global array to manage connected WebSocket clients

// Configure WebSocket server with event listeners
wss.on('connection', (ws) => {
    logger.info('Client connected to WebSocket'); // Log client connections
    clients.push(ws);

    ws.on('message', (message) => {
        logger.info(`Received message from client: ${message}`); // Log received messages
    });

    ws.on('close', () => {
        logger.info('Client disconnected'); // Log client disconnections
        clients = clients.filter(client => client !== ws);
    });

    ws.on('error', (error) => {
        logger.error('WebSocket error:', error); // Log WebSocket errors
    });
});

// Function to allow broadcasting to all connected clients
global.broadcastMessage = (data) => {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            console.log(`Broadcasting message to client with readyState: ${client.readyState}`); // gpt_pilot_debugging_log
            try {
                client.send(JSON.stringify({ message: data }), (error) => {
                    if (error) {
                        logger.error('Error broadcasting message:', error); // Log broadcasting errors
                    }
                });
            } catch (error) {
                logger.error(`Error sending message: ${error.message}`, { errorStack: error.stack }); // Log error with stack trace
            }
        }
    });
    logger.info('Broadcasted message to all connected clients'); // Log message broadcasting
};

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  logger.info('WebSocket Server initialized.'); // Log WebSocket server initialization
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  logger.error(`Unhandled Rejection at: ${promise} reason: ${reason}`, { error: reason, stack: reason.stack }); // Log unhandled rejections with error trace
});

process.on('uncaughtException', (err, origin) => {
  console.error(`Caught exception: ${err}`, `Exception origin: ${origin}`);
  logger.error(`Caught exception: ${err}. Exception origin: ${origin}`, { error: err, stack: err.stack }); // Log uncaught exceptions with error trace
});