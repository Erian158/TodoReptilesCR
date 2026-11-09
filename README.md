# TodoReptilesCR

Sistema web para la gestión y comercialización de productos especializados para reptiles: caso de estudio TodoReptilesCR.

## Módulos frontend

- Inicio, catálogo y detalle de productos.
- Registro e inicio de sesión con validación en cliente, preparados para conectarse a una API segura.
- Vista demostrativa de perfil y formulario local de mascotas.
- Recomendaciones de productos a partir de las etiquetas del catálogo central en `js/productos.js`.
- Carrito y favoritos locales, más historial y seguimiento de pedidos exclusivamente DEMO.
- Panel administrativo visual con catálogo existente y pedidos locales DEMO; no tiene autenticación, ventas reales ni existencias.

## Ejecutar localmente

Abre el proyecto desde el directorio web de XAMPP, por ejemplo `http://localhost/TodoReptiles/TodoReptilesCR/`. Las hojas de estilo, imágenes y scripts usan rutas relativas.

## Estado de usuarios y mascotas

No hay backend de autenticación ni almacenamiento PHP/MySQL integrado. El registro y el inicio de sesión no autentican ni guardan credenciales. Los formularios de perfil solo validan y muestran que guardar requiere el servidor.

Los perfiles de mascotas son demostrativos y se guardan en `localStorage` bajo la clave `todoreptilescr_mascotas_demo`; no se asocian a una cuenta ni se sincronizan. Las fotografías se muestran temporalmente en el formulario y no se persisten.

El carrito, los favoritos y los pedidos de demostración se guardan localmente con las claves `todoreptilescr_carrito_demo`, `todoreptilescr_favoritos_demo` y `todoreptilescr_pedidos_demo`. El botón del carrito crea un pedido DEMO local; no inicia una compra, no envía datos a la tienda y no procesa pagos. El total no incluye envío, impuestos ni descuentos.

El inventario real no está disponible en los datos del catálogo. El panel no estima existencias ni reporta ventas del negocio. La administración de categorías corresponde al módulo de Persona 4 y no se duplica aquí.
