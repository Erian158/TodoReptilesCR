const mensajeFormulario = (elemento, texto, esError = false) => {
    if (!elemento) return;
    elemento.textContent = texto;
    elemento.classList.toggle('error', esError);
};

const mostrarErrorCampo = (campo, mensaje) => {
    const contenedor = campo.closest('.usuario-campo');
    const error = contenedor?.querySelector('.campo-error');
    if (error) error.textContent = mensaje;
    campo.setAttribute('aria-invalid', mensaje ? 'true' : 'false');
};

const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

const validarTelefonoCR = (telefono) => {
    const normalizado = telefono.replace(/[\s()-]/g, '');
    return /^(?:\+?506)?[2-8]\d{7}$/.test(normalizado);
};

const alternarVisibilidadContrasena = (boton) => {
    const input = document.getElementById(boton.dataset.passwordToggle);
    if (!input) return;

    const mostrar = input.type === 'password';
    input.type = mostrar ? 'text' : 'password';
    boton.setAttribute('aria-label', mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña');
    const icono = boton.querySelector('i');
    if (icono) icono.className = mostrar ? 'bi bi-eye-slash' : 'bi bi-eye';
};

const inicializarAutenticacion = () => {
    document.querySelectorAll('[data-password-toggle]').forEach((boton) => {
        boton.addEventListener('click', () => alternarVisibilidadContrasena(boton));
    });

    const registro = document.getElementById('registro-form');
    if (registro) {
        registro.addEventListener('submit', (evento) => {
            evento.preventDefault();
            const campos = [
                document.getElementById('registro-nombre'),
                document.getElementById('registro-email'),
                document.getElementById('registro-telefono'),
                document.getElementById('registro-password'),
                document.getElementById('registro-confirmacion')
            ];
            campos.forEach((campo) => mostrarErrorCampo(campo, ''));

            const [nombre, email, telefono, password, confirmacion] = campos;
            let valido = true;

            if (!nombre.value.trim()) {
                mostrarErrorCampo(nombre, 'Ingresa tu nombre completo.');
                valido = false;
            }
            if (!validarEmail(email.value.trim())) {
                mostrarErrorCampo(email, 'Ingresa un correo electrónico válido.');
                valido = false;
            }
            if (!validarTelefonoCR(telefono.value.trim())) {
                mostrarErrorCampo(telefono, 'Ingresa un teléfono de Costa Rica válido de 8 dígitos, con o sin +506.');
                valido = false;
            }
            if (password.value.length < 8) {
                mostrarErrorCampo(password, 'La contraseña debe tener al menos 8 caracteres.');
                valido = false;
            }
            if (confirmacion.value !== password.value) {
                mostrarErrorCampo(confirmacion, 'Las contraseñas no coinciden.');
                valido = false;
            }

            const mensaje = document.getElementById('registro-mensaje');
            if (!valido) {
                mensajeFormulario(mensaje, 'Revisa los campos indicados antes de continuar.', true);
                return;
            }

            mensajeFormulario(mensaje, 'Los datos son válidos, pero el registro aún no está habilitado porque falta conectar el servidor.');
        });
    }

    const login = document.getElementById('login-form');
    if (login) {
        login.addEventListener('submit', (evento) => {
            evento.preventDefault();
            const email = document.getElementById('login-email');
            const password = document.getElementById('login-password');
            mostrarErrorCampo(email, '');
            mostrarErrorCampo(password, '');

            let valido = true;
            if (!validarEmail(email.value.trim())) {
                mostrarErrorCampo(email, 'Ingresa un correo electrónico válido.');
                valido = false;
            }
            if (!password.value) {
                mostrarErrorCampo(password, 'Ingresa tu contraseña.');
                valido = false;
            }

            const mensaje = document.getElementById('login-mensaje');
            if (!valido) {
                mensajeFormulario(mensaje, 'Revisa los campos indicados antes de continuar.', true);
                return;
            }

            mensajeFormulario(mensaje, 'La autenticación aún no está habilitada porque falta conectar el servidor. No se inició sesión ni se guardaron tus credenciales.');
        });
    }

    const perfil = document.getElementById('perfil-form');
    if (perfil) {
        perfil.addEventListener('submit', (evento) => {
            evento.preventDefault();
            const nombre = document.getElementById('perfil-nombre');
            const email = document.getElementById('perfil-email');
            const telefono = document.getElementById('perfil-telefono');
            [nombre, email, telefono].forEach((campo) => mostrarErrorCampo(campo, ''));
            let valido = true;

            if (!nombre.value.trim()) {
                mostrarErrorCampo(nombre, 'Ingresa tu nombre completo.');
                valido = false;
            }
            if (!validarEmail(email.value.trim())) {
                mostrarErrorCampo(email, 'Ingresa un correo electrónico válido.');
                valido = false;
            }
            if (telefono.value.trim() && !validarTelefonoCR(telefono.value.trim())) {
                mostrarErrorCampo(telefono, 'Ingresa un teléfono de Costa Rica válido de 8 dígitos.');
                valido = false;
            }

            const mensaje = document.getElementById('perfil-mensaje');
            if (!valido) {
                mensajeFormulario(mensaje, 'Revisa los campos indicados.', true);
                return;
            }
            mensajeFormulario(mensaje, 'Los datos son válidos, pero no se guardaron: se requiere una cuenta autenticada y conexión con el servidor.');
        });

        actualizarResumenMascotasPerfil();
        window.addEventListener('mascotas:actualizadas', actualizarResumenMascotasPerfil);
    }
};

const actualizarResumenMascotasPerfil = () => {
    const resumen = document.getElementById('perfil-mascotas-resumen');
    if (!resumen) return;

    const mascotas = window.mascotasDemo?.obtenerTodas() || [];
    resumen.replaceChildren();

    if (!mascotas.length) {
        const vacio = document.createElement('div');
        vacio.className = 'perfil-vacio';
        const icono = document.createElement('i');
        icono.className = 'bi bi-heart';
        const texto = document.createElement('p');
        texto.textContent = 'Aún no hay mascotas guardadas en este navegador.';
        vacio.append(icono, texto);
        resumen.append(vacio);
        return;
    }

    mascotas.forEach((mascota) => {
        const linea = document.createElement('div');
        linea.className = 'perfil-mascota-linea';
        const nombre = document.createElement('strong');
        nombre.textContent = mascota.nombre;
        const detalle = document.createElement('span');
        detalle.textContent = `${mascota.especie} · ${mascota.edad || 'Edad no indicada'}`;
        linea.append(nombre, detalle);
        resumen.append(linea);
    });
};

document.addEventListener('DOMContentLoaded', inicializarAutenticacion);
