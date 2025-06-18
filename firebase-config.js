// Importa las funciones necesarias del SDK de Firebase 
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Configuración del proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDu-_vpONpb42CSkPzjWwLZLlWkG0LLyXM",
  authDomain: "tiendabelleza-56ce2.firebaseapp.com",
  databaseURL: "https://tiendabelleza-56ce2-default-rtdb.firebaseio.com",
  projectId: "tiendabelleza-56ce2",
  storageBucket: "tiendabelleza-56ce2.appspot.com",
  messagingSenderId: "78777047836",
  appId: "1:78777047836:web:d08fea0926fe55c10a38d9"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Función opcional para actualizar un producto
function actualizarProducto(productoId, datosActualizados) {
  const referencia = ref(database, 'productos/' + productoId);
  update(referencia, datosActualizados)
    .then(() => {
      console.log("Datos actualizados correctamente.");
    })
    .catch((error) => {
      console.error("Error al actualizar los datos:", error);
    });
}

// Exporta la base de datos y la función de actualización
export { database, actualizarProducto };