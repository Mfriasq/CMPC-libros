import axios from "axios";

// Configuración base de axios
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interfaces para TypeScript
export interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  age?: number;
}

export interface UpdateUserDto {
  name?: string;
  age?: number;
}

// Servicios de usuario
export const userService = {
  // Obtener todos los usuarios
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await apiClient.get("/users");
      return response.data;
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      throw error;
    }
  },

  // Obtener un usuario por ID
  getUserById: async (id: number): Promise<User> => {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      throw error;
    }
  },

  // Crear un nuevo usuario
  createUser: async (userData: CreateUserDto): Promise<User> => {
    try {
      const response = await apiClient.post("/users", userData);
      return response.data;
    } catch (error) {
      console.error("Error al crear usuario:", error);
      throw error;
    }
  },

  // Actualizar un usuario
  updateUser: async (id: number, userData: UpdateUserDto): Promise<User> => {
    try {
      const response = await apiClient.patch(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      throw error;
    }
  },

  // Eliminar un usuario
  deleteUser: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/users/${id}`);
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      throw error;
    }
  },

  // Verificar el estado de la API
  checkHealth: async (): Promise<any> => {
    try {
      const response = await apiClient.get("/health");
      return response.data;
    } catch (error) {
      console.error("Error al verificar estado de la API:", error);
      throw error;
    }
  },
};
