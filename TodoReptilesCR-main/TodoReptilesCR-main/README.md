# TodoReptilesCR

Sistema web para la gestión y comercialización de productos especializados para reptiles: caso de estudio TodoReptilesCR.

## Módulos frontend

- Inicio, catálogo y detalle de productos.
- Registro e inicio de sesión con validación en cliente, preparados para conectarse a una API segura.
- Vista demostrativa de perfil y formulario local de mascotas.
- Recomendaciones de productos a partir de las etiquetas del catálogo central en `js/productos.js`.

## Ejecutar localmente

Abre el proyecto desde el directorio web de XAMPP, por ejemplo `http://localhost/TodoReptiles/TodoReptilesCR/`. Las hojas de estilo, imágenes y scripts usan rutas relativas.

## Estado de usuarios y mascotas

No hay backend de autenticación ni almacenamiento PHP/MySQL integrado. El registro y el inicio de sesión no autentican ni guardan credenciales. Los formularios de perfil solo validan y muestran que guardar requiere el servidor.

Los perfiles de mascotas son demostrativos y se guardan en `localStorage` bajo la clave `todoreptilescr_mascotas_demo`; no se asocian a una cuenta ni se sincronizan. Las fotografías se muestran temporalmente en el formulario y no se persisten.
