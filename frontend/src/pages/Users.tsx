import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  usersService,
  User,
  CreateUserDto,
  UpdateUserDto,
} from "../services/usersService";
import { UserRole, USER_ROLES } from "../constants/UserRoles";
import { SelectChangeEvent } from "@mui/material";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  AppBar,
  Toolbar,
  CircularProgress,
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

const Users: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Formulario
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: USER_ROLES.USER as UserRole,
  });

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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    try {
      if (editingUser) {
        const updateData: UpdateUserDto = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };
        // Solo incluir password si se proporcionó
        if (formData.password) {
          updateData.password = formData.password;
        }
        await usersService.updateUser(editingUser.id, updateData);
        toast.success("Usuario actualizado correctamente");
      } else {
        const createData: CreateUserDto = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        };
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
      setFormData({
        name: userToEdit.name,
        email: userToEdit.email,
        password: "", // No mostrar password por seguridad
        role: userToEdit.role,
      });
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
    setFormData({
      name: "",
      email: "",
      password: "",
      role: USER_ROLES.USER,
    });
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
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  fullWidth
                  label="Nombre de usuario"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={
                    editingUser ? "Nueva Contraseña (opcional)" : "Contraseña"
                  }
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required={!editingUser}
                  helperText={
                    editingUser
                      ? "Dejar vacío para mantener la contraseña actual"
                      : ""
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Rol</InputLabel>
                  <Select
                    value={formData.role}
                    label="Rol"
                    onChange={(e: SelectChangeEvent) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as UserRole,
                      })
                    }
                  >
                    <MenuItem value={USER_ROLES.USER}>Usuario</MenuItem>
                    <MenuItem value={USER_ROLES.LIBRARIAN}>
                      Bibliotecario
                    </MenuItem>
                    <MenuItem value={USER_ROLES.ADMIN}>Administrador</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {editingUser ? "Actualizar" : "Crear"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default Users;
