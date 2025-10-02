# Script para iniciar el proyecto en modo desarrollo
# Ejecutar con: .\start-dev.ps1

Write-Host "🚀 Iniciando proyecto NestJS + React + PostgreSQL en modo desarrollo..." -ForegroundColor Green

# Verificar si Docker está instalado
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "Por favor instala Docker Desktop desde: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Verificar si Docker Compose está disponible
if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose no está disponible" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker detectado correctamente" -ForegroundColor Green

# Detener contenedores existentes si los hay
Write-Host "🛑 Deteniendo contenedores existentes..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml down 2>$null

# Construir e iniciar los contenedores
Write-Host "🔨 Construyendo e iniciando contenedores..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml up --build

# Si llegamos aquí, algo salió mal
Write-Host "❌ Error al iniciar los contenedores" -ForegroundColor Red