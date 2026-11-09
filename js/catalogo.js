const categoriasCatalogo = [
  'Reptiles',
  'Terrarios',
  'Iluminación y calefacción',
  'Sustratos',
  'Decoración',
  'Suplementos',
  'Gatos y perros',
  'Alimentación',
  'Otros'
];

const normalizarTexto = (valor = '') => valor
  .toString()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const formatearPrecio = (valor) => new Intl.NumberFormat('es-CR', {
  maximumFractionDigits: 0
}).format(valor);

const crearTarjetaProducto = (producto) => `
  <article class="catalogo-producto">
    <div class="catalogo-producto-imagen">
      <img src="${producto.imagen}" alt="${producto.nombre}">
      <button type="button" class="producto-favorito-btn${window.TiendaStorage?.isFavorite(producto.id) ? ' is-favorite' : ''}"
        data-toggle-favorite data-product-id="${producto.id}" aria-pressed="${window.TiendaStorage?.isFavorite(producto.id) || false}"
        aria-label="${window.TiendaStorage?.isFavorite(producto.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
        <i class="bi ${window.TiendaStorage?.isFavorite(producto.id) ? 'bi-heart-fill' : 'bi-heart'}"></i>
      </button>
    </div>

    <div class="catalogo-producto-cuerpo">
      <span class="catalogo-etiqueta">${producto.categoria}</span>
      <h3>${producto.nombre}</h3>
      <p class="catalogo-marca">${producto.marca}</p>
      <p class="catalogo-precio">₡${formatearPrecio(producto.precio)}</p>

      <div class="catalogo-acciones">
        <a href="producto.html?id=${producto.id}" class="btn btn-detalle">Ver detalles</a>
        <button type="button" class="btn btn-agregar-carrito" data-add-cart data-product-id="${producto.id}">Agregar al carrito</button>
      </div>
    </div>
  </article>
`;

const obtenerValoresSeleccionados = () => {
  const categoria = document.getElementById('filtro-categoria')?.value || 'todas';
  const marca = document.getElementById('filtro-marca')?.value || 'todas';
  const min = Number(document.getElementById('precio-min')?.value || 0);
  const max = Number(document.getElementById('precio-max')?.value || Number.MAX_SAFE_INTEGER);
  const busqueda = normalizarTexto(document.getElementById('busqueda-catalogo')?.value || '');
  const orden = document.getElementById('orden-productos')?.value || 'relevancia';

  return { categoria, marca, min, max, busqueda, orden };
};

const aplicarFiltros = () => {
  const { categoria, marca, min, max, busqueda, orden } = obtenerValoresSeleccionados();
  const catalogo = document.getElementById('catalogo-grid');
  const contador = document.getElementById('resultado-contador');
  const sinResultados = document.getElementById('sin-resultados');

  if (!catalogo || !contador || !sinResultados) return;

  const productosFiltrados = [...window.productos].filter((producto) => {
    const nombreNormalizado = normalizarTexto(producto.nombre);
    const marcaNormalizada = normalizarTexto(producto.marca);
    const categoriaNormalizada = normalizarTexto(producto.categoria);

    const coincideCategoria = categoria === 'todas' || categoriaNormalizada === normalizarTexto(categoria);
    const coincideMarca = marca === 'todas' || marcaNormalizada === normalizarTexto(marca);
    const coincidePrecio = producto.precio >= min && producto.precio <= max;
    const coincideBusqueda = !busqueda || nombreNormalizado.includes(busqueda) || categoriaNormalizada.includes(busqueda) || marcaNormalizada.includes(busqueda);

    return coincideCategoria && coincideMarca && coincidePrecio && coincideBusqueda;
  });

  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    switch (orden) {
      case 'precio-menor':
        return a.precio - b.precio;
      case 'precio-mayor':
        return b.precio - a.precio;
      case 'alfabetico':
        return a.nombre.localeCompare(b.nombre, 'es');
      default:
        return a.id - b.id;
    }
  });

  catalogo.innerHTML = productosOrdenados.map(crearTarjetaProducto).join('');
  contador.textContent = `${productosOrdenados.length} producto${productosOrdenados.length === 1 ? '' : 's'} encontrado${productosOrdenados.length === 1 ? '' : 's'}`;

  if (productosOrdenados.length === 0) {
    sinResultados.hidden = false;
    catalogo.classList.add('catalogo-vacio');
  } else {
    sinResultados.hidden = true;
    catalogo.classList.remove('catalogo-vacio');
  }
};

const llenarCategorias = () => {
  const selectCategoria = document.getElementById('filtro-categoria');
  if (!selectCategoria) return;

  selectCategoria.innerHTML = `
    <option value="todas">Todas las categorías</option>
    ${categoriasCatalogo.map((categoria) => `
      <option value="${categoria}">${categoria}</option>
    `).join('')}
  `;

  const params = new URLSearchParams(window.location.search);
  const categoriaSeleccionada = params.get('categoria');
  const busquedaInicial = params.get('buscar');

  if (busquedaInicial) {
    document.getElementById('busqueda-catalogo').value = busquedaInicial.slice(0, 100);
  }

  if (categoriaSeleccionada) {
    const categoriaExistente = categoriasCatalogo.find((categoria) => normalizarTexto(categoria) === normalizarTexto(categoriaSeleccionada));
    if (categoriaExistente) {
      selectCategoria.value = categoriaExistente;
    }
  }
};

const llenarMarcas = () => {
  const selectMarca = document.getElementById('filtro-marca');
  if (!selectMarca) return;

  const marcas = [...new Set(window.productos.map((producto) => producto.marca))].sort((a, b) => a.localeCompare(b, 'es'));

  selectMarca.innerHTML = `
    <option value="todas">Todas las marcas</option>
    ${marcas.map((marca) => `
      <option value="${marca}">${marca}</option>
    `).join('')}
  `;
};

const configurarCategoriaChip = () => {
  const chips = document.querySelectorAll('.categoria-chip');
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const categoria = chip.dataset.categoria;
      document.getElementById('filtro-categoria').value = categoria;
      aplicarFiltros();
      document.querySelector('.catalogo-filtros')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
};

const limpiarFiltros = () => {
  document.getElementById('filtro-categoria').value = 'todas';
  document.getElementById('filtro-marca').value = 'todas';
  document.getElementById('precio-min').value = '';
  document.getElementById('precio-max').value = '';
  document.getElementById('busqueda-catalogo').value = '';
  document.getElementById('orden-productos').value = 'relevancia';
  aplicarFiltros();
};

const inicializarCatalogo = () => {
  if (!window.productos || !window.productos.length) return;

  llenarCategorias();
  llenarMarcas();
  configurarCategoriaChip();

  document.getElementById('filtro-categoria')?.addEventListener('change', aplicarFiltros);
  document.getElementById('filtro-marca')?.addEventListener('change', aplicarFiltros);
  document.getElementById('precio-min')?.addEventListener('input', aplicarFiltros);
  document.getElementById('precio-max')?.addEventListener('input', aplicarFiltros);
  document.getElementById('busqueda-catalogo')?.addEventListener('input', aplicarFiltros);
  document.getElementById('orden-productos')?.addEventListener('change', aplicarFiltros);
  document.getElementById('limpiar-filtros')?.addEventListener('click', limpiarFiltros);

  aplicarFiltros();
  window.addEventListener('favoritos:actualizados', aplicarFiltros);
};

document.addEventListener('DOMContentLoaded', inicializarCatalogo);
