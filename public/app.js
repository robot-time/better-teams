// app.js

const debug = true; // Set to true to bypass login for debugging

// Firebase config - IMPORTANT: Add your database URL
const firebaseConfig = {
  apiKey: "AIzaSyAPabG2Z4C9J78zdFRhIAiGBNAAOu68tRc",
  authDomain: "better-teams-fr.firebaseapp.com",
  databaseURL: "https://better-teams-fr-default-rtdb.firebaseio.com/", // ADD THIS LINE
  projectId: "better-teams-fr",
  storageBucket: "better-teams-fr.firebasestorage.app",
  messagingSenderId: "337730612061",
  appId: "1:337730612061:web:48f2aca4f601bde9cd96b4",
  measurementId: "G-W7HDVZ43MF"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userNameSpan = document.getElementById('userNameSidebar'); // Fixed: was 'userName'
const chatDiv = document.getElementById('chat');
const loginDiv = document.getElementById('login');
const messageInput = document.getElementById('messageInput');
const messagesDiv = document.getElementById('messages');

// Clear welcome message when real messages start loading
function clearWelcomeMessage() {
  const welcomeMsg = messagesDiv.querySelector('.welcome-message');
  if (welcomeMsg) {
    welcomeMsg.remove();
  }
}

// === DEBUG MODE OVERRIDE ===
if (debug) {
  loginDiv.style.display = 'none';
  chatDiv.style.display = 'flex';
  userNameSpan.textContent = 'DebugUser';
  
  // Set debug avatar
  updateUserAvatar(null, 'DebugUser');
  
  // Still load messages in debug mode
  loadMessages();
}

// === AUTH MODE ===
if (!debug) {
  auth.onAuthStateChanged(user => {
    if (user) {
      loginDiv.style.display = 'none';
      chatDiv.style.display = 'flex';
      
      // Update user info in sidebar
      userNameSpan.textContent = user.displayName;
      updateUserAvatar(user.photoURL, user.displayName);
      
      loadMessages();
    } else {
      loginDiv.style.display = 'block';
      chatDiv.style.display = 'none';
    }
  });

  loginBtn.onclick = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(error => {
      console.error('Login error:', error);
    });
  };

  logoutBtn.onclick = () => auth.signOut();
}

// === Send a message ===
function sendMessage() {
  const text = messageInput.value.trim();
  if (text === '') return;

  // Clear input immediately for better UX
  messageInput.value = '';
  messageInput.style.height = 'auto';

  const currentUser = debug ? null : auth.currentUser;
  const message = {
    name: debug ? 'DebugUser' : (currentUser ? currentUser.displayName : 'Anonymous'),
    text,
    timestamp: Date.now(),
    photoURL: debug ? null : (currentUser ? currentUser.photoURL : null)
  };

  console.log('Sending message:', message); // Debug log

  if (!debug && auth.currentUser) {
    // Only add to Firebase - the listener will handle displaying it
    db.ref('messages').push(message)
      .then(() => {
        console.log('Message sent successfully');
      })
      .catch(error => {
        console.error('Error sending message:', error);
        // If error, restore the message in input
        messageInput.value = text;
      });
  } else if (debug) {
    // In debug mode, manually add since there's no Firebase listener
    clearWelcomeMessage();
    const msgElement = createMessageElement(message);
    messagesDiv.appendChild(msgElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
}

// === Update user avatar in sidebar ===
function updateUserAvatar(photoURL, displayName) {
  const userAvatarSidebar = document.getElementById('userAvatarSidebar');
  
  if (photoURL) {
    // If user has a profile picture, use it
    userAvatarSidebar.innerHTML = `
      <img src="${photoURL}" alt="${displayName}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">
      <div class="status-indicator online"></div>
    `;
  } else {
    // Fallback to initials
    const initials = displayName ? displayName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
    userAvatarSidebar.innerHTML = `
      <span style="font-size: 12px; font-weight: 600;">${initials}</span>
      <div class="status-indicator online"></div>
    `;
  }
}

// === Create message element ===
function createMessageElement(msg) {
  const msgElement = document.createElement('div');
  msgElement.className = 'message';
  
  // Determine avatar content
  let avatarContent = '';
  if (msg.photoURL) {
    avatarContent = `<img src="${msg.photoURL}" alt="${msg.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">`;
  } else {
    const initial = msg.name ? msg.name[0].toUpperCase() : 'A';
    avatarContent = initial;
  }
  
  msgElement.innerHTML = `
    <div class="message-avatar">${avatarContent}</div>
    <div class="message-content">
      <div class="message-header">
        <div class="message-author">${msg.name || 'Anonymous'}</div>
        <div class="message-time">${new Date(msg.timestamp).toLocaleTimeString()}</div>
      </div>
      <div class="message-text">${msg.text}</div>
    </div>`;
  return msgElement;
}

// === Load messages from DB ===
function loadMessages() {
  console.log('Loading messages...'); // Debug log
  
  db.ref('messages').limitToLast(50).on('child_added', snapshot => {
    console.log('New message received:', snapshot.val()); // Debug log
    
    clearWelcomeMessage();
    const msg = snapshot.val();
    const msgElement = createMessageElement(msg);
    messagesDiv.appendChild(msgElement);
    
    // Auto-scroll to bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }, error => {
    console.error('Error loading messages:', error);
  });
}

// === Handle Enter key for sending messages ===
messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// === Auto-resize textarea ===
messageInput.addEventListener('input', () => {
  messageInput.style.height = 'auto';
  messageInput.style.height = Math.min(messageInput.scrollHeight, 200) + 'px';
});