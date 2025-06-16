import { database } from "./firebase-config.js";
import { push, ref } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const adminBtn = document.getElementById("adminBtn");
const adminPanel = document.getElementById("adminPanel");
const adminLogin = document.getElementById("adminLogin");
const adminContent = document.getElementById("adminContent");

adminBtn.addEventListener("click", () => {
  adminPanel.classList.toggle("hidden");
});

window.validateAdmin = () => {
  const pass = document.getElementById("adminPass").value;
  if (pass === "tu_contraseña_secreta") {
    adminLogin.classList.add("hidden");
    adminContent.classList.remove("hidden");
  } else {
    alert("Contraseña incorrecta");
  }
};

window.addProduct = () => {
  const producto = {
    name: document.getElementById("name").value,
    description: document.getElementById("description").value,
    category: document.getElementById("category").value,
    price: parseFloat(document.getElementById("price").value),
    stock: parseInt(document.getElementById("stock").value),
    image: document.getElementById("image").value
  };

  push(ref(database, 'productos/'), producto)
    .then(() => alert("Producto agregado"))
    .catch(err => alert("Error: " + err.message));
};