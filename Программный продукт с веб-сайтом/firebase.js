//src="https://www.gstatic.com/firebasejs/7.14.6/firebase-app.js"
//src="https://www.gstatic.com/firebasejs/7.14.6/firebase-database.js"


// import { initializeApp } from "https://www.gstatic.com/firebasejs/7.14.6/firebase-app.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/7.14.6/firebase-database.js";
 
//import "firebase/app";
//import "firebase/database";
import firebase from "firebase";
// import firebase from 'firebase/compat/app';
//import { } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase- SERVICE .js'
//const firebase = import('firebase');
//   const firebaseConfig = {
//   apiKey: "AIzaSyCBxIbl1a2bskQQPm4U9cEu9-poK3vLsec",
//   authDomain: "webcoursework-b8cb4.firebaseapp.com",
//   databaseURL: "https://webcoursework-b8cb4-default-rtdb.firebaseio.com",
//   projectId: "webcoursework-b8cb4",
//   storageBucket: "webcoursework-b8cb4.appspot.com",
//   messagingSenderId: "1036866418547",
//   appId: "1:1036866418547:web:7e7396c092659efddc7706",
//   measurementId: "G-CC6K714F9R"
// };
const firebaseConfig = {
    apiKey: "AIzaSyDsu2cHBJuget5uyIf3abTrs2wZJqhLR7g",
    authDomain: "smau-temp.firebaseapp.com",
    databaseURL: "https://smau-temp-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "smau-temp",
    storageBucket: "smau-temp.appspot.com",
    messagingSenderId: "208565502888",
    appId: "1:208565502888:web:4df62cc01d3ebf4729539d",
    measurementId: "G-FWJBGEFGFY"
  };

  //Initialize Firebase
  //const app = initializeApp(firebaseConfig);
  // Получение ссылки на Realtime Database
  //var database = firebase.database();

  firebase.initializeApp(firebaseConfig)
  var database = firebase.database()

  database.ref('reports/' + 29).set({
    mark: '0'
  })

  
//   // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getDatabase, ref, set } from "firebase/database";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyDsu2cHBJuget5uyIf3abTrs2wZJqhLR7g",
//   authDomain: "smau-temp.firebaseapp.com",
//   databaseURL: "https://smau-temp-default-rtdb.europe-west1.firebasedatabase.app",
//   projectId: "smau-temp",
//   storageBucket: "smau-temp.appspot.com",
//   messagingSenderId: "208565502888",
//   appId: "1:208565502888:web:4df62cc01d3ebf4729539d",
//   measurementId: "G-FWJBGEFGFY"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const db = getDatabase();
//   set(ref(db, 'users/' + 3), {
//     username: "0"
//   });
// //   database.ref('reports/' + 27).set({
// //     mark: '0'
// //   })