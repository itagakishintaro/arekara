// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
import * as firebase from "firebase/app";

// Add the Firebase services that you want to use
import "firebase/auth";
import "firebase/firestore";
import "firebase/analytics";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDadWj8aO7YdZDCEmOijVRZkejjyva74nM",
  authDomain: "routine-347f1.firebaseapp.com",
  databaseURL: "https://routine-347f1.firebaseio.com",
  projectId: "routine-347f1",
  storageBucket: "routine-347f1.appspot.com",
  messagingSenderId: "1026118734552",
  appId: "1:1026118734552:web:4ae7313bd22597ea41fdad",
  measurementId: "G-ZJWL965080"
};

console.log('firebase', firebase.default);
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

export default firebase;