# Informe breve de auditoría técnica y preparación de entrega — Memora Flow

## Incidencias críticas detectadas

1. La portada de la memoria actual indica `13/06/2026`, fecha posterior al límite de entrega informado (`29/05/2026 antes de las 14:00`).
2. La memoria incluye el repositorio, pero no presenta una URL pública de despliegue verificable.
3. La tabla de pruebas de la memoria identifica los casos como diseñados, no como ejecutados con evidencias finales.
4. El archivo comprimido y el repositorio público contienen marcadores de conflicto Git en archivos esenciales (`README.md`, `docker-compose.yml`, backend y frontend). El proyecto original no debe entregarse en ese estado.

## Correcciones aplicadas al paquete revisado

- Resolución de marcadores de conflicto conservando la rama coherente con la API REST, MySQL, JWT y PDF descritos en la memoria.
- Eliminación de archivos duplicados de la rama alternativa que generaban dos estructuras incompatibles.
- Conservación del flujo funcional y de los endpoints existentes.
- Mejora visual del frontend activo: login, navegación, dashboard, formularios, tablas, alertas y componentes comunes.
- Actualización de README e incorporación de plantillas para pruebas y checklist final.

## Verificaciones realizadas

- Extracción e inspección del archivo entregado.
- Comprobación de ausencia de marcadores de conflicto en la versión revisada.
- Comprobación de resolución de imports internos activos.
- Validación sintáctica de los archivos JavaScript del backend mediante `node --check`.

## Verificaciones pendientes del alumno

- Ejecución completa del sistema con Docker Desktop.
- Cumplimentación del registro de pruebas con resultados y capturas reales.
- Actualización/push del repositorio GitHub con el código revisado.
- Despliegue público y verificación de su URL.
- Actualización de la memoria editable con evidencias finales y exportación PDF.
