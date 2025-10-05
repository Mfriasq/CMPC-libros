-- Migración para agregar columna restoredAt a la tabla users
-- Fecha: 2025-10-05

-- Agregar columna restoredAt a la tabla users
ALTER TABLE users 
ADD COLUMN "restoredAt" TIMESTAMP NULL;

-- Agregar comentario a la nueva columna
COMMENT ON COLUMN users."restoredAt" IS 'Fecha de restauración del usuario eliminado';

-- Crear índice para optimizar consultas por restoredAt
CREATE INDEX idx_users_restored_at ON users("restoredAt");