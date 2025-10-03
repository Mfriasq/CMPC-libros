import React from "react";
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Chip,
  Box,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  LocalLibrary as LibrarianIcon,
} from "@mui/icons-material";
import { User } from "../services/usersService";
import { USER_ROLES, getRoleLabel } from "../constants/UserRoles";

interface UserCardProps {
  user: User;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onRestore?: (id: number) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onEdit,
  onDelete,
  onRestore,
}) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return <AdminIcon sx={{ fontSize: 16 }} />;
      case USER_ROLES.LIBRARIAN:
        return <LibrarianIcon sx={{ fontSize: 16 }} />;
      default:
        return <PersonIcon sx={{ fontSize: 16 }} />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return "error";
      case USER_ROLES.LIBRARIAN:
        return "warning";
      default:
        return "primary";
    }
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        opacity: user.estado.nombre === "activo" ? 1 : 0.6,
        border: user.estado.nombre === "activo" ? "none" : "1px dashed #ccc",
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
            {user.name}
          </Typography>
          <Chip
            icon={getRoleIcon(user.role)}
            label={getRoleLabel(user.role)}
            color={getRoleColor(user.role) as any}
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Email:</strong> {user.email}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>ID:</strong> {user.id}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          <strong>Estado:</strong>{" "}
          <Chip
            label={user.estado.nombre === "activo" ? "Activo" : "Eliminado"}
            color={user.estado.nombre === "activo" ? "success" : "default"}
            size="small"
          />
        </Typography>

        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Creado: {new Date(user.createdAt).toLocaleDateString("es-ES")}
        </Typography>

        {user.updatedAt !== user.createdAt && (
          <Typography variant="caption" display="block">
            Actualizado: {new Date(user.updatedAt).toLocaleDateString("es-ES")}
          </Typography>
        )}
      </CardContent>

      <CardActions>
        {onEdit && user.estado.nombre === "activo" && (
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => onEdit(user.id)}
          >
            Editar
          </Button>
        )}

        {onDelete && user.estado.nombre === "activo" && (
          <Button
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onDelete(user.id)}
          >
            Eliminar
          </Button>
        )}

        {onRestore && user.estado.nombre === "eliminado" && (
          <Button
            size="small"
            color="success"
            startIcon={<RestoreIcon />}
            onClick={() => onRestore(user.id)}
          >
            Restaurar
          </Button>
        )}
      </CardActions>
    </Card>
  );
};
