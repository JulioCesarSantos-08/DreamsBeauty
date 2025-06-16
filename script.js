// script.js
import { database } from './firebase-config.js';
import { ref, onValue } from 'firebase/database';

const productsContainer = document.getElementById('productsContainer');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');

let allProducts = [];

function renderProducts(products) {
  productsContainer.innerHTML = "";
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.imagen}" alt="${product.nombre}">
      <h3>${product.nombre}</h3>
      <p>${product.descripcion}</p>
      <p><strong>Categoría:</strong> ${product.categoria}</p>
      <p><strong>Precio:</strong> $${product.precio}</p>
      <p><strong>Stock:</strong> ${product.existencia}</p>
    `;
    productsContainer.appendChild(card);
  });
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

  renderProducts(filtrados);
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