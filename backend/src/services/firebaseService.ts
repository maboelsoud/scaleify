import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const firebaseConfig = {
  credential: applicationDefault()
};
  
export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

console.log("🚀 ~ process.env.NODE_ENVprocess.env.NODE_ENV::", process.env.NODE_ENV);
if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
  console.log("Connecting firebase-admin to Firestore Emulator...");
  db.settings({
    host: "localhost:8080",
    ssl: false,
  });
  (async ()=> {
    try {
      const res = await db.collection('users').add({
        first: "Ada",
        last: "Lovelace",
        born: 1815
      });
      console.log('Added document with ID: ', res.id);
      // [END firestore_data_set_id_random_collection]
    
      console.log('Add: ', res);
    } catch (e) {
      console.error("Error adding document: ", e);
    }

  })()
}