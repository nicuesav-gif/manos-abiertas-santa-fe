const productos = [
  { id: 1, nombre: "Camiseta", categoria: "ropa", precio: 0, emoji: "👕", descripcion: "Camiseta para donación en El Roperito de Manos Abiertas Santa Fe." },
  { id: 2, nombre: "Pantalon", categoria: "ropa", precio: 0, emoji: "👖", descripcion: "Pantalón para donación en El Roperito de Manos Abiertas Santa Fe." },
  { id: 3, nombre: "Medias", categoria: "ropa", precio: 0, emoji: "🧦", descripcion: "Medias para donación en El Roperito de Manos Abiertas Santa Fe." }
];

function formatearPrecio(numero) {
  if (!numero || numero === 0) return "Donación solidaria";
  return "$" + numero.toLocaleString("es-AR");
}

function buscarProducto(id) {
  return productos.find(function (p) { return p.id === id; });
}

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