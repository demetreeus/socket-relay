// Connect to the Socket.IO server
const socket = io();

// DOM elements
const messagesContainer = document.getElementById('messages');
const lotIdInput = document.getElementById('lot-id');
const priceInput = document.getElementById('price');
const userIdInput = document.getElementById('user-id');
const submitButton = document.getElementById('submit-bid');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// Listen for messages from the server
socket.on('message', (data) => {
  console.log('Received message:', data);
  displayMessage(data);
});

// Handle connection event
socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
    
    // Display connection status
  const connectionMessage = {
    status: 'Connected to server',
    timestamp: new Date().toLocaleTimeString()
  };
  displayMessage(connectionMessage);
});

// Handle disconnection event
socket.on('disconnect', () => {
  console.log('Disconnected from server');
  
  // Display disconnection status
  const disconnectionMessage = {
    status: 'Disconnected from server',
    timestamp: new Date().toLocaleTimeString()
  };
  displayMessage(disconnectionMessage);
});

// Handle form submission
submitButton.addEventListener('click', () => {
  // Get form values
  const lotId = parseInt(lotIdInput.value);
  const price = parseInt(priceInput.value);
  const userId = parseInt(userIdInput.value);
  
  // Create message object
  const message = {
    lot_id: lotId,
    price: price,
    winner: userId,
    timestamp: new Date().toLocaleTimeString()
  };
  
  // Send message to server via POST request
  fetch('/api/bid', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      lot_id: lotId,
      price: price,
      user: userId
    }),
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
    displayMessage({
      status: 'Bid submitted successfully',
      timestamp: new Date().toLocaleTimeString()
    });
  })
  .catch((error) => {
    console.error('Error:', error);
    displayMessage({
      status: 'Error submitting bid: ' + error.message,
      timestamp: new Date().toLocaleTimeString()
    });
  });
});

// Function to display a message
function displayMessage(data) {
  const messageElement = document.createElement('div');
  messageElement.className = 'message';
  
  // Format the message content
  let content = '';
  
  if (data.status) {
    content = `<strong>Status:</strong> ${data.status}`;
    if (data.timestamp) {
      content += ` | <strong>Time:</strong> ${data.timestamp}`;
    }
  } else {
    content = `
      <strong>Lot ID:</strong> ${data.lot_id} | 
      <strong>Price:</strong> $${data.price} | 
      <strong>Winner:</strong> ${data.winner}
    `;
    if (data.timestamp) {
      content += ` | <strong>Time:</strong> ${data.timestamp}`;
    }
  }
  
  messageElement.innerHTML = content;
  
  // Add to messages container
  messagesContainer.appendChild(messageElement);
  
  // Auto-scroll to the bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Tab functionality
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Remove active class from all tabs and tab contents
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding content
    tab.classList.add('active');
    const tabId = tab.getAttribute('data-tab');
    document.getElementById(tabId).classList.add('active');
  });
});