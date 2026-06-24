// js/firebase.js — Firebase config & initialization

// Firebase configuration (CorpPool project)
const firebaseConfig = {
  apiKey:            "AIzaSyDTQFDoxaerEXe9fr1E1pUgSLJBzNT9h5s",
  authDomain:        "corppool.firebaseapp.com",
  projectId:         "corppool",
  storageBucket:     "corppool.firebasestorage.app",
  messagingSenderId: "561713561875",
  appId:             "1:561713561875:web:8cbd0c5b9c5bce98d31ae6",
  measurementId:     "G-R8RK9WDXKQ"
};

// Initialize Firebase app
firebase.initializeApp(firebaseConfig);

// Expose services globally
const auth = firebase.auth();
const db   = firebase.firestore();

// Enable offline persistence (data works even without internet)
db.enablePersistence({ synchronizeTabs: true }).catch(err => {
  if (err.code === 'failed-precondition') {
    console.warn('[Firestore] Multiple tabs open — persistence disabled for this tab.');
  } else if (err.code === 'unimplemented') {
    console.warn('[Firestore] Persistence not supported in this browser.');
  }
});
