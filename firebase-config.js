// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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

// Función para guardar producto desde el formulario
export function guardarProductoDesdeFormulario() {
  const nombre = document.getElementById("nombre").value.trim();
  const descripcion = document.getElementById("descripcion").value.trim();
  const categoria = document.getElementById("categoria").value.trim();
  const precio = parseFloat(document.getElementById("precio").value);
  const existencia = parseInt(document.getElementById("existencia").value);
  const imagenInput = document.getElementById("imagen");

  // Validación
  if (!nombre || !descripcion || !categoria || isNaN(precio) || isNaN(existencia) || !imagenInput.value) {
    alert("Por favor completa todos los campos.");
    return;
  }

  // Obtener nombre de archivo de imagen local
  const nombreImagen = imagenInput.value.split("\\").pop(); // para Windows
  const urlImagen = 'imagenes/' + nombreImagen; // carpeta local donde están las imágenes

  const producto = {
    nombre,
    descripcion,
    categoria,
    precio,
    existencia,
    imagen: urlImagen
  };

  // Guardar en Firebase
  const productosRef = ref(database, 'productos');
  const nuevoProductoRef = push(productosRef);

  set(nuevoProductoRef, producto)
    .then(() => {
      alert("Producto guardado con éxito.");
      document.getElementById("formularioProducto").reset();
      document.getElementById("formularioProducto").style.display = "none";
    })
    .catch((error) => {
      console.error("Error al guardar el producto:", error);
      alert("Hubo un error al guardar el producto.");
    });
}

// Exportar para uso en otros archivos
export { database, ref, push, set };