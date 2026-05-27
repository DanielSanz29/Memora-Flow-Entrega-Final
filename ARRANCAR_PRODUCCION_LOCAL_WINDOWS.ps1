Write-Host "== Memora Flow: prueba local del despliegue de produccion ==" -ForegroundColor Cyan

Write-Host "Deteniendo el entorno de desarrollo si estuviera abierto..." -ForegroundColor Yellow
docker compose down --remove-orphans 2>$null | Out-Null

docker compose -f docker-compose.production.yml down -v --remove-orphans 2>$null | Out-Null

Write-Host "Construyendo una unica aplicacion web (React build + API Express)..." -ForegroundColor Cyan
docker compose -f docker-compose.production.yml up -d --build --no-cache

Write-Host "Estado de contenedores:" -ForegroundColor Cyan
docker compose -f docker-compose.production.yml ps

Write-Host "Esperando a que la aplicacion responda..." -ForegroundColor Cyan
$ok = $false
for ($i = 1; $i -le 45; $i++) {
    try {
        $respuesta = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 3
        if ($respuesta.StatusCode -eq 200) {
            $ok = $true
            break
        }
    }
    catch {
        Start-Sleep -Seconds 2
    }
}

if ($ok) {
    Write-Host "Aplicacion de produccion iniciada correctamente." -ForegroundColor Green
    Write-Host "Web y API: http://localhost:3000" -ForegroundColor Green
    Write-Host "phpMyAdmin: http://localhost:8081" -ForegroundColor Green
    Start-Process "http://localhost:3000"
}
else {
    Write-Host "La aplicacion no ha respondido. Consulta: docker compose -f docker-compose.production.yml logs app_prod --tail=100" -ForegroundColor Red
}
