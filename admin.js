// admin.js
import { database, storage } from './firebase-config.js';
import { ref as dbRef, push, set } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';

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
  form.style = `
    position: fixed;
    top: 10%;
    left: 50%;
    transform: translateX(-50%);
    background: #fff0f5;
    border: 2px solid #f9b5e3;
    border-radius: 20px;
    padding: 1.5rem;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    max-width: 320px;
  `;

  form.innerHTML = `
    <h2 style="text-align:center;">Nuevo Producto</h2>
    <input type="text" id="nombre" placeholder="Nombre" required style="width: 100%; margin-bottom: 10px;"><br>
    <textarea id="descripcion" placeholder="Descripción" required style="width: 100%; margin-bottom: 10px;"></textarea><br>
    <input type="text" id="categoria" placeholder="Categoría" required style="width: 100%; margin-bottom: 10px;"><br>
    <input type="number" id="precio" placeholder="Precio" required style="width: 100%; margin-bottom: 10px;"><br>
    <input type="number" id="existencia" placeholder="Existencia" required style="width: 100%; margin-bottom: 10px;"><br>
    <input type="file" id="imagen" accept="image/*" capture style="margin-bottom: 20px;"><br>

    <div style="text-align: center;">
      <button type="submit" style="background-color: #f48fb1; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; margin-right: 10px;">
        Guardar
      </button>
      <button type="button" id="cerrarForm" style="background-color: #e0e0e0; color: black; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer;">
        Cancelar
      </button>
    </div>
  `;

  document.body.appendChild(form);

  document.getElementById('cerrarForm').addEventListener('click', () => {
    form.remove();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const categoria = document.getElementById('categoria').value.trim().toLowerCase();
    const precio = parseFloat(document.getElementById('precio').value);
    const existencia = parseInt(document.getElementById('existencia').value);
    const imagenFile = document.getElementById('imagen').files[0];

    if (!nombre || !descripcion || !categoria || isNaN(precio) || isNaN(existencia) || !imagenFile) {
      alert('Por favor completa todos los campos y selecciona una imagen.');
      return;
    }

    try {
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
      form.remove();
    } catch (error) {
      console.error('Error al subir imagen o guardar producto:', error);
      alert('Hubo un error al guardar el producto.');
    }
  });
}