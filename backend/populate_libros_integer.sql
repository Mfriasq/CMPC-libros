-- Script para poblar la tabla de libros con disponibilidad como entero
-- Configurando encoding UTF-8

SET client_encoding = 'UTF8';

-- Primero, aplicar la migración de la columna
-- Agregar nueva columna temporal
ALTER TABLE libros ADD COLUMN IF NOT EXISTS disponibilidad_temp INTEGER DEFAULT 0;

-- Migrar datos existentes si la columna disponibilidad es boolean
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'libros' 
               AND column_name = 'disponibilidad' 
               AND data_type = 'boolean') THEN
        UPDATE libros 
        SET disponibilidad_temp = CASE 
            WHEN disponibilidad = true THEN 1 
            ELSE 0 
        END;
        
        ALTER TABLE libros DROP COLUMN disponibilidad;
        ALTER TABLE libros RENAME COLUMN disponibilidad_temp TO disponibilidad;
        ALTER TABLE libros ALTER COLUMN disponibilidad SET NOT NULL;
    END IF;
END $$;

-- Limpiar tabla y repoblar con nuevos datos
DELETE FROM libros;

INSERT INTO libros (titulo, autor, editorial, genero, precio, disponibilidad, estado, "createdAt", "updatedAt") VALUES
('Cien años de soledad', 'Gabriel García Márquez', 'Sudamericana', 'Realismo mágico', 2500, 3, 'activo', NOW(), NOW()),
('Don Quijote de la Mancha', 'Miguel de Cervantes', 'Francisco de Robles', 'Novela', 1800, 5, 'activo', NOW(), NOW()),
('1984', 'George Orwell', 'Secker & Warburg', 'Distopía', 2200, 2, 'activo', NOW(), NOW()),
('El amor en los tiempos del cólera', 'Gabriel García Márquez', 'Oveja Negra', 'Romance', 2300, 0, 'activo', NOW(), NOW()),
('Rayuela', 'Julio Cortázar', 'Sudamericana', 'Ficción experimental', 2000, 4, 'activo', NOW(), NOW()),
('La casa de los espíritus', 'Isabel Allende', 'Plaza & Janés', 'Realismo mágico', 2100, 2, 'activo', NOW(), NOW()),
('Orgullo y prejuicio', 'Jane Austen', 'T. Egerton', 'Romance', 1900, 6, 'activo', NOW(), NOW()),
('El principito', 'Antoine de Saint-Exupéry', 'Reynal & Hitchcock', 'Fábula', 1500, 8, 'activo', NOW(), NOW()),
('Matar un ruiseñor', 'Harper Lee', 'J. B. Lippincott & Co.', 'Ficción', 2000, 0, 'activo', NOW(), NOW()),
('El gran Gatsby', 'F. Scott Fitzgerald', 'Charles Scribner''s Sons', 'Ficción', 1800, 3, 'activo', NOW(), NOW()),
('Crimen y castigo', 'Fiódor Dostoyevski', 'El Mensajero Ruso', 'Novela psicológica', 2400, 1, 'activo', NOW(), NOW()),
('Los Miserables', 'Victor Hugo', 'A. Lacroix, Verboeckhoven & Cie', 'Novela histórica', 2800, 0, 'activo', NOW(), NOW()),
('Ulises', 'James Joyce', 'Sylvia Beach', 'Modernismo', 3000, 2, 'activo', NOW(), NOW()),
('En busca del tiempo perdido', 'Marcel Proust', 'Grasset', 'Ficción autobiográfica', 3500, 0, 'activo', NOW(), NOW()),
('El extranjero', 'Albert Camus', 'Gallimard', 'Existencialismo', 1700, 4, 'activo', NOW(), NOW()),
('Lolita', 'Vladimir Nabokov', 'Olympia Press', 'Ficción', 2600, 1, 'activo', NOW(), NOW()),
('El nombre de la rosa', 'Umberto Eco', 'Bompiani', 'Misterio histórico', 2900, 3, 'activo', NOW(), NOW()),
('La metamorfosis', 'Franz Kafka', 'Kurt Wolff Verlag', 'Ficción absurda', 1400, 5, 'activo', NOW(), NOW()),
('Ficciones', 'Jorge Luis Borges', 'Sur', 'Ficción fantástica', 1600, 2, 'activo', NOW(), NOW()),
('El túnel', 'Ernesto Sábato', 'Sur', 'Ficción psicológica', 1500, 3, 'activo', NOW(), NOW());