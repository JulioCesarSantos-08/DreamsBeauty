import { database } from './firebase-config.js';
import {
  ref as dbRef, push, set, update, remove, onValue
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

function mostrarFormulario(producto = null) {
  const existing = document.getElementById('adminForm');
  if (existing) existing.remove();

  const form = document.createElement('form');
  form.id = 'adminForm';
  form.enctype = 'multipart/form-data';
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
    max-width: 350px;
  `;

  form.innerHTML = `
    <h2 style="text-align:center;">${producto ? 'Editar Producto' : 'Nuevo Producto'}</h2>
    <input type="text" id="nombre" placeholder="Nombre" required style="width: 100%; margin-bottom: 10px;" value="${producto?.nombre || ''}"><br>
    <textarea id="descripcion" placeholder="Descripción" required style="width: 100%; margin-bottom: 10px;">${producto?.descripcion || ''}</textarea><br>
    <input type="text" id="categoria" placeholder="Categoría" required style="width: 100%; margin-bottom: 10px;" value="${producto?.categoria || ''}"><br>
    <input type="number" id="precio" placeholder="Precio" required style="width: 100%; margin-bottom: 10px;" value="${producto?.precio || ''}"><br>
    <input type="number" id="existencia" placeholder="Existencia" required style="width: 100%; margin-bottom: 10px;" value="${producto?.existencia || ''}"><br>
    
    <input type="file" id="imagenInput" accept="image/*" ${producto ? '' : 'required'} style="margin-bottom: 10px;"><br>
    <input type="hidden" id="imagenURL" value="${producto?.imagen || ''}">

    <div style="text-align: center;">
      <button type="submit" style="background-color: #f48fb1; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; margin-right: 10px;">
        ${producto ? 'Actualizar' : 'Guardar'}
      </button>
      <button type="button" id="cerrarForm" style="background-color: #e0e0e0; color: black; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer;">
        Cancelar
      </button>
    </div>
  `;

  document.body.appendChild(form);

  document.getElementById('cerrarForm').addEventListener('click', () => form.remove());

  const imagenInput = document.getElementById('imagenInput');
  const imagenURL = document.getElementById('imagenURL');

  imagenInput.addEventListener('change', async () => {
    const file = imagenInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('imagen', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Error en la subida de imagen');

      const data = await res.json();
      imagenURL.value = data.url;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      alert('Hubo un problema al subir la imagen.');
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const categoria = document.getElementById('categoria').value.trim().toLowerCase();
    const precio = parseFloat(document.getElementById('precio').value);
    const existencia = parseInt(document.getElementById('existencia').value);
    const url = imagenURL.value.trim();

    if (!nombre || !descripcion || !categoria || isNaN(precio) || isNaN(existencia) || !url) {
      alert('Por favor completa todos los campos y espera a que la imagen termine de subir.');
      return;
    }

    const productoData = { nombre, descripcion, categoria, precio, existencia, imagen: url };

    try {
      if (producto) {
        await update(dbRef(database, 'productos/' + producto.id), productoData);
        alert('Producto actualizado exitosamente');
      } else {
        const newRef = push(dbRef(database, 'productos'));
        await set(newRef, productoData);
        alert('Producto agregado exitosamente');
      }

      form.reset();
      form.remove();
      mostrarPanelProductos();
    } catch (err) {
      console.error('Error al guardar producto:', err);
      alert('Hubo un error al guardar el producto.');
    }
  });
}

function mostrarPanelProductos() {
  let panel = document.getElementById('adminPanel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'adminPanel';
    panel.style = `
      position: fixed;
      top: 75px;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      max-width: 800px;
      background: #fffafc;
      border: 2px solid #f9b5e3;
      border-radius: 15px;
      padding: 20px;
      z-index: 9998;
      max-height: 70vh;
      overflow-y: auto;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(panel);
  }

  const productosRef = dbRef(database, 'productos');
  onValue(productosRef, (snapshot) => {
    panel.innerHTML = `<h2 style="text-align:center;">Lista de Productos</h2>`;
    snapshot.forEach((child) => {
      const producto = child.val();
      producto.id = child.key;

      const card = document.createElement('div');
      card.className = 'productoCard';
      card.dataset.id = producto.id;
      card.style = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #ccc;
        padding: 10px;
        margin-bottom: 5px;
        gap: 1rem;
      `;

      card.innerHTML = `
        <div style="flex: 1;">
          <strong>${producto.nombre}</strong><br>
          <small>${producto.descripcion}</small><br>
          <small><b>Categoría:</b> ${producto.categoria}</small><br>
          <small><b>Precio:</b> $${producto.precio}</small> |
          <small><b>Existencia:</b> ${producto.existencia}</small>
        </div>
        <img src="${producto.imagen}" alt="imagen" style="height: 50px; border-radius: 5px;">
        <div style="display:flex; flex-direction: column; gap: 5px;">
          <button class="editarBtn" style="padding: 5px 10px; background: #ffd54f; border: none; border-radius: 5px;">Editar</button>
          <button class="eliminarBtn" style="padding: 5px 10px; background: #e57373; color: white; border: none; border-radius: 5px;">Eliminar</button>
        </div>
      `;
      panel.appendChild(card);
    });
  });
}

function mostrarBotonesNavegacion() {
  const btnNuevo = document.getElementById('nuevoProductoBtn');
  if (!btnNuevo) {
    const boton = document.createElement('button');
    boton.id = 'nuevoProductoBtn';
    boton.textContent = 'Agregar Nuevo Producto';
    boton.style = `
      position: fixed;
      bottom: 100px;
      right: 30px;
      background: #f06292;
      color: white;
      border: none;
      border-radius: 50px;
      padding: 12px 20px;
      font-size: 1rem;
      z-index: 9999;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      cursor: pointer;
    `;
    boton.addEventListener('click', () => mostrarFormulario());
    document.body.appendChild(boton);
  }
}

const adminBtn = document.getElementById('adminBtn');
let isAdmin = false;

adminBtn.addEventListener('click', () => {
  if (!isAdmin) {
    const pass = prompt('Introduce la contraseña de administrador:');
    if (pass === 'milip2025') {
      isAdmin = true;
      mostrarFormulario();
      mostrarPanelProductos();
      mostrarBotonesNavegacion();
    } else {
      alert('Contraseña incorrecta.');
    }
  } else {
    mostrarFormulario();
    mostrarPanelProductos();
    mostrarBotonesNavegacion();
  }
});

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('editarBtn')) {
    const id = e.target.closest('.productoCard').dataset.id;
    const productoRef = dbRef(database, 'productos/' + id);
    onValue(productoRef, (snapshot) => {
      const producto = snapshot.val();
      if (producto) {
        producto.id = id;
        mostrarFormulario(producto);
      }
    }, { onlyOnce: true });
  }

  if (e.target.classList.contains('eliminarBtn')) {
    const id = e.target.closest('.productoCard').dataset.id;
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      remove(dbRef(database, 'productos/' + id))
        .then(() => alert('Producto eliminado.'))
        .catch((error) => alert('Error al eliminar: ' + error));
    }
  }
});