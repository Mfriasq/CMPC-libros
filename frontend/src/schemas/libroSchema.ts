import * as yup from "yup";

// Definir explícitamente el tipo para evitar problemas de inferencia
export interface LibroFormData {
  titulo: string;
  autor: string;
  editorial: string;
  precio: number;
  disponibilidad: number;
  generoId: number;
  imagenUrl?: string | null;
}

// Esquema de validación para el formulario de libro
export const libroSchema: yup.ObjectSchema<LibroFormData> = yup.object({
  titulo: yup
    .string()
    .required("El título es requerido")
    .min(1, "El título no puede estar vacío")
    .max(200, "El título no puede exceder 200 caracteres")
    .matches(
      /^[a-zA-Z0-9\sáéíóúñüÁÉÍÓÚÑÜ\-.,;:()"'!¿?]+$/,
      "El título contiene caracteres no permitidos"
    ),

  autor: yup
    .string()
    .required("El autor es requerido")
    .min(2, "El nombre del autor debe tener al menos 2 caracteres")
    .max(100, "El nombre del autor no puede exceder 100 caracteres")
    .matches(
      /^[a-zA-Z\sáéíóúñüÁÉÍÓÚÑÜ\-.'']+$/,
      "El nombre del autor contiene caracteres no válidos"
    ),

  editorial: yup
    .string()
    .required("La editorial es requerida")
    .min(2, "El nombre de la editorial debe tener al menos 2 caracteres")
    .max(100, "el nombre de la editorial no puede exceder 100 caracteres")
    .matches(
      /^[a-zA-Z\sáéíóúñüÁÉÍÓÚÑÜ\-.'&]+$/,
      "El nombre de la editorial contiene caracteres no válidos"
    ),

  precio: yup
    .number()
    .required("El precio es requerido")
    .positive("El precio debe ser un número positivo")
    .min(100, "El precio mínimo es $100")
    .max(1000000, "El precio máximo es $1,000,000")
    .test("decimales", "El precio debe tener máximo 2 decimales", (value) => {
      if (value === undefined) return true;
      const decimales = (value.toString().split(".")[1] || "").length;
      return decimales <= 2;
    }),

  disponibilidad: yup
    .number()
    .required("La disponibilidad es requerida")
    .integer("La disponibilidad debe ser un número entero")
    .min(0, "La disponibilidad no puede ser negativa")
    .max(10000, "La disponibilidad máxima es 10,000 ejemplares"),

  generoId: yup
    .number()
    .required("El género es requerido")
    .integer("El ID del género debe ser un número entero")
    .min(1, "Debe seleccionar un género válido")
    .notOneOf([0], "Debe seleccionar un género válido"),

  imagenUrl: yup
    .string()
    .optional()
    .nullable()
    .transform((value) => (value === "" ? undefined : value))
    .max(500, "La URL de imagen no puede exceder 500 caracteres")
    .test(
      "formato-imagen",
      "La URL de imagen debe tener una extensión válida",
      (value) => {
        if (!value || value.trim() === "") return true;
        const validExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;
        return validExtensions.test(value);
      }
    ),
});
