// firebaseConfig.js
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
    apiKey: 'AIzaSyDNZgA64olb7US5D6VjMi8-CTW3lPGCNzM',
    authDomain: 'YOUR_AUTH_DOMAIN',
    databaseURL: 'https://txyco-test-default-rtdb.firebaseio.com',
    projectId: 'txyco-test',
    storageBucket: 'txyco-test.appspot.com',
    messagingSenderId: '741933552398',
    appId: '1:741933552398:android:f19b6b9907c7cf089dfd5f',
}

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

export { database }
