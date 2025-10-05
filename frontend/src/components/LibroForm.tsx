import React, { useState, useEffect } from "react";
import {
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  FormHelperText,
  SelectChangeEvent,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import { libroSchema, LibroFormData } from "../schemas/libroSchema";

interface LibroFormProps {
  initialData?: Partial<LibroFormData>;
  generos: Array<{ id: number; nombre: string }>;
  onSubmit: (data: LibroFormData, image?: File) => Promise<void>;
  submitLabel: string;
  imagePreview?: string;
  existingImageUrl?: string;
}

interface FormErrors {
  titulo?: string;
  autor?: string;
  editorial?: string;
  precio?: string;
  disponibilidad?: string;
  generoId?: string;
  imagenUrl?: string;
}

export const LibroForm: React.FC<LibroFormProps> = ({
  initialData,
  generos,
  onSubmit,
  submitLabel,
  imagePreview,
  existingImageUrl,
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(imagePreview || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const [formData, setFormData] = useState<LibroFormData>({
    titulo: initialData?.titulo || "",
    autor: initialData?.autor || "",
    editorial: initialData?.editorial || "",
    precio: initialData?.precio || 0,
    disponibilidad: initialData?.disponibilidad || 0,
    generoId: initialData?.generoId || 0,
    imagenUrl: initialData?.imagenUrl || "",
  });

  // Marcar campos como tocados si hay datos iniciales (modo edición) y validar inicialmente
  useEffect(() => {
    if (initialData) {
      setTouched({
        titulo: true,
        autor: true,
        editorial: true,
        precio: true,
        disponibilidad: true,
        generoId: true,
        imagenUrl: true,
      });
    }
  }, [initialData]);

  // Validar formulario completo cuando no hay datos iniciales (modo crear)
  useEffect(() => {
    if (!initialData) {
      // En modo crear, validar inmediatamente para habilitar el botón cuando sea apropiado
      const validateAllFields = async () => {
        try {
          await libroSchema.validate(formData, { abortEarly: false });
          setErrors({});
        } catch (error: any) {
          // No mostrar errores inicialmente, solo calcular estado de validez
        }
      };
      validateAllFields();
    }
  }, [formData, initialData]);

  // Validación reactiva
  useEffect(() => {
    const validateField = async (field: keyof LibroFormData, value: any) => {
      try {
        await libroSchema.validateAt(field, { [field]: value });
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      } catch (error: any) {
        if (touched[field]) {
          setErrors((prev) => ({ ...prev, [field]: error.message }));
        }
      }
    };

    // Validar cada campo que ha sido tocado
    Object.keys(touched).forEach((field) => {
      if (touched[field]) {
        validateField(
          field as keyof LibroFormData,
          formData[field as keyof LibroFormData]
        );
      }
    });
  }, [formData, touched]);

  const handleFieldChange =
    (field: keyof LibroFormData) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]:
          field === "precio" ||
          field === "disponibilidad" ||
          field === "generoId"
            ? value === ""
              ? 0
              : Number(value)
            : value,
      }));

      if (!touched[field]) {
        setTouched((prev) => ({ ...prev, [field]: true }));
      }
    };

  const handleSelectChange =
    (field: keyof LibroFormData) => (event: SelectChangeEvent) => {
      const value = event.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: Number(value),
      }));

      if (!touched[field]) {
        setTouched((prev) => ({ ...prev, [field]: true }));
      }
    };

  const handleBlur = (field: keyof LibroFormData) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreview("");
  };

  const validateForm = async (): Promise<boolean> => {
    try {
      await libroSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error: any) {
      const newErrors: FormErrors = {};
      error.inner?.forEach((err: any) => {
        newErrors[err.path as keyof FormErrors] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Marcar todos los campos como tocados para mostrar errores
    const allFields = Object.keys(formData) as (keyof LibroFormData)[];
    setTouched(
      allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    );

    try {
      const isValid = await validateForm();
      if (isValid) {
        // Limpiar imagenUrl si está vacío para evitar problemas de validación en el backend
        const cleanFormData = { ...formData };
        if (!cleanFormData.imagenUrl || cleanFormData.imagenUrl.trim() === "") {
          delete cleanFormData.imagenUrl;
        }

        await onSubmit(cleanFormData, selectedImage || undefined);
        // Reset del formulario
        setFormData({
          titulo: "",
          autor: "",
          editorial: "",
          precio: 0,
          disponibilidad: 0,
          generoId: 0,
          imagenUrl: "",
        });
        setSelectedImage(null);
        setPreview("");
        setErrors({});
        setTouched({});
      }
    } catch (error) {
      console.error("Error al enviar formulario:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validación simplificada para el botón
  const isFormValid = (() => {
    try {
      // Verificar campos obligatorios
      const hasRequiredFields =
        formData.titulo &&
        formData.titulo.trim().length >= 1 &&
        formData.autor &&
        formData.autor.trim().length >= 2 &&
        formData.editorial &&
        formData.editorial.trim().length >= 2 &&
        formData.generoId > 0 &&
        formData.precio >= 100 &&
        formData.disponibilidad >= 0;

      // Verificar que no haya errores visibles (solo en campos tocados)
      const touchedFieldsWithErrors = Object.keys(touched).filter(
        (field) => touched[field] && errors[field as keyof FormErrors]
      );

      const isValid = hasRequiredFields && touchedFieldsWithErrors.length === 0;

      return isValid;
    } catch (error) {
      console.error("Form validation error:", error);
      return false;
    }
  })();

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {/* Título */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Título"
            value={formData.titulo}
            onChange={handleFieldChange("titulo")}
            onBlur={handleBlur("titulo")}
            error={!!errors.titulo}
            helperText={errors.titulo}
            required
          />
        </Grid>

        {/* Editorial */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Editorial"
            value={formData.editorial}
            onChange={handleFieldChange("editorial")}
            onBlur={handleBlur("editorial")}
            error={!!errors.editorial}
            helperText={errors.editorial}
            required
          />
        </Grid>

        {/* Autor */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Autor"
            value={formData.autor}
            onChange={handleFieldChange("autor")}
            onBlur={handleBlur("autor")}
            error={!!errors.autor}
            helperText={errors.autor}
            required
          />
        </Grid>

        {/* Género */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required error={!!errors.generoId}>
            <InputLabel>Género</InputLabel>
            <Select
              value={formData.generoId.toString()}
              label="Género"
              onChange={handleSelectChange("generoId")}
              onBlur={handleBlur("generoId")}
            >
              <MenuItem value={0} disabled>
                Seleccionar género
              </MenuItem>
              {generos.map((genero) => (
                <MenuItem key={genero.id} value={genero.id}>
                  {genero.nombre}
                </MenuItem>
              ))}
            </Select>
            {errors.generoId && (
              <FormHelperText>{errors.generoId}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Cantidad Disponible */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Cantidad Disponible"
            type="number"
            value={formData.disponibilidad}
            onChange={handleFieldChange("disponibilidad")}
            onBlur={handleBlur("disponibilidad")}
            error={!!errors.disponibilidad}
            helperText={errors.disponibilidad}
            inputProps={{ min: 0 }}
            required
          />
        </Grid>

        {/* Precio */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Precio (CLP)"
            type="number"
            value={formData.precio || ""}
            onChange={handleFieldChange("precio")}
            onBlur={handleBlur("precio")}
            error={!!errors.precio}
            helperText={errors.precio}
            inputProps={{
              min: 0,
              step: 1,
            }}
            InputProps={{
              startAdornment: <span style={{ marginRight: "8px" }}>$</span>,
            }}
            placeholder="Ej: 15990"
            required
          />
        </Grid>

        {/* Campo de imagen */}
        <Grid item xs={12}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Imagen del Libro (Opcional)
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<AddIcon />}
              sx={{ mb: 2 }}
            >
              Seleccionar Imagen
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>

            {preview && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mt: 2,
                }}
              >
                <Box
                  component="img"
                  src={preview}
                  alt="Vista previa"
                  sx={{
                    width: 100,
                    height: 100,
                    objectFit: "cover",
                    borderRadius: 1,
                    border: "1px solid #ddd",
                  }}
                />
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<ClearIcon />}
                  onClick={removeImage}
                  size="small"
                >
                  Quitar Imagen
                </Button>
              </Box>
            )}

            {existingImageUrl && !preview && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mt: 2,
                }}
              >
                <Box
                  component="img"
                  src={`http://localhost:3001${existingImageUrl}`}
                  alt="Imagen actual"
                  sx={{
                    width: 100,
                    height: 100,
                    objectFit: "cover",
                    borderRadius: 1,
                    border: "1px solid #ddd",
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  Imagen actual
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Botón de envío */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? "Enviando..." : submitLabel}
        </Button>
      </Box>
    </form>
  );
};
