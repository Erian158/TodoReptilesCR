(() => {
    const formatPrice = (amount) => new Intl.NumberFormat('es-CR', { maximumFractionDigits: 0 }).format(amount);
    const statuses = ['Recibido', 'En preparación', 'Enviado', 'Entregado'];

    const render = () => {
        const container = document.getElementById('seguimiento-contenido');
        const orderId = new URLSearchParams(window.location.search).get('id');
        const order = window.TiendaStorage.getOrders().find((item) => item.id === orderId);
        if (!order) {
            container.innerHTML = '';
            const message = document.createElement('section');
            message.className = 'pedido-no-encontrado';
            const title = document.createElement('h1');
            title.textContent = 'Pedido DEMO no encontrado';
            const text = document.createElement('p');
            text.textContent = 'El identificador no corresponde a un pedido de demostración guardado en este navegador.';
            const link = document.createElement('a');
            link.href = 'pedidos.html';
            link.className = 'btn-tienda-primary';
            link.textContent = 'Volver al historial';
            message.append(title, text, link);
            container.append(message);
            return;
        }

        const main = document.createElement('section');
        main.className = 'seguimiento-card';
        const heading = document.createElement('div');
        heading.className = 'seguimiento-heading';
        const title = document.createElement('h1');
        title.textContent = `Pedido DEMO ${order.id}`;
        const badge = document.createElement('span');
        badge.className = 'pedido-estado';
        badge.textContent = order.status;
        heading.append(title, badge);
        const note = document.createElement('p');
        note.className = 'pedido-nota-demo';
        note.textContent = 'Seguimiento demostrativo local. Estos estados no representan una compra recibida ni información logística real.';
        const date = document.createElement('p');
        date.className = 'seguimiento-fecha';
        const createdAt = new Date(order.createdAt);
        date.textContent = `Creado localmente: ${Number.isNaN(createdAt.getTime()) ? 'fecha no disponible' : new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium', timeStyle: 'short' }).format(createdAt)}`;
        const progress = document.createElement('ol');
        progress.className = 'pedido-progreso';
        const currentIndex = statuses.indexOf(order.status);
        statuses.forEach((status, index) => {
            const step = document.createElement('li');
            step.className = index <= currentIndex ? 'completado' : '';
            const marker = document.createElement('span');
            marker.className = 'progreso-marcador';
            marker.textContent = index < currentIndex ? '✓' : String(index + 1);
            const label = document.createElement('strong');
            label.textContent = status;
            const caption = document.createElement('small');
            caption.textContent = index <= currentIndex ? 'Estado DEMO' : 'Pendiente en la demostración';
            step.append(marker, label, caption);
            progress.append(step);
        });

        const list = document.createElement('div');
        list.className = 'seguimiento-items';
        order.items.forEach((item) => {
            const row = document.createElement('div');
            row.className = 'seguimiento-item';
            const name = document.createElement('span');
            name.textContent = `${item.name} × ${item.quantity}`;
            const subtotal = document.createElement('strong');
            subtotal.textContent = `₡${formatPrice(item.subtotal)}`;
            row.append(name, subtotal);
            list.append(row);
        });
        const total = document.createElement('p');
        total.className = 'seguimiento-total';
        total.textContent = `Total DEMO: ₡${formatPrice(order.total)}`;
        const link = document.createElement('a');
        link.className = 'btn-tienda-outline';
        link.href = 'pedidos.html';
        link.textContent = 'Volver al historial';
        main.append(heading, note, date, progress, list, total, link);
        container.replaceChildren(main);
    };

    document.addEventListener('DOMContentLoaded', render);
})();
