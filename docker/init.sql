-- Script de inicialización completo para Sistema de Biblioteca
-- Se ejecuta automáticamente al crear el contenedor PostgreSQL

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Configurar zona horaria
SET TIME ZONE 'America/Santiago';

-- 1. Crear tabla Estados
CREATE TABLE IF NOT EXISTS "estados" (
  "id" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(50) NOT NULL UNIQUE,
  "descripcion" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla Géneros
CREATE TABLE IF NOT EXISTS "generos" (
  "id" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(100) NOT NULL UNIQUE,
  "descripcion" TEXT,
  "estadoId" INTEGER DEFAULT 1,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY ("estadoId") REFERENCES "estados"("id")
);

-- 3. Crear tabla Usuarios
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "name" VARCHAR(255) NOT NULL,
  "age" INTEGER,
  "password" VARCHAR(255) NOT NULL,
  "role" VARCHAR(50) DEFAULT 'user',
  "estadoId" INTEGER DEFAULT 1,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY ("estadoId") REFERENCES "estados"("id")
);

-- 4. Crear tabla Libros
CREATE TABLE IF NOT EXISTS "libros" (
  "id" SERIAL PRIMARY KEY,
  "titulo" VARCHAR(255) NOT NULL UNIQUE,
  "autor" VARCHAR(255) NOT NULL,
  "editorial" VARCHAR(255) NOT NULL,
  "precio" INTEGER NOT NULL,
  "disponibilidad" INTEGER NOT NULL DEFAULT 1,
  "imagenUrl" VARCHAR(500),
  "generoId" INTEGER NOT NULL,
  "estadoId" INTEGER DEFAULT 1,
  "fechaEliminacion" TIMESTAMP WITH TIME ZONE,
  "fechaRestauracion" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY ("generoId") REFERENCES "generos"("id"),
  FOREIGN KEY ("estadoId") REFERENCES "estados"("id")
);

-- Insertar datos iniciales

-- 1. Estados del sistema
INSERT INTO "estados" ("nombre", "descripcion") VALUES 
  ('activo', 'Registro activo en el sistema'),
  ('eliminado', 'Registro eliminado lógicamente del sistema')
ON CONFLICT ("nombre") DO NOTHING;

-- 2. Géneros literarios (30+ géneros)
INSERT INTO "generos" ("nombre", "descripcion", "estadoId") VALUES 
  ('Ficción', 'Literatura narrativa de carácter imaginativo', 1),
  ('No Ficción', 'Literatura basada en hechos reales', 1),
  ('Ciencia Ficción', 'Narrativa que especula sobre futuros posibles', 1),
  ('Fantasía', 'Literatura que incluye elementos mágicos o sobrenaturales', 1),
  ('Misterio', 'Novelas de intriga y suspense', 1),
  ('Terror', 'Literatura diseñada para provocar miedo', 1),
  ('Romance', 'Novelas centradas en relaciones amorosas', 1),
  ('Aventura', 'Narrativa de acción y exploración', 1),
  ('Biografía', 'Relatos de vidas reales', 1),
  ('Historia', 'Libros sobre eventos históricos', 1),
  ('Filosofía', 'Textos sobre pensamiento y reflexión', 1),
  ('Psicología', 'Estudios sobre la mente y comportamiento humano', 1),
  ('Autoayuda', 'Guías para mejoramiento personal', 1),
  ('Negocios', 'Literatura empresarial y económica', 1),
  ('Tecnología', 'Libros sobre avances tecnológicos', 1),
  ('Ciencias', 'Textos científicos y de investigación', 1),
  ('Medicina', 'Literatura médica y de salud', 1),
  ('Arte', 'Libros sobre expresiones artísticas', 1),
  ('Música', 'Literatura musical y biografías de músicos', 1),
  ('Deportes', 'Libros sobre actividades deportivas', 1),
  ('Cocina', 'Recetas y literatura gastronómica', 1),
  ('Viajes', 'Guías y relatos de viajes', 1),
  ('Política', 'Análisis político y social', 1),
  ('Religión', 'Textos religiosos y espirituales', 1),
  ('Educación', 'Literatura pedagógica y educativa', 1),
  ('Infantil', 'Literatura para niños', 1),
  ('Juvenil', 'Literatura para adolescentes', 1),
  ('Poesía', 'Compilaciones poéticas', 1),
  ('Teatro', 'Obras teatrales y dramáticas', 1),
  ('Ensayo', 'Textos reflexivos y analíticos', 1),
  ('Cómics', 'Novelas gráficas y cómics', 1),
  ('Manga', 'Cómics de origen japonés', 1),
  ('Thriller', 'Novelas de suspense psicológico', 1),
  ('Distopía', 'Narrativa sobre sociedades disfuncionales', 1),
  ('Utopía', 'Narrativa sobre sociedades ideales', 1)
ON CONFLICT ("nombre") DO NOTHING;

-- 3. Usuarios con diferentes roles (contraseñas hasheadas con bcrypt)
-- admin123: $2b$10$g4BYVyc8kfP6j4j73IwuhO2fLWBqz0g.bPI732F/JW326qwLMQ/1i
-- librarian123: $2b$10$iNJeEbid8AAfxeuVRj9XQulWbi6RHc6Veu9WOliiFF8gUaI5Wz5q2
-- user123: $2b$10$cmJrXVjfHI9pgTjK6JCt/OBUz7mXusvuPy6WpZ6RLoegpzbqIppou
INSERT INTO "users" ("email", "name", "age", "password", "role", "estadoId") VALUES 
  ('admin@biblioteca.com', 'Administrador Sistema', 35, '$2b$10$g4BYVyc8kfP6j4j73IwuhO2fLWBqz0g.bPI732F/JW326qwLMQ/1i', 'admin', 1),
  ('librarian@biblioteca.com', 'María Bibliotecaria', 28, '$2b$10$iNJeEbid8AAfxeuVRj9XQulWbi6RHc6Veu9WOliiFF8gUaI5Wz5q2', 'librarian', 1),
  ('user@biblioteca.com', 'Juan Usuario', 25, '$2b$10$cmJrXVjfHI9pgTjK6JCt/OBUz7mXusvuPy6WpZ6RLoegpzbqIppou', 'user', 1),
  ('carlos.admin@biblioteca.com', 'Carlos Administrador', 42, '$2b$10$g4BYVyc8kfP6j4j73IwuhO2fLWBqz0g.bPI732F/JW326qwLMQ/1i', 'admin', 1),
  ('ana.librarian@biblioteca.com', 'Ana Pérez', 31, '$2b$10$iNJeEbid8AAfxeuVRj9XQulWbi6RHc6Veu9WOliiFF8gUaI5Wz5q2', 'librarian', 1),
  ('luis.user@biblioteca.com', 'Luis González', 29, '$2b$10$cmJrXVjfHI9pgTjK6JCt/OBUz7mXusvuPy6WpZ6RLoegpzbqIppou', 'user', 1)
ON CONFLICT ("email") DO NOTHING;

-- Mensaje de confirmación de inicialización básica
SELECT 'Estructura básica y datos iniciales cargados correctamente' AS message;
SELECT 'Estados creados:' AS info, COUNT(*) AS cantidad FROM "estados";
SELECT 'Géneros creados:' AS info, COUNT(*) AS cantidad FROM "generos";  
SELECT 'Usuarios creados:' AS info, COUNT(*) AS cantidad FROM "users";