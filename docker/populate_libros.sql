-- Script de inserción de libros para Sistema de Biblioteca
-- Parte 2: 100+ libros con datos realistas

-- 4. Libros (100+ libros distribuidos en diferentes géneros)
INSERT INTO "libros" ("titulo", "autor", "editorial", "precio", "disponibilidad", "generoId", "estadoId") VALUES 
-- Ficción
('Cien años de soledad', 'Gabriel García Márquez', 'Sudamericana', 25000, 5, 1, 1),
('El amor en los tiempos del cólera', 'Gabriel García Márquez', 'Sudamericana', 22000, 3, 1, 1),
('La casa de los espíritus', 'Isabel Allende', 'Plaza & Janés', 20000, 4, 1, 1),
('Rayuela', 'Julio Cortázar', 'Alfaguara', 18000, 2, 1, 1),
('El túnel', 'Ernesto Sabato', 'Seix Barral', 15000, 6, 1, 1),
('Ficciones', 'Jorge Luis Borges', 'Emecé', 16000, 4, 1, 1),
('Pedro Páramo', 'Juan Rulfo', 'FCE', 14000, 3, 1, 1),
('La ciudad y los perros', 'Mario Vargas Llosa', 'Seix Barral', 21000, 2, 1, 1),
('El laberinto de la soledad', 'Octavio Paz', 'FCE', 19000, 5, 1, 1),
('Como agua para chocolate', 'Laura Esquivel', 'Planeta', 17000, 7, 1, 1),

-- Ciencia Ficción
('Dune', 'Frank Herbert', 'Acervo', 28000, 3, 3, 1),
('Fundación', 'Isaac Asimov', 'Plaza & Janés', 24000, 4, 3, 1),
('1984', 'George Orwell', 'Debolsillo', 16000, 8, 3, 1),
('Fahrenheit 451', 'Ray Bradbury', 'Minotauro', 15000, 6, 3, 1),
('Neuromante', 'William Gibson', 'Minotauro', 22000, 2, 3, 1),
('El fin de la eternidad', 'Isaac Asimov', 'Plaza & Janés', 20000, 3, 3, 1),
('La máquina del tiempo', 'H.G. Wells', 'Alianza', 12000, 5, 3, 1),
('Yo, Robot', 'Isaac Asimov', 'Edhasa', 18000, 4, 3, 1),
('El marciano', 'Andy Weir', 'Nova', 25000, 3, 3, 1),
('Blade Runner', 'Philip K. Dick', 'Minotauro', 19000, 2, 3, 1),

-- Fantasía
('El Señor de los Anillos: La Comunidad del Anillo', 'J.R.R. Tolkien', 'Minotauro', 32000, 4, 4, 1),
('El Señor de los Anillos: Las Dos Torres', 'J.R.R. Tolkien', 'Minotauro', 32000, 4, 4, 1),
('El Señor de los Anillos: El Retorno del Rey', 'J.R.R. Tolkien', 'Minotauro', 32000, 3, 4, 1),
('Harry Potter y la Piedra Filosofal', 'J.K. Rowling', 'Salamandra', 22000, 6, 4, 1),
('Harry Potter y el Cáliz de Fuego', 'J.K. Rowling', 'Salamandra', 24000, 4, 4, 1),
('Juego de Tronos', 'George R.R. Martin', 'Gigamesh', 28000, 3, 4, 1),
('El nombre del viento', 'Patrick Rothfuss', 'Plaza & Janés', 26000, 2, 4, 1),
('Las crónicas de Narnia', 'C.S. Lewis', 'Destino', 20000, 5, 4, 1),
('El hobbit', 'J.R.R. Tolkien', 'Minotauro', 18000, 7, 4, 1),
('Eragon', 'Christopher Paolini', 'Roca Editorial', 21000, 3, 4, 1),

-- Misterio
('El nombre de la rosa', 'Umberto Eco', 'Lumen', 25000, 2, 5, 1),
('Los crímenes de la calle Morgue', 'Edgar Allan Poe', 'Alianza', 14000, 4, 5, 1),
('El sabueso de los Baskerville', 'Arthur Conan Doyle', 'Anaya', 16000, 5, 5, 1),
('Asesinato en el Orient Express', 'Agatha Christie', 'Molino', 18000, 3, 5, 1),
('La chica del tren', 'Paula Hawkins', 'Planeta', 20000, 4, 5, 1),
('El código Da Vinci', 'Dan Brown', 'Umbriel', 22000, 6, 5, 1),
('La verdad sobre el caso Harry Quebert', 'Joël Dicker', 'Alfaguara', 24000, 2, 5, 1),
('El psicoanalista', 'John Katzenbach', 'Ediciones B', 19000, 3, 5, 1),
('La casa torcida', 'Agatha Christie', 'Molino', 17000, 4, 5, 1),
('El silencio de los corderos', 'Thomas Harris', 'Planeta', 21000, 2, 5, 1),

-- Terror
('Drácula', 'Bram Stoker', 'Alianza', 16000, 4, 6, 1),
('Frankenstein', 'Mary Shelley', 'Cátedra', 15000, 5, 6, 1),
('El resplandor', 'Stephen King', 'Plaza & Janés', 22000, 3, 6, 1),
('It (Eso)', 'Stephen King', 'Plaza & Janés', 28000, 2, 6, 1),
('El exorcista', 'William Peter Blatty', 'Planeta', 18000, 3, 6, 1),
('Cementerio de animales', 'Stephen King', 'Plaza & Janés', 20000, 4, 6, 1),
('Los relatos de Lovecraft', 'H.P. Lovecraft', 'Alianza', 19000, 3, 6, 1),
('El extraño caso del Dr. Jekyll y Mr. Hyde', 'R.L. Stevenson', 'Anaya', 12000, 6, 6, 1),
('La llamada de Cthulhu', 'H.P. Lovecraft', 'Minotauro', 17000, 2, 6, 1),
('Carrie', 'Stephen King', 'Plaza & Janés', 16000, 4, 6, 1),

-- Romance
('Orgullo y prejuicio', 'Jane Austen', 'Alba', 18000, 5, 7, 1),
('Jane Eyre', 'Charlotte Brontë', 'Cátedra', 17000, 4, 7, 1),
('Lo que el viento se llevó', 'Margaret Mitchell', 'Plaza & Janés', 26000, 2, 7, 1),
('El notebook', 'Nicholas Sparks', 'Roca Editorial', 16000, 6, 7, 1),
('Bajo la misma estrella', 'John Green', 'Nube de Tinta', 15000, 8, 7, 1),
('Me before you', 'Jojo Moyes', 'Suma', 18000, 4, 7, 1),
('El tiempo entre costuras', 'María Dueñas', 'Temas de Hoy', 22000, 3, 7, 1),
('Cincuenta sombras de Grey', 'E.L. James', 'Grijalbo', 19000, 5, 7, 1),
('Cumbres borrascosas', 'Emily Brontë', 'Cátedra', 16000, 3, 7, 1),
('Sentido y sensibilidad', 'Jane Austen', 'Alba', 17000, 4, 7, 1),

-- Aventura
('La isla del tesoro', 'Robert Louis Stevenson', 'Anaya', 14000, 5, 8, 1),
('Las aventuras de Tom Sawyer', 'Mark Twain', 'Alianza', 13000, 6, 8, 1),
('Robinson Crusoe', 'Daniel Defoe', 'Cátedra', 15000, 4, 8, 1),
('Moby Dick', 'Herman Melville', 'Cátedra', 21000, 2, 8, 1),
('Las aventuras de Huckleberry Finn', 'Mark Twain', 'Alianza', 14000, 5, 8, 1),
('El conde de Montecristo', 'Alejandro Dumas', 'Planeta', 24000, 3, 8, 1),
('Los tres mosqueteros', 'Alejandro Dumas', 'Planeta', 20000, 4, 8, 1),
('Veinte mil leguas de viaje submarino', 'Julio Verne', 'Anaya', 16000, 5, 8, 1),
('La vuelta al mundo en 80 días', 'Julio Verne', 'Anaya', 15000, 6, 8, 1),
('Viaje al centro de la Tierra', 'Julio Verne', 'Anaya', 15000, 4, 8, 1),

-- Biografía
('Steve Jobs', 'Walter Isaacson', 'Debate', 28000, 3, 9, 1),
('Einstein: Su vida y su universo', 'Walter Isaacson', 'Debate', 26000, 2, 9, 1),
('Leonardo da Vinci', 'Walter Isaacson', 'Debate', 30000, 2, 9, 1),
('Mandela: Una biografía íntima', 'Anthony Sampson', 'Grijalbo', 22000, 3, 9, 1),
('Gandhi: Una biografía', 'Yogesh Chadha', 'Plaza & Janés', 20000, 4, 9, 1),
('Churchill: Una biografía', 'Roy Jenkins', 'Planeta', 25000, 2, 9, 1),
('Marie Curie: Una biografía', 'Eva Curie', 'Alianza', 18000, 3, 9, 1),
('Frida Kahlo: Una biografía', 'Hayden Herrera', 'Planeta', 21000, 4, 9, 1),
('Nelson Mandela: Una biografía', 'Martin Meredith', 'Crítica', 23000, 2, 9, 1),
('Tesla: Inventor de la era eléctrica', 'W. Bernard Carlson', 'Crítica', 24000, 3, 9, 1),

-- Historia
('Sapiens: De animales a dioses', 'Yuval Noah Harari', 'Debate', 22000, 6, 10, 1),
('Homo Deus', 'Yuval Noah Harari', 'Debate', 24000, 4, 10, 1),
('21 lecciones para el siglo XXI', 'Yuval Noah Harari', 'Debate', 20000, 5, 10, 1),
('Una breve historia del tiempo', 'Stephen Hawking', 'Crítica', 18000, 4, 10, 1),
('El mundo de ayer', 'Stefan Zweig', 'Acantilado', 19000, 3, 10, 1),
('La Segunda Guerra Mundial', 'Winston Churchill', 'Planeta', 35000, 2, 10, 1),
('Historia de dos ciudades', 'Charles Dickens', 'Alba', 16000, 4, 10, 1),
('Los pilares de la Tierra', 'Ken Follett', 'Plaza & Janés', 28000, 3, 10, 1),
('La caída de los gigantes', 'Ken Follett', 'Plaza & Janés', 30000, 2, 10, 1),
('El siglo', 'Ken Follett', 'Plaza & Janés', 32000, 2, 10, 1),

-- Filosofía
('El mundo de Sofía', 'Jostein Gaarder', 'Siruela', 20000, 4, 11, 1),
('Más Platón y menos Prozac', 'Lou Marinoff', 'Ediciones B', 16000, 3, 11, 1),
('El arte de la guerra', 'Sun Tzu', 'Alianza', 12000, 6, 11, 1),
('Meditaciones', 'Marco Aurelio', 'Gredos', 14000, 4, 11, 1),
('El príncipe', 'Nicolás Maquiavelo', 'Alianza', 13000, 5, 11, 1),
('Crítica de la razón pura', 'Immanuel Kant', 'Alfaguara', 25000, 2, 11, 1),
('Así habló Zaratustra', 'Friedrich Nietzsche', 'Alianza', 18000, 3, 11, 1),
('El contrato social', 'Jean-Jacques Rousseau', 'Alianza', 15000, 4, 11, 1),
('Ética a Nicómaco', 'Aristóteles', 'Gredos', 20000, 2, 11, 1),
('La República', 'Platón', 'Gredos', 22000, 3, 11, 1),

-- Autoayuda
('Los 7 hábitos de la gente altamente efectiva', 'Stephen R. Covey', 'Paidós', 18000, 8, 13, 1),
('Cómo ganar amigos e influir sobre las personas', 'Dale Carnegie', 'Elipse', 15000, 10, 13, 1),
('El poder del ahora', 'Eckhart Tolle', 'Gaia', 16000, 6, 13, 1),
('Piense y hágase rico', 'Napoleon Hill', 'Grijalbo', 14000, 7, 13, 1),
('El monje que vendió su Ferrari', 'Robin Sharma', 'Grijalbo', 15000, 5, 13, 1),
('Padre rico, padre pobre', 'Robert Kiyosaki', 'Aguilar', 17000, 8, 13, 1),
('Los cuatro acuerdos', 'Don Miguel Ruiz', 'Urano', 13000, 9, 13, 1),
('El secreto', 'Rhonda Byrne', 'Urano', 16000, 6, 13, 1),
('Inteligencia emocional', 'Daniel Goleman', 'Kairós', 19000, 4, 13, 1),
('Mindset: La actitud del éxito', 'Carol S. Dweck', 'Sirio', 18000, 5, 13, 1)

ON CONFLICT ("titulo") DO NOTHING;

-- Mensaje de confirmación
SELECT 'Libros insertados correctamente' AS message;
SELECT COUNT(*) AS total_libros FROM "libros";
SELECT COUNT(*) AS total_generos FROM "generos"; 
SELECT COUNT(*) AS total_usuarios FROM "users";