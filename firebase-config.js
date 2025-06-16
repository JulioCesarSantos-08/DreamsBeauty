// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDu-_vpONpb42CSkPzjWwLZLlWkG0LLyXM",
  authDomain: "tiendabelleza-56ce2.firebaseapp.com",
  projectId: "tiendabelleza-56ce2",
  storageBucket: "tiendabelleza-56ce2.firebasestorage.app",
  messagingSenderId: "78777047836",
  appId: "1:78777047836:web:d08fea0926fe55c10a38d9"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };