# Script para iniciar el proyecto en modo producción
# Ejecutar con: .\start-prod.ps1

Write-Host "🚀 Iniciando proyecto NestJS + React + PostgreSQL en modo producción..." -ForegroundColor Green

# Verificar si Docker está instalado
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "Por favor instala Docker Desktop desde: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Docker detectado correctamente" -ForegroundColor Green

# Detener contenedores existentes si los hay
Write-Host "🛑 Deteniendo contenedores existentes..." -ForegroundColor Yellow
docker-compose down 2>$null

# Construir e iniciar los contenedores en modo producción
Write-Host "🔨 Construyendo e iniciando contenedores para producción..." -ForegroundColor Yellow
docker-compose up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Proyecto iniciado correctamente!" -ForegroundColor Green
    Write-Host "" -ForegroundColor White
    Write-Host "📍 Servicios disponibles:" -ForegroundColor Cyan
    Write-Host "  - Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "  - Backend API: http://localhost:3001" -ForegroundColor White
    Write-Host "  - Documentación API: http://localhost:3001/api/docs" -ForegroundColor White
    Write-Host "  - Adminer (DB): http://localhost:8080" -ForegroundColor White
    Write-Host "" -ForegroundColor White
    Write-Host "📋 Para ver los logs ejecuta: docker-compose logs -f" -ForegroundColor Yellow
    Write-Host "🛑 Para detener: docker-compose down" -ForegroundColor Yellow
} else {
    Write-Host "❌ Error al iniciar los contenedores" -ForegroundColor Red
}