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
  const producto = buscarProducto(id);

  if (!producto) return false;

  const existente = seleccionDonacion.find(
    item => item.id === Number(id)
  );

  if (existente) {
    existente.cantidad++;
  } else {
    seleccionDonacion.push({
      id: Number(id),
      cantidad: 1
    });
  }

  actualizarResumenDonacion();
  return true;
}

function actualizarResumenDonacion() {
  let resumen = document.getElementById("ia-carrito");

  if (!resumen) {
    resumen = document.createElement("div");
    resumen.id = "ia-carrito";

    const resultado = document.getElementById("ia-resultado");

    resultado.insertAdjacentElement("afterend", resumen);
  }

  if (seleccionDonacion.length === 0) {
    resumen.innerHTML = "";
    return;
  }

  const total = seleccionDonacion.reduce(
    (suma, item) => suma + item.cantidad,
    0
  );

  resumen.innerHTML = `
    <h3>❤️ Mi donación</h3>
    <ul>
      ${seleccionDonacion.map(item => {
        const producto = buscarProducto(item.id);

        return `
          <li>
            ${producto.emoji} ${producto.nombre}:
            ${item.cantidad}
          </li>
        `;
      }).join("")}
    </ul>
    <p><strong>Total de prendas: ${total}</strong></p>
    <button type="button" id="ia-vaciar-carrito">
      Vaciar donación
    </button>
  `;

  document.getElementById("ia-vaciar-carrito")
    .addEventListener("click", function () {
      seleccionDonacion = [];
      actualizarResumenDonacion();
    });
}
