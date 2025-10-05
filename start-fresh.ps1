# Script de inicio completo desde cero
# Elimina todos los contenedores y datos anteriores y crea todo nuevo

Write-Host "INICIANDO Sistema de Biblioteca desde CERO..." -ForegroundColor Green
Write-Host ""

# 1. Detener y eliminar contenedores existentes
Write-Host "Limpiando contenedores anteriores..." -ForegroundColor Yellow
docker-compose down -v 2>$null
docker-compose -f docker-compose.dev.yml down -v 2>$null

# 2. Eliminar contenedores relacionados específicamente
Write-Host "Eliminando contenedores específicos..." -ForegroundColor Yellow
docker rm -f nestjs_backend 2>$null
docker rm -f nestjs_frontend 2>$null  
docker rm -f nestjs_postgres 2>$null
docker rm -f nestjs_backend_dev 2>$null
docker rm -f nestjs_frontend_dev 2>$null

# 3. Eliminar volúmenes de datos
Write-Host "Eliminando volúmenes de datos..." -ForegroundColor Yellow
docker volume rm nestjs_postgres_data 2>$null
docker volume rm nestjs_postgres_data_dev 2>$null
docker volume rm nestjs_backend_uploads 2>$null
docker volume rm nestjs_backend_logs 2>$null

# 4. Limpiar imágenes huérfanas
Write-Host "Limpiando imágenes no utilizadas..." -ForegroundColor Yellow
docker image prune -f 2>$null

Write-Host ""
Write-Host "Limpieza completa" -ForegroundColor Green
Write-Host ""

# 5. Construir e iniciar servicios
Write-Host "Construyendo e iniciando servicios..." -ForegroundColor Cyan
docker-compose up --build -d

# 6. Mostrar estado
Write-Host ""
Write-Host "Estado de los servicios:" -ForegroundColor Cyan
Start-Sleep -Seconds 5
docker-compose ps

Write-Host ""
Write-Host "Información de conexión:" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Backend API: http://localhost:3001" -ForegroundColor White
Write-Host "Swagger API: http://localhost:3001/api" -ForegroundColor White
Write-Host "Base de Datos: localhost:5432 (usuario: postgres, password: password, db: biblioteca)" -ForegroundColor White

Write-Host ""
Write-Host "Usuarios disponibles:" -ForegroundColor Green
Write-Host "Admin: admin@biblioteca.com / admin123" -ForegroundColor White
Write-Host "Librarian: librarian@biblioteca.com / librarian123" -ForegroundColor White  
Write-Host "User: user@biblioteca.com / user123" -ForegroundColor White

Write-Host ""
Write-Host "Datos preconfigurados:" -ForegroundColor Green
Write-Host "- 35 géneros literarios" -ForegroundColor White
Write-Host "- 100+ libros de ejemplo" -ForegroundColor White
Write-Host "- 6 usuarios con diferentes roles" -ForegroundColor White
Write-Host "- Sistema de estados (activo/eliminado)" -ForegroundColor White

Write-Host ""
Write-Host "Para ver logs en tiempo real:" -ForegroundColor Cyan
Write-Host "docker-compose logs -f" -ForegroundColor Gray

Write-Host ""
Write-Host "Sistema iniciado correctamente!" -ForegroundColor Green