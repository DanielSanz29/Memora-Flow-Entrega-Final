# Cambios funcionales 02 - Catálogos visuales y consulta gerencial

## Cambios solicitados

Se incorporan dos mejoras solicitadas tras revisar visualmente el panel de trabajo:

1. Para los perfiles **asesor** y **recepción**, se añade la opción **Ver catálogos**, con tres subsecciones visuales: **Ataúdes**, **Flores** y **Urnas**.
2. Para el perfil **gerencia**, se añade la opción **Ver funerarios y recepcionistas**, orientada a consultar los pedidos vinculados al personal operativo.

## Implementación realizada

- Nueva ruta de interfaz `/catalogos`, accesible desde el panel y el menú lateral de asesor y recepción.
- Nueva interfaz con ilustraciones propias en formato SVG para las categorías de ataúdes, flores y urnas.
- Carga real de productos y precios desde el endpoint existente `/api/productos`.
- Nueva ruta de interfaz `/seguimiento/personal`, visible para gerencia.
- Nuevo endpoint protegido `GET /api/seguimiento/personal-pedidos`.
- La vista gerencial diferencia la atribución de datos:
  - Para el perfil **asesor**, muestra las órdenes creadas por el usuario.
  - Para el perfil **recepción**, muestra órdenes derivadas de expedientes abiertos por dicho perfil, respetando el reparto funcional existente.
- Control de acceso: la vista de seguimiento queda protegida por rol de gerencia en frontend y backend.

## Ficheros principales modificados

### Frontend
- `src/App.jsx`
- `src/components/Layout.jsx`
- `src/pages/DashboardPage.jsx`
- `src/pages/CatalogosPage.jsx`
- `src/pages/PersonalPedidosPage.jsx`
- `src/services/api.js`
- `src/assets/catalogos/ataudes.svg`
- `src/assets/catalogos/flores.svg`
- `src/assets/catalogos/urnas.svg`

### Backend
- `src/app.js`
- `src/routes/seguimiento.routes.js`
- `src/controllers/seguimientoController.js`
- `src/repositories/seguimientoRepository.js`

## Validación

- Compilación frontend mediante Vite: superada.
- Comprobación sintáctica del backend: superada.
- API en modo reproducible `DB_MODE=memory`: probada para catálogo de asesor/recepción y seguimiento protegido de gerencia.
