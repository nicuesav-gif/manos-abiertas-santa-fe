/*
   NIVEL 5: INTELIGENCIA ARTIFICIAL (Teachable Machine)
   ----------------------------------------------------
   Este archivo agrega el "Reconocedor de donaciones" a la página.
   Va DESPUÉS de script.js, porque usa sus funciones
   buscarProducto(), formatearPrecio() y agregarAlCarrito().

   PARA ADAPTARLO A MANOS ABIERTAS SOLO HAY QUE CAMBIAR LOS PASOS 1, 2, 3 y 4.
*/


/* PASO 1: el enlace de tu modelo */
const URL_MODELO = "https://teachablemachine.withgoogle.com/models/rFAu5UI1b/";


/* PASO 2: conectá cada CLASE del modelo con un ítem de script.js */
const clasesIA = {
  "Camiseta": 1,
  "Pantalon": 2,
  "Medias": 3,
  "Nada": null
};


/* PASO 3: qué tan seguro tiene que estar el modelo para mostrar un resultado
   0.8 = 80%. Si lo bajás, se equivoca más; si lo subís, contesta menos veces. */
const CONFIANZA_MINIMA = 0.8;


/* PASO 4: destino y uso de cada donación en Manos Abiertas */
const RESENAS_DE_EJEMPLO = false;

const resenas = {
  // 1 = Camiseta
  1: [
    { autor: "El Roperito — Manos Abiertas", estrellas: 5, texto: "Las camisetas recibidas se clasifican y entregan a bajo costo o sin cargo a familias que participan de las obras de Manos Abiertas Santa Fe, ayudando a sostener las actividades solidarias." },
    { autor: "Voluntariado Santa Fe", estrellas: 5, texto: "Una prenda esencial de uso diario para niños, jóvenes y adultos acompañados por la fundación." }
  ],
  // 2 = Pantalon
  2: [
    { autor: "El Roperito — Manos Abiertas", estrellas: 5, texto: "Los pantalones son una de las prendas más solicitadas para abrigo y uso cotidiano; lo recaudado en El Roperito sostiene las obras de la fundación en Santa Fe." },
    { autor: "Voluntariado Santa Fe", estrellas: 5, texto: "Acompañan el día a día de familias y personas asistidas en los distintos espacios comunitarios." }
  ],
  // 3 = Medias
  3: [
    { autor: "El Roperito — Manos Abiertas", estrellas: 5, texto: "Las medias ayudan a mantener el abrigo y el bienestar diario de quienes asisten a las obras de Manos Abiertas Santa Fe." },
    { autor: "Voluntariado Santa Fe", estrellas: 5, texto: "Un complemento básico y muy necesario dentro de la ropa que se clasifica y destina a la comunidad." }
  ]
};


/* ============ De acá para abajo no hace falta tocar nada ============ */

const iaEstado = document.getElementById("ia-estado");
const iaVisor = document.getElementById("ia-visor");
const iaBarras = document.getElementById("ia-barras");
const iaResultado = document.getElementById("ia-resultado");
const iaArchivo = document.getElementById("ia-archivo");
const btnCamara = document.getElementById("btn-camara");
const btnFoto = document.getElementById("btn-foto");
const iaDemo = document.getElementById("ia-demo");

const modoDemo = URL_MODELO.trim() === "";
let modelo = null;
let webcam = null;
let camaraEncendida = false;
let ultimaClaseMostrada = "";


/* Carga el modelo una sola vez (la primera vez que se usa) */
async function cargarModelo() {
  if (modelo) return modelo;
  if (typeof tmImage === "undefined") {
    throw new Error("No se pudo cargar la librería de Teachable Machine. Revisá tu conexión a internet.");
  }
  let url = URL_MODELO.trim();
  if (!url.endsWith("/")) url += "/";
  iaEstado.textContent = "Cargando el modelo… ⏳";
  modelo = await tmImage.load(url + "model.json", url + "metadata.json");
  iaEstado.textContent = "Modelo listo ✅";
  return modelo;
}


/* Dibuja una barra por clase con su porcentaje.
   "predicciones" es un array de objetos: { className: "Medialunas", probability: 0.93 } */
function mostrarBarras(predicciones) {
  for (const p of predicciones) {
    let fila = iaBarras.querySelector('[data-clase="' + p.className + '"]');

    // La primera vez creamos la fila; después solo actualizamos el ancho
    if (!fila) {
      fila = document.createElement("div");
      fila.className = "ia-fila";
      fila.dataset.clase = p.className;
      fila.innerHTML =
        '<span class="ia-nombre">' + p.className + "</span>" +
        '<span class="ia-pista"><span class="ia-relleno"></span></span>' +
        '<span class="ia-porcentaje">0%</span>';
      iaBarras.appendChild(fila);
    }

    const porcentaje = Math.round(p.probability * 100);
    fila.querySelector(".ia-relleno").style.width = porcentaje + "%";
    fila.querySelector(".ia-porcentaje").textContent = porcentaje + "%";
  }
}


