import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyC-TKOmion0VsJxn1JR-n9Q0672-9jQwug',
  authDomain: 'timewriter-2a1c8.firebaseapp.com',
  databaseURL: 'https://timewriter-2a1c8.firebaseio.com',
  projectId: 'timewriter-2a1c8',
  storageBucket: 'timewriter-2a1c8.appspot.com',
  messagingSenderId: '496057982046',
  appId: '1:496057982046:web:625f923acdc0f6a7a3a8cf'
}

const app = window.firebase = firebase.initializeApp(firebaseConfig)

export const auth = app.auth()
export const database = app.database()
export const authProvider = new firebase.auth.GoogleAuthProvider()

export default app
