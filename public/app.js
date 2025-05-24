// app.js

const debug = false; // Set to true to bypass login for debugging

// Firebase config (use your actual config here)
const firebaseConfig = {
  apiKey: "AIzaSyAPabG2Z4C9J78zdFRhIAiGBNAAOu68tRc",
  authDomain: "better-teams-fr.firebaseapp.com",
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
const userNameSpan = document.getElementById('userName');
const chatDiv = document.getElementById('chat');
const loginDiv = document.getElementById('login');
const messageInput = document.getElementById('messageInput');
const messagesDiv = document.getElementById('messages');

// === DEBUG MODE OVERRIDE ===
if (debug) {
  loginDiv.style.display = 'none';
  chatDiv.style.display = 'flex';
  userNameSpan.textContent = 'DebugUser';

  // Fake listener so UI looks live
  messagesDiv.innerHTML = `
    <div class="message">
      <div class="message-avatar">D</div>
      <div class="message-content">
        <div class="message-header">
          <div class="message-author">DebugUser</div>
          <div class="message-time">now</div>
        </div>
        <div class="message-text">This is a debug message preview.</div>
      </div>
    </div>`;
}

// === AUTH MODE ===
if (!debug) {
  auth.onAuthStateChanged(user => {
    if (user) {
      loginDiv.style.display = 'none';
      chatDiv.style.display = 'flex';
      userNameSpan.textContent = user.displayName;
      loadMessages();
    } else {
      loginDiv.style.display = 'block';
      chatDiv.style.display = 'none';
    }
  });

  loginBtn.onclick = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  logoutBtn.onclick = () => auth.signOut();
}

// === Send a message ===
function sendMessage() {
  const text = messageInput.value.trim();
  if (text === '') return;

  const message = {
    name: debug ? 'DebugUser' : auth.currentUser.displayName,
    text,
    timestamp: Date.now()
  };

  if (!debug) {
    db.ref('messages').push(message);
  } else {
    // Just append it locally
    messagesDiv.innerHTML += `
      <div class="message">
        <div class="message-avatar">D</div>
        <div class="message-content">
          <div class="message-header">
            <div class="message-author">DebugUser</div>
            <div class="message-time">now</div>
          </div>
          <div class="message-text">${text}</div>
        </div>
      </div>`;
  }

  messageInput.value = '';
}

// === Load messages from DB ===
function loadMessages() {
  db.ref('messages').limitToLast(50).on('child_added', snapshot => {
    const msg = snapshot.val();
    const msgElement = document.createElement('div');
    msgElement.className = 'message';
    msgElement.innerHTML = `
      <div class="message-avatar">${msg.name[0]}</div>
      <div class="message-content">
        <div class="message-header">
          <div class="message-author">${msg.name}</div>
          <div class="message-time">${new Date(msg.timestamp).toLocaleTimeString()}</div>
        </div>
        <div class="message-text">${msg.text}</div>
      </div>`;
    messagesDiv.appendChild(msgElement);
  });
}
