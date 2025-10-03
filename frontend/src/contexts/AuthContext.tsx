import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService, AuthUser } from "../services/authService";
import { USER_ROLES } from "../constants/UserRoles";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, userData: AuthUser) => void;
  logout: () => void;
  canManageBooks: () => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error);
        // Limpiar datos si hay error
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (token: string, userData: AuthUser): void => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = (): void => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const canManageBooks = (): boolean => {
    return (
      user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.LIBRARIAN
    );
  };

  const isAdmin = (): boolean => {
    return user?.role === USER_ROLES.ADMIN;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    canManageBooks,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