/* Busca la clase con el porcentaje más alto y muestra el producto */
function mostrarResultado(predicciones) {
  const mejor = predicciones.reduce(function (a, b) {
    return a.probability > b.probability ? a : b;
  });

  // Marcamos la barra ganadora
  iaBarras.querySelectorAll(".ia-fila").forEach(function (fila) {
    fila.classList.toggle("ganadora", fila.dataset.clase === mejor.className);
  });

  // Decidimos qué mostrar
  let clave;
  const id = clasesIA[mejor.className];
  if (mejor.probability < CONFIANZA_MINIMA) {
    clave = "duda";
  } else if (id === null || id === undefined) {
    clave = "nada:" + mejor.className;
  } else {
    clave = "producto:" + id;
  }

  // Si no cambió, no redibujamos (así el botón no "parpadea" con la cámara)
  if (clave === ultimaClaseMostrada) return;
  ultimaClaseMostrada = clave;

  if (clave === "duda") {
    iaResultado.innerHTML = '<p class="ia-aviso">🤔 No estoy seguro. Acercá la prenda o probá con más luz.</p>';
  } else if (clave.startsWith("nada")) {
    iaResultado.innerHTML = '<p class="ia-aviso">👀 No veo ninguna prenda de donación. Mostrame una.</p>';
  } else {
    const producto = buscarProducto(id);
    if (!producto) {
      iaResultado.innerHTML = '<p class="ia-aviso">⚠️ La clase "' + mejor.className +
        '" apunta al id ' + id + ", pero ese ítem no existe en el listado.</p>";
      return;
    }
    iaResultado.innerHTML =
      '<div class="ia-tarjeta">' +
        '<div class="emoji">' + producto.emoji + "</div>" +
        "<div>" +
          '<p class="ia-etiqueta">Detectamos</p>' +
          "<h3>" + producto.nombre + "</h3>" +
          '<p class="descripcion">' + producto.descripcion + "</p>" +
          '<p class="precio">' + formatearPrecio(producto.precio) + "</p>" +
          '<button class="btn" data-ia-id="' + producto.id + '">Sumar a mi donación</button>' +
        "</div>" +
      "</div>" +
      armarResenas(producto.id);
  }
}


/* Convierte un número en estrellas: 4 -> "★★★★☆" */
function dibujarEstrellas(cantidad) {
  const llenas = Math.round(cantidad);
  return "★".repeat(llenas) + "☆".repeat(5 - llenas);
}

/* Arma el bloque de reseñas/mensajes de un ítem (promedio + comentarios) */
function armarResenas(id) {
  const lista = resenas[id];
  if (!lista || lista.length === 0) {
    return '<p class="ia-aviso">Este ítem todavía no tiene mensajes cargados.</p>';
  }

  // Promedio de estrellas: sumamos todas y dividimos por la cantidad
  let suma = 0;
  for (const r of lista) {
    suma += r.estrellas;
  }
  const promedio = suma / lista.length;

  let html =
    '<div class="ia-resenas">' +
      '<div class="ia-resenas-cabecera">' +
        '<span class="estrellas" aria-label="' + promedio.toFixed(1) + ' de 5 estrellas">' + dibujarEstrellas(promedio) + "</span>" +
        "<strong>" + promedio.toFixed(1).replace(".", ",") + "</strong>" +
        "<span>(" + lista.length + " notas)</span>" +
        (RESENAS_DE_EJEMPLO ? '<span class="ia-ejemplo">Mensajes de ejemplo</span>' : "") +
      "</div>";

  for (const r of lista) {
    html +=
      '<blockquote class="ia-resena">' +
        '<span class="estrellas" aria-label="' + r.estrellas + ' de 5 estrellas">' + dibujarEstrellas(r.estrellas) + "</span>" +
        "<p>“" + r.texto + "”</p>" +
        "<cite>— " + r.autor + "</cite>" +
      "</blockquote>";
  }

  return html + "</div>";
}


/* Le pasa una imagen (foto, video o canvas) al modelo */
async function predecir(elemento) {
  const predicciones = await modelo.predict(elemento);
  mostrarBarras(predicciones);
  mostrarResultado(predicciones);
}


/* ---------- Opción A: cámara ---------- */
async function bucleCamara() {
  if (!camaraEncendida) return;
  webcam.update();             // toma un cuadro nuevo de la cámara
  await predecir(webcam.canvas);
  requestAnimationFrame(bucleCamara); // y vuelve a empezar
}

btnCamara.addEventListener("click", async function () {
  // Si ya está prendida, la apagamos
  if (camaraEncendida) {
    camaraEncendida = false;
    if (webcam) webcam.stop();
    btnCamara.textContent = "📷 Usar cámara";
    iaEstado.textContent = "Cámara apagada.";
    return;
  }
  try {
    await cargarModelo();
    iaEstado.textContent = "Pidiendo permiso para la cámara…";
    webcam = new tmImage.Webcam(300, 300, true); // ancho, alto, espejado
    await webcam.setup();
    await webcam.play();
    iaVisor.innerHTML = "";
    iaVisor.appendChild(webcam.canvas);
    camaraEncendida = true;
    btnCamara.textContent = "⏹ Apagar cámara";
    iaEstado.textContent = "Mostrale una prenda a la cámara 🎥";
    bucleCamara();
  } catch (error) {
    iaEstado.textContent = "❌ " + (error.message || "No se pudo usar la cámara. Revisá los permisos del navegador.");
  }
});


/* ---------- Opción B: subir una foto ---------- */
btnFoto.addEventListener("click", function () {
  iaArchivo.value = "";
  iaArchivo.click(); // abre el selector de archivos
});

iaArchivo.addEventListener("change", async function () {
  const archivo = iaArchivo.files && iaArchivo.files[0];
  if (!archivo) return;

  // Si la cámara estaba prendida, la apagamos
  if (camaraEncendida) {
    camaraEncendida = false;
    if (webcam) webcam.stop();
    btnCamara.textContent = "📷 Usar cámara";
  }

  const urlTemporal = URL.createObjectURL(archivo);
  const img = document.createElement("img");
  img.alt = "Foto subida";
  img.src = urlTemporal;
  iaVisor.innerHTML = "";
  iaVisor.appendChild(img);
  iaEstado.textContent = "Cargando imagen… ⏳";

  img.onload = async function () {
    try {
      await cargarModelo();
      ultimaClaseMostrada = "";
      await predecir(img);
      iaEstado.textContent = "Listo ✅ Probá con otra foto si querés.";
    } catch (error) {
      iaEstado.textContent = "❌ " + (error.message || "Error al analizar la foto.");
    } finally {
      URL.revokeObjectURL(urlTemporal);
    }
  };

  img.onerror = function () {
    iaEstado.textContent = "❌ No se pudo leer el archivo de imagen seleccionado.";
    URL.revokeObjectURL(urlTemporal);
  };
});


/* ---------- Botón "Sumar a mi donación" (usa el carrito de script.js) ---------- */
iaResultado.addEventListener("click", function (evento) {
  const id = evento.target.dataset.iaId;
  if (id) {
    agregarAlCarrito(Number(id));
    evento.target.textContent = "✅ Sumado";
  }
});


/* ---------- MODO DEMO (cuando URL_MODELO está vacío) ---------- */
function simularPredicciones(claseElegida) {
  const nombres = Object.keys(clasesIA);
  const confianza = 0.85 + Math.random() * 0.12;

  const azar = nombres.map(function () { return Math.random(); });
  let sumaOtras = 0;
  nombres.forEach(function (n, i) { if (n !== claseElegida) sumaOtras += azar[i]; });

  return nombres.map(function (nombre, i) {
    const probabilidad = nombre === claseElegida
      ? confianza
      : (1 - confianza) * azar[i] / sumaOtras;
    return { className: nombre, probability: probabilidad };
  });
}

if (modoDemo) {
  btnCamara.classList.add("oculto");
  btnFoto.classList.add("oculto");
  iaEstado.textContent = "Modo demo: los resultados son simulados. Tocá un ítem para \"mostrárselo\" a la IA.";

  for (const nombre of Object.keys(clasesIA)) {
    const producto = clasesIA[nombre] ? buscarProducto(clasesIA[nombre]) : null;
    const boton = document.createElement("button");
    boton.className = "ia-muestra";
    boton.type = "button";
    boton.innerHTML = '<span class="emoji">' + (producto ? producto.emoji : "🫥") + "</span>" + nombre;

    boton.addEventListener("click", function () {
      iaDemo.querySelectorAll(".ia-muestra").forEach(function (b) { b.classList.remove("activo"); });
      boton.classList.add("activo");
      iaVisor.innerHTML = '<span class="ia-visor-emoji">' + (producto ? producto.emoji : "🫥") + "</span>";
      iaEstado.textContent = "Analizando… 🔍";
      setTimeout(function () {
        ultimaClaseMostrada = "";
        const predicciones = simularPredicciones(nombre);
        mostrarBarras(predicciones);
        mostrarResultado(predicciones);
        iaEstado.textContent = "Modo demo: los resultados son simulados.";
      }, 500);
    });

    iaDemo.appendChild(boton);
  }

  iaDemo.querySelector(".ia-muestra").click();
} else {
  iaDemo.classList.add("oculto");
}