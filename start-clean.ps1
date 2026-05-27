Set-Location $PSScriptRoot
Write-Host "Parando contenedores y borrando volúmenes..."
docker compose down -v --remove-orphans
Write-Host "Levantando proyecto..."
docker compose up -d --build
Write-Host "Estado:"
docker compose ps
Write-Host "Backend health:"
Start-Process "http://localhost:3000/api/health"
Write-Host "Frontend:"
Start-Process "http://localhost:5173"
