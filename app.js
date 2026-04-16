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

function agregarVenta(surtidoId, productoId) {
  let cantidad = Number(prompt("Cantidad vendida (kg):"));

  let surtido = surtidos.find(s => s.id === surtidoId);
  let producto = surtido.productos.find(p => p.id === productoId);

  let vendidos = producto.ventas.reduce((a, b) => a + b, 0);

  if (vendidos + cantidad > producto.kilos) {
    alert("No puedes vender más de lo que tienes");
    return;
  }

  producto.ventas.push(cantidad);

  guardar(surtidos);
  render();
}

function calcularProducto(producto) {
  let capital = producto.kilos * producto.precioKilo;
  let vendidos = producto.ventas.reduce((a, b) => a + b, 0);
  let total = vendidos * producto.precioVenta;
  let ganancia = total - capital;
  let restante = producto.kilos - vendidos;

  return { capital, vendidos, total, ganancia, restante };
}

function render() {
  let contenedor = document.getElementById("surtidos");
  contenedor.innerHTML = "";

  surtidos.forEach(surtido => {
    let div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>Surtido - ${surtido.fecha}</h3>
      <button onclick="agregarProducto(${surtido.id})">Agregar Producto</button>
    `;

    surtido.productos.forEach(p => {
      let calc = calcularProducto(p);

      let prodDiv = document.createElement("div");
      prodDiv.className = "producto";

      prodDiv.innerHTML = `
        <h4>${p.nombre}</h4>
        <div class="producto-grid">

  <div><strong>Kilos:</strong> ${p.kilos}</div>
  <div><strong>Precio compra:</strong> ${p.precioKilo}</div>
  <div><strong>Precio venta:</strong> ${p.precioVenta}</div>

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

</div> `;

      div.appendChild(prodDiv);
    });

    contenedor.appendChild(div);
  });
}

render();
