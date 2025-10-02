import React, { useState, useEffect } from "react";
import "./App.css";
import { userService } from "./services/userService";

interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  createdAt: string;
  updatedAt: string;
}

interface CreateUserDto {
  name: string;
  email: string;
  age?: number;
}

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateUserDto>({
    name: "",
    email: "",
    age: undefined,
  });

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await userService.getAllUsers();
      setUsers(usersData);
    } catch (err) {
      setError("Error al cargar los usuarios");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "age" ? (value ? parseInt(value) : undefined) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await userService.createUser(formData);
      setFormData({ name: "", email: "", age: undefined });
      await loadUsers(); // Recargar la lista
    } catch (err) {
      setError("Error al crear el usuario");
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      try {
        setError(null);
        await userService.deleteUser(id);
        await loadUsers(); // Recargar la lista
      } catch (err) {
        setError("Error al eliminar el usuario");
        console.error(err);
      }
    }
  };

  return (
    <div className="App">
      <div className="header">
        <h1>🚀 NestJS + React + PostgreSQL</h1>
        <p>Aplicación Fullstack con TypeScript</p>
      </div>

      <div className="container">
        {error && <div className="error">{error}</div>}

        {/* Formulario para crear usuarios */}
        <div className="user-form">
          <h2>Crear Nuevo Usuario</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Nombre completo"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              name="age"
              placeholder="Edad (opcional)"
              value={formData.age || ""}
              onChange={handleInputChange}
              min="1"
              max="120"
            />
            <button type="submit">Crear Usuario</button>
          </form>
        </div>

        {/* Lista de usuarios */}
        <div className="user-list">
          <h2>Lista de Usuarios</h2>
          {loading ? (
            <div className="loading">Cargando usuarios...</div>
          ) : users.length === 0 ? (
            <div className="loading">No hay usuarios registrados</div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="user-item">
                <h3>{user.name}</h3>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                {user.age && (
                  <p>
                    <strong>Edad:</strong> {user.age} años
                  </p>
                )}
                <p>
                  <strong>Creado:</strong>{" "}
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(user.id)}
                >
                  Eliminar Usuario
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
