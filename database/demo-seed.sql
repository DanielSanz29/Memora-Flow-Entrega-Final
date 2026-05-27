INSERT INTO rol (id, nombre, descripcion) VALUES
 (1, 'administrador', 'Acceso completo a administración y configuración'),
 (2, 'recepcion', 'Alta y consulta inicial de expedientes'),
 (3, 'asesor', 'Gestión de órdenes, productos, servicios y presupuesto'),
 (4, 'gerencia', 'Consulta, revisión y seguimiento');
INSERT INTO usuario (id, nombre, email, password_hash, rol_id, activo) VALUES
 (1, 'Administrador Memora', 'admin@memora.local', '$2b$10$9PHISmpjCLgAHhLBfOTkPOc2p/.2lzAYRmBBfK46JeCZ5VvoGvtai', 1, 1),
 (2, 'Recepción Memora', 'recepcion@memora.local', '$2b$10$qskB.2AHSUNXvkceaaR3KONsh02ZuHYIBVP9x6E3cVglEqlDpto5u', 2, 1),
 (3, 'Asesor Memora', 'asesor@memora.local', '$2b$10$OUrTG.PSBwA0jwZUyfyISeOAx8nszJZLVqM8qTkhtsB3gzgos4cSC', 3, 1),
 (4, 'Gerencia Memora', 'gerencia@memora.local', '$2b$10$MecccnBY2SOkuqJlkyVfS.n1sAE.VBsR7E97iusseIMRRxTS2wVD.', 4, 1);
INSERT INTO estado_orden (id, nombre, descripcion, orden_logico) VALUES
 (1, 'borrador', 'Orden creada pero todavía editable', 1),
 (2, 'en preparación', 'Orden en fase de preparación administrativa', 2),
 (3, 'pendiente de validación', 'Orden pendiente de revisión', 3),
 (4, 'cerrada', 'Orden cerrada administrativamente', 4),
 (5, 'anulada', 'Orden anulada', 5);
INSERT INTO categoria_producto (id, nombre, descripcion) VALUES
 (1, 'ataudes', 'Ataúdes disponibles para el servicio'), (2, 'urnas', 'Urnas funerarias'), (3, 'flores', 'Productos florales'), (4, 'documentacion', 'Conceptos documentales');
INSERT INTO producto (id, categoria_id, nombre, descripcion, precio_base, activo) VALUES
 (1, 1, 'Ataúd básico', 'Ataúd funcional de gama básica', 650.00, 1), (2, 1, 'Ataúd premium', 'Ataúd de acabado superior', 1250.00, 1),
 (3, 2, 'Urna estándar', 'Urna funeraria estándar', 180.00, 1), (4, 2, 'Urna ecológica', 'Urna biodegradable', 240.00, 1),
 (5, 3, 'Centro floral', 'Centro floral para ceremonia', 95.00, 1), (6, 3, 'Corona', 'Corona funeraria', 180.00, 1),
 (7, 3, 'Ramo', 'Ramo floral sencillo', 55.00, 1), (8, 3, 'Arreglo personalizado', 'Arreglo floral personalizado', 150.00, 1);
INSERT INTO servicio_complementario (id, nombre, descripcion, precio_base, activo) VALUES
 (1, 'Velatorio', 'Servicio de velatorio en sala', 350.00, 1), (2, 'Sala de despedida', 'Uso de sala de despedida', 220.00, 1),
 (3, 'Ceremonia', 'Organización de ceremonia', 300.00, 1), (4, 'Traslado', 'Traslado del fallecido dentro de zona local', 180.00, 1);
INSERT INTO cliente_responsable (id, dni, nombre, apellidos, telefono, email, direccion) VALUES
 (1, '12345678A', 'María', 'García López', '600123456', 'maria.garcia@example.local', 'Calle Ejemplo 12, Zaragoza');
INSERT INTO fallecido (id, dni, nombre, apellidos, fecha_defuncion, lugar_defuncion) VALUES (1, '87654321B', 'Antonio', 'Pérez Martín', '2026-05-10', 'Zaragoza');
INSERT INTO expediente (id, codigo, cliente_id, fallecido_id, estado) VALUES (1, 'EXP-2026-0001', 1, 1, 'abierto');
INSERT INTO orden_funeraria (id, expediente_id, tipo_servicio, estado_id, total_estimado, observacion_general) VALUES (1, 1, 'incineracion', 2, 625.00, 'Orden de prueba para demostración del flujo principal.');
INSERT INTO detalle_orden (id, orden_id, producto_id, concepto, cantidad, precio_unitario, subtotal) VALUES (1, 1, 3, 'Urna estándar', 1, 180.00, 180.00), (2, 1, 5, 'Centro floral', 1, 95.00, 95.00);
INSERT INTO orden_servicio_complementario (orden_id, servicio_id, precio_aplicado) VALUES (1, 1, 350.00);
INSERT INTO observacion (id, orden_id, usuario_id, texto) VALUES (1, 1, 3, 'Observación inicial de prueba. Confirmar documentación antes de cerrar la orden.');
INSERT INTO auditoria (id, usuario_id, entidad, entidad_id, accion, detalle) VALUES
 (1, 1, 'sistema', 1, 'seed_inicial', 'Carga inicial de datos de prueba'),
 (2, 3, 'orden_funeraria', 1, 'crear_orden', 'Estado inicial: en preparación. Orden incluida como dato inicial');
