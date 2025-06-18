// admin.js
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { firebaseConfig } from './firebase-config.js';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Evento al dar clic en "Guardar producto"
document.getElementById("guardarBtn").addEventListener("click", () => {
  const nombre = document.getElementById("nombre").value.trim();
  const descripcion = document.getElementById("descripcion").value.trim();
  const categoria = document.getElementById("categoria").value.trim();
  const precio = parseFloat(document.getElementById("precio").value);
  const existencia = parseInt(document.getElementById("existencia").value);
  const imagenInput = document.getElementById("imagen");

  if (!nombre || !descripcion || !categoria || isNaN(precio) || isNaN(existencia) || !imagenInput.value) {
    alert("Por favor completa todos los campos.");
    return;
  }

  // Solo tomamos el nombre del archivo para guardar la ruta local
  const nombreImagen = imagenInput.value.split("\\").pop();
  const urlImagen = 'productos/' + nombreImagen;

  // Crear nueva referencia en la base de datos
  const productosRef = ref(database, 'productos');
  const nuevoProductoRef = push(productosRef);

  // Guardar producto
  set(nuevoProductoRef, {
    nombre,
    descripcion,
    categoria,
    precio,
    existencia,
    imagen: urlImagen
  })
    .then(() => {
      alert("Producto guardado con éxito.");
      document.getElementById("formularioProducto").reset();
      document.getElementById("formularioProducto").style.display = "none";
    })
    .catch((error) => {
      console.error("Error al guardar el producto:", error);
      alert("Hubo un error al guardar el producto.");
    });
});