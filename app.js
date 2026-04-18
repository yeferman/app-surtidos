function formatoMoneda(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(valor);
}

let surtidos = cargar();

function crearSurtido() {
  let nuevo = {
    id: Date.now(),
    fecha: new Date().toLocaleDateString(),
    productos: []
  };

  function borrarSurtido(id) {
  let confirmar = confirm("¿Seguro que quieres eliminar este surtido?");
  if (!confirmar) return;

  surtidos = surtidos.filter(s => s.id !== id);

  guardar(surtidos);
  render();
}

  surtidos.push(nuevo);
  guardar(surtidos);
  render();
}

function agregarProducto(surtidoId) {
  let nombre = prompt("Nombre del producto:");
  let kilos = Number(prompt("Kilos comprados:"));
  let precioKilo = Number(prompt("Precio por kilo:"));
  let precioVenta = Number(prompt("Precio de venta:"));

  let surtido = surtidos.find(s => s.id === surtidoId);

  surtido.productos.push({
    id: Date.now(),
    nombre,
    kilos,
    precioKilo,
    precioVenta,
    ventas: []
  });

  guardar(surtidos);
  render();
}

// 🔥 NUEVO SISTEMA DE VENTAS
let ventaActual = {};

function abrirVenta(surtidoId, productoId) {
  ventaActual = { surtidoId, productoId };
  document.getElementById("modalVenta").classList.remove("hidden");
}

function cerrarModal() {
  document.getElementById("modalVenta").classList.add("hidden");
  document.getElementById("inputKg").value = "";
  document.getElementById("inputNota").value = "";
}

function confirmarVenta() {
  let kg = Number(document.getElementById("inputKg").value);
  let nota = document.getElementById("inputNota").value;

  if (!kg || kg <= 0) {
    alert("Cantidad inválida");
    return;
  }

  let surtido = surtidos.find(s => s.id === ventaActual.surtidoId);
  let producto = surtido.productos.find(p => p.id === ventaActual.productoId);

  let vendidos = producto.ventas.reduce((a, v) => {
    return a + (typeof v === "number" ? v : v.cantidad);
  }, 0);

  if (vendidos + kg > producto.kilos) {
    alert("No tienes suficiente inventario");
    return;
  }

  producto.ventas.push({
    cantidad: kg,
    nota: nota || "",
    fecha: new Date().toLocaleString()
  });

  guardar(surtidos);
  cerrarModal();
  render();
}

// 📜 HISTORIAL
function verHistorial(surtidoId, productoId) {
  let surtido = surtidos.find(s => s.id === surtidoId);
  let producto = surtido.productos.find(p => p.id === productoId);

  let contenedor = document.getElementById("listaHistorial");

  if (producto.ventas.length === 0) {
    contenedor.innerHTML = "<p>No hay ventas</p>";
  } else {
    contenedor.innerHTML = producto.ventas
      .slice()
      .reverse()
      .map(v => {
        let cantidad = typeof v === "number" ? v : v.cantidad;
        let nota = typeof v === "number" ? "" : v.nota;
        let fecha = typeof v === "number" ? "" : v.fecha;

        return `
          <div>
            <strong>${fecha}</strong><br>
            ${cantidad} kg - ${nota || "Sin nota"}
          </div>
          <hr>
        `;
      })
      .join("");
  }

  document.getElementById("modalHistorial").classList.remove("hidden");
}

function cerrarHistorial() {
  document.getElementById("modalHistorial").classList.add("hidden");
}

// 🧮 CÁLCULOS
function calcularProducto(producto) {
  let capital = producto.kilos * producto.precioKilo;

  let vendidos = producto.ventas.reduce((a, v) => {
    return a + (typeof v === "number" ? v : v.cantidad);
  }, 0);

  let total = vendidos * producto.precioVenta;
  let ganancia = total - capital;
  let restante = producto.kilos - vendidos;

  return { capital, vendidos, total, ganancia, restante };
}

// 🎨 RENDER
function render() {
  let contenedor = document.getElementById("surtidos");
  contenedor.innerHTML = "";

  surtidos.forEach(surtido => {
    let div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <div class="header-surtido">
  <h3>Surtido - ${surtido.fecha}</h3>

  <button class="btn-delete"
    onclick="borrarSurtido(${surtido.id})">
    🗑️
  </button>

   <h3>Surtido - ${surtido.fecha}</h3>
      <button class="btn-full" onclick="agregarProducto(${surtido.id})">
        Agregar Producto
      </button>
</div>
    `;

    surtido.productos.forEach(p => {
      let calc = calcularProducto(p);

      let prodDiv = document.createElement("div");
      prodDiv.className = "producto";

      prodDiv.innerHTML = `
        <h4 class="header-producto">
          <span>${p.nombre}</span>
          <button class="btn-vender"
            onclick="abrirVenta(${surtido.id}, ${p.id})">
            Vender
          </button>
        </h4>

        <div class="producto-grid">

          <div><strong>Kilos:</strong> ${p.kilos}</div>
          <div><strong>Compra:</strong> ${formatoMoneda(p.precioKilo)}</div>
          <div><strong>Venta:</strong> ${formatoMoneda(p.precioVenta)}</div>

          <div><strong>Vendidos:</strong> ${calc.vendidos}</div>
          <div><strong>Restante:</strong> ${calc.restante}</div>
          <div></div>

          <div><strong>Capital:</strong> ${formatoMoneda(calc.capital)}</div>
          <div><strong>Total:</strong> ${formatoMoneda(calc.total)}</div>
          <div>
            <strong>Ganancia:</strong>
            <span class="${calc.ganancia >= 0 ? 'ganancia' : 'perdida'}">
              ${formatoMoneda(calc.ganancia)}
            </span>
          </div>

        </div>

        <button class="btn-full btn-historial"
          onclick="verHistorial(${surtido.id}, ${p.id})">
          📜 Historial
        </button>
      `;

      div.appendChild(prodDiv);
    });

    contenedor.appendChild(div);
  });
}

render();
