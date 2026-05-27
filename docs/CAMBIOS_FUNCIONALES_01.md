# Cambios funcionales y visuales solicitados - Iteración 01

## Cambios incorporados

- Se elimina del inicio de sesión el bloque visible de credenciales de demostración.
- Se eliminan los valores precargados del formulario de acceso; el usuario debe introducir sus credenciales.
- Se elimina del panel principal el bloque denominado "Flujo recomendado para la defensa" y el acceso directo a una orden de demostración.
- La creación de órdenes deja de solicitar un identificador numérico manual de expediente.
- La nueva orden solo se crea a partir de un expediente previamente localizado o registrado, mostrando su código y las personas vinculadas.
- Se incorpora el módulo "Historial de órdenes", con listado, búsqueda, filtro por estado y acceso al detalle editable.
- El resumen de una orden incluye un historial de estados con fecha, acción, detalle y usuario responsable.
- Los nuevos cambios de estado se registran con los nombres de estado de origen y destino.

## Archivos modificados

### Frontend

- `src/pages/LoginPage.jsx`
- `src/pages/DashboardPage.jsx`
- `src/pages/OrdenWizardPage.jsx`
- `src/pages/OrdenesPage.jsx` (nuevo)
- `src/pages/ResumenOrdenPage.jsx`
- `src/pages/BuscarExpedientePage.jsx`
- `src/components/Layout.jsx`
- `src/App.jsx`
- `src/services/api.js`

### Backend y datos

- `src/routes/orden.routes.js`
- `src/controllers/ordenController.js`
- `src/services/ordenService.js`
- `src/repositories/ordenRepository.js`
- `database/seed.sql`
- `database/demo-seed.sql`
- `scripts/ejecutar_pruebas_demo.py`

## Nota sobre la base de datos existente

La funcionalidad de historial funciona sobre la tabla de auditoría ya incluida en el proyecto, por lo que no requiere modificar el esquema ni aplicar migraciones. Las órdenes nuevas y los cambios de estado realizados desde esta versión quedarán registrados. Si se desea volver a cargar la orden inicial de ejemplo con un primer evento de historial, debe recrearse el volumen de MySQL; esta acción elimina los datos locales actuales.
