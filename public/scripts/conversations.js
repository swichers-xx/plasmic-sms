document.addEventListener('DOMContentLoaded', function() {
  const conversationsList = document.getElementById('conversationsList');
  const projectId = '65cca90e6f397d6d765dde74';

  async function fetchConversations() {
    try {
      const response = await fetch(`/api/conversations/${projectId}`);
      const conversations = await response.json();
      renderConversations(conversations);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  }

  function renderConversations(conversations) {
    conversations.forEach(conversation => {
      const conversationDiv = document.createElement('div');
      conversationDiv.className = 'conversation';
      const contactPhoneHeader = document.createElement('h4');
      contactPhoneHeader.textContent = `Conversation with ${conversation.contactPhone}`;
      const latestMessagePreview = document.createElement('p');
      const latestMessage = conversation.messages[conversation.messages.length - 1];
      latestMessagePreview.textContent = `Latest: ${latestMessage.body.substring(0, 50)}...`;
      conversationDiv.appendChild(contactPhoneHeader);
      conversationDiv.appendChild(latestMessagePreview);
      conversationDiv.onclick = () => expandConversation(conversation.messages);
      conversationsList.appendChild(conversationDiv);
    });
  }

  function expandConversation(messages) {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = '';
    messages.forEach(message => {
      const messageP = document.createElement('p');
      messageP.textContent = `${message.from}: ${message.body}`;
      modalBody.appendChild(messageP);
    });
  }

  fetchConversations();
});