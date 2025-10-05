-- Migración para eliminar fechaEliminacion y renombrar fechaRestauracion a restoredAt
-- Fecha: 2025-10-05

-- Primero, crear la nueva columna restoredAt
ALTER TABLE libros 
ADD COLUMN "restoredAt" TIMESTAMP NULL;

-- Copiar los datos de fechaRestauracion a restoredAt
UPDATE libros 
SET "restoredAt" = "fechaRestauracion" 
WHERE "fechaRestauracion" IS NOT NULL;

-- Eliminar la columna fechaEliminacion
ALTER TABLE libros 
DROP COLUMN IF EXISTS "fechaEliminacion";

-- Eliminar la columna fechaRestauracion
ALTER TABLE libros 
DROP COLUMN IF EXISTS "fechaRestauracion";

-- Agregar comentario a la nueva columna
COMMENT ON COLUMN libros."restoredAt" IS 'Fecha de restauración del libro eliminado';

-- Crear índice para optimizar consultas por restoredAt
CREATE INDEX idx_libros_restored_at ON libros("restoredAt");