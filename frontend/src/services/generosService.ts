import axios from "axios";

const API_BASE_URL = "http://localhost:3001";

// Interface para Genero
export interface Genero {
  id: number;
  nombre: string;
  descripcion?: string;
  createdAt: Date;
  updatedAt: Date;
  estado: {
    id: number;
    nombre: string;
  };
}

export interface CreateGeneroDto {
  nombre: string;
  descripcion?: string;
}

export interface UpdateGeneroDto {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

class GenerosService {
  private getAuthHeader() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getAllGeneros(): Promise<Genero[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/generos`, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching generos:", error);
      throw error;
    }
  }

  async getGeneroById(id: number): Promise<Genero> {
    try {
      const response = await axios.get(`${API_BASE_URL}/generos/${id}`, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching genero:", error);
      throw error;
    }
  }

  async createGenero(generoData: CreateGeneroDto): Promise<Genero> {
    try {
      const response = await axios.post(`${API_BASE_URL}/generos`, generoData, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error("Error creating genero:", error);
      throw error;
    }
  }

  async updateGenero(id: number, generoData: UpdateGeneroDto): Promise<Genero> {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/generos/${id}`,
        generoData,
        {
          headers: this.getAuthHeader(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating genero:", error);
      throw error;
    }
  }

  async deleteGenero(id: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/generos/${id}`, {
        headers: this.getAuthHeader(),
      });
    } catch (error) {
      console.error("Error deleting genero:", error);
      throw error;
    }
  }
}

export const generosService = new GenerosService();
