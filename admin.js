// admin.js
import { database, storage } from './firebase-config.js';
import { ref as dbRef, push, set, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const adminBtn = document.getElementById('adminBtn');

let isAdmin = false;

adminBtn.addEventListener('click', () => {
  if (!isAdmin) {
    const pass = prompt('Introduce la contraseña de administrador:');
    if (pass === 'milip2025') {
      isAdmin = true;
      mostrarFormulario();
    } else {
      alert('Contraseña incorrecta.');
    }
  } else {
    mostrarFormulario();
  }
});

function mostrarFormulario() {
  if (document.getElementById('adminForm')) return;

  const form = document.createElement('form');
  form.id = 'adminForm';
  form.innerHTML = `
    <h2>Agregar nuevo producto</h2>
    <input type="text" id="nombre" placeholder="Nombre" required><br>
    <textarea id="descripcion" placeholder="Descripción" required></textarea><br>
    <input type="text" id="categoria" placeholder="Categoría" required><br>
    <input type="number" id="precio" placeholder="Precio" required><br>
    <input type="number" id="existencia" placeholder="Existencia" required><br>
    <input type="file" id="imagen" accept="image/*" capture><br>
    <button type="submit">Guardar producto</button>
  `;

  document.body.appendChild(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const descripcion = document.getElementById('descripcion').value;
    const categoria = document.getElementById('categoria').value;
    const precio = parseFloat(document.getElementById('precio').value);
    const existencia = parseInt(document.getElementById('existencia').value);
    const imagenFile = document.getElementById('imagen').files[0];

    if (!imagenFile) {
      alert('Debes seleccionar una imagen.');
      return;
    }

    const imageRef = storageRef(storage, 'imagenes/' + Date.now() + '_' + imagenFile.name);
    await uploadBytes(imageRef, imagenFile);
    const imageURL = await getDownloadURL(imageRef);

    const newProductRef = push(dbRef(database, 'productos'));
    await set(newProductRef, {
      nombre,
      descripcion,
      categoria,
      precio,
      existencia,
      imagen: imageURL
    });

    alert('Producto agregado exitosamente');
    form.reset();
  });
}