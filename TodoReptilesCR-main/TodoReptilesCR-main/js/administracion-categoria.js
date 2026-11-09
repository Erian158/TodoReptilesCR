
document.addEventListener("DOMContentLoaded", function () {


    const CLAVE = "todoreptilescr_categorias_demo_v1";


    const productos = window.productos || [];


    const categoriasOriginales =
        typeof categoriasCatalogo !== "undefined"
            ? categoriasCatalogo
            : [];

    const tabla = document.getElementById("tabla-categorias");
    const buscar = document.getElementById("buscar-categoria");

    const formulario = document.getElementById("formulario-categoria");
    const idInput = document.getElementById("id-categoria");
    const nombreInput = document.getElementById("nombre-categoria");
    const descripcionInput = document.getElementById("descripcion-categoria");

    const mensaje = document.getElementById("mensaje");
    const errorFormulario = document.getElementById("error-formulario");

    const modalCategoria = new bootstrap.Modal(
        document.getElementById("modalCategoria")
    );

    const modalEliminar = new bootstrap.Modal(
        document.getElementById("modalEliminar")
    );

    let idParaEliminar = null;


    function normalizar(texto) {
        return texto
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ");
    }
    function categoriasIniciales() {

        return categoriasOriginales.map(function (nombre, indice) {
            return {
                id: indice + 1,
                nombre: nombre,
                descripcion: "Categoría de productos " + nombre
            };
        });

    }


    function cargarCategorias() {

        try {

            const guardadas = localStorage.getItem(CLAVE);

            if (guardadas !== null) {

                const datos = JSON.parse(guardadas);

                if (Array.isArray(datos)) {
                    return datos;
                }

            }

        } catch (error) {
            console.warn("No se pudieron leer los datos locales.");
        }

        return categoriasIniciales();
    }

    let categorias = cargarCategorias();



    function guardarCategorias() {

        try {

            localStorage.setItem(
                CLAVE,
                JSON.stringify(categorias)
            );
            return true;
        } catch (error) {
            mostrarMensaje(
                "No se pudieron guardar los cambios en este navegador.",
                "danger"
            );
            return false;
        }
    }

    function contarProductos(nombreCategoria) {

        return productos.filter(function (producto) {

            return normalizar(producto.categoria) ===
                   normalizar(nombreCategoria);
        }).length;
    }

    function mostrarMensaje(texto, tipo) {

        mensaje.textContent = texto;

        mensaje.className = "alert alert-" + tipo;

        mensaje.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

    }

    function mostrarErrorFormulario(texto) {
        errorFormulario.textContent = texto;
        errorFormulario.classList.remove("d-none");
    }

    function limpiarErrorFormulario() {
        errorFormulario.textContent = "";
        errorFormulario.classList.add("d-none");
    }

    function actualizarEstadisticas() {
        document.getElementById("total-categorias").textContent =
            categorias.length;
        document.getElementById("total-productos").textContent =
            productos.length;
        let categoriasOcupadas = 0;
        categorias.forEach(function (categoria) {
            if (contarProductos(categoria.nombre) > 0) {
                categoriasOcupadas++;
            }
        });

        document.getElementById("categorias-con-productos").textContent =
            categoriasOcupadas;
    }

    function crearCelda(texto) {
        const celda = document.createElement("td");
        // textContent evita insertar HTML del usuario
        celda.textContent = texto;
        return celda;

    }

    function crearBoton(accion, id, icono, titulo, clase) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "btn-accion " + clase;
        boton.dataset.accion = accion;
        boton.dataset.id = id;
        boton.title = titulo;
        boton.setAttribute("aria-label", titulo);
        const i = document.createElement("i");
        i.className = "bi " + icono;
        boton.appendChild(i);
        return boton;
    }

    function mostrarCategorias() {
        const textoBusqueda = normalizar(buscar.value);
        const filtradas = categorias.filter(function (categoria) {
            return normalizar(categoria.nombre).includes(textoBusqueda) ||
            normalizar(categoria.descripcion).includes(textoBusqueda);

        });

        tabla.replaceChildren();

        filtradas.forEach(function (categoria) {

            const fila = document.createElement("tr");
            const celdaNombre = crearCelda(categoria.nombre);
            celdaNombre.classList.add("categoria-nombre");
            const celdaDescripcion = crearCelda(categoria.descripcion);
            celdaDescripcion.classList.add("categoria-descripcion");
            const celdaCantidad = document.createElement("td");

            const etiqueta = document.createElement("span");
            etiqueta.className = "categoria-cantidad";
            etiqueta.textContent = contarProductos(categoria.nombre);

            celdaCantidad.appendChild(etiqueta);

            const celdaAcciones = document.createElement("td");
            const acciones = document.createElement("div");

            acciones.className = "admin-acciones";

            const botonEditar = crearBoton(
                "editar",
                categoria.id,
                "bi-pencil-square",
                "Editar " + categoria.nombre,
                "btn-editar"
            );

            const botonEliminar = crearBoton(
                "eliminar",
                categoria.id,
                "bi-trash",
                "Eliminar " + categoria.nombre,
                "btn-eliminar"
            );

            acciones.appendChild(botonEditar);
            acciones.appendChild(botonEliminar);

            celdaAcciones.appendChild(acciones);

            fila.appendChild(celdaNombre);
            fila.appendChild(celdaDescripcion);
            fila.appendChild(celdaCantidad);
            fila.appendChild(celdaAcciones);

            tabla.appendChild(fila);

        });

        const estadoVacio = document.getElementById("estado-vacio");

        if (filtradas.length === 0) {
            estadoVacio.classList.remove("d-none");
        } else {
            estadoVacio.classList.add("d-none");
        }

        // Contador
        document.getElementById("contador-resultados").textContent =
            filtradas.length + " categoría(s) encontrada(s)";

        actualizarEstadisticas();

    }

    function agregarCategoria(nombre, descripcion) {

        const existe = categorias.some(function (categoria) {

            return normalizar(categoria.nombre) === normalizar(nombre);

        });

        if (existe) {

            mostrarErrorFormulario(
                "Ya existe una categoría con ese nombre."
            );

            return;
        }


        const nuevoId = categorias.length > 0
            ? Math.max(...categorias.map(c => Number(c.id))) + 1
            : 1;

        const nuevaCategoria = {
            id: nuevoId,
            nombre: nombre,
            descripcion: descripcion
        };

        categorias.push(nuevaCategoria);

        if (!guardarCategorias()) {
            categorias.pop();
            return;
        }

        modalCategoria.hide();

        mostrarCategorias();

        mostrarMensaje(
            "La categoría se agregó correctamente.",
            "success"
        );

    }
    function editarCategoria(id, nombre, descripcion) {

        const categoria = categorias.find(function (item) {
            return item.id === id;
        });

        if (!categoria) {
            mostrarErrorFormulario("No se encontró la categoría.");
            return;
        }

        // Verificar nombre duplicado
        const duplicada = categorias.some(function (item) {

            return item.id !== id &&
                normalizar(item.nombre) === normalizar(nombre);

        });

        if (duplicada) {

            mostrarErrorFormulario(
                "Ya existe otra categoría con ese nombre."
            );

            return;
        }

        // No renombrar categorías con productos asociados,
        // porque los productos originales no se modifican.
        if (
            normalizar(categoria.nombre) !== normalizar(nombre) &&
            contarProductos(categoria.nombre) > 0
        ) {

            mostrarErrorFormulario(
                "Esta categoría tiene productos asociados. " +
                "Podés editar su descripción, pero no cambiar " +
                "su nombre en esta demostración."
            );

            return;
        }

        const nombreAnterior = categoria.nombre;
        const descripcionAnterior = categoria.descripcion;

        categoria.nombre = nombre;
        categoria.descripcion = descripcion;

        if (!guardarCategorias()) {
            categoria.nombre = nombreAnterior;
            categoria.descripcion = descripcionAnterior;
            return;
        }

        modalCategoria.hide();

        mostrarCategorias();

        mostrarMensaje(
            "La categoría se actualizó correctamente.",
            "success"
        );

    }


    function abrirEditar(id) {

        const categoria = categorias.find(function (item) {
            return item.id === id;
        });

        if (!categoria) {
            mostrarMensaje("La categoría no existe.", "danger");
            return;
        }

        limpiarErrorFormulario();

        idInput.value = categoria.id;
        nombreInput.value = categoria.nombre;
        descripcionInput.value = categoria.descripcion;

        document.getElementById("tituloModalCategoria").textContent =
            "Editar categoría";

        modalCategoria.show();

    }

    function abrirEliminar(id) {

        const categoria = categorias.find(function (item) {
            return item.id === id;
        });

        if (!categoria) {
            mostrarMensaje("La categoría no existe.", "danger");
            return;
        }

        const cantidad = contarProductos(categoria.nombre);
        const texto = document.getElementById("texto-eliminar");
        const botonConfirmar = document.getElementById("confirmar-eliminar");

        idParaEliminar = id;

        if (cantidad > 0) {

            texto.textContent =
                "La categoría \"" + categoria.nombre +
                "\" tiene " + cantidad +
                " producto(s) asociado(s). No se puede eliminar " +
                "en esta demostración porque afectaría la " +
                "organización del catálogo.";

            botonConfirmar.disabled = true;

        } else {

            texto.textContent =
                "¿Estás seguro de que querés eliminar la categoría \"" +
                categoria.nombre + "\"?";

            botonConfirmar.disabled = false;

        }

        modalEliminar.show();

    }

    function eliminarCategoria() {

        const categoria = categorias.find(function (item) {
            return item.id === idParaEliminar;
        });

        if (!categoria) {
            modalEliminar.hide();
            mostrarMensaje("La categoría no existe.", "danger");
            return;
        }

        if (contarProductos(categoria.nombre) > 0) {
            modalEliminar.hide();
            mostrarMensaje(
                "No se puede eliminar una categoría con productos.",
                "danger"
            );
            return;
        }
        const categoriasAnteriores = [...categorias];
        categorias = categorias.filter(function (item) {
            return item.id !== idParaEliminar;
        });
        if (!guardarCategorias()) {
            categorias = categoriasAnteriores;
            return;
        }

        modalEliminar.hide();
        idParaEliminar = null;
        mostrarCategorias();
        mostrarMensaje(
            "La categoría se eliminó correctamente.",
            "success"
        );

    }

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();
        limpiarErrorFormulario();
        const nombre = nombreInput.value.trim().replace(/\s+/g, " ");
        const descripcion = descripcionInput.value.trim();
        // Validar campos vacíos
        if (nombre === "" || descripcion === "") {
            mostrarErrorFormulario(
                "Debés completar el nombre y la descripción."
            );
            return;
        }

        // Validar longitudes
        if (nombre.length > 60 || descripcion.length > 250) {

            mostrarErrorFormulario(
                "El texto supera la longitud permitida."
            );
            return;
        }

        const id = Number(idInput.value);
        if (idInput.value === "") {
            agregarCategoria(nombre, descripcion);
        } else {
            editarCategoria(id, nombre, descripcion);
        }

    });
    document.getElementById("btn-nueva-categoria")
        .addEventListener("click", function () {
            formulario.reset();
            idInput.value = "";
            limpiarErrorFormulario();
            document.getElementById("tituloModalCategoria").textContent =
                "Nueva categoría";
        });
    tabla.addEventListener("click", function (evento) {

        const boton = evento.target.closest("button[data-accion]");

        if (!boton) {
            return;
        }

        const id = Number(boton.dataset.id);

        if (boton.dataset.accion === "editar") {
            abrirEditar(id);
        }

        if (boton.dataset.accion === "eliminar") {
            abrirEliminar(id);
        }

    });

    document.getElementById("confirmar-eliminar")
        .addEventListener("click", eliminarCategoria);
    buscar.addEventListener("input", mostrarCategorias);
    mostrarCategorias();

});
