# peerSMS API Documentation

## Overview

This document provides a detailed description of the various API endpoints available in the peerSMS application. It aims to guide developers and users in understanding the functionalities available, including authentication, sending SMS/MMS, managing contacts, and analyzing message deliverability and responses.

## Authentication

Authentication in the peerSMS application is handled through two main endpoints: `/api/auth/register` for user registration and `/api/auth/login` for user login. Successful login returns a JSON Web Token (JWT) which is then used for accessing protected endpoints.

### Register

- **Endpoint:** `/api/auth/register`
- **Method:** `POST`
- **Description:** Allows new users to create an account.
- **Body Parameters:**
  - `username`: Unique username for the user.
  - `email`: Email address of the user.
  - `password`: Strong password for account security.
- **Success Response:** Status 201 - `{ "message": "User created successfully" }`
- **Error Response:** Status 400 - `{ "error": "User already exists" }`
- **Example Request:**
  ```curl
  curl -X POST http://localhost:PORT/api/auth/register \
      -H 'Content-Type: application/json' \
      --data '{"username": "newUser", "email": "user@example.com", "password": "password123"}'
  ```

### Login

- **Endpoint:** `/api/auth/login`
- **Method:** `POST`
- **Description:** Authenticates user credentials and returns a JWT for accessing protected endpoints.
- **Body Parameters:**
  - `username`: The user's username.
  - `password`: The user's password.
- **Success Response:** Status 200 - `{ "token": "JWT_TOKEN_HERE" }`
- **Error Response:** Status 400 - `{ "error": "Invalid username or password" }`
- **Example Request:**
  ```curl
  curl -X POST http://localhost:PORT/api/auth/login \
      -H 'Content-Type: application/json' \
      --data '{"username": "newUser", "password": "password123"}'
  ```

The JSON Web Token (JWT) received upon successful login must be included in the `Authorization` header of subsequent requests to access protected endpoints, in the format `Authorization: Bearer JWT_TOKEN_HERE`.

### Create a Project

- **Endpoint:** `/api/projects/create-project`
- **Method:** `POST`
- **Description:** Creates a new survey project and uploads the initial sample data via a CSV file. The project name and description are specified in the request body along with the CSV file containing sample data.
- **Content-Type:** `multipart/form-data`
- **Body Parameters:**
  - `name`: Name of the project.
  - `description`: Description of the project.
  - `file`: CSV file containing project sample data. Expected columns in the CSV can be customizable and should correspond to variables used in messaging templates. Common columns include `phone`, `name`, `surveyLink`, etc.
- **Success Response:** Status 201 - Returns JSON with project details including the ID.
- **Error Response:** Status 400 - `{ "error": "Error description" }` for file upload errors or validation issues.
- **Example CURL Command:**
  ```bash
  curl -X POST http://localhost:3001/api/projects/create-project \
      -F "name=Project Name" \
      -F "description=Project Description" \
      -F "file=@/path/to/yourfile.csv;type=text/csv" \
      -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
  ```

This section of the API documentation aims to guide developers on how to successfully use this functionality.

## Sending SMS/MMS

### Send Single SMS

- **Endpoint:** `/api/sms/send-single-sms`
- **Method:** `POST`
- **Description:** Sends a personalized SMS to a single recipient from the project's contact list. Placeholders in the message body are dynamically replaced with the contact's information.
- **Body Parameters:**
  - `projectId`: The ID of the project.
  - `contactId`: The ID of the contact within the project.
  - `message`: The message content with placeholders for dynamic data insertion.
- **Success Response:** Status 200 - `{ "message": "SMS to [contact phone] queued for sending: [Message] [personalized message]" }`
- **Error Response:** Varies depending on the issue: Status 404 for "Project not found", or Status 500 for internal errors.
- **Example Request:**
  ```curl
  curl -X POST http://localhost:PORT/api/sms/send-single-sms \
      -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
      -H 'Content-Type: application/json' \
      --data '{"projectId": "PROJECT_ID_HERE", "contactId": "CONTACT_ID_HERE", "message": "Hello {name}, please visit {surveyLink}"}'
  ```

### Send MMS

- **Endpoint:** `/api/sms/send-mms`
- **Method:** `POST`
- **Description:** Sends an MMS containing media and a personalized message to a single recipient from the project's contact list.
- **Body Parameters:**
  - `projectId`: The ID of the project.
  - `contactId`: The ID of the contact within the project.
  - `message`: The message content with placeholders for dynamic data insertion.
  - `mediaUrl`: URL of the media to be sent as part of the MMS.
- **Success Response:** Status 200 - `{ "message": "MMS sent successfully", "messageId": "MESSAGE_ID", "messageSid": "MESSAGE_SID" }`
- **Error Response:** Varies depending on the issue: Status 404 for "Project not found" or "Contact not found within project.", or Status 500 for internal errors.
- **Example Request:**
  ```curl
  curl -X POST http://localhost:PORT/api/sms/send-mms \
      -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
      -H 'Content-Type: application/json' \
      --data '{"projectId": "PROJECT_ID_HERE", "contactId": "CONTACT_ID_HERE", "message": "Hello {name}, check this out!", "mediaUrl": "https://example.com/path/to/image.jpg"}'
  ```

## Managing Contacts

_Detailed documentation on how to manage contacts via API endpoints will be added here._

## Analyzing Message Analytics

### Fetching Message Analytics

- **Endpoint:** `/api/analytics/message-metrics`
- **Method:** `GET`
- **Description:** Retrieves aggregated messaging analytics for a project, including total messages sent, delivered, and read.
- **Required Headers:** `Authorization: Bearer [JWT_TOKEN]` - to authenticate the request.
- **Success Response:** Returns JSON object with analytics data, including the total number of messages sent, delivered, and read.
- **Error Response:** Status 500 - `{ "message": "Failed to fetch message metrics", "error": [Error Detail]}`
- **Example Request:**
  ```curl
  curl -X GET http://localhost:PORT/api/analytics/message-metrics \
      -H 'Authorization: Bearer YOUR_JWT_TOKEN'
  ```

### Managing Conversations

- **Endpoint:** `/api/conversations/:projectId`
- **Method:** `GET`
- **Description:** Lists all conversations associated with a given project. A conversation consists of a series of messages exchanged with a specific contact.
- **URL Parameters:** `projectId` - The ID of the project for which to retrieve conversations.
- **Required Headers:** `Authorization: Bearer [JWT_TOKEN]` - to authenticate the request.
- **Success Response:** Returns JSON array of conversation objects, each containing contact details and messages exchanged.
- **Error Response:** Status 404 - `{ "message": "Project not found" }` or Status 500 - `{ "message": "Failed to fetch conversations", "error": [Error Detail]}`
- **Example Request:**
  ```curl
  curl -X GET http://localhost:PORT/api/conversations/YOUR_PROJECT_ID \
      -H 'Authorization: Bearer YOUR_JWT_TOKEN'
  ```