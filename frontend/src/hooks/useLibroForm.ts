import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { libroSchema, LibroFormData } from "../schemas/libroSchema";

interface UseLibroFormProps {
  defaultValues?: Partial<LibroFormData>;
  onSubmit: (data: LibroFormData, selectedImage?: File) => Promise<void>;
}

export const useLibroForm = ({
  defaultValues,
  onSubmit,
}: UseLibroFormProps) => {
  const form = useForm<LibroFormData>({
    resolver: yupResolver(libroSchema),
    defaultValues: {
      titulo: "",
      autor: "",
      editorial: "",
      precio: 0,
      disponibilidad: 0,
      generoId: 0,
      imagenUrl: "",
      ...defaultValues,
    },
    mode: "onChange", // Validación en tiempo real
  });

  const handleSubmitWithImage = (selectedImage?: File) => {
    const submitHandler: SubmitHandler<LibroFormData> = async (data) => {
      try {
        await onSubmit(data, selectedImage);
        form.reset();
      } catch (error) {
        console.error("Error al enviar formulario:", error);
      }
    };

    return form.handleSubmit(submitHandler);
  };

  const resetForm = (values?: Partial<LibroFormData>) => {
    form.reset({
      titulo: "",
      autor: "",
      editorial: "",
      precio: 0,
      disponibilidad: 0,
      generoId: 0,
      imagenUrl: "",
      ...values,
    });
  };

  return {
    ...form,
    handleSubmitWithImage,
    resetForm,
    isValid: form.formState.isValid,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
  };
};
