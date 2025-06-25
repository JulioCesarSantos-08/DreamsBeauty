// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDBJ9qe5eZqptNy1UTb4Oi1mcJUxBxKf-s",
  authDomain: "dreamshop-45a70.firebaseapp.com",
  databaseURL: "https://dreamshop-45a70-default-rtdb.firebaseio.com",
  projectId: "dreamshop-45a70",
  storageBucket: "dreamshop-45a70.appspot.com",
  messagingSenderId: "183753341240",
  appId: "1:183753341240:web:5870409b9f704d1e42a9cd",
  measurementId: "G-XBYP89FPFL"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);

// Función para guardar producto desde el formulario
export async function guardarProductoDesdeFormulario() {
  const nombre = document.getElementById("nombre").value.trim();
  const descripcion = document.getElementById("descripcion").value.trim();
  const categoria = document.getElementById("categoria").value.trim();
  const precio = parseFloat(document.getElementById("precio").value);
  const existencia = parseInt(document.getElementById("existencia").value);
  const imagenInput = document.getElementById("imagen");

  // Validación
  if (!nombre || !descripcion || !categoria || isNaN(precio) || isNaN(existencia) || !imagenInput.files.length) {
    alert("Por favor completa todos los campos.");
    return;
  }

  try {
    const archivo = imagenInput.files[0];
    const ruta = `productos/${Date.now()}_${archivo.name}`;
    const imagenRef = storageRef(storage, ruta);

    // Subir imagen
    await uploadBytes(imagenRef, archivo);
    const imagenURL = await getDownloadURL(imagenRef);

    // Crear objeto producto
    const producto = {
      nombre,
      descripcion,
      categoria,
      precio,
      existencia,
      imagen: imagenURL
    };

    // Guardar en la base de datos
    const productosRef = ref(database, 'productos');
    const nuevoProductoRef = push(productosRef);
    await set(nuevoProductoRef, producto);

    alert("Producto guardado con éxito.");
    document.getElementById("formularioProducto").reset();
    document.getElementById("formularioProducto").style.display = "none";

  } catch (error) {
    console.error("Error al guardar el producto:", error);
    alert("Hubo un error al subir la imagen o guardar el producto.");
  }
}

// Exportar objetos útiles
export { database, storage, ref, push, set, storageRef, uploadBytes, getDownloadURL };