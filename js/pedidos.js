(() => {
    const formatPrice = (amount) => new Intl.NumberFormat('es-CR', { maximumFractionDigits: 0 }).format(amount);
    const formatDate = (date) => {
        const parsed = new Date(date);
        return Number.isNaN(parsed.getTime()) ? 'Fecha no disponible' : new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium' }).format(parsed);
    };

    const renderOrders = () => {
        const list = document.getElementById('pedidos-lista');
        if (!list) return;
        const orders = window.TiendaStorage.getOrders();
        const empty = document.getElementById('pedidos-vacio');
        list.replaceChildren();
        empty.hidden = orders.length > 0;

        orders.forEach((order) => {
            const card = document.createElement('article');
            card.className = 'pedido-card';
            const heading = document.createElement('div');
            heading.className = 'pedido-card-top';
            const title = document.createElement('h2');
            title.textContent = `Pedido ${order.id}`;
            const status = document.createElement('span');
            status.className = 'pedido-estado';
            status.textContent = order.status;
            heading.append(title, status);
            const info = document.createElement('div');
            info.className = 'pedido-card-info';
            [
                `Fecha DEMO: ${formatDate(order.createdAt)}`,
                `${order.items.reduce((sum, item) => sum + item.quantity, 0)} artículo(s)`,
                `Total DEMO: ₡${formatPrice(order.total)}`
            ].forEach((text) => {
                const item = document.createElement('p');
                item.textContent = text;
                info.append(item);
            });
            const actions = document.createElement('div');
            actions.className = 'pedido-card-actions';
            const tracking = document.createElement('a');
            tracking.className = 'btn-tienda-primary';
            tracking.href = `seguimiento-pedido.html?id=${encodeURIComponent(order.id)}`;
            tracking.textContent = 'Ver pedido y seguimiento DEMO';
            actions.append(tracking);
            card.append(heading, info, actions);
            list.append(card);
        });
    };

    document.addEventListener('DOMContentLoaded', () => {
        renderOrders();
        window.addEventListener('tienda:actualizada', renderOrders);
    });
})();
