# peerSMS

peerSMS is a versatile application designed to efficiently manage and dispatch personalized SMS survey invitations at scale. Leveraging Twilio's powerful messaging capabilities, peerSMS enables users to handle multiple survey projects simultaneously, ensuring a targeted and customized outreach.

## Overview

Built on a Node.js backend, peerSMS uses the Express framework to provide a robust API layer. The application employs MongoDB for data persistence, offering a scalable solution for managing large datasets of recipient information. Integration with Twilio allows for sending SMS messages and handling responses, while JWT authentication protects access to the application.

## Features

- **Customizable Messaging**: Utilize message templates with dynamic variables for personalized communication.
- **Bulk Import**: Upload CSV files to manage recipient data efficiently.
- **Number Rotation**: Leverage multiple Twilio numbers with configurable rotation strategies to optimize deliverability.
- **Inbox Management**: Track responses with an integrated inbox, facilitating two-way communication.
- **Analytics**: Monitor and analyze the effectiveness of messaging campaigns with detailed deliverability insights.

## Getting started

### Requirements

- Node.js
- MongoDB
- npm or yarn

### Quickstart

1. Clone the repository to your local machine.
2. Install the necessary dependencies using `npm install`.
3. Set up the `.env` file with your MongoDB and Twilio credentials.
4. Start the application using `npm start`.
5. Refer to the API documentation to begin managing survey campaigns with peerSMS.

### License

Copyright (c) 2024.