const WebSocket = require('ws');
const Message = require('../models/Message');

const initWebSocketServer = (server) => {
  const wss = new WebSocket.Server({ server });
  global.clients = []; // Initialize an empty array to keep track of clients

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket'); // Log when a client connects
    clients.push(ws); // Add the new WebSocket connection to the clients array

    ws.on('message', (message) => {
      console.log(`Received message from client: ${message}`); // Log received messages (for future features or debug)
    });

    ws.on('close', () => {
      console.log('Client disconnected'); // Log when a client disconnects
      clients = clients.filter(client => client !== ws); // Remove the disconnected client from the clients array
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error); // Log WebSocket errors
    });
  });

  global.broadcastMessage = (data) => {
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data), (error) => {
          if (error) {
            console.error('Error broadcasting message:', error); // Log any errors that occur during broadcasting
          }
        });
      }
    });essage to all connected clients'); // Log when a message is broadcasted
  };
};

module.exports = initWebSocke
    console.log('Broadcasted mtServer;