/* MANOS ABIERTAS SANTA FE — script.js */

const productos = [
  { id: 1, nombre: "Camiseta", categoria: "ropa", precio: 0, emoji: "👕", descripcion: "Camiseta para donación y clasificación en El Roperito de Manos Abiertas Santa Fe." },
  { id: 2, nombre: "Pantalon", categoria: "ropa", precio: 0, emoji: "👖", descripcion: "Pantalón para donación y abrigo en las obras de Manos Abiertas Santa Fe." },
  { id: 3, nombre: "Medias", categoria: "ropa", precio: 0, emoji: "🧦", descripcion: "Medias para donación y uso diario en Manos Abiertas Santa Fe." }
];

function formatearPrecio(numero) {
  if (!numero || numero === 0) return "Donación solidaria";
  return "$" + numero.toLocaleString("es-AR");
}

function buscarProducto(id) {
  return productos.find(function (p) { return p.id === id; });
}

/* Lista / donación en memoria */
let seleccionDonacion = [];

function agregarAlCarrito(id) {
  const existente = seleccionDonacion.find(function (item) { return item.id === id; });
  if (existente) {
    existente.cantidad++;
  } else {
    seleccionDonacion.push({ id: id, cantidad: 1 });
  }
  return seleccionDonacion;
}

/* Interacciones opcionales seguras (solo se activan si existen en index.html) */
const btnMenu = document.getElementById("btn-menu");
const menu = document.getElementById("menu");
if (btnMenu && menu) {
  btnMenu.addEventListener("click", function () {
    const abierto = menu.classList.toggle("abierto");
    btnMenu.setAttribute("aria-expanded", abierto);
    btnMenu.textContent = abierto ? "✕" : "☰";
  });

  menu.querySelectorAll("a").forEach(function (enlace) {
    enlace.addEventListener("click", function () {
      menu.classList.remove("abierto");
      btnMenu.textContent = "☰";
    });
  });
}

const btnTema = document.getElementById("btn-tema");
if (btnTema) {
  function aplicarTema(oscuro) {
    document.body.classList.toggle("oscuro", oscuro);
    btnTema.textContent = oscuro ? "☀️" : "🌙";
  }
  aplicarTema(localStorage.getItem("tema") === "oscuro");
  btnTema.addEventListener("click", function () {
    const ahoraOscuro = !document.body.classList.contains("oscuro");
    aplicarTema(ahoraOscuro);
    localStorage.setItem("tema", ahoraOscuro ? "oscuro" : "claro");
  });
}

const btnArriba = document.getElementById("btn-arriba");
if (btnArriba) {
  window.addEventListener("scroll", function () {
    btnArriba.classList.toggle("oculto", window.scrollY <= 300);
  });
  btnArriba.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

const saludoEl = document.getElementById("saludo");
if (saludoEl) {
  const hora = new Date().getHours();
  const saludo = hora < 12 ? "¡Buen día! ☀️" : hora < 20 ? "¡Buenas tardes! 🌤️" : "¡Buenas noches! 🌙";
  saludoEl.textContent = saludo + " Bienvenido a Manos Abiertas";
}

const anioEl = document.getElementById("anio");
if (anioEl) {
  anioEl.textContent = new Date().getFullYear();
}

const formContacto = document.querySelector("#contacto form");
if (formContacto) {
  formContacto.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const campoNombre = document.getElementById("nombre");
    const campoEmail = document.getElementById("email");
    if (!campoNombre || !campoNombre.value.trim()) {
      alert("Por favor, escribí tu nombre.");
      return;
    }
    if (!campoEmail || !campoEmail.value.trim()) {
      alert("Por favor, escribí tu email.");
      return;
    }
    alert("¡Gracias por escribir a Manos Abiertas Santa Fe! Tu consulta fue registrada.");
    formContacto.reset();
  });
}