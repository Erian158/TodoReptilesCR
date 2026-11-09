(() => {
    const STORAGE_KEY = 'todoreptilescr_mascotas_demo';
    const MAX_MASCOTAS = 30;
    const MAX_FOTO_BYTES = 3 * 1024 * 1024;
    const tiposValidos = new Set(['reptil', 'perro', 'gato', 'otro']);
    let mascotas = [];
    let fotoTemporalUrl = '';

    const mostrarMensaje = (texto, esError = false) => {
        const mensaje = document.getElementById('mascota-form-mensaje');
        if (!mensaje) return;
        mensaje.textContent = texto;
        mensaje.classList.toggle('error', esError);
    };

    const leerMascotas = () => {
        try {
            const contenido = localStorage.getItem(STORAGE_KEY);
            if (!contenido) return [];
            const datos = JSON.parse(contenido);
            if (!Array.isArray(datos)) throw new Error('El formato almacenado no es válido.');
            return datos.filter((item) => item
                && typeof item.id === 'string'
                && typeof item.nombre === 'string'
                && item.nombre.length <= 50
                && tiposValidos.has(item.tipo)
                && typeof item.especie === 'string'
                && item.especie.length <= 60
                && typeof item.edad === 'string'
                && item.edad.length <= 30
                && typeof item.observaciones === 'string'
                && item.observaciones.length <= 500
            ).slice(0, MAX_MASCOTAS);
        } catch (error) {
            console.error('No se pudieron leer las mascotas locales:', error);
            mostrarMensaje('No se pudieron leer los datos locales de mascotas. Revisa el almacenamiento de este navegador.', true);
            return [];
        }
    };

    const guardarMascotas = () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mascotas));
            window.dispatchEvent(new Event('mascotas:actualizadas'));
            return true;
        } catch (error) {
            console.error('No se pudieron guardar las mascotas locales:', error);
            mascotas = leerMascotas();
            mostrarMensaje('No se pudieron guardar los datos. Revisa el espacio disponible y los permisos del navegador.', true);
            return false;
        }
    };

    const crearElemento = (etiqueta, clase, texto) => {
        const elemento = document.createElement(etiqueta);
        if (clase) elemento.className = clase;
        if (texto !== undefined) elemento.textContent = texto;
        return elemento;
    };

    const iconoTipo = (tipo) => ({
        reptil: 'bi bi-emoji-smile',
        perro: 'bi bi-emoji-smile',
        gato: 'bi bi-emoji-smile',
        otro: 'bi bi-heart'
    }[tipo] || 'bi bi-heart');

    const renderizarMascotas = () => {
        const listado = document.getElementById('mascotas-listado');
        if (!listado) return;
        const vacio = document.getElementById('mascotas-vacio');
        const contador = document.getElementById('mascotas-contador');

        listado.replaceChildren();
        contador.textContent = `${mascotas.length} mascota${mascotas.length === 1 ? '' : 's'} registrada${mascotas.length === 1 ? '' : 's'}`;
        vacio.hidden = mascotas.length > 0;

        mascotas.forEach((mascota) => {
            const tarjeta = crearElemento('article', 'mascota-card');
            const encabezado = crearElemento('div', 'mascota-card-top');
            const icono = crearElemento('span', 'mascota-card-icon');
            const iconoI = document.createElement('i');
            iconoI.className = iconoTipo(mascota.tipo);
            icono.append(iconoI);
            const titulo = document.createElement('div');
            titulo.append(
                crearElemento('h3', '', mascota.nombre),
                crearElemento('p', 'mascota-card-tipo', `${mascota.tipo[0].toUpperCase()}${mascota.tipo.slice(1)} · ${mascota.especie}`)
            );
            encabezado.append(icono, titulo);

            const cuerpo = crearElemento('div', 'mascota-card-body');
            cuerpo.append(crearElemento('p', '', `Edad aproximada: ${mascota.edad || 'No indicada'}`));
            if (mascota.observaciones) {
                cuerpo.append(crearElemento('p', 'mascota-observaciones', `Observaciones: ${mascota.observaciones}`));
            }

            const acciones = crearElemento('div', 'mascota-card-actions');
            const editar = crearElemento('button', '', 'Editar');
            editar.type = 'button';
            editar.addEventListener('click', () => iniciarEdicion(mascota));
            const eliminar = crearElemento('button', 'mascota-eliminar', 'Eliminar');
            eliminar.type = 'button';
            eliminar.addEventListener('click', () => eliminarMascota(mascota.id));
            acciones.append(editar, eliminar);
            tarjeta.append(encabezado, cuerpo, acciones);
            listado.append(tarjeta);
        });
    };

    const renderizarSelectorRecomendaciones = () => {
        const selector = document.getElementById('recomendaciones-mascota');
        if (!selector) return;
        const seleccionado = selector.value;
        selector.replaceChildren(new Option('Selecciona una mascota', ''));
        mascotas.forEach((mascota) => selector.add(new Option(`${mascota.nombre} (${mascota.especie})`, mascota.id)));
        selector.value = mascotas.some((mascota) => mascota.id === seleccionado)
            ? seleccionado
            : (mascotas[0]?.id || '');
        renderizarRecomendaciones();
    };

    const normalizar = (texto) => texto.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const renderizarRecomendaciones = () => {
        const contenedor = document.getElementById('recomendaciones-productos');
        if (!contenedor) return;
        const aviso = document.getElementById('recomendaciones-vacias');
        const selector = document.getElementById('recomendaciones-mascota');
        const mascota = mascotas.find((item) => item.id === selector.value);
        contenedor.replaceChildren();

        if (!mascota || !Array.isArray(window.productos)) {
            aviso.hidden = false;
            return;
        }

        const especie = normalizar(mascota.especie);
        const relacionados = window.productos.filter((producto) => {
            const tipos = Array.isArray(producto.recommendationTypes) ? producto.recommendationTypes : [];
            const especies = Array.isArray(producto.recommendationSpecies) ? producto.recommendationSpecies : [];
            const coincideTipo = tipos.includes(mascota.tipo);
            const coincideEspecie = especies.some((etiqueta) => especie.includes(normalizar(etiqueta)));
            return coincideTipo || coincideEspecie;
        }).slice(0, 4);

        if (!relacionados.length) {
            aviso.textContent = 'No hay productos del catálogo etiquetados para esta mascota todavía.';
            aviso.hidden = false;
            return;
        }

        aviso.hidden = true;
        relacionados.forEach((producto) => {
            const tarjeta = crearElemento('article', 'recomendacion-card');
            const imagenEnlace = crearElemento('a', 'recomendacion-imagen');
            imagenEnlace.href = `producto.html?id=${encodeURIComponent(producto.id)}`;
            const imagen = document.createElement('img');
            imagen.src = producto.imagen;
            imagen.alt = producto.nombre;
            imagen.loading = 'lazy';
            imagenEnlace.append(imagen);

            const contenido = crearElemento('div', 'recomendacion-contenido');
            contenido.append(
                crearElemento('h3', '', producto.nombre),
                crearElemento('p', '', `₡${new Intl.NumberFormat('es-CR', { maximumFractionDigits: 0 }).format(producto.precio)}`)
            );
            const detalle = crearElemento('a', '', 'Ver producto');
            detalle.href = `producto.html?id=${encodeURIComponent(producto.id)}`;
            contenido.append(detalle);
            tarjeta.append(imagenEnlace, contenido);
            contenedor.append(tarjeta);
        });
    };

    const limpiarFotoTemporal = () => {
        if (fotoTemporalUrl) URL.revokeObjectURL(fotoTemporalUrl);
        fotoTemporalUrl = '';
        const preview = document.getElementById('mascota-foto-preview');
        if (preview) {
            preview.removeAttribute('src');
            preview.hidden = true;
        }
    };

    const limpiarFormulario = () => {
        document.getElementById('mascota-form').reset();
        document.getElementById('mascota-id').value = '';
        document.getElementById('formulario-titulo').textContent = 'Registrar mascota';
        document.getElementById('cancelar-edicion').hidden = true;
        limpiarFotoTemporal();
    };

    const iniciarEdicion = (mascota) => {
        document.getElementById('mascota-id').value = mascota.id;
        document.getElementById('mascota-nombre').value = mascota.nombre;
        document.getElementById('mascota-tipo').value = mascota.tipo;
        document.getElementById('mascota-especie').value = mascota.especie;
        document.getElementById('mascota-edad').value = mascota.edad;
        document.getElementById('mascota-observaciones').value = mascota.observaciones;
        document.getElementById('formulario-titulo').textContent = 'Editar mascota';
        document.getElementById('cancelar-edicion').hidden = false;
        mostrarMensaje('');
        document.getElementById('formulario-mascota').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const eliminarMascota = (id) => {
        const mascota = mascotas.find((item) => item.id === id);
        if (!mascota || !window.confirm(`¿Eliminar el perfil local de ${mascota.nombre}?`)) return;
        mascotas = mascotas.filter((item) => item.id !== id);
        if (guardarMascotas()) {
            renderizarMascotas();
            renderizarSelectorRecomendaciones();
            mostrarMensaje(`${mascota.nombre} se eliminó de este navegador.`);
        }
    };

    const validarFoto = (archivo) => {
        const error = document.getElementById('mascota-foto-error');
        error.textContent = '';
        if (!archivo) return true;
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)) {
            error.textContent = 'Selecciona una imagen JPG, PNG o WebP.';
            return false;
        }
        if (archivo.size > MAX_FOTO_BYTES) {
            error.textContent = 'La imagen debe pesar 3 MB o menos.';
            return false;
        }
        return true;
    };

    const configurarFormulario = () => {
        const formulario = document.getElementById('mascota-form');
        if (!formulario) return;
        const fotoInput = document.getElementById('mascota-foto');

        fotoInput.addEventListener('change', () => {
            limpiarFotoTemporal();
            const archivo = fotoInput.files[0];
            if (!validarFoto(archivo)) {
                fotoInput.value = '';
                return;
            }
            if (archivo) {
                fotoTemporalUrl = URL.createObjectURL(archivo);
                const preview = document.getElementById('mascota-foto-preview');
                preview.src = fotoTemporalUrl;
                preview.hidden = false;
            }
        });

        document.getElementById('cancelar-edicion').addEventListener('click', () => {
            limpiarFormulario();
            mostrarMensaje('');
        });

        formulario.addEventListener('submit', (evento) => {
            evento.preventDefault();
            const nombre = document.getElementById('mascota-nombre');
            const tipo = document.getElementById('mascota-tipo');
            const especie = document.getElementById('mascota-especie');
            const edad = document.getElementById('mascota-edad');
            const observaciones = document.getElementById('mascota-observaciones');
            const foto = fotoInput.files[0];
            const errores = [
                [nombre, nombre.value.trim() ? '' : 'Ingresa el nombre de la mascota.'],
                [tipo, tiposValidos.has(tipo.value) ? '' : 'Selecciona el tipo de mascota.'],
                [especie, especie.value.trim() ? '' : 'Ingresa la especie de la mascota.'],
                [edad, edad.value.trim().length <= 30 ? '' : 'La edad debe tener 30 caracteres o menos.'],
                [observaciones, observaciones.value.length <= 500 ? '' : 'Las observaciones deben tener 500 caracteres o menos.']
            ];
            let valido = validarFoto(foto);
            errores.forEach(([campo, mensaje]) => {
                const elementoError = campo.closest('.mascota-campo').querySelector('.campo-error');
                elementoError.textContent = mensaje;
                campo.setAttribute('aria-invalid', mensaje ? 'true' : 'false');
                if (mensaje) valido = false;
            });

            if (!valido) {
                mostrarMensaje('Revisa los campos indicados antes de guardar.', true);
                return;
            }

            const id = document.getElementById('mascota-id').value;
            const actualizada = {
                id: id || (window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`),
                nombre: nombre.value.trim().slice(0, 50),
                tipo: tipo.value,
                especie: especie.value.trim().slice(0, 60),
                edad: edad.value.trim().slice(0, 30),
                observaciones: observaciones.value.trim().slice(0, 500)
            };

            if (id) {
                mascotas = mascotas.map((mascota) => mascota.id === id ? actualizada : mascota);
            } else {
                if (mascotas.length >= MAX_MASCOTAS) {
                    mostrarMensaje(`Puedes guardar hasta ${MAX_MASCOTAS} perfiles de mascota en este navegador.`, true);
                    return;
                }
                mascotas.push(actualizada);
            }

            if (guardarMascotas()) {
                limpiarFormulario();
                renderizarMascotas();
                renderizarSelectorRecomendaciones();
                mostrarMensaje(id ? 'Cambios guardados localmente en este navegador.' : 'Mascota agregada localmente en este navegador.');
            }
        });

        document.getElementById('recomendaciones-mascota')?.addEventListener('change', renderizarRecomendaciones);
    };

    mascotas = leerMascotas();
    window.mascotasDemo = {
        obtenerTodas: () => leerMascotas()
    };

    document.addEventListener('DOMContentLoaded', () => {
        renderizarMascotas();
        renderizarSelectorRecomendaciones();
        configurarFormulario();
    });
})();
