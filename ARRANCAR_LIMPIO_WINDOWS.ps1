$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "== Memora Flow: preparando un arranque limpio ==" -ForegroundColor Cyan

# Elimina únicamente contenedores antiguos que existan. Si alguno ya no existe,
# no se considera un error y el arranque continúa normalmente.
$containersReservados = @("memora_mysql", "memora_phpmyadmin", "memora_backend", "memora_frontend")
$contenedoresActuales = @(docker ps -a --format "{{.Names}}")
foreach ($container in $containersReservados) {
    if ($contenedoresActuales -contains $container) {
        Write-Host "Eliminando contenedor anterior: $container" -ForegroundColor Yellow
        docker rm -f $container | Out-Null
    }
    else {
        Write-Host "Sin contenedor anterior: $container" -ForegroundColor DarkGray
    }
}

Write-Host "== Limpiando la ejecución anterior del proyecto actual ==" -ForegroundColor Cyan
docker compose down -v --remove-orphans

Write-Host "== Construyendo sin caché para no reutilizar versiones anteriores ==" -ForegroundColor Cyan
docker compose build --pull --no-cache

Write-Host "== Arrancando servicios ==" -ForegroundColor Cyan
docker compose up -d

Write-Host "== Esperando a que la API responda ==" -ForegroundColor Cyan
$ok = $false
for ($i = 0; $i -lt 45; $i++) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -TimeoutSec 2
        if ($response.status -eq "ok") { $ok = $true; break }
    }
    catch {
        Start-Sleep -Seconds 2
    }
}

docker compose ps
if (-not $ok) {
    Write-Host "La API no ha respondido. Ejecuta: docker compose logs backend --tail=100" -ForegroundColor Red
    Write-Host "Y para el frontend: docker compose logs frontend --tail=100" -ForegroundColor Red
    exit 1
}

Write-Host "API correcta. Abriendo la aplicación y phpMyAdmin..." -ForegroundColor Green
Start-Process "http://localhost:5173"
Start-Process "http://localhost:8080"
Write-Host "Aplicación: http://localhost:5173" -ForegroundColor Green
Write-Host "API: http://localhost:3000/api/health" -ForegroundColor Green
Write-Host "phpMyAdmin: http://localhost:8080" -ForegroundColor Green
