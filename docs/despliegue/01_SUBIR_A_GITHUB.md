# 1. Subir la versión final a GitHub

## Recomendación

Para evitar mezclar esta versión corregida con commits antiguos que contenían errores, se recomienda crear un repositorio nuevo y limpio llamado, por ejemplo, `Memora-Flow-Entrega-Final`.

## Pasos en GitHub

1. Entrar en GitHub con la cuenta del alumno.
2. Pulsar **New repository**.
3. Escribir como nombre `Memora-Flow-Entrega-Final`.
4. Elegir visibilidad **Public** si el tutor debe acceder directamente al código.
5. No marcar las opciones de crear README, `.gitignore` ni licencia, porque esta carpeta ya los contiene.
6. Crear el repositorio y copiar la dirección HTTPS que muestra GitHub.

## Pasos en Visual Studio Code

Abrir en Visual Studio Code la carpeta `MemoraFlow_PRODUCCION_RAILWAY_LISTO` y abrir una terminal dentro de ella.

```powershell
git init
git branch -M main
git add .
git commit -m "Preparar Memora Flow para entrega y despliegue en Railway"
git remote add origin https://github.com/TU_USUARIO/Memora-Flow-Entrega-Final.git
git push -u origin main
```

Sustituir `TU_USUARIO` por el nombre real de la cuenta de GitHub.

## Comprobación

Al terminar, abrir el repositorio desde el navegador y confirmar que en la raíz aparecen:

- `Dockerfile`
- `railway.json`
- `backend/`
- `frontend/`
- `database/`
- `README.md`

Guardar la URL del repositorio, porque deberá sustituirse en la memoria definitiva.
