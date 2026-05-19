import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAEQvCkcv5RnUTO3SuoAdtQ4RmGw7wOmGk",
  authDomain: "hospital-listing-47f2b.firebaseapp.com",
  projectId: "hospital-listing-47f2b",
  storageBucket: "hospital-listing-47f2b.firebasestorage.app",
  messagingSenderId: "950041769243",
  appId: "1:950041769243:web:17a3f81fbe7e344f17cfbe",
  measurementId: "G-YMD13FYL61"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const usersSnap = await getDocs(query(collection(db, "users"), where("role", "==", "admin")));
  console.log("--- ADMIN USERS ---");
  usersSnap.forEach(doc => {
    console.log(doc.id, doc.data());
  });
}

check().catch(console.error);
