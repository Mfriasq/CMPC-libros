// src/__tests__/components/LibroForm.basic.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { LibroForm } from "../../components/LibroForm";

// Mock react-toastify
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

// NOTA: Los warnings de React act() son esperados en este test debido a las
// validaciones asíncronas del formulario. Los tests siguen funcionando correctamente.

describe("LibroForm Component - Basic Tests", () => {
  const mockOnSubmit = jest.fn();
  const mockGeneros = [
    { id: 1, nombre: "Ficción" },
    { id: 2, nombre: "No Ficción" },
    { id: 3, nombre: "Ciencia" },
  ];

  const defaultProps = {
    generos: mockGeneros,
    onSubmit: mockOnSubmit,
    submitLabel: "Crear Libro",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderLibroForm = (props = {}) => {
    return render(<LibroForm {...defaultProps} {...props} />);
  };

  it("renders without crashing", () => {
    renderLibroForm();
    // If we get here without throwing, the test passes
    expect(true).toBe(true);
  });

  it("renders basic form elements", () => {
    renderLibroForm();

    // Check for basic text presence instead of specific elements
    expect(screen.getByText("Crear Libro")).toBeInTheDocument();
  });

  it("renders form fields", () => {
    renderLibroForm();

    // Check for input elements by role
    const titleInput = screen.getByLabelText(/título/i);
    const authorInput = screen.getByLabelText(/autor/i);
    const publisherInput = screen.getByLabelText(/editorial/i);

    expect(titleInput).toBeInTheDocument();
    expect(authorInput).toBeInTheDocument();
    expect(publisherInput).toBeInTheDocument();
  });

  it("renders submit button", () => {
    renderLibroForm();

    const submitButton = screen.getByRole("button", { name: /crear libro/i });
    expect(submitButton).toBeInTheDocument();
  });

  it("renders image section", () => {
    renderLibroForm();

    // Check for image section text
    const imageText = screen.getByText(/imagen del libro/i);
    expect(imageText).toBeInTheDocument();
  });

  it("shows initial data when provided", () => {
    const initialData = {
      titulo: "Libro de Prueba",
      autor: "Autor de Prueba",
      editorial: "Editorial de Prueba",
      precio: 19.99,
      disponibilidad: 5,
      generoId: 1,
    };

    renderLibroForm({ initialData });

    // Check that the values are displayed
    expect(screen.getByDisplayValue("Libro de Prueba")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Autor de Prueba")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Editorial de Prueba")).toBeInTheDocument();
  });

  it("changes submit label based on props", () => {
    renderLibroForm({ submitLabel: "Actualizar Libro" });

    expect(
      screen.getByRole("button", { name: /actualizar libro/i })
    ).toBeInTheDocument();
  });
});
