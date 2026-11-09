(() => {
    const KEYS = {
        cart: 'todoreptilescr_carrito_demo',
        favorites: 'todoreptilescr_favoritos_demo',
        orders: 'todoreptilescr_pedidos_demo'
    };

    const read = (key) => {
        try {
            const value = localStorage.getItem(key);
            if (!value) return [];
            const parsed = JSON.parse(value);
            if (!Array.isArray(parsed)) throw new TypeError('El formato guardado no es una lista.');
            return parsed;
        } catch (error) {
            console.error(`No se pudo leer ${key}:`, error);
            window.dispatchEvent(new CustomEvent('tienda:storage-error', {
                detail: { message: 'No se pudieron leer algunos datos de demostración guardados en este navegador.' }
            }));
            return [];
        }
    };

    const write = (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            window.dispatchEvent(new CustomEvent('tienda:actualizada', { detail: { key } }));
            return true;
        } catch (error) {
            console.error(`No se pudo guardar ${key}:`, error);
            return false;
        }
    };

    const getProduct = (id) => {
        const numericId = Number(id);
        return (window.productos || []).find((product) => product.id === numericId) || null;
    };

    const getCart = () => read(KEYS.cart).filter((line) => {
        return Number.isInteger(line.productId)
            && Number.isInteger(line.quantity)
            && line.quantity > 0
            && getProduct(line.productId);
    }).map((line) => ({
        productId: line.productId,
        quantity: Math.min(99, line.quantity)
    }));

    const setCart = (lines) => write(KEYS.cart, lines);

    const addToCart = (id, quantity = 1) => {
        const product = getProduct(id);
        const amount = Number(quantity);
        if (!product || !Number.isInteger(amount) || amount < 1 || amount > 99) return false;
        const cart = getCart();
        const existing = cart.find((line) => line.productId === product.id);
        if (existing) existing.quantity = Math.min(99, existing.quantity + amount);
        else cart.push({ productId: product.id, quantity: amount });
        return setCart(cart);
    };

    const updateQuantity = (id, quantity) => {
        const amount = Number(quantity);
        if (!getProduct(id) || !Number.isInteger(amount) || amount < 1 || amount > 99) return false;
        const cart = getCart();
        const line = cart.find((item) => item.productId === Number(id));
        if (!line) return false;
        line.quantity = amount;
        return setCart(cart);
    };

    const removeFromCart = (id) => setCart(getCart().filter((line) => line.productId !== Number(id)));
    const clearCart = () => setCart([]);

    const getFavorites = () => [...new Set(read(KEYS.favorites)
        .filter((id) => Number.isInteger(id) && getProduct(id)))];

    const toggleFavorite = (id) => {
        const product = getProduct(id);
        if (!product) return false;
        const favorites = getFavorites();
        const next = favorites.includes(product.id)
            ? favorites.filter((favoriteId) => favoriteId !== product.id)
            : [...favorites, product.id];
        return write(KEYS.favorites, next);
    };

    const isFavorite = (id) => getFavorites().includes(Number(id));
    const removeFavorite = (id) => write(KEYS.favorites, getFavorites().filter((favoriteId) => favoriteId !== Number(id)));

    const getOrders = () => read(KEYS.orders).filter((order) => {
        return order
            && typeof order.id === 'string'
            && order.id.length <= 60
            && order.demo === true
            && typeof order.createdAt === 'string'
            && ['Recibido', 'En preparación', 'Enviado', 'Entregado'].includes(order.status)
            && Array.isArray(order.items)
            && order.items.length > 0
            && order.items.every((item) => item
                && Number.isInteger(item.productId)
                && typeof item.name === 'string'
                && item.name.length <= 200
                && typeof item.image === 'string'
                && item.image.length <= 240
                && Number.isInteger(item.unitPrice)
                && item.unitPrice >= 0
                && Number.isInteger(item.quantity)
                && item.quantity >= 1
                && item.quantity <= 99
                && Number.isInteger(item.subtotal)
                && item.subtotal === item.unitPrice * item.quantity)
            && Number.isFinite(order.total)
            && order.total === order.items.reduce((sum, item) => sum + item.subtotal, 0);
    });

    const createDemoOrder = () => {
        const cart = getCart();
        if (!cart.length) return { ok: false, reason: 'empty' };

        const items = cart.map((line) => {
            const product = getProduct(line.productId);
            return {
                productId: product.id,
                name: product.nombre,
                image: product.imagen,
                unitPrice: product.precio,
                quantity: line.quantity,
                subtotal: product.precio * line.quantity
            };
        });
        const order = {
            id: `DEMO-${Date.now().toString(36).toUpperCase()}`,
            createdAt: new Date().toISOString(),
            status: 'Recibido',
            demo: true,
            items,
            total: items.reduce((sum, item) => sum + item.subtotal, 0)
        };
        const orders = getOrders();
        orders.unshift(order);
        if (!write(KEYS.orders, orders)) return { ok: false, reason: 'storage' };
        if (!clearCart()) return { ok: false, reason: 'storage' };
        return { ok: true, order };
    };

    const updateDemoOrderStatus = (id, status) => {
        const allowed = ['Recibido', 'En preparación', 'Enviado', 'Entregado'];
        if (!allowed.includes(status)) return false;
        const orders = getOrders();
        const order = orders.find((item) => item.id === id);
        if (!order) return false;
        order.status = status;
        return write(KEYS.orders, orders);
    };

    window.TiendaStorage = {
        getCart,
        setCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getFavorites,
        toggleFavorite,
        isFavorite,
        removeFavorite,
        getOrders,
        createDemoOrder,
        updateDemoOrderStatus,
        getProduct
    };

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.header-actions a[aria-label="Carrito"]').forEach((link) => {
            link.href = 'carrito.html';
            link.classList.add('carrito-header-link');
            link.innerHTML = '<i class="bi bi-cart3"></i><span class="carrito-header-contador" aria-live="polite"></span>';
            const actualizarContador = () => {
                const count = getCart().reduce((sum, line) => sum + line.quantity, 0);
                const badge = link.querySelector('.carrito-header-contador');
                badge.textContent = count > 0 ? String(count) : '';
                badge.hidden = count === 0;
                link.setAttribute('aria-label', count ? `Carrito, ${count} artículos` : 'Carrito');
            };
            actualizarContador();
            window.addEventListener('tienda:actualizada', actualizarContador);
        });

        const notify = (text, error = false) => {
            let region = document.getElementById('tienda-notificacion');
            if (!region) {
                region = document.createElement('div');
                region.id = 'tienda-notificacion';
                region.className = 'tienda-notificacion';
                region.setAttribute('role', 'status');
                region.setAttribute('aria-live', 'polite');
                document.body.append(region);
            }
            region.textContent = text;
            region.classList.toggle('error', error);
            region.hidden = false;
            window.clearTimeout(region.hideTimer);
            region.hideTimer = window.setTimeout(() => { region.hidden = true; }, 3500);
        };

        window.addEventListener('tienda:storage-error', (event) => {
            notify(event.detail?.message || 'Ocurrió un error al leer datos de demostración.', true);
        });

        document.addEventListener('click', (event) => {
            const favorite = event.target.closest('[data-toggle-favorite]');
            if (favorite) {
                const productId = Number(favorite.dataset.productId);
                if (!toggleFavorite(productId)) {
                    notify('No se pudo actualizar favoritos en este navegador.', true);
                    return;
                }
                const active = isFavorite(productId);
                favorite.setAttribute('aria-pressed', String(active));
                favorite.setAttribute('aria-label', active ? 'Quitar de favoritos' : 'Agregar a favoritos');
                favorite.classList.toggle('is-favorite', active);
                const icon = favorite.querySelector('i');
                if (icon) icon.className = active ? 'bi bi-heart-fill' : 'bi bi-heart';
                window.dispatchEvent(new CustomEvent('favoritos:actualizados'));
                notify(active ? 'Producto agregado a favoritos.' : 'Producto quitado de favoritos.');
                return;
            }

            const addButton = event.target.closest('[data-add-cart]');
            if (!addButton) return;
            const quantityInput = addButton.dataset.quantityInput
                ? document.getElementById(addButton.dataset.quantityInput)
                : null;
            const quantity = quantityInput ? Number(quantityInput.value) : Number(addButton.dataset.quantity || 1);
            if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
                notify('La cantidad debe ser un número entero entre 1 y 99.', true);
                return;
            }
            if (!addToCart(addButton.dataset.productId, quantity)) {
                notify('No se pudo agregar el producto. Revisa el almacenamiento local del navegador.', true);
                return;
            }
            notify('Producto agregado al carrito de demostración.');
        });
    });
})();
