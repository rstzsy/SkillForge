const firebase = require('firebase')
const firebaseConfig = {
    apiKey: "AIzaSyCQxa6G4_XWeR8471xDJjKPNFbleadt9rM",
    authDomain: "skill-94f02.firebaseapp.com",
    projectId: "skill-94f02",
    storageBucket: "skill-94f02.firebasestorage.app",
    messagingSenderId: "47899552265",
    appId: "1:47899552265:web:78fe52dd2d83f29542a6d8",
    measurementId: "G-M8PFSHL88T"
};

firebase.initializeAoo(firebaseConfig);
const db=firebase.firestore();
const speaking_bookings = db.collection("speaking_bookings");
module.exports = speaking_bookings;


  