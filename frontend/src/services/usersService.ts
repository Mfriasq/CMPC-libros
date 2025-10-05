import axios from "axios";
import { UserRole } from "../constants/UserRoles";

const API_BASE_URL = "http://localhost:3001";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  estado: {
    id: number;
    nombre: string;
  };
  restoredAt?: Date;
  deletedAt?: Date;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  age?: number;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  age?: number;
}

class UsersService {
  private getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/users`,
        this.getAuthHeaders()
      );
      return response.data.data;
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      throw error;
    }
  }

  async getUserById(id: number): Promise<User> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/users/${id}`,
        this.getAuthHeaders()
      );
      return response.data.data;
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      throw error;
    }
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/users`,
        userData,
        this.getAuthHeaders()
      );
      return response.data.data;
    } catch (error: any) {
      console.error("Error al crear usuario:", error);
      // Extraer el mensaje del servidor si está disponible
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data ||
        "Error al crear usuario";
      const customError = new Error(serverMessage);
      (customError as any).response = error.response;
      throw customError;
    }
  }

  async updateUser(id: number, userData: UpdateUserDto): Promise<User> {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/users/${id}`,
        userData,
        this.getAuthHeaders()
      );
      return response.data.data;
    } catch (error: any) {
      console.error("Error al actualizar usuario:", error);
      // Extraer el mensaje del servidor si está disponible
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data ||
        "Error al actualizar usuario";
      const customError = new Error(serverMessage);
      (customError as any).response = error.response;
      throw customError;
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/users/${id}`, this.getAuthHeaders());
    } catch (error: any) {
      console.error("Error al eliminar usuario:", error);
      // Extraer el mensaje del servidor si está disponible
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data ||
        "Error al eliminar usuario";
      const customError = new Error(serverMessage);
      (customError as any).response = error.response;
      throw customError;
    }
  }

  async restoreUser(id: number): Promise<User> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/users/${id}/restore`,
        {},
        this.getAuthHeaders()
      );
      return response.data.data;
    } catch (error: any) {
      console.error("Error al restaurar usuario:", error);
      // Extraer el mensaje del servidor si está disponible
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data ||
        "Error al restaurar usuario";
      const customError = new Error(serverMessage);
      (customError as any).response = error.response;
      throw customError;
    }
  }

  async searchUsers(query: string): Promise<User[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/users/search/${encodeURIComponent(query)}`,
        this.getAuthHeaders()
      );
      return response.data.data;
    } catch (error) {
      console.error("Error en la búsqueda de usuarios:", error);
      throw error;
    }
  }
}

export const usersService = new UsersService();
