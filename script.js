import { database } from "./firebase-config.js";
import { get, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const productContainer = document.getElementById("productContainer");

let productos = [];

onValue(ref(database, 'productos/'), snapshot => {
  productos = [];
  snapshot.forEach(child => {
    productos.push({ id: child.key, ...child.val() });
  });
  renderProducts(productos);
  loadCategories(productos);
});

function renderProducts(lista) {
  productContainer.innerHTML = "";
  lista.forEach(producto => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${producto.image}" alt="${producto.name}">
      <h3>${producto.name}</h3>
      <p>${producto.description}</p>
      <strong>${producto.category}</strong><br>
      <strong>$${producto.price}</strong><br>
      <small>En stock: ${producto.stock}</small>
    `;
    productContainer.appendChild(card);
  });
}

function loadCategories(lista) {
  const categorias = [...new Set(lista.map(p => p.category))];
  categoryFilter.innerHTML = '<option value="todas">Todas las categorías</option>';
  categorias.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

searchInput.addEventListener("input", e => {
  const filtro = e.target.value.toLowerCase();
  const filtrados = productos.filter(p =>
    p.name.toLowerCase().includes(filtro) ||
    p.description.toLowerCase().includes(filtro)
  );
  renderProducts(filtrados);
});

categoryFilter.addEventListener("change", e => {
  const categoria = e.target.value;
  const filtrados = categoria === "todas"
    ? productos
    : productos.filter(p => p.category === categoria);
  renderProducts(filtrados);
});