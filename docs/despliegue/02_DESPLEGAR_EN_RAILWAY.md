# 2. Desplegar Memora Flow en Railway

## Arquitectura elegida

La publicación utiliza dos servicios dentro de un único proyecto Railway:

- **MySQL**: base de datos gestionada por Railway.
- **memora-flow-web**: contenedor construido desde el `Dockerfile` de la raíz. Sirve frontend React y API Express bajo una única URL pública.

No es necesario crear un servicio público independiente para el frontend.

## Paso A. Crear proyecto y base MySQL

1. Entrar en Railway y pulsar **New Project**.
2. Elegir un proyecto vacío.
3. Pulsar **+ New** > **Database** > **MySQL**.
4. Esperar a que aparezca el servicio de MySQL activo.
5. Mantener el nombre del servicio como `MySQL` o anotar el nombre exacto si Railway lo asigna de otra forma.

## Paso B. Añadir la aplicación desde GitHub

1. En el mismo proyecto Railway, pulsar **+ New** > **GitHub Repo**.
2. Seleccionar el repositorio `Memora-Flow-Entrega-Final`.
3. Railway detectará el `Dockerfile` de la raíz y construirá la aplicación completa.
4. Renombrar el servicio, si se desea, como `memora-flow-web`.

## Paso C. Configurar variables del servicio web

Entrar en el servicio de aplicación, apartado **Variables**, pulsar **Raw Editor** y pegar:

```env
NODE_ENV=production
DB_MODE=mysql
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_INIT_ON_START=true
DB_CONNECT_ATTEMPTS=45
JWT_SECRET=CAMBIAR_POR_UNA_CLAVE_LARGA_ALEATORIA
JWT_EXPIRES_IN=8h
```

Si el servicio de base de datos no se llama `MySQL`, reemplazar `MySQL` por el nombre que se muestra en Railway.

Para crear una clave segura en PowerShell:

```powershell
-join ((48..57)+(65..90)+(97..122) | Get-Random -Count 48 | ForEach-Object {[char]$_})
```

Copiar el resultado y utilizarlo como valor de `JWT_SECRET`.

## Paso D. Lanzar el despliegue

1. Tras guardar variables, Railway iniciará un nuevo despliegue o permitirá pulsar **Redeploy**.
2. Abrir los logs del servicio web.
3. Confirmar que aparece el mensaje de conexión con MySQL y la inicialización de tablas/datos de prueba.
4. Confirmar que el healthcheck `/api/health` se muestra correcto.

## Paso E. Obtener la URL pública

1. Entrar en el servicio `memora-flow-web`.
2. Ir a **Settings** > **Networking**.
3. Pulsar **Generate Domain**.
4. Copiar la URL con `https://`.
5. Abrir la URL y probar inicio de sesión, catálogos, historial, vista de gerencia y PDF.

## Comprobaciones mínimas

- Abrir `https://TU_DOMINIO/api/health` y comprobar respuesta `status: ok`.
- Acceder con usuario recepción y abrir **Ver catálogos**.
- Acceder con gerencia y abrir **Ver funerarios y recepcionistas**.
- Crear o editar una orden únicamente con datos ficticios.
- Descargar un PDF.
- Abrir la URL desde incógnito para verificar que no depende de la sesión local.

## Advertencia de uso académico

La aplicación pública contiene datos ficticios y usuarios de demostración. No se deben introducir datos reales de personas ni utilizarla como sistema productivo de una empresa.
