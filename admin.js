// admin.js
import { database, storage } from './firebase-config.js';
import {
  ref as dbRef, push, set, update, remove, onValue
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';
import {
  ref as storageRef, uploadBytes, getDownloadURL
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';

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

function mostrarFormulario(producto = null) {
  const existing = document.getElementById('adminForm');
  if (existing) existing.remove();

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
    max-width: 350px;
  `;

  form.innerHTML = `
    <h2 style="text-align:center;">${producto ? 'Editar Producto' : 'Nuevo Producto'}</h2>
    <input type="text" id="nombre" placeholder="Nombre" required style="width: 100%; margin-bottom: 10px;" value="${producto?.nombre || ''}"><br>
    <textarea id="descripcion" placeholder="Descripción" required style="width: 100%; margin-bottom: 10px;">${producto?.descripcion || ''}</textarea><br>
    <input type="text" id="categoria" placeholder="Categoría" required style="width: 100%; margin-bottom: 10px;" value="${producto?.categoria || ''}"><br>
    <input type="number" id="precio" placeholder="Precio" required style="width: 100%; margin-bottom: 10px;" value="${producto?.precio || ''}"><br>
    <input type="number" id="existencia" placeholder="Existencia" required style="width: 100%; margin-bottom: 10px;" value="${producto?.existencia || ''}"><br>
    <input type="file" id="imagen" accept="image/*" style="margin-bottom: 20px;"><br>

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

    if (!nombre || !descripcion || !categoria || isNaN(precio) || isNaN(existencia)) {
      alert('Por favor completa todos los campos.');
      return;
    }

    try {
      let imageURL = producto?.imagen;

      if (imagenFile) {
        const imageRef = storageRef(storage, 'imagenes/' + Date.now() + '_' + imagenFile.name);
        await uploadBytes(imageRef, imagenFile);
        imageURL = await getDownloadURL(imageRef);
      }

      const productoData = { nombre, descripcion, categoria, precio, existencia, imagen: imageURL };

      if (producto) {
        await update(dbRef(database, 'productos/' + producto.id), productoData);
        alert('Producto actualizado exitosamente');
      } else {
        const newProductRef = push(dbRef(database, 'productos'));
        await set(newProductRef, productoData);
        alert('Producto agregado exitosamente');
      }

      form.reset();
      form.remove();
      mostrarPanelProductos();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('Hubo un error al guardar el producto.');
    }
  });
}

function mostrarPanelProductos() {
  let panel = document.getElementById('productosPanel');
  if (panel) panel.remove();

  panel = document.createElement('div');
  panel.id = 'productosPanel';
  panel.style = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 40vh;
    overflow-y: auto;
    background: #fff;
    border-top: 2px solid #f9b5e3;
    padding: 1rem;
    z-index: 9998;
  `;

  panel.innerHTML = `<h3>Productos Existentes</h3><div id="listaProductos"></div>`;
  document.body.appendChild(panel);

  const lista = panel.querySelector('#listaProductos');

  onValue(dbRef(database, 'productos'), snapshot => {
    const data = snapshot.val();
    lista.innerHTML = '';
    if (data) {
      Object.entries(data).forEach(([id, producto]) => {
        const div = document.createElement('div');
        div.style = "display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #eee; padding: 5px 0;";
        div.innerHTML = `
          <span><strong>${producto.nombre}</strong> (${producto.categoria}) - $${producto.precio} - Stock: ${producto.existencia}</span>
          <span>
            <button style="margin-right: 10px;" data-id="${id}" class="editarBtn">✏️</button>
            <button data-id="${id}" class="eliminarBtn">🗑️</button>
          </span>
        `;
        lista.appendChild(div);
      });

      lista.querySelectorAll('.editarBtn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          mostrarFormulario({ id, ...data[id] });
        });
      });

      lista.querySelectorAll('.eliminarBtn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          if (confirm('¿Estás seguro de eliminar este producto?')) {
            await remove(dbRef(database, 'productos/' + id));
            alert('Producto eliminado');
            mostrarPanelProductos();
          }
        });
      });
    } else {
      lista.innerHTML = '<p>No hay productos aún.</p>';
    }
  });
}

function mostrarBotonesNavegacion() {
  let btns = document.getElementById('botonesAdmin');
  if (btns) return;

  btns = document.createElement('div');
  btns.id = 'botonesAdmin';
  btns.style = `
    position: fixed;
    bottom: 70px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 9999;
  `;

  btns.innerHTML = `
    <button onclick="window.location.href='recibos.html'" style="background:#ce93d8;color:white;padding:10px 15px;border:none;border-radius:10px;cursor:pointer;">🧾 Ver Recibos</button>
    <button onclick="window.location.href='index.html'" style="background:#f48fb1;color:white;padding:10px 15px;border:none;border-radius:10px;cursor:pointer;">🏠 Página Principal</button>
  `;

  document.body.appendChild(btns);
}