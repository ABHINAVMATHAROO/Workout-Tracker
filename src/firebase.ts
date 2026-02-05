import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDQgfDkxQWSiGvP5vLOVYydeKwe6sPh6F4',
  authDomain: 'workout-tracker-46485.firebaseapp.com',
  projectId: 'workout-tracker-46485',
  storageBucket: 'workout-tracker-46485.firebasestorage.app',
  messagingSenderId: '1059653873279',
  appId: '1:1059653873279:web:c04515fb07f8340bc3594a',
  measurementId: 'G-ZBE8STEREE',
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
