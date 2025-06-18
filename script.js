// script.js
import { database } from './firebase-config.js';
import {
  ref,
  onValue,
  update,
  push
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

const productsContainer = document.getElementById('productsContainer');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');

let allProducts = [];
let carrito = [];

function renderProductsGrouped(products) {
  productsContainer.innerHTML = "";

  const grouped = {};
  products.forEach(p => {
    if (!grouped[p.categoria]) grouped[p.categoria] = [];
    grouped[p.categoria].push(p);
  });

  for (const categoria in grouped) {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'category-group';

    const title = document.createElement('h2');
    title.textContent = categoria;
    groupDiv.appendChild(title);

    const slider = document.createElement('div');
    slider.className = 'product-slider';

    grouped[categoria].forEach(product => {
      const card = document.createElement('div');
      card.className = "product-card";
      card.innerHTML = `
        <img src="${product.imagen}" alt="${product.nombre}">
        <h3>${product.nombre}</h3>
        <p>${product.descripcion}</p>
        <p><strong>Precio:</strong> $${product.precio}</p>
        <p><strong>Stock:</strong> ${product.existencia}</p>
        <button class="buy-btn" data-id="${product.id}">Comprar</button>
        <button class="cart-btn" data-id="${product.id}">Agregar al carrito</button>
      `;
      slider.appendChild(card);
    });

    groupDiv.appendChild(slider);
    productsContainer.appendChild(groupDiv);
  }

  document.querySelectorAll('.buy-btn').forEach(btn => btn.addEventListener('click', handleCompra));
  document.querySelectorAll('.cart-btn').forEach(btn => btn.addEventListener('click', handleCarrito));
}

function handleCompra(e) {
  const id = e.target.dataset.id;
  const producto = allProducts.find(p => p.id === id);
  if (!producto || producto.existencia <= 0) return alert("Producto agotado");

  const nombreCliente = prompt("¿Cuál es tu nombre para el comprobante?");
  if (!nombreCliente) return;

  const nuevaExistencia = producto.existencia - 1;
  const productoRef = ref(database, `productos/${id}`);

  update(productoRef, { existencia: nuevaExistencia });

  const venta = {
    productoId: id,
    nombre: producto.nombre,
    precio: producto.precio,
    cliente: nombreCliente,
    fecha: new Date().toISOString()
  };
  push(ref(database, 'ventas'), venta);

  alert(`Gracias por tu compra, ${nombreCliente}. Guarda este mensaje como comprobante.`);
}

function handleCarrito(e) {
  const id = e.target.dataset.id;
  const producto = allProducts.find(p => p.id === id);
  if (!producto) return;

  carrito.push(producto);
  alert(`Agregado al carrito: ${producto.nombre}`);
  // En el futuro podemos mostrar el carrito visualmente y permitir confirmar compra múltiple
}

function updateCategoryOptions() {
  const categorias = Array.from(new Set(allProducts.map(p => p.categoria)));
  categoryFilter.innerHTML = `<option value="todos">Todas las categorías</option>`;
  categorias.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

function filtrarProductos() {
  const busqueda = searchInput.value.toLowerCase();
  const categoriaSeleccionada = categoryFilter.value;

  const filtrados = allProducts.filter(producto => {
    const coincideCategoria = categoriaSeleccionada === 'todos' || producto.categoria === categoriaSeleccionada;
    const coincideTexto =
      producto.nombre.toLowerCase().includes(busqueda) ||
      producto.descripcion.toLowerCase().includes(busqueda);
    return coincideCategoria && coincideTexto;
  });

  renderProductsGrouped(filtrados);
}

// Escuchar productos desde Firebase
onValue(ref(database, 'productos'), snapshot => {
  const data = snapshot.val();
  if (data) {
    allProducts = Object.entries(data).map(([id, p]) => ({ id, ...p }));
    updateCategoryOptions();
    filtrarProductos();
  } else {
    productsContainer.innerHTML = "<p>No hay productos disponibles.</p>";
  }
});

searchInput.addEventListener("input", filtrarProductos);
categoryFilter.addEventListener("change", filtrarProductos);