import './style.css';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  EmailAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

import {
  getFirestore,
  addDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';

import * as firebaseui from 'firebaseui';

const startRsvpButton = document.getElementById('startRsvp');
const guestbookContainer = document.getElementById('guestbook-container');
const login = document.getElementById('login');
const form = document.getElementById('leave-message');
const input = document.getElementById('message');
const guestbook = document.getElementById('guestbook');

let guestbookListener = null;

let db, auth;

async function main() {
  const firebaseConfig = {
    apiKey: "AIzaSyDDXr--VSP0otD1WPtZnjgd7ynkDZW3ii0",
    authDomain: "meet-here-b9a2f.firebaseapp.com",
    projectId: "meet-here-b9a2f",
    storageBucket: "meet-here-b9a2f.appspot.com",
    messagingSenderId: "657499604810",
    appId: "1:657499604810:web:723ea8d50d126fe30ea3b3",
    measurementId: "G-3MY03H4EGF"
  };

  initializeApp(firebaseConfig);
  auth = getAuth();
  db = getFirestore();

  const uiConfig = {
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    signInOptions: [EmailAuthProvider.PROVIDER_ID],
    callbacks: {
      signInSuccessWithAuthResult: function (authResult, redirectUrl) {
        return false;
      },
    },
  };

  const ui = new firebaseui.auth.AuthUI(getAuth());
  login.addEventListener('click', () => {
    ui.start('#firebaseui-auth-container', uiConfig);
  });

  startRsvpButton.addEventListener('click', () => {
    if (auth.currentUser) {
      signOut(auth);
    } else {
      ui.start('#firebaseui-auth-container', uiConfig);
    }
  });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      startRsvpButton.textContent = 'LOGOUT';
      login.remove(login);
      guestbookContainer.style.display = 'block';
      subscribeGuestbook();
    } else {
      startRsvpButton.textContent = 'log in';
      guestbookContainer.style.display = 'none';
      unsubscribeGuestbook();
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    addDoc(collection(db, 'guestbook'), {
      text: input.value,
      timestamp: Date.now(),
      name: auth.currentUser.displayName,
      userId: auth.currentUser.uid,
    });

    input.value = '';

    return false;
  });
}
main();

function subscribeGuestbook() {
  const q = query(collection(db, 'guestbook'), orderBy('timestamp', 'desc'));
  guestbookListener = onSnapshot(q, (snaps) => {
    guestbook.innerHTML = '';
    snaps.forEach((doc) => {
      const entry = document.createElement('p');
      entry.textContent = doc.data().name + ': ' + doc.data().text;
      guestbook.appendChild(entry);
    });
  });
}

function unsubscribeGuestbook() {
  if (guestbookListener != null) {
    guestbookListener();
    guestbookListener = null;
  }
}
