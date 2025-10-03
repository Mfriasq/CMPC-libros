import axios, { AxiosResponse } from "axios";
import { Genero } from "./generosService";

const API_BASE_URL = "http://localhost:3001";

// Interfaces
export interface Libro {
  id: number;
  titulo: string;
  autor: string;
  editorial: string;
  precio: number;
  estado: {
    id: number;
    nombre: string;
  };
  fechaEliminacion: Date;
  fechaRestauracion: Date;
  disponibilidad: number;
  createdAt: Date;
  updatedAt: Date;
  generoId: number;
  genero?: Genero; // Relación con el modelo de género
  imagenUrl?: string; // URL de la imagen del libro
}

export interface CreateLibroDto {
  titulo: string;
  autor: string;
  editorial: string;
  precio: number;
  generoId: number;
  disponibilidad: number;
}

export interface UpdateLibroDto {
  titulo?: string;
  autor?: string;
  precio?: number;
  generoId?: number;
  disponibilidad?: number;
}

export interface SearchFilters {
  search?: string;
  titulo?: string;
  autor?: string;
  generoId?: number;
  disponibilidad?: number;
  estado?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LibrosSearchParams {
  titulo?: string;
  autor?: string;
  editorial?: string;
  generoId?: number;
  estado?: string;
  page?: number;
  limit?: number;
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

export const librosService = {
  // Obtener todos los libros con paginación
  async getAllLibros(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Libro>> {
    const response: AxiosResponse<PaginatedResponse<Libro>> =
      await axiosInstance.get(`/libros?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Obtener todos los libros sin paginación (para compatibilidad)
  async getAllLibrosSinPaginacion(): Promise<Libro[]> {
    const response: AxiosResponse<PaginatedResponse<Libro>> =
      await axiosInstance.get("/libros?page=1&limit=1000");
    return response.data.data;
  },

  // Buscar libros con filtros y paginación
  async searchLibros(
    filters: LibrosSearchParams = {}
  ): Promise<PaginatedResponse<Libro>> {
    const params = new URLSearchParams();

    if (filters.titulo) params.append("titulo", filters.titulo);
    if (filters.autor) params.append("autor", filters.autor);
    if (filters.editorial) params.append("editorial", filters.editorial);
    if (filters.generoId)
      params.append("generoId", filters.generoId.toString());
    if (filters.estado) params.append("estado", filters.estado);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const response: AxiosResponse<PaginatedResponse<Libro>> =
      await axiosInstance.get(`/libros/search?${params.toString()}`);
    return response.data;
  },

  // Obtener libro por ID
  async getLibroById(id: number): Promise<Libro> {
    const response: AxiosResponse<Libro> = await axiosInstance.get(
      `/libros/${id}`
    );
    return response.data;
  },

  // Crear nuevo libro
  async createLibro(libro: CreateLibroDto): Promise<Libro> {
    const response: AxiosResponse<Libro> = await axiosInstance.post(
      "/libros",
      libro
    );
    return response.data;
  },

  // Actualizar libro
  async updateLibro(id: number, libro: UpdateLibroDto): Promise<Libro> {
    const response: AxiosResponse<Libro> = await axiosInstance.patch(
      `/libros/${id}`,
      libro
    );
    return response.data;
  },

  // Eliminar libro (soft delete)
  async deleteLibro(id: number): Promise<void> {
    await axiosInstance.delete(`/libros/${id}`);
  },

  // Restaurar libro eliminado
  async restoreLibro(id: number): Promise<Libro> {
    const response: AxiosResponse<Libro> = await axiosInstance.patch(
      `/libros/restore/${id}`
    );
    return response.data;
  },

  // Subir imagen para un libro
  async uploadImage(
    id: number,
    imageFile: File
  ): Promise<{ message: string; imagenUrl: string }> {
    const formData = new FormData();
    formData.append("imagen", imageFile);

    const response: AxiosResponse<{ message: string; imagenUrl: string }> =
      await axiosInstance.post(`/libros/${id}/imagen`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    return response.data;
  },

  // Exportar libros a CSV
  async exportToCsv(filters: LibrosSearchParams): Promise<void> {
    // Construir parámetros de consulta
    const params = new URLSearchParams();
    if (filters.titulo) params.append("titulo", filters.titulo);
    if (filters.autor) params.append("autor", filters.autor);
    if (filters.editorial) params.append("editorial", filters.editorial);
    if (filters.generoId)
      params.append("generoId", filters.generoId.toString());
    if (filters.estado) params.append("estado", filters.estado);

    const response = await axiosInstance.get(
      `/libros/export/csv?${params.toString()}`,
      {
        responseType: "blob",
        headers: {
          Accept: "text/csv",
        },
      }
    );

    // Crear blob y descargar archivo
    const blob = new Blob([response.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    // Generar nombre de archivo con fecha
    const date = new Date().toISOString().split("T")[0];
    link.download = `libros_${date}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
