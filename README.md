# Memora Flow - versión preparada para producción y Railway

Aplicación web interna para la gestión asistida de órdenes funerarias, desarrollada como proyecto final del CFGS de Desarrollo de Aplicaciones Web.

## Versión actual

Esta carpeta contiene la versión final del código preparada para:

- ejecución local en desarrollo con `docker-compose.yml`;
- comprobación local del formato de producción con `docker-compose.production.yml`;
- publicación en Railway mediante un único servicio web y una base de datos MySQL gestionada.

## Cambios funcionales incorporados

- Inicio de sesión sin mostrar credenciales en la interfaz.
- Búsqueda, alta y edición de expedientes.
- Creación de orden vinculada a un expediente real, sin solicitar un ID manual.
- Historial general de órdenes y registro de cambios de estado.
- Catálogos visuales de **ataúdes**, **flores** y **urnas** para recepción y asesoría.
- Seguimiento gerencial de pedidos realizados por personal asesor y recepción.
- Productos, servicios, presupuesto, observaciones y generación PDF.
- Administración básica de usuarios, roles, estados y catálogos.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Interfaz | React 19, React Router DOM 7, Tailwind CSS 3, Vite 6 |
| Servidor | Node.js 20, Express 4 |
| Datos | MySQL 8.4 y mysql2 |
| Seguridad | JWT, bcryptjs, Helmet |
| Documentos | PDFKit |
| Infraestructura local | Docker Compose |
| Publicación propuesta | Railway + MySQL gestionado |

## Arquitectura de producción preparada

En desarrollo, frontend y backend pueden iniciarse como servicios separados. Para publicar el proyecto se ha preparado una arquitectura más sencilla y robusta:

1. El `Dockerfile` de la raíz compila el frontend React con Vite.
2. El backend Express sirve el build estático generado y la API REST.
3. La aplicación pública dispone de **una sola URL**: la web se abre en `/` y la API responde en `/api`.
4. Railway provisiona MySQL como servicio de base de datos independiente.
5. Al primer arranque, `DB_INIT_ON_START=true` crea tablas y carga datos ficticios de demostración mediante los scripts de la carpeta `database/`.

Esta estructura evita desplegar dos dominios públicos y evita problemas de CORS o de URLs del backend incrustadas en el frontend.

## Ejecución local actual, modo desarrollo

Mantiene la forma de trabajo utilizada durante la implementación:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\ARRANCAR_LIMPIO_WINDOWS.ps1
```

Direcciones:

| Servicio | Dirección |
|---|---|
| Interfaz de desarrollo | `http://localhost:5173` |
| API | `http://localhost:3000/api/health` |
| phpMyAdmin | `http://localhost:8080` |

## Probar exactamente la versión de producción antes de Railway

Esta prueba usa una sola URL para web y API, igual que el despliegue:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\ARRANCAR_PRODUCCION_LOCAL_WINDOWS.ps1
```

Direcciones de la prueba de producción:

| Servicio | Dirección |
|---|---|
| Aplicación completa | `http://localhost:3000` |
| Estado de la API | `http://localhost:3000/api/health` |
| phpMyAdmin de prueba | `http://localhost:8081` |

En esta modalidad el contenedor de aplicación compila React y Express lo sirve directamente, de forma equivalente al contenedor que se publicará en Railway.

## Usuarios y datos de demostración

Todos los datos son ficticios y se utilizan únicamente para mostrar el flujo del proyecto.

| Perfil | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@memora.local` | `Admin1234` |
| Recepción | `recepcion@memora.local` | `Recep1234` |
| Asesor | `asesor@memora.local` | `Asesor1234` |
| Gerencia | `gerencia@memora.local` | `Gerencia1234` |

DNI/NIE de búsqueda precargado: `12345678A`.

## Publicación en GitHub y Railway

La guía detallada se encuentra en:

- `docs/despliegue/01_SUBIR_A_GITHUB.md`
- `docs/despliegue/02_DESPLEGAR_EN_RAILWAY.md`
- `docs/despliegue/03_EVIDENCIAS_PARA_LA_MEMORIA.md`

Archivos preparados para Railway:

| Archivo | Finalidad |
|---|---|
| `Dockerfile` | Build de React y ejecución de Express en una sola imagen |
| `railway.json` | Configura Dockerfile, healthcheck y reinicio |
| `.env.railway.example` | Variables que se deben configurar en el servicio web |
| `database/init.sql` | Crea tablas principales |
| `database/seed.sql` | Carga datos ficticios y usuarios de la demostración |

## Seguridad y límites del despliegue académico

- No se deben registrar datos personales reales en la versión pública.
- La clave `JWT_SECRET` debe definirse en Railway y no subirse al repositorio.
- Los usuarios de demostración deben compartirse únicamente con el tutor o tribunal.
- La URL publicada corresponde a una demostración académica, no a un sistema de explotación real.
- Antes del depósito debe comprobarse el acceso en modo incógnito y añadirse la URL final a la memoria.
