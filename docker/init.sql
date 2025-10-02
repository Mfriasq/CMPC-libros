-- Archivo de inicialización para PostgreSQL
-- Este archivo se ejecuta automáticamente cuando se crea el contenedor

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear usuario adicional si es necesario
-- CREATE USER nestjs_user WITH PASSWORD 'nestjs_password';
-- GRANT ALL PRIVILEGES ON DATABASE nestjs_db TO nestjs_user;

-- Insertar datos de ejemplo (opcional)
-- INSERT INTO users (name, email, age) VALUES 
--   ('Juan Pérez', 'juan@ejemplo.com', 30),
--   ('María García', 'maria@ejemplo.com', 25);

-- Mensaje de confirmación
SELECT 'Base de datos inicializada correctamente' AS message;