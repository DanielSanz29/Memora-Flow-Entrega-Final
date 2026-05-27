# Registro de pruebas finales — Memora Flow

**Instrucción:** ejecutar cada prueba tras levantar la versión revisada con Docker. Cumplimentar resultado y evidencia antes de trasladar los resultados a la memoria final.

| ID | Requisito | Caso de prueba | Resultado esperado | Resultado real | Evidencia |
|---|---|---|---|---|---|
| CP-01 | RF-01 | Login con `admin@memora.local` | Acceso al panel principal | Pendiente de ejecución | Captura login/dashboard |
| CP-02 | RF-01 | Login con contraseña incorrecta | Mensaje de error y sin acceso | Pendiente de ejecución | Captura mensaje |
| CP-03 | RF-01 / RNF-04 | Solicitar `/api/ordenes/1/resumen` sin token en Postman | Respuesta 401 | Pendiente de ejecución | Captura Postman |
| CP-04 | RF-01 | Usuario recepción intenta acceder a administración | Acceso bloqueado | Pendiente de ejecución | Captura UI/Network |
| CP-05 | RF-02 | Buscar DNI `12345678A` | Recuperación de expediente precargado | Pendiente de ejecución | Captura búsqueda |
| CP-06 | RF-02 / RF-03 | Crear expediente nuevo con datos válidos | Alta realizada sin duplicidad | Pendiente de ejecución | Captura formulario/BBDD |
| CP-07 | RF-04 | Crear orden desde expediente | Nueva orden en estado inicial | Pendiente de ejecución | Captura orden |
| CP-08 | RF-05 / RF-06 | Añadir producto y servicio | Detalles asociados a la orden | Pendiente de ejecución | Captura resumen |
| CP-09 | RF-07 | Comprobar cálculo tras añadir/eliminar línea | Total recalculado correctamente | Pendiente de ejecución | Captura antes/después |
| CP-10 | RF-09 | Añadir observación y cambiar estado | Historial y estado actualizados | Pendiente de ejecución | Captura seguimiento |
| CP-11 | RF-08 | Generar PDF desde una orden completa | Archivo PDF descargable y coherente | Pendiente de ejecución | Captura PDF |
| CP-12 | RNF-04 | DNI con intento SQL (`12345678A' OR 1=1 --`) | No devuelve registros indebidos | Pendiente de ejecución | Captura Postman |
| CP-13 | RNF-04 | Observación con etiqueta `<script>` | Se muestra como texto, no se ejecuta | Pendiente de ejecución | Captura UI |
| CP-14 | RNF-10 | Restaurar entorno tras `docker compose down -v` | Scripts reinicializan datos de demostración | Pendiente de ejecución | Captura Docker/BBDD |

## Capturas mínimas para anexos

1. Docker Desktop o terminal con contenedores en ejecución.
2. Inicio de sesión de la interfaz revisada.
3. Dashboard y búsqueda por DNI.
4. Alta o edición de expediente.
5. Resumen de orden con productos/servicios y total.
6. PDF generado.
7. Postman: healthcheck, login, ruta sin token y prueba SQL.
8. phpMyAdmin: tablas principales y registros de prueba.
