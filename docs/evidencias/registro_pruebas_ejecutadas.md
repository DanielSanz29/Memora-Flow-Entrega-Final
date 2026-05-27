# Registro de pruebas ejecutadas - Memora Flow

**Fecha de ejecución:** 27/05/2026  
**Entorno ejecutado:** API Node.js/Express con `DB_MODE=memory`, datos de prueba precargados y autenticación JWT.  
**Alcance de la evidencia:** verifica rutas, reglas de negocio, seguridad básica y generación PDF. La persistencia MySQL/Docker y el despliegue público requieren validación posterior en el equipo de entrega.

**Resultado:** 20/20 pruebas superadas.

| ID | Requisito | Prueba | Resultado obtenido | Estado |
|---|---|---|---|---|
| CP-01 | RF-01 | Inicio de sesión válido | HTTP 200; token emitido=True | SUPERADA |
| CP-02 | RF-01 | Contraseña incorrecta | HTTP 401; Credenciales incorrectas | SUPERADA |
| CP-03 | RNF-04 | Ruta protegida sin token | HTTP 401; Token no proporcionado | SUPERADA |
| CP-04 | RF-01 / RNF-04 | Control de rol en administración | HTTP 403; No tienes permisos para realizar esta acción | SUPERADA |
| CP-05 | RF-02 | Búsqueda por DNI existente | HTTP 200; coincidencias=1 | SUPERADA |
| CP-06 | RNF-04 | Entrada similar a inyección SQL | HTTP 422; El DNI/NIE debe tener entre 5 y 15 caracteres alfanuméricos | SUPERADA |
| CP-07 | RF-03 | Alta de expediente y personas diferenciadas | HTTP 201; id=2 | SUPERADA |
| CP-08 | RF-04 / RF-05 | Creación de orden funeraria | HTTP 201; id=2; tipo=inhumacion | SUPERADA |
| CP-09 | RF-06 / RF-07 | Añadir producto y recalcular total | HTTP 201; total=650 | SUPERADA |
| CP-10 | RF-06 / RNF-05 | Rechazo de cantidad no positiva | HTTP 422; Cantidad debe ser un número entero positivo | SUPERADA |
| CP-11 | RF-05 / RF-07 | Añadir servicio y sumar presupuesto | HTTP 201; total=870 | SUPERADA |
| CP-12 | RF-09 / RNF-04 | Saneamiento de observación con etiqueta script | HTTP 201; escapado=True | SUPERADA |
| CP-13 | RF-09 | Cambio de estado | HTTP 200; estado=pendiente de validación | SUPERADA |
| CP-14 | RF-08 | Generación de resumen PDF | HTTP 200; tipo=application/pdf; bytes=2949 | SUPERADA |
| CP-15 | RF-01 / RF-06 | Consulta de catálogos con rol administrador | HTTP 200; productos=8; servicios=4 | SUPERADA |
| CP-16 | RF-09 | Listado e historial general de órdenes | HTTP 200; ordenes=2 | SUPERADA |
| CP-17 | RF-09 | Historial de cambios de estado de una orden | HTTP 200; eventos=2; cambio_registrado=True | SUPERADA |
| CP-18 | RF-06 | Consulta visual de catálogos para asesor | HTTP 200; categorías=['ataudes', 'flores', 'urnas'] | SUPERADA |
| CP-19 | RF-09 | Consulta gerencial de pedidos por personal | HTTP 200; personal=2 | SUPERADA |
| CP-20 | RNF-04 | Protección de consulta gerencial por rol | HTTP 403; No tienes permisos para realizar esta acción | SUPERADA |

## Evidencias generadas

- `resultados_api_demo.json`: registro estructurado de respuestas y resultados.
- `orden_generada_prueba.pdf`: PDF generado mediante la API durante la prueba CP-14.

## Verificaciones pendientes antes del depósito

- Arranque completo mediante Docker Compose con MySQL 8.4 y phpMyAdmin en el equipo del alumno.
- Capturas reales de la aplicación funcionando con MySQL.
- Publicación del repositorio actualizado y comprobación de la URL de despliegue.