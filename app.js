function formatoMoneda(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(valor);
}

let editActual = {};
let surtidos = cargar();

function crearSurtido() {
  let nuevo = {
    id: Date.now(),
    fecha: new Date().toISOString(),
    productos: []
  };

  surtidos.unshift(nuevo);
  guardar(surtidos);
  render();
}

function formatearFecha(fecha) {
  const opciones = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(fecha).toLocaleDateString('es-CO', opciones);
}

  function borrarSurtido(id) {
  let confirmar = confirm("¿Seguro que quieres eliminar este surtido?");
  if (!confirmar) return;

  surtidos = surtidos.filter(s => s.id !== id);

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


function borrarProducto(surtidoId, productoId) {
  let confirmar = confirm("¿Quitar este producto?");
  if (!confirmar) return;

  let surtido = surtidos.find(s => s.id === surtidoId);

  surtido.productos = surtido.productos.filter(p => p.id !== productoId);

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

function eliminarVenta(surtidoId, productoId, index) {
  let confirmar = confirm("¿Eliminar esta venta?");
  if (!confirmar) return;

  let surtido = surtidos.find(s => s.id === surtidoId);
  let producto = surtido.productos.find(p => p.id === productoId);

  producto.ventas.splice(index, 1);

  guardar(surtidos);
  render();
  verHistorial(surtidoId, productoId); // refresca el modal
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
          .map((v, index) => {
        let cantidad = typeof v === "number" ? v : v.cantidad;
        let nota = typeof v === "number" ? "" : v.nota;
        let fecha = typeof v === "number" ? "" : v.fecha;

        return `
         <div class="item-historial">
    <div>
      <strong>${fecha}</strong><br>
      ${cantidad} kg - ${nota || "Sin nota"}
    </div>

    <button class="btn-delete-mini"
      onclick="eliminarVenta(${surtidoId}, ${productoId}, ${index})">
      ❌
    </button>
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


function abrirEditar(surtidoId, productoId) {
  editActual = { surtidoId, productoId };

  let surtido = surtidos.find(s => s.id === surtidoId);
  let producto = surtido.productos.find(p => p.id === productoId);

  document.getElementById("editKilos").value = producto.kilos;
  document.getElementById("editCompra").value = producto.precioKilo;
  document.getElementById("editVenta").value = producto.precioVenta;

  document.getElementById("modalEditar").classList.remove("hidden");
}

function cerrarEditar() {
  document.getElementById("modalEditar").classList.add("hidden");
}

function guardarEdicion() {
  let kilos = Number(document.getElementById("editKilos").value);
  let compra = Number(document.getElementById("editCompra").value);
  let venta = Number(document.getElementById("editVenta").value);

  if (!kilos || kilos <= 0) {
    alert("Kilos inválidos");
    return;
  }

  let surtido = surtidos.find(s => s.id === editActual.surtidoId);
  let producto = surtido.productos.find(p => p.id === editActual.productoId);

  let vendidos = producto.ventas.reduce((a, v) => {
    return a + (typeof v === "number" ? v : v.cantidad);
  }, 0);

  // 🚨 VALIDACIÓN CLAVE
  if (kilos < vendidos) {
    alert("No puedes poner menos kilos que los ya vendidos");
    return;
  }

  producto.kilos = kilos;
  producto.precioKilo = compra;
  producto.precioVenta = venta;

  guardar(surtidos);
  render();
  cerrarEditar();
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

function exportarBackup() {
  let datos = JSON.stringify(surtidos, null, 2);

  let blob = new Blob([datos], { type: "application/json" });
  let url = URL.createObjectURL(blob);

  let a = document.createElement("a");
  a.href = url;
  a.download = "backup_surtidos.json";
  a.click();

  URL.revokeObjectURL(url);
}

function importarBackup(event) {
  let archivo = event.target.files[0];

  if (!archivo) return;

  let lector = new FileReader();

  lector.onload = function(e) {
    try {
      let datos = JSON.parse(e.target.result);

      if (!Array.isArray(datos)) {
        alert("Archivo inválido");
        return;
      }

      let confirmar = confirm("Esto reemplazará todos tus datos actuales. ¿Continuar?");
      if (!confirmar) return;

      surtidos = datos;

      guardar(surtidos);
      render();

      alert("Backup restaurado correctamente ✅");

    } catch (error) {
      alert("Error al leer el archivo");
    }
  };

  lector.readAsText(archivo);
}


function verResumen(surtidoId) {
  let surtido = surtidos.find(s => s.id === surtidoId);

  let capital = 0;
  let total = 0;

  surtido.productos.forEach(p => {
    let calc = calcularProducto(p);
    capital += calc.capital;
    total += calc.total;
  });

  let ganancia = total - capital;

  document.getElementById("resCapital").innerText = formatoMoneda(capital);
  document.getElementById("resTotal").innerText = formatoMoneda(total);

  let gananciaElem = document.getElementById("resGanancia");
  gananciaElem.innerText = formatoMoneda(ganancia);

  gananciaElem.className = ganancia >= 0 ? "ganancia" : "perdida";

  document.getElementById("modalResumen").classList.remove("hidden");
}


function cerrarResumen() {
  document.getElementById("modalResumen").classList.add("hidden");
}




// 🎨 RENDER
function render() {
  let contenedor = document.getElementById("surtidos");
  contenedor.innerHTML = "";

  surtidos.forEach(surtido => {
    let div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
div.innerHTML = `
  <div class="header-surtido">

    <div class="fecha-surtido">
      <span class="label">Surtido</span>
      <span class="fecha">${formatearFecha(surtido.fecha)}</span>
    </div>

    <div class="acciones-surtido">
      <button class="btn-view"
        onclick="verResumen(${surtido.id})">
        👁️
      </button>

      <button class="btn-delete"
        onclick="borrarSurtido(${surtido.id})">
        🗑️
      </button>
    </div>

  </div>

  <!-- 🔥 ESTE ES EL QUE FALTA -->
  <button class="btn-full"
    onclick="agregarProducto(${surtido.id})">
    Agregar Producto
  </button>
`;
  </div>
    `;

    surtido.productos.forEach(p => {
      let calc = calcularProducto(p);

      let prodDiv = document.createElement("div");
      prodDiv.className = "producto";

      prodDiv.innerHTML = `
      <h4 class="header-producto">
        <span>${p.nombre}</span>
        <div class="acciones-producto">
        <button class="btn-edit"
        onclick="abrirEditar(${surtido.id}, ${p.id})">
      ✏️
    </button>

    <button class="btn-vender"
      onclick="abrirVenta(${surtido.id}, ${p.id})">
      Vender
    </button>   
      
     

    <button class="btn-delete"
      onclick="borrarProducto(${surtido.id}, ${p.id})">
      🗑️
    </button>
  </div>
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
