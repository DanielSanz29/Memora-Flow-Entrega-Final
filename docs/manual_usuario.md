# Manual de usuario - Memora Flow

## 1. Descripción general

Memora Flow es una aplicación web interna para gestionar de forma asistida expedientes y órdenes funerarias. El sistema permite buscar o crear expedientes, separar los datos del familiar responsable y de la persona fallecida, crear una orden, añadir productos y servicios, registrar observaciones, calcular un presupuesto estimado y generar un PDF final.

## 2. Inicio de sesión

1. Abrir http://localhost:5173.
2. Introducir email y contraseña.
3. Pulsar **Iniciar sesión**.
4. Si las credenciales son válidas, se muestra el panel principal.

Usuario recomendado para pruebas:

- Email: `admin@memora.local`
- Contraseña: `Admin1234`

## 3. Buscar expediente

1. Acceder a **Buscar expediente**.
2. Introducir DNI/NIE del responsable o del fallecido.
3. Pulsar **Buscar**.
4. Si existe, se mostrará la ficha resumida.
5. Si no existe, se puede crear un nuevo expediente.

Dato de prueba:

- DNI responsable: `12345678A`

## 4. Alta de expediente

1. Acceder a **Crear expediente** desde la búsqueda.
2. Completar los datos del familiar responsable.
3. Completar los datos de la persona fallecida.
4. Guardar.
5. El sistema redirige al formulario de creación de orden.

## 5. Crear orden funeraria

1. Indicar el ID de expediente.
2. Seleccionar el tipo de servicio: incineración o inhumación.
3. Añadir una observación general si procede.
4. Pulsar **Crear orden**.
5. La orden queda en estado borrador.

## 6. Añadir productos, flores y servicios

En la pantalla de resumen de la orden:

1. Seleccionar un producto o flor.
2. Indicar cantidad.
3. Pulsar **Añadir producto**.
4. Seleccionar un servicio complementario.
5. Pulsar **Añadir servicio**.

El sistema recalcula automáticamente el total estimado.

## 7. Añadir observaciones

1. Escribir una observación interna.
2. Pulsar **Añadir observación**.
3. La observación queda guardada con usuario y fecha.

## 8. Cambiar estado

1. Seleccionar un estado en la sección **Cambio de estado**.
2. Pulsar **Actualizar estado**.
3. El cambio queda registrado en auditoría.

Estados disponibles:

- borrador
- en preparación
- pendiente de validación
- cerrada
- anulada

## 9. Generar PDF

1. Entrar en el resumen de una orden.
2. Pulsar **Generar PDF**.
3. El navegador descarga un archivo `orden-ID.pdf`.

El PDF incluye:

- expediente
- responsable
- fallecido
- tipo de servicio
- estado
- productos y flores
- servicios complementarios
- observaciones
- total estimado

## 10. Administración básica

Solo el usuario administrador puede acceder a **Administración**.

La pantalla permite consultar:

- usuarios
- roles
- estados
- productos
- servicios

La edición avanzada queda preparada como ampliación futura.

## 11. Errores habituales

### Credenciales incorrectas

Revisar email y contraseña. Para pruebas usar `admin@memora.local / Admin1234`.

### DNI/NIE no válido

Debe contener entre 5 y 15 caracteres alfanuméricos.

### No se genera el PDF

Comprobar que el backend está levantado y que la orden existe.

### No carga la administración

Verificar que se ha iniciado sesión con un usuario administrador.

### Error de conexión

Comprobar los contenedores:

```bash
docker compose ps
```

Revisar logs:

```bash
docker compose logs -f backend
```
