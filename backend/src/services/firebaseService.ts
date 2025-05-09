import { applicationDefault, initializeApp, App } from 'firebase-admin/app';
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
// import { FirebaseFirestore } from "firebase-admin/firestore";

// const firebaseConfig = {
//   credential: applicationDefault()
// };
  

// export const app = initializeApp(firebaseConfig);
// export const db = getFirestore(app);
// export const auth = getAuth(app);

let _app: App | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

// TODO: might make this private, we would rather not make other services use firebase app directly
export function getFirebaseApp() {
  if (!_app) {
    _app = initializeApp({ credential: applicationDefault() });
  }
  return _app;
}

export function getFirestoreDb() {
  if (!_db) {
    _db = getFirestore(getFirebaseApp());

    console.log("🚀 ~ process.env.NODE_ENVprocess.env.NODE_ENV::", process.env.NODE_ENV);
    if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
      console.log("Connecting firebase-admin to Firestore Emulator...");
      getFirestoreDb().settings({
        host: "localhost:8080",
        ssl: false,
      });
      // (async ()=> {
      //   await insertSeedData();
      // })()
    }

  }

  return _db;
}

// TODO: might wanna remove this, we dont need it
export function getAuthService() {
  if (!_auth) {
    _auth = getAuth(getFirebaseApp());
  }
  return _auth;
}

// async function insertSeedData() {
//     try {
//       const res = await getFirestoreDb().collection('users').add({
//         first: "Ada",
//         last: "Lovelace",
//         born: 1815
//       });
//       console.log('Added document with ID: ', res.id);
//       // [END firestore_data_set_id_random_collection]
    
//       console.log('Add: ', res);
//     } catch (e) {
//       console.error("Error adding document: ", e);
//     }
// }
