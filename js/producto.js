const obtenerProductoActual = () => {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get('id'));
  return window.productos.find((producto) => producto.id === id) || null;
};

const formatearPrecio = (valor) => new Intl.NumberFormat('es-CR', {
  maximumFractionDigits: 0
}).format(valor);

const pintarProductosRelacionados = (productoActual) => {
  const contenedor = document.getElementById('productos-relacionados');
  if (!contenedor) return;

  const relacionados = window.productos.filter((producto) => {
    if (producto.id === productoActual.id) return false;
    return producto.categoria === productoActual.categoria || producto.marca === productoActual.marca;
  }).slice(0, 4);

  if (!relacionados.length) {
    contenedor.innerHTML = '<p class="producto-relacionado-vacio">No hay productos relacionados disponibles por el momento.</p>';
    return;
  }

  contenedor.innerHTML = relacionados.map((producto) => `
    <article class="producto-relacionado">
      <a href="producto.html?id=${producto.id}" class="producto-relacionado-imagen">
        <img src="${producto.imagen}" alt="${producto.nombre}">
      </a>
      <div class="producto-relacionado-body">
        <span>${producto.categoria}</span>
        <h3>${producto.nombre}</h3>
        <p>₡${formatearPrecio(producto.precio)}</p>
        <a href="producto.html?id=${producto.id}" class="btn btn-detalle">Ver detalle</a>
      </div>
    </article>
  `).join('');
};

const renderizarDetalle = () => {
  const contenedor = document.getElementById('producto-detalle');
  if (!contenedor) return;

  const producto = obtenerProductoActual();

  if (!producto) {
    document.title = 'Producto no encontrado | TodoReptilesCR';
    contenedor.innerHTML = `
      <div class="producto-no-encontrado">
        <h1>Producto no encontrado</h1>
        <p>El producto solicitado no existe o fue eliminado. Puedes volver al catálogo para explorar otras opciones.</p>
        <a href="catalogo.html" class="btn btn-primary">Volver al catálogo</a>
      </div>
    `;
    return;
  }

  document.title = `${producto.nombre} | TodoReptilesCR`;

  contenedor.innerHTML = `
    <div class="producto-imagen-grande">
      <img src="${producto.imagen}" alt="${producto.nombre}">
    </div>

    <div class="producto-info-detalle">
      <span class="producto-badge">${producto.categoria}</span>
      <h1>${producto.nombre}</h1>

      <div class="producto-meta">
        <p><strong>Marca:</strong> ${producto.marca}</p>
        <p><strong>Precio:</strong> <span class="producto-precio">₡${formatearPrecio(producto.precio)}</span></p>
      </div>

      <p class="producto-descripcion">${producto.descripcion}</p>

      <div class="producto-disponibilidad">
        <strong>Disponibilidad:</strong>
        <span>${producto.disponibilidad}</span>
      </div>

      <div class="producto-acciones-detalle">
        <label for="cantidad-producto">Cantidad</label>
        <div class="selector-cantidad">
          <button type="button" aria-label="Restar cantidad" data-accion="restar">-</button>
          <input id="cantidad-producto" type="number" value="1" min="1" max="10" readonly>
          <button type="button" aria-label="Sumar cantidad" data-accion="sumar">+</button>
        </div>
        <button type="button" class="btn btn-agregar-carrito" data-add-cart data-product-id="${producto.id}" data-quantity-input="cantidad-producto">Agregar al carrito</button>
        <button type="button" class="producto-detalle-favorito${window.TiendaStorage?.isFavorite(producto.id) ? ' is-favorite' : ''}"
          data-toggle-favorite data-product-id="${producto.id}" aria-pressed="${window.TiendaStorage?.isFavorite(producto.id) || false}"
          aria-label="${window.TiendaStorage?.isFavorite(producto.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
          <i class="bi ${window.TiendaStorage?.isFavorite(producto.id) ? 'bi-heart-fill' : 'bi-heart'}"></i> Favoritos
        </button>
      </div>

      <a href="catalogo.html" class="volver-catalogo">← Volver al catálogo</a>
    </div>
  `;

  const cantidadInput = document.getElementById('cantidad-producto');
  const actualizarCantidad = (valor) => {
    if (!cantidadInput) return;
    const cantidadActual = Number(cantidadInput.value) || 1;
    const nuevaCantidad = Math.max(1, Math.min(10, cantidadActual + valor));
    cantidadInput.value = nuevaCantidad;
  };

  document.querySelector('[data-accion="restar"]')?.addEventListener('click', () => actualizarCantidad(-1));
  document.querySelector('[data-accion="sumar"]')?.addEventListener('click', () => actualizarCantidad(1));

  pintarProductosRelacionados(producto);
};

document.addEventListener('DOMContentLoaded', renderizarDetalle);
