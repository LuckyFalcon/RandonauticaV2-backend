require("firebase/auth");
const firebase = require('firebase')
const admin = require('firebase-admin')
const serviceAccount = require("./randonautica-firebase-adminsdk-b16a7-5d83b6b111.json");

// Your web app's Firebase configuration
 var firebaseConfig = {
    apiKey: "AIzaSyDQVilJISYv54W6BYGmtzXayNdNh-5Hzdw",
    authDomain: "randonautica.firebaseapp.com",
    databaseURL: "https://randonautica.firebaseio.com",
    projectId: "randonautica",
    storageBucket: "randonautica.appspot.com",
    messagingSenderId: "798292909561",
    appId: "1:798292909561:web:4bc7e8a6a9a642a33cf128",
    measurementId: "G-JP0BMPJGMX"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://randonautica.firebaseio.com"
});

module.exports = { firebase, admin };