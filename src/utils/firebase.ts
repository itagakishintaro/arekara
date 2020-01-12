// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
import * as firebase from "firebase/app";

// Add the Firebase services that you want to use
import "firebase/auth";
import "firebase/firestore";
import "firebase/analytics";

// This element is connected to the Redux store.
import { store } from "../store.js";

// These are the actions needed by this element.
import { update } from "../actions/user.js";
import { navigate } from "../actions/app.js";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAtd1A4qrE4DEmP0_Xg0XudDN_ORDXwH80",
  authDomain: "arekara-pwa.firebaseapp.com",
  databaseURL: "https://arekara-pwa.firebaseio.com",
  projectId: "arekara-pwa",
  storageBucket: "arekara-pwa.appspot.com",
  messagingSenderId: "928743824635",
  appId: "1:928743824635:web:73b0c2a44a844eb3c8245e",
  measurementId: "G-7EB9QSP2NL"
};

// Initialize Firebase
//@ts-ignore
const firebaseDefault = firebase.default?firebase.default:firebase;
firebaseDefault.initializeApp(firebaseConfig);
firebaseDefault.analytics();

// Auth Changed
firebaseDefault.auth().onAuthStateChanged( (user: {uid: String}) => {
  console.log("onAuthStateChanged", user);
  if (user && user.uid) {
    store.dispatch( update(user) );
    store.dispatch( navigate("/top") );
  } else {
    store.dispatch( update({uid: null}) );
  }
});

export default firebaseDefault;