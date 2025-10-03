// Constantes para los roles de usuario en el sistema
export const USER_ROLES = {
  ADMIN: "admin",
  LIBRARIAN: "librarian",
  USER: "user",
} as const;

// Tipo TypeScript para los roles
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Array de todos los roles disponibles (útil para validaciones y selects)
export const AVAILABLE_ROLES: UserRole[] = Object.values(USER_ROLES);

// Etiquetas amigables para mostrar en la UI
export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: "Administrador",
  [USER_ROLES.LIBRARIAN]: "Bibliotecario",
  [USER_ROLES.USER]: "Usuario",
} as const;

// Función helper para verificar si un valor es un rol válido
export const isValidRole = (role: string): role is UserRole => {
  return AVAILABLE_ROLES.includes(role as UserRole);
};

// Función helper para obtener la etiqueta de un rol
export const getRoleLabel = (role: UserRole): string => {
  return ROLE_LABELS[role] || role;
};
