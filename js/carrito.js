(() => {
    const formatPrice = (amount) => new Intl.NumberFormat('es-CR', { maximumFractionDigits: 0 }).format(amount);

    const createElement = (tag, className, text) => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    };

    const renderCart = () => {
        const list = document.getElementById('carrito-lista');
        if (!list) return;
        const cart = window.TiendaStorage.getCart();
        const empty = document.getElementById('carrito-vacio');
        const summary = document.getElementById('carrito-resumen');
        const count = cart.reduce((sum, line) => sum + line.quantity, 0);
        const subtotal = cart.reduce((sum, line) => {
            const product = window.TiendaStorage.getProduct(line.productId);
            return sum + product.precio * line.quantity;
        }, 0);

        list.replaceChildren();
        empty.hidden = cart.length > 0;
        summary.hidden = cart.length === 0;
        document.getElementById('carrito-articulos').textContent = `${count} artículo${count === 1 ? '' : 's'}`;
        document.getElementById('carrito-subtotal').textContent = `₡${formatPrice(subtotal)}`;
        document.getElementById('carrito-total').textContent = `₡${formatPrice(subtotal)}`;

        cart.forEach((line) => {
            const product = window.TiendaStorage.getProduct(line.productId);
            const row = createElement('article', 'carrito-linea');
            const image = document.createElement('img');
            image.className = 'carrito-producto-imagen';
            image.src = product.imagen;
            image.alt = product.nombre;
            const details = createElement('div', 'carrito-producto-info');
            details.append(createElement('span', 'carrito-categoria', product.categoria));
            const title = createElement('a', 'carrito-producto-titulo', product.nombre);
            title.href = `producto.html?id=${encodeURIComponent(product.id)}`;
            details.append(title, createElement('p', 'carrito-unitario', `Precio unitario: ₡${formatPrice(product.precio)}`));

            const controls = createElement('div', 'carrito-cantidad');
            const decrement = createElement('button', '', '−');
            decrement.type = 'button';
            decrement.setAttribute('aria-label', `Reducir cantidad de ${product.nombre}`);
            decrement.disabled = line.quantity <= 1;
            decrement.addEventListener('click', () => changeQuantity(product.id, line.quantity - 1));
            const quantity = createElement('span', '', String(line.quantity));
            const increment = createElement('button', '', '+');
            increment.type = 'button';
            increment.setAttribute('aria-label', `Aumentar cantidad de ${product.nombre}`);
            increment.disabled = line.quantity >= 99;
            increment.addEventListener('click', () => changeQuantity(product.id, line.quantity + 1));
            controls.append(decrement, quantity, increment);

            const subtotalLabel = createElement('strong', 'carrito-subtotal-linea', `₡${formatPrice(product.precio * line.quantity)}`);
            const remove = createElement('button', 'carrito-eliminar', 'Eliminar');
            remove.type = 'button';
            remove.addEventListener('click', () => {
                if (!window.TiendaStorage.removeFromCart(product.id)) {
                    showMessage('No se pudo actualizar el carrito local.', true);
                }
            });
            row.append(image, details, controls, subtotalLabel, remove);
            list.append(row);
        });
    };

    const showMessage = (text, error = false) => {
        const message = document.getElementById('carrito-mensaje');
        message.textContent = text;
        message.classList.toggle('error', error);
    };

    const changeQuantity = (productId, quantity) => {
        if (!window.TiendaStorage.updateQuantity(productId, quantity)) {
            showMessage('La cantidad debe ser un entero entre 1 y 99.', true);
        } else {
            showMessage('');
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        renderCart();
        window.addEventListener('tienda:actualizada', renderCart);
        document.getElementById('carrito-vaciar')?.addEventListener('click', () => {
            if (!window.TiendaStorage.getCart().length) return;
            if (!window.confirm('¿Vaciar el carrito de demostración?')) return;
            if (window.TiendaStorage.clearCart()) showMessage('Carrito local vaciado.');
            else showMessage('No se pudo vaciar el carrito local.', true);
        });

        document.getElementById('carrito-continuar')?.addEventListener('click', () => {
            if (!window.TiendaStorage.getCart().length) return;
            const accepted = window.confirm('Esta acción solo creará un pedido DEMO en este navegador. No se enviará a la tienda ni realizará un pago. ¿Deseas continuar?');
            if (!accepted) return;
            const result = window.TiendaStorage.createDemoOrder();
            if (!result.ok) {
                showMessage(result.reason === 'empty'
                    ? 'Agrega productos antes de crear un pedido de demostración.'
                    : 'No se pudo guardar el pedido DEMO en este navegador.', true);
                return;
            }
            window.location.href = `seguimiento-pedido.html?id=${encodeURIComponent(result.order.id)}`;
        });
    });
})();
