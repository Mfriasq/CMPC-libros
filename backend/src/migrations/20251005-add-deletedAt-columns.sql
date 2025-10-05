-- Migración para agregar el campo deletedAt a las tablas libros y usuarios
-- Fecha: 2025-10-05

-- Agregar columna deletedAt a la tabla libros
ALTER TABLE libros 
ADD COLUMN "deletedAt" TIMESTAMP NULL;

-- Agregar columna deletedAt a la tabla users  
ALTER TABLE users 
ADD COLUMN "deletedAt" TIMESTAMP NULL;

-- Comentarios para documentar los campos
COMMENT ON COLUMN libros."deletedAt" IS 'Fecha de eliminación lógica del libro';
COMMENT ON COLUMN users."deletedAt" IS 'Fecha de eliminación lógica del usuario';

-- Crear índices para optimizar consultas por deletedAt
CREATE INDEX idx_libros_deleted_at ON libros("deletedAt");
CREATE INDEX idx_users_deleted_at ON users("deletedAt");

-- Actualizar registros existentes que están marcados como eliminados
-- Para libros: si estadoId corresponde al estado "eliminado" y fechaEliminacion no es null
UPDATE libros 
SET "deletedAt" = "fechaEliminacion" 
WHERE "estadoId" = (SELECT id FROM estados WHERE nombre = 'eliminado') 
AND "fechaEliminacion" IS NOT NULL;

-- Para usuarios: si estadoId corresponde al estado "eliminado"  
UPDATE users 
SET "deletedAt" = NOW() 
WHERE "estadoId" = (SELECT id FROM estados WHERE nombre = 'eliminado');