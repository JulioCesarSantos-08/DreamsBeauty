// script.js
import { database } from './firebase-config.js';
import { ref, onValue } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

const productsContainer = document.getElementById('productsContainer');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');

let allProducts = [];

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
      `;
      slider.appendChild(card);
    });

    groupDiv.appendChild(slider);
    productsContainer.appendChild(groupDiv);
  }
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