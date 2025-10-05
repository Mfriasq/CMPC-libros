# Validaciones Reactivas en Formularios

## Implementación de react-hook-form + Yup para el formulario de libros

### Características implementadas:

#### 1. **Esquema de Validación Yup (libroSchema.ts)**

- ✅ **Título**: Obligatorio, 1-200 caracteres, caracteres seguros
- ✅ **Autor**: Obligatorio, 2-100 caracteres, solo letras y caracteres especiales válidos
- ✅ **Editorial**: Obligatorio, 2-100 caracteres, caracteres comerciales permitidos
- ✅ **Precio**: Obligatorio, rango $100-$1,000,000, máximo 2 decimales
- ✅ **Disponibilidad**: Obligatorio, entero 0-10,000
- ✅ **Género**: Obligatorio, ID válido > 0
- ✅ **Imagen**: Opcional, URL válida con extensiones permitidas

#### 2. **Componente LibroForm.tsx**

- ✅ **Validación en tiempo real**: Los errores aparecen mientras escribes
- ✅ **Validación onBlur**: Se activa al salir del campo
- ✅ **Estado de touched**: Solo muestra errores después de interacción
- ✅ **Botón deshabilitado**: Se habilita solo cuando el formulario es válido
- ✅ **Reset automático**: Limpia el formulario después del envío exitoso

#### 3. **Sincronización Backend-Frontend**

Las validaciones del frontend coinciden exactamente con las del backend:

**Backend (DTO):**

```typescript
@MinLength(2, { message: "El nombre del autor debe tener al menos 2 caracteres" })
@MaxLength(100, { message: "El nombre del autor no puede exceder 100 caracteres" })
@IsSafeName({ message: "El nombre del autor contiene caracteres no válidos" })
autor: string;
```

**Frontend (Yup):**

```typescript
autor: yup
  .string()
  .required("El autor es requerido")
  .min(2, "El nombre del autor debe tener al menos 2 caracteres")
  .max(100, "El nombre del autor no puede exceder 100 caracteres")
  .matches(
    /^[a-zA-Z\sáéíóúñüÁÉÍÓÚÑÜ\-.'']+$/,
    "El nombre del autor contiene caracteres no válidos"
  );
```

### 4. **Mejoras en UX**

#### Validación Visual:

- 🔴 **Campos con error**: Borde rojo + mensaje de error
- 🟢 **Campos válidos**: Sin borde de error
- ⚫ **Campos no tocados**: Estado neutral

#### Feedback Inmediato:

- **Tiempo real**: Validación mientras escribes
- **Mensajes claros**: Errores específicos y comprensibles
- **Estado del botón**: Habilitado solo con formulario válido

#### Manejo de Imágenes:

- **Vista previa**: Muestra la imagen seleccionada
- **Validación de formato**: Solo imágenes válidas
- **Imagen existente**: Muestra la imagen actual al editar

### 5. **Integración con el Sistema Existente**

#### Libros.tsx:

```typescript
// Nuevo manejo del submit
const handleFormSubmit = async (data: LibroFormData, image?: File) => {
  // Lógica de envío con validaciones ya aplicadas
};

// Uso del componente
<LibroForm
  initialData={editingLibro ? {...} : undefined}
  generos={generos}
  onSubmit={handleFormSubmit}
  submitLabel={editingLibro ? "Actualizar" : "Crear"}
  existingImageUrl={editingLibro?.imagenUrl}
/>
```

### 6. **Ventajas Implementadas**

#### Para Usuarios:

- ✅ **Feedback inmediato**: Saben qué corregir sin enviar
- ✅ **Mensajes claros**: Errores específicos y útiles
- ✅ **Prevención de errores**: No pueden enviar datos inválidos
- ✅ **Experiencia fluida**: Validación sin interrupciones

#### Para Desarrolladores:

- ✅ **Código limpio**: Separación de validaciones y lógica
- ✅ **Reutilizable**: Esquemas Yup reutilizables
- ✅ **Mantenible**: Fácil modificar validaciones
- ✅ **Consistente**: Mismas reglas en frontend y backend

### 7. **Estructura de Archivos**

```
frontend/src/
├── schemas/
│   └── libroSchema.ts          # Esquemas de validación Yup
├── components/
│   └── LibroForm.tsx           # Formulario con validaciones reactivas
└── pages/
    └── Libros.tsx              # Página principal (actualizada)
```

### 8. **Dependencias Agregadas**

```json
{
  "react-hook-form": "^7.64.0",
  "@hookform/resolvers": "^5.2.2",
  "yup": "^1.7.1"
}
```

### 9. **Próximas Mejoras Posibles**

- [ ] **Validación asíncrona**: Verificar títulos duplicados en tiempo real
- [ ] **Validación condicional**: Reglas que dependan de otros campos
- [ ] **Auto-guardado**: Guardar borradores automáticamente
- [ ] **Validación de imágenes**: Verificar dimensiones y formato en tiempo real
- [ ] **Formularios anidados**: Para libros con múltiples autores

### 10. **Ejemplo de Uso**

Al escribir en el campo "Título":

1. **Usuario escribe**: "A" → ✅ Sin error (aún no perdió foco)
2. **Usuario hace blur**: → ✅ Sin error (mínimo 1 carácter)
3. **Usuario borra todo**: → 🔴 "El título es requerido"
4. **Usuario escribe "Este título tiene más de doscientos caracteres..."**: → 🔴 "El título no puede exceder 200 caracteres"
5. **Usuario corrige**: "Título válido" → ✅ Campo válido

El botón "Crear/Actualizar" se habilita automáticamente cuando todos los campos son válidos.
