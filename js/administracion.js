(() => {
    const formatPrice = (amount) => new Intl.NumberFormat('es-CR', { maximumFractionDigits: 0 }).format(amount);
    const statuses = ['Recibido', 'En preparación', 'Enviado', 'Entregado'];
    let orderQuery = '';
    let statusQuery = '';
    let productQuery = '';

    const addCell = (row, value, className = '') => {
        const cell = document.createElement('td');
        if (className) cell.className = className;
        if (value instanceof Node) cell.append(value);
        else cell.textContent = value;
        row.append(cell);
    };

    const renderOrders = () => {
        const body = document.getElementById('admin-tabla-pedidos');
        if (!body) return;
        const orders = window.TiendaStorage.getOrders().filter((order) => {
            return order.id.toLowerCase().includes(orderQuery)
                && (!statusQuery || order.status === statusQuery);
        });
        const empty = document.getElementById('admin-pedidos-vacios');
        body.replaceChildren();
        empty.hidden = orders.length > 0;
        document.getElementById('admin-pedidos-total').textContent = String(window.TiendaStorage.getOrders().length);

        orders.forEach((order) => {
            const row = document.createElement('tr');
            const date = new Date(order.createdAt);
            addCell(row, order.id);
            addCell(row, Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium' }).format(date));
            addCell(row, String(order.items.reduce((sum, item) => sum + item.quantity, 0)));
            addCell(row, `₡${formatPrice(order.total)}`);

            const select = document.createElement('select');
            select.className = 'admin-estado-select';
            select.setAttribute('aria-label', `Estado DEMO del pedido ${order.id}`);
            statuses.forEach((status) => select.add(new Option(status, status)));
            select.value = order.status;
            select.addEventListener('change', () => {
                if (!window.TiendaStorage.updateDemoOrderStatus(order.id, select.value)) {
                    window.alert('No se pudo actualizar este estado DEMO local.');
                }
            });
            addCell(row, select);

            const tracking = document.createElement('a');
            tracking.className = 'admin-seguimiento-link';
            tracking.href = `seguimiento-pedido.html?id=${encodeURIComponent(order.id)}`;
            tracking.textContent = 'Abrir';
            addCell(row, tracking);
            body.append(row);
        });
    };

    const renderInventory = () => {
        const body = document.getElementById('admin-tabla-inventario');
        if (!body) return;
        const products = (window.productos || []).filter((product) => {
            const searchable = `${product.nombre} ${product.marca} ${product.categoria}`.toLocaleLowerCase('es');
            return searchable.includes(productQuery);
        });
        const empty = document.getElementById('admin-inventario-vacios');
        body.replaceChildren();
        empty.hidden = products.length > 0;
        document.getElementById('admin-productos-total').textContent = String((window.productos || []).length);

        products.forEach((product) => {
            const row = document.createElement('tr');
            addCell(row, product.nombre);
            addCell(row, product.marca);
            addCell(row, product.categoria);
            addCell(row, `₡${formatPrice(product.precio)}`);
            addCell(row, 'No informado', 'admin-stock-no-disponible');
            body.append(row);
        });
    };

    document.addEventListener('DOMContentLoaded', () => {
        renderOrders();
        renderInventory();
        document.getElementById('admin-busqueda-pedidos')?.addEventListener('input', (event) => {
            orderQuery = event.target.value.trim().toLocaleLowerCase('es');
            renderOrders();
        });
        document.getElementById('admin-filtro-estado')?.addEventListener('change', (event) => {
            statusQuery = event.target.value;
            renderOrders();
        });
        document.getElementById('admin-busqueda-inventario')?.addEventListener('input', (event) => {
            productQuery = event.target.value.trim().toLocaleLowerCase('es');
            renderInventory();
        });
        window.addEventListener('tienda:actualizada', renderOrders);
    });
})();
