// Replace with your Firebase config ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
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

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const chatEl = document.getElementById("chat");
const loginEl = document.getElementById("login");
const userNameEl = document.getElementById("userName");

loginBtn.onclick = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
};

logoutBtn.onclick = () => {
  auth.signOut();
};

auth.onAuthStateChanged((user) => {
  if (user) {
    loginEl.style.display = "none";
    chatEl.style.display = "block";
    userNameEl.textContent = user.displayName;
  } else {
    loginEl.style.display = "block";
    chatEl.style.display = "none";
  }
});

function sendMessage() {
  const msgInput = document.getElementById("messageInput");
  const text = msgInput.value;
  const user = auth.currentUser;

  if (text.trim() === "" || !user) return;

  db.ref("messages").push({
    name: user.displayName,
    text,
    timestamp: Date.now()
  });

  msgInput.value = "";
}

db.ref("messages").on("child_added", (snapshot) => {
  const msg = snapshot.val();
  const msgEl = document.createElement("p");
  msgEl.innerText = `${msg.name}: ${msg.text}`;
  document.getElementById("messages").appendChild(msgEl);
});
