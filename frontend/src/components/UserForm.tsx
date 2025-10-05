import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  TextField,
  Button,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Grid,
} from '@mui/material';
import { UserRole, USER_ROLES } from '../constants/UserRoles';
import PasswordValidationHelp from './PasswordValidationHelp';

interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  age?: number;
}

interface UserFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  initialData?: {
    name: string;
    email: string;
    role: UserRole;
    age?: number;
  };
  isEditing?: boolean;
  loading?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
  loading = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
  } = useForm<UserFormData>({
    mode: 'onChange',
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      role: initialData?.role || USER_ROLES.USER,
      age: initialData?.age || undefined,
      password: '',
      confirmPassword: '',
    },
  });

  const watchPassword = watch('password');
  const watchConfirmPassword = watch('confirmPassword');
  const watchName = watch('name');
  const watchEmail = watch('email');

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      // Validación manual
      if (!isEditing) {
        // Para crear usuario
        if (!data.name.trim()) {
          return;
        }
        if (!data.email.trim()) {
          return;
        }
        if (!data.password.trim()) {
          return;
        }
        if (data.password !== data.confirmPassword) {
          return;
        }
      }

      // Limpiar datos antes del envío
      const cleanData: any = { ...data };
      
      // Eliminar campos vacios opcionales
      if (!cleanData.age) {
        delete cleanData.age;
      }
      
      // Para edición, solo incluir password si se proporcionó
      if (isEditing) {
        if (!cleanData.password || cleanData.password.trim() === '') {
          delete cleanData.password;
          delete cleanData.confirmPassword;
        }
      }
      
      await onSubmit(cleanData);
    } catch (error) {
      console.error('Error en el formulario:', error);
    }
  };

  // Determinar si el botón debe estar habilitado
  const isSubmitEnabled = () => {
    if (loading) return false;
    
    if (isEditing) {
      // Para edición, habilitar si hay cambios
      return isDirty;
    } else {
      // Para creación, verificar campos requeridos
      const hasRequiredFields = watchName.trim() && 
                               watchEmail.trim() && 
                               watchPassword.trim() && 
                               watchConfirmPassword.trim();
      const passwordsMatch = watchPassword === watchConfirmPassword;
      return hasRequiredFields && passwordsMatch;
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nombre completo"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => {
              const allowedDomains = ['biblioteca.com', 'library.org', 'edu.cl', 'gov.cl', 'gmail.com', 'outlook.com', 'hotmail.com'];
              const emailValue = field.value || '';
              const isValidDomain = emailValue && allowedDomains.some(domain => emailValue.endsWith('@' + domain));
              
              let helperText = errors.email?.message;
              if (!helperText && !isValidDomain && emailValue.includes('@')) {
                helperText = `Dominios permitidos: ${allowedDomains.join(', ')}`;
              }

              return (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  fullWidth
                  error={!!errors.email}
                  helperText={helperText}
                  disabled={loading}
                />
              );
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Box>
                <TextField
                  {...field}
                  label={isEditing ? "Nueva contraseña (opcional)" : "Contraseña"}
                  type="password"
                  fullWidth
                  error={!!errors.password}
                  helperText={errors.password?.message || (isEditing ? "Dejar vacío para mantener la contraseña actual" : "")}
                  disabled={loading}
                />
                {(!isEditing || field.value) && (
                  <Box sx={{ mt: 1 }}>
                    <PasswordValidationHelp password={field.value || ''} />
                  </Box>
                )}
              </Box>
            )}
          />
        </Grid>

        {(!isEditing || (isEditing && watchPassword)) && (
          <Grid item xs={12}>
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => {
                const passwordsMatch = watchPassword === field.value;
                const showMatchIndicator = field.value && watchPassword;
                
                let helperText = errors.confirmPassword?.message;
                if (!helperText && showMatchIndicator) {
                  helperText = passwordsMatch ? 
                    '✓ Las contraseñas coinciden' : 
                    'Las contraseñas no coinciden';
                }
                
                return (
                  <TextField
                    {...field}
                    label="Confirmar contraseña"
                    type="password"
                    fullWidth
                    error={!!errors.confirmPassword || Boolean(showMatchIndicator && !passwordsMatch)}
                    helperText={helperText}
                    disabled={loading}
                    sx={{
                      '& .MuiFormHelperText-root': {
                        color: showMatchIndicator && passwordsMatch && !errors.confirmPassword ? 'success.main' : undefined
                      }
                    }}
                  />
                );
              }}
            />
          </Grid>
        )}

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.role}>
            <InputLabel>Rol</InputLabel>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Rol"
                  disabled={loading}
                >
                  <MenuItem value={USER_ROLES.USER}>Usuario</MenuItem>
                  <MenuItem value={USER_ROLES.LIBRARIAN}>Bibliotecario</MenuItem>
                  <MenuItem value={USER_ROLES.ADMIN}>Administrador</MenuItem>
                </Select>
              )}
            />
            {errors.role && (
              <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                {errors.role.message}
              </Typography>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="age"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Edad (opcional)"
                type="number"
                fullWidth
                error={!!errors.age}
                helperText={errors.age?.message}
                disabled={loading}
                inputProps={{ min: 13, max: 120 }}
              />
            )}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="outlined"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={!isSubmitEnabled()}
          sx={{
            backgroundColor: isSubmitEnabled() ? 'primary.main' : 'grey.400',
            '&:hover': {
              backgroundColor: isSubmitEnabled() ? 'primary.dark' : 'grey.400',
            },
          }}
        >
          {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
        </Button>
      </Box>
    </Box>
  );
};

export default UserForm;