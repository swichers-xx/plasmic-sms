// Establish a WebSocket connection to the server
const serverUrl = `ws://${window.location.hostname}:${window.location.port}`;
const webSocket = new WebSocket(serverUrl);

// Listen for messages from the WebSocket connection
webSocket.onmessage = function(event) {
    const inboxMessagesDiv = document.getElementById('inboxMessages');
    if (!inboxMessagesDiv) {
        console.log('inboxMessagesDiv is not found on this page.'); // gpt_pilot_debugging_log
        return; // Exit if no div found
    }
    const messageData = JSON.parse(event.data);
    // Create a new element to display the message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'inbox-message';
    messageDiv.innerHTML = `<strong>From:</strong> ${messageData.from}, <strong>Message:</strong> ${messageData.message}`;

    // Append the new message element to the inbox messages div
    inboxMessagesDiv.prepend(messageDiv);
    console.log(`Message from ${messageData.from} added to the inbox`); // gpt_pilot_debugging_log
};

// Handle any errors that occur
webSocket.onerror = function(error) {
    console.error('WebSocket Error: ', error); // gpt_pilot_debugging_log
};

// Handle the WebSocket connection closing
webSocket.onclose = function(event) {
    console.log('WebSocket connection closed:', event); // gpt_pilot_debugging_log
};