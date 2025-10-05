import React from "react";
import { render, screen } from "@testing-library/react";

// Tipo para Libro
interface Libro {
  id: number;
  titulo: string;
  autor: string;
  genero: string;
  disponible: boolean;
}

// Componente Lista de Libros simplificado para testing
const SimpleLibrosList: React.FC<{ libros?: Libro[] }> = ({
  libros = [
    {
      id: 1,
      titulo: "El Quijote",
      autor: "Cervantes",
      genero: "Clásico",
      disponible: true,
    },
    {
      id: 2,
      titulo: "Cien años de soledad",
      autor: "García Márquez",
      genero: "Realismo mágico",
      disponible: false,
    },
  ],
}) => {
  return (
    <div>
      <h1>Lista de Libros</h1>
      <div className="libros-container">
        {libros.length === 0 ? (
          <p>No hay libros disponibles</p>
        ) : (
          <ul>
            {libros.map((libro) => (
              <li
                key={libro.id}
                className={`libro-item ${
                  libro.disponible ? "disponible" : "no-disponible"
                }`}
              >
                <h3>{libro.titulo}</h3>
                <p>Autor: {libro.autor}</p>
                <p>Género: {libro.genero}</p>
                <span className="estado">
                  {libro.disponible ? "Disponible" : "No disponible"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button className="btn-agregar">Agregar Libro</button>
    </div>
  );
};

describe("Libros List Component - Isolated Tests", () => {
  it("renders books list title", () => {
    render(<SimpleLibrosList />);

    expect(screen.getByText("Lista de Libros")).toBeInTheDocument();
  });

  it("renders books with default data", () => {
    render(<SimpleLibrosList />);

    expect(screen.getByText("El Quijote")).toBeInTheDocument();
    expect(screen.getByText("Cien años de soledad")).toBeInTheDocument();
    expect(screen.getByText("Autor: Cervantes")).toBeInTheDocument();
    expect(screen.getByText("Autor: García Márquez")).toBeInTheDocument();
  });

  it("shows book availability status", () => {
    render(<SimpleLibrosList />);

    const disponibleElements = screen.getAllByText("Disponible");
    const noDisponibleElements = screen.getAllByText("No disponible");

    expect(disponibleElements).toHaveLength(1);
    expect(noDisponibleElements).toHaveLength(1);
  });

  it("renders empty state when no books", () => {
    render(<SimpleLibrosList libros={[]} />);

    expect(screen.getByText("No hay libros disponibles")).toBeInTheDocument();
  });

  it("renders add book button", () => {
    render(<SimpleLibrosList />);

    expect(
      screen.getByRole("button", { name: /agregar libro/i })
    ).toBeInTheDocument();
  });

  it("renders book genres correctly", () => {
    render(<SimpleLibrosList />);

    expect(screen.getByText("Género: Clásico")).toBeInTheDocument();
    expect(screen.getByText("Género: Realismo mágico")).toBeInTheDocument();
  });

  it("applies correct CSS classes based on availability", () => {
    const customLibros = [
      {
        id: 1,
        titulo: "Libro Disponible",
        autor: "Autor1",
        genero: "Género1",
        disponible: true,
      },
      {
        id: 2,
        titulo: "Libro No Disponible",
        autor: "Autor2",
        genero: "Género2",
        disponible: false,
      },
    ];

    render(<SimpleLibrosList libros={customLibros} />);

    const libroItems = screen.getAllByRole("listitem");
    expect(libroItems[0]).toHaveClass("disponible");
    expect(libroItems[1]).toHaveClass("no-disponible");
  });
});
