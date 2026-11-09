(() => {
    const formatPrice = (amount) => new Intl.NumberFormat('es-CR', { maximumFractionDigits: 0 }).format(amount);

    const render = () => {
        const list = document.getElementById('favoritos-lista');
        if (!list) return;
        const products = window.TiendaStorage.getFavorites()
            .map((id) => window.TiendaStorage.getProduct(id))
            .filter(Boolean);
        const empty = document.getElementById('favoritos-vacio');
        list.replaceChildren();
        empty.hidden = products.length > 0;

        products.forEach((product) => {
            const card = document.createElement('article');
            card.className = 'favorito-card';
            const imageLink = document.createElement('a');
            imageLink.className = 'favorito-imagen';
            imageLink.href = `producto.html?id=${encodeURIComponent(product.id)}`;
            const image = document.createElement('img');
            image.src = product.imagen;
            image.alt = product.nombre;
            imageLink.append(image);

            const content = document.createElement('div');
            content.className = 'favorito-contenido';
            const category = document.createElement('span');
            category.className = 'favorito-categoria';
            category.textContent = product.categoria;
            const title = document.createElement('h2');
            title.textContent = product.nombre;
            const price = document.createElement('p');
            price.className = 'favorito-precio';
            price.textContent = `₡${formatPrice(product.precio)}`;
            const actions = document.createElement('div');
            actions.className = 'favorito-acciones';
            const details = document.createElement('a');
            details.className = 'btn-tienda-outline';
            details.href = imageLink.href;
            details.textContent = 'Ver detalles';
            const add = document.createElement('button');
            add.className = 'btn-tienda-primary';
            add.type = 'button';
            add.textContent = 'Agregar al carrito';
            add.dataset.addCart = '';
            add.dataset.productId = String(product.id);
            const remove = document.createElement('button');
            remove.className = 'favorito-quitar';
            remove.type = 'button';
            remove.textContent = 'Quitar de favoritos';
            remove.addEventListener('click', () => {
                if (!window.TiendaStorage.removeFavorite(product.id)) {
                    document.getElementById('favoritos-mensaje').textContent = 'No se pudieron actualizar los favoritos locales.';
                }
            });
            actions.append(details, add, remove);
            content.append(category, title, price, actions);
            card.append(imageLink, content);
            list.append(card);
        });
    };

    document.addEventListener('DOMContentLoaded', () => {
        render();
        window.addEventListener('tienda:actualizada', render);
        window.addEventListener('favoritos:actualizados', render);
    });
})();
