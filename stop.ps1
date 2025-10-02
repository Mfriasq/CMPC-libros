# Script para detener el proyecto
# Ejecutar con: .\stop.ps1

Write-Host "🛑 Deteniendo proyecto NestJS + React + PostgreSQL..." -ForegroundColor Yellow

# Detener contenedores de desarrollo
Write-Host "Deteniendo contenedores de desarrollo..." -ForegroundColor White
docker-compose -f docker-compose.dev.yml down 2>$null

# Detener contenedores de producción
Write-Host "Deteniendo contenedores de producción..." -ForegroundColor White
docker-compose down 2>$null

Write-Host "✅ Proyecto detenido correctamente!" -ForegroundColor Green

# Preguntar si quiere limpiar volúmenes
$response = Read-Host "¿Quieres eliminar también los volúmenes de base de datos? (y/N)"
if ($response -eq 'y' -or $response -eq 'Y' -or $response -eq 'yes') {
    Write-Host "🗑️ Eliminando volúmenes..." -ForegroundColor Red
    docker-compose down -v 2>$null
    docker-compose -f docker-compose.dev.yml down -v 2>$null
    Write-Host "✅ Volúmenes eliminados!" -ForegroundColor Green
}