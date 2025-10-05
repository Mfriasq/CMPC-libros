import * as Yup from 'yup';
import { UserRole, USER_ROLES } from '../constants/UserRoles';

export const userSchema = Yup.object().shape({
  name: Yup.string()
    .required('El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .matches(
      /^[a-zA-ZÀ-ÿ\u00f1\u00d1\u0100-\u017f\u1e00-\u1eff\s'.-]+$/,
      'El nombre contiene caracteres no válidos'
    ),
  
  email: Yup.string()
    .required('El email es requerido')
    .email('El email debe tener un formato válido')
    .max(100, 'El email no puede exceder 100 caracteres')
    .matches(
      /@(biblioteca\.com|library\.org|edu\.cl|gov\.cl|gmail\.com|outlook\.com|hotmail\.com)$/,
      'El email debe pertenecer a un dominio autorizado'
    ),
  
  password: Yup.string()
    .required('La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña no puede exceder 128 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{};':"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_+=[\]{};':"\\|,.<>/?]*$/,
      'La contraseña debe incluir mayúsculas, minúsculas, números y símbolos especiales. No debe contener espacios ni secuencias comunes.'
    )
    .test('no-common-sequences', 'La contraseña contiene secuencias comunes no permitidas', (value) => {
      if (!value) return true;
      const commonSequences = ['123456', 'abcdef', 'qwerty', 'password', 'admin', 'user', '111111', '000000', 'abc123', '123abc'];
      return !commonSequences.some(seq => value.toLowerCase().includes(seq));
    })
    .test('no-spaces', 'La contraseña no debe contener espacios', (value) => {
      return !value || !/\s/.test(value);
    }),
  
  confirmPassword: Yup.string()
    .required('La confirmación de contraseña es requerida')
    .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden'),
  
  role: Yup.mixed<UserRole>()
    .oneOf(Object.values(USER_ROLES), 'El rol debe ser user, admin o librarian')
    .optional()
    .default(USER_ROLES.USER),
  
  age: Yup.number()
    .optional()
    .min(13, 'La edad mínima es 13 años')
    .max(120, 'La edad máxima es 120 años')
    .integer('La edad debe ser un número entero')
});

export const updateUserSchema = Yup.object().shape({
  name: Yup.string()
    .optional()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .matches(
      /^[a-zA-ZÀ-ÿ\u00f1\u00d1\u0100-\u017f\u1e00-\u1eff\s'.-]+$/,
      'El nombre contiene caracteres no válidos'
    ),
  
  email: Yup.string()
    .optional()
    .email('El email debe tener un formato válido')
    .max(100, 'El email no puede exceder 100 caracteres')
    .matches(
      /@(biblioteca\.com|library\.org|edu\.cl|gov\.cl|gmail\.com|outlook\.com|hotmail\.com)$/,
      'El email debe pertenecer a un dominio autorizado'
    ),
  
  password: Yup.string()
    .optional()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña no puede exceder 128 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{};':"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_+=[\]{};':"\\|,.<>/?]*$/,
      'La contraseña debe incluir mayúsculas, minúsculas, números y símbolos especiales'
    )
    .test('no-common-sequences', 'La contraseña contiene secuencias comunes no permitidas', (value) => {
      if (!value) return true;
      const commonSequences = ['123456', 'abcdef', 'qwerty', 'password', 'admin', 'user', '111111', '000000', 'abc123', '123abc'];
      return !commonSequences.some(seq => value.toLowerCase().includes(seq));
    })
    .test('no-spaces', 'La contraseña no debe contener espacios', (value) => {
      return !value || !/\s/.test(value);
    }),
  
  confirmPassword: Yup.string()
    .optional()
    .when('password', {
      is: (password: string) => password && password.length > 0,
      then: (schema) => schema.required('La confirmación de contraseña es requerida')
        .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden'),
      otherwise: (schema) => schema.notRequired()
    }),
  
  role: Yup.mixed<UserRole>()
    .oneOf(Object.values(USER_ROLES), 'El rol debe ser user, admin o librarian')
    .optional(),
  
  age: Yup.number()
    .optional()
    .min(13, 'La edad mínima es 13 años')
    .max(120, 'La edad máxima es 120 años')
    .integer('La edad debe ser un número entero')
});

export type UserFormData = Yup.InferType<typeof userSchema>;
export type UpdateUserFormData = Yup.InferType<typeof updateUserSchema>;