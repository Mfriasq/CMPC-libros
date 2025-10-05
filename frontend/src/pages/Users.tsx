import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  usersService,
  User,
  CreateUserDto,
  UpdateUserDto,
} from "../services/usersService";

import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  AppBar,
  Toolbar,
  CircularProgress,
  Fab,
} from "@mui/material";
import { UserCard } from "../components/UserCard";
import {
  Add as AddIcon,
  Logout as LogoutIcon,
  People as PeopleIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import UserForm from "../components/UserForm";

const Users: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);



  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (preserveScroll: boolean = false) => {
    try {
      // Guardar posición del scroll si se solicita
      const scrollPosition = preserveScroll ? window.pageYOffset : 0;

      setLoading(true);
      const data = await usersService.getAllUsers();
      setUsers(data);

      // Restaurar posición del scroll después del re-render
      if (preserveScroll && scrollPosition > 0) {
        setTimeout(() => {
          window.scrollTo(0, scrollPosition);
        }, 0);
      }
    } catch (error) {
      toast.error("Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingUser) {
        const updateData: UpdateUserDto = {
          name: data.name,
          email: data.email,
          role: data.role,
        };
        // Solo incluir password si se proporcionó
        if (data.password && data.password.trim()) {
          updateData.password = data.password;
        }
        await usersService.updateUser(editingUser.id, updateData);
        toast.success("Usuario actualizado correctamente");
      } else {
        const createData: CreateUserDto = {
          name: data.name,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
          role: data.role,
        };
        if (data.age) {
          createData.age = data.age;
        }
        await usersService.createUser(createData);
        toast.success("Usuario creado correctamente");
      }
      loadUsers(true);
      handleCloseDialog();
    } catch (error: any) {
      console.log(error);
      // Mostrar el mensaje específico del servidor o uno genérico como fallback
      const errorMessage =
        error.message ||
        (editingUser
          ? "Error al actualizar el usuario"
          : "Error al crear el usuario");
      toast.error(errorMessage);
    }
  };

  const handleEdit = (userId: number) => {
    const userToEdit = users.find((u) => u.id === userId);
    if (userToEdit) {
      setEditingUser(userToEdit);
      setDialogOpen(true);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      try {
        await usersService.deleteUser(id);
        toast.success("Usuario eliminado correctamente");
        loadUsers(true);
      } catch (error: any) {
        const errorMessage = error.message || "Error al eliminar el usuario";
        toast.error(errorMessage);
      }
    }
  };

  const handleRestore = async (id: number) => {
    if (
      window.confirm("¿Estás seguro de que quieres restaurar este usuario?")
    ) {
      try {
        await usersService.restoreUser(id);
        toast.success("Usuario restaurado correctamente");
        loadUsers(true);
      } catch (error: any) {
        const errorMessage = error.message || "Error al restaurar el usuario";
        toast.error(errorMessage);
      }
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
  };

  // Verificar que el usuario sea administrador
  if (user?.role !== "admin") {
    return (
      <Container>
        <Typography
          variant="h4"
          color="error"
          sx={{ textAlign: "center", mt: 4 }}
        >
          Acceso Denegado
        </Typography>
        <Typography variant="body1" sx={{ textAlign: "center", mt: 2 }}>
          Solo los administradores pueden acceder a la gestión de usuarios.
        </Typography>
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/libros")}
          >
            Volver a Libros
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      {/* AppBar */}
      <AppBar position="static">
        <Toolbar>
          <PeopleIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Gestión de Usuarios - Sistema de Biblioteca
          </Typography>
          <Button
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/libros")}
            sx={{ mr: 2 }}
          >
            Libros
          </Button>
          <Button color="inherit" onClick={logout} startIcon={<LogoutIcon />}>
            Cerrar Sesión ({user?.name})
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Botón Agregar Usuario */}
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" component="h1">
            Usuarios
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Agregar Usuario
          </Button>
        </Box>

        {/* Lista de Usuarios */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {users.length > 0 ? (
              users.map((user) => (
                <Grid item xs={12} sm={6} md={4} key={user.id}>
                  <UserCard
                    user={user}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onRestore={handleRestore}
                  />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ textAlign: "center", my: 4 }}>
                  No se encontraron usuarios
                </Typography>
              </Grid>
            )}
          </Grid>
        )}
      </Container>

      {/* Dialog para Crear/Editar Usuario */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingUser ? "Editar Usuario" : "Agregar Nuevo Usuario"}
        </DialogTitle>
        <DialogContent>
          <UserForm
            onSubmit={handleSubmit}
            onCancel={handleCloseDialog}
            initialData={editingUser ? {
              name: editingUser.name,
              email: editingUser.email,
              role: editingUser.role,
            } : undefined}
            isEditing={!!editingUser}
            loading={false}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Users;
