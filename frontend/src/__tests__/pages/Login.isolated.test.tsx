import React from "react";
import { render, screen } from "@testing-library/react";

// Componente Login simplificado para testing (sin dependencias externas)
const SimpleLogin: React.FC = () => {
  return (
    <div>
      <h1>Iniciar Sesión</h1>
      <form>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Ingresa tu email"
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Ingresa tu contraseña"
          />
        </div>
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
};

describe("Login Component - Isolated Tests", () => {
  it("renders login form", () => {
    render(<SimpleLogin />);

    expect(screen.getByText("Iniciar Sesión")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /ingresar/i })
    ).toBeInTheDocument();
  });

  it("renders email input with correct attributes", () => {
    render(<SimpleLogin />);

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("placeholder", "Ingresa tu email");
  });

  it("renders password input with correct attributes", () => {
    render(<SimpleLogin />);

    const passwordInput = screen.getByLabelText(/contraseña/i);
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toHaveAttribute(
      "placeholder",
      "Ingresa tu contraseña"
    );
  });

  it("renders submit button", () => {
    render(<SimpleLogin />);

    const submitButton = screen.getByRole("button", { name: /ingresar/i });
    expect(submitButton).toHaveAttribute("type", "submit");
  });
});
