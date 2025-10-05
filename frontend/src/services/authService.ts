import axios, { AxiosResponse } from "axios";

const API_BASE_URL = "http://localhost:3001";

// Interfaces
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  data: {
    access_token: string;
    user: AuthUser;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Configuración de Axios
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token a todas las peticiones
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas de error
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await axiosInstance.post(
      "/auth/login",
      credentials
    );

    const { access_token, user } = response.data.data;

    // Guardar token y datos del usuario
    localStorage.setItem("token", access_token);
    localStorage.setItem("user", JSON.stringify(user));

    return response.data;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Error durante logout:", error);
    } finally {
      // Limpiar datos locales siempre
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  // Obtener usuario actual
  getCurrentUser(): AuthUser | null {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        return JSON.parse(userString);
      } catch (error) {
        console.error("Error al parsear usuario:", error);
        localStorage.removeItem("user");
      }
    }
    return null;
  },

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return !!(token && user);
  },

  // Obtener token
  getToken(): string | null {
    return localStorage.getItem("token");
  },

  // Verificar permisos
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  },

  // Verificar si es admin
  isAdmin(): boolean {
    return this.hasRole("admin");
  },

  // Verificar si es bibliotecario
  isLibrarian(): boolean {
    return this.hasRole("LIBRARIAN");
  },

  // Verificar si puede gestionar libros
  canManageBooks(): boolean {
    const user = this.getCurrentUser();
    return user?.role === "admin" || user?.role === "LIBRARIAN";
  },
};
