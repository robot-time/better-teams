const firebaseConfig = {
  apiKey: "AIzaSyAPabG2Z4C9J78zdFRhIAiGBNAAOu68tRc",
  authDomain: "better-teams-fr.firebaseapp.com",
  databaseURL: "https://better-teams-fr-default-rtdb.firebaseio.com/",
  projectId: "better-teams-fr",
  storageBucket: "better-teams-fr.firebasestorage.app",
  messagingSenderId: "337730612061",
  appId: "1:337730612061:web:48f2aca4f601bde9cd96b4",
  measurementId: "G-W7HDVZ43MF"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const chatDiv = document.getElementById('chat');
const messageInput = document.getElementById('messageInput');
const messagesDiv = document.getElementById('messages');

function saveUsername() {
  const name = document.getElementById('usernameInput').value.trim();
  if (!name) return;
  localStorage.setItem('faxName', name);
  document.getElementById('usernameModal').style.display = 'none';
  chatDiv.style.display = 'block';
  loadMessages();
}

function getUsername() {
  return localStorage.getItem('faxName') || 'Anonymous';
}

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;
  messageInput.value = '';

  const message = {
    name: getUsername(),
    text,
    timestamp: Date.now()
  };

  db.ref('messages').push(message);
}

function createMessageElement(msg) {
  const msgElement = document.createElement('div');
  msgElement.className = 'fax-message';
  msgElement.innerHTML = `
    <div class="fax-border">
      TO: Everyone<br>
      FROM: ${msg.name}<br>
      DATE: ${new Date(msg.timestamp).toLocaleString()}<br>
      -----------------------------<br>
      ${msg.text}
    </div>
  `;
  return msgElement;
}

function loadMessages() {
  db.ref('messages').limitToLast(50).on('child_added', snapshot => {
    const msg = snapshot.val();
    const msgElement = createMessageElement(msg);
    messagesDiv.appendChild(msgElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

// If user already saved a name, skip prompt
window.onload = () => {
  if (getUsername()) {
    document.getElementById('usernameModal').style.display = 'none';
    chatDiv.style.display = 'block';
    loadMessages();
  }
};
