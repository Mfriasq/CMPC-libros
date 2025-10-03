import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  librosService,
  Libro,
  CreateLibroDto,
} from "../services/librosService";
import { generosService, Genero } from "../services/generosService";
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
  Paper,
  IconButton,
  Pagination,
} from "@mui/material";
import { LibroCard } from "../components";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Logout as LogoutIcon,
  Book as BookIcon,
  Clear as ClearIcon,
  People as PeopleIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";

const Libros: React.FC = () => {
  const { user, logout, canManageBooks } = useAuth();
  const navigate = useNavigate();
  const [libros, setLibros] = useState<Libro[]>([]);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [loading, setLoading] = useState(true);
  const [genreFilter, setGenreFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState("");
  const [titleFilter, setTitleFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [editorialFilter, setEditorialFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLibro, setEditingLibro] = useState<Libro | null>(null);
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [booksPerPage] = useState(12); // 12 libros por página
  const [formData, setFormData] = useState<CreateLibroDto>({
    titulo: "",
    editorial: "",
    autor: "",
    precio: 0,
    generoId: 0,
    disponibilidad: 1,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Estado para debounce
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    loadGeneros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo cargar géneros al montar el componente

  useEffect(() => {
    loadLibros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]); // Recargar libros cuando cambie la página

  // useEffect para búsqueda con debounce
  useEffect(() => {
    debouncedSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleFilter, authorFilter, editorialFilter]); // Solo cuando cambien título, autor o editorial

  // Limpiar timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const loadGeneros = async () => {
    try {
      const data = await generosService.getAllGeneros();
      setGeneros(data.filter((genero) => genero.estado.nombre === "activo"));
    } catch (error) {
      toast.error("Error al cargar los géneros");
    }
  };

  const loadLibros = useCallback(
    async (preserveScroll: boolean = false, page: number = currentPage) => {
      try {
        // Guardar posición del scroll si se solicita
        const scrollPosition = preserveScroll ? window.pageYOffset : 0;

        setLoading(true);
        const response = await librosService.getAllLibros(page, booksPerPage);
        setLibros(response.data);
        setTotalPages(response.totalPages);
        setTotalBooks(response.total);
        setCurrentPage(response.page);

        // Restaurar posición del scroll después del re-render
        if (preserveScroll && scrollPosition > 0) {
          setTimeout(() => {
            window.scrollTo(0, scrollPosition);
          }, 0);
        }
      } catch (error) {
        toast.error("Error al cargar los libros");
      } finally {
        setLoading(false);
      }
    },
    [currentPage, booksPerPage]
  );

  // Función de búsqueda con debounce
  const debouncedSearch = useCallback(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(async () => {
      // Solo realizar búsqueda si hay algún filtro de texto
      if (titleFilter || authorFilter || editorialFilter) {
        try {
          setLoading(true);
          const filters = {
            titulo: titleFilter || undefined,
            autor: authorFilter || undefined,
            editorial: editorialFilter || undefined,
            generoId:
              genreFilter && genreFilter !== ""
                ? Number(genreFilter)
                : undefined,
            estado: statusFilter || undefined,
            page: 1,
            limit: booksPerPage,
          };
          const response = await librosService.searchLibros(filters);
          setLibros(response.data);
          setTotalPages(response.totalPages);
          setTotalBooks(response.total);
          setCurrentPage(1);
        } catch (error) {
          toast.error("Error en la búsqueda");
        } finally {
          setLoading(false);
        }
      } else {
        // Si no hay filtros de texto, cargar todos los libros
        loadLibros(false, 1);
      }
    }, 500); // 500ms de delay

    setSearchTimeout(timeout);
  }, [
    titleFilter,
    authorFilter,
    editorialFilter,
    genreFilter,
    statusFilter,
    booksPerPage,
    searchTimeout,
    loadLibros,
  ]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const filters = {
        titulo: titleFilter || undefined,
        autor: authorFilter || undefined,
        editorial: editorialFilter || undefined,
        generoId:
          genreFilter && genreFilter !== "" ? Number(genreFilter) : undefined,
        estado: statusFilter || undefined,
        page: 1,
        limit: booksPerPage,
      };
      const response = await librosService.searchLibros(filters);
      setLibros(response.data);
      setTotalPages(response.totalPages);
      setTotalBooks(response.total);
      setCurrentPage(response.page);
    } catch (error) {
      toast.error("Error en la búsqueda");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setAuthorFilter("");
    setEditorialFilter("");
    setGenreFilter("");
    setStatusFilter("");
    setTitleFilter("");
    setCurrentPage(1);
    loadLibros(true, 1); // Preservar scroll
  };

  const handleExportCsv = async () => {
    try {
      const filters = {
        titulo: titleFilter || undefined,
        autor: authorFilter || undefined,
        editorial: editorialFilter || undefined,
        generoId:
          genreFilter && genreFilter !== "" ? Number(genreFilter) : undefined,
        estado: statusFilter || undefined,
      };
      await librosService.exportToCsv(filters);
      toast.success("Archivo CSV descargado exitosamente");
    } catch (error) {
      toast.error("Error al exportar libros a CSV");
    }
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
    loadLibros(false, page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    try {
      let libroId: number;

      if (editingLibro) {
        await librosService.updateLibro(editingLibro.id, formData);
        libroId = editingLibro.id;
        toast.success("Libro actualizado correctamente");
      } else {
        const newLibro = await librosService.createLibro(formData);
        libroId = newLibro.id;
        toast.success("Libro creado correctamente");
      }

      // Si hay una imagen seleccionada, subirla
      if (selectedImage && libroId) {
        try {
          await librosService.uploadImage(libroId, selectedImage);
          toast.success("Imagen subida correctamente");
        } catch (imageError) {
          toast.warn("Libro guardado, pero error al subir la imagen");
        }
      }

      loadLibros(true); // Preservar scroll
      handleCloseDialog();
    } catch (error) {
      toast.error(
        editingLibro
          ? "Error al actualizar el libro"
          : "Error al crear el libro"
      );
    }
  };

  const handleEdit = (libro: Libro) => {
    setEditingLibro(libro);
    setFormData({
      titulo: libro.titulo,
      editorial: libro.editorial,
      autor: libro.autor,
      precio: libro.precio,
      generoId: libro.generoId,
      disponibilidad: libro.disponibilidad,
    });
    // Limpiar campos de imagen al editar (se mostrará la imagen actual si existe)
    setSelectedImage(null);
    setImagePreview("");
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este libro?")) {
      try {
        await librosService.deleteLibro(id);
        toast.success("Libro eliminado correctamente");
        handleSearch(); // Preservar scroll
      } catch (error) {
        toast.error("Error al eliminar el libro");
      }
    }
  };

  const handleRestore = async (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres restaurar este libro?")) {
      try {
        await librosService.restoreLibro(id);
        toast.success("Libro restaurado correctamente");
        handleSearch(); // Preservar scroll
      } catch (error) {
        toast.error("Error al restaurar el libro");
      }
    }
  };

  // Funciones wrapper para LibroCard
  const handleEditById = (id: number) => {
    const libro = libros.find((l) => l.id === id);
    if (libro) {
      handleEdit(libro);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingLibro(null);
    setFormData({
      titulo: "",
      editorial: "",
      autor: "",
      precio: 0,
      generoId: 0,
      disponibilidad: 1,
    });
    setSelectedImage(null);
    setImagePreview("");
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor selecciona un archivo de imagen válido");
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("El archivo es demasiado grande. Máximo 5MB");
        return;
      }

      setSelectedImage(file);

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview("");
  };

  return (
    <>
      <AppBar
        position="static"
        sx={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}
      >
        <Toolbar>
          <BookIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Sistema Biblioteca - {user?.email} ({user?.role})
          </Typography>
          {user?.role === "admin" && (
            <Button
              color="inherit"
              startIcon={<PeopleIcon />}
              onClick={() => navigate("/users")}
              sx={{ mr: 2 }}
            >
              Gestionar Usuarios
            </Button>
          )}
          <Button color="inherit" onClick={logout} startIcon={<LogoutIcon />}>
            Cerrar Sesión
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Filtros de búsqueda */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Buscar Libros
          </Typography>
          <Grid container spacing={2} alignItems="end">
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                label="Buscar por título"
                value={titleFilter}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTitleFilter(e.target.value)
                }
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                label="Buscar por autor"
                value={authorFilter}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAuthorFilter(e.target.value)
                }
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                label="Buscar por editorial"
                value={editorialFilter}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditorialFilter(e.target.value)
                }
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Género</InputLabel>
                <Select
                  value={genreFilter}
                  label="Género"
                  onChange={(e: SelectChangeEvent) =>
                    setGenreFilter(e.target.value)
                  }
                >
                  <MenuItem value="">Todos</MenuItem>
                  {generos.map((genero) => (
                    <MenuItem key={genero.id} value={genero.id}>
                      {genero.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={1}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={statusFilter}
                  label="Estado"
                  onChange={(e: SelectChangeEvent) =>
                    setStatusFilter(e.target.value)
                  }
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="activo">Activo</MenuItem>
                  <MenuItem value="eliminado">Eliminado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  startIcon={<SearchIcon />}
                  size="small"
                  sx={{ minWidth: "auto" }}
                >
                  Buscar
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleExportCsv}
                  startIcon={<DownloadIcon />}
                  size="small"
                  sx={{ minWidth: "auto" }}
                >
                  CSV
                </Button>
                <IconButton
                  onClick={clearFilters}
                  size="small"
                  title="Limpiar filtros"
                >
                  <ClearIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Botón para agregar libro */}
        {canManageBooks() && (
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
              sx={{
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)",
                },
              }}
            >
              Agregar Libro
            </Button>
          </Box>
        )}

        {/* Lista de libros */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {libros.length === 0 ? (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: "center" }}>
                  <Typography variant="h6" color="text.secondary">
                    No se encontraron libros
                  </Typography>
                </Paper>
              </Grid>
            ) : (
              libros.map((libro) => (
                <Grid item xs={12} sm={6} md={4} key={libro.id}>
                  <LibroCard
                    libro={{
                      ...libro,
                      precio: libro.precio,
                      genero: libro.genero,
                      estado: libro.estado,
                    }}
                    canEdit={canManageBooks()}
                    onEdit={handleEditById}
                    onDelete={canManageBooks() ? handleDelete : undefined}
                    onRestore={canManageBooks() ? handleRestore : undefined}
                  />
                </Grid>
              ))
            )}
          </Grid>
        )}

        {/* Paginación */}
        {!loading && totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ ml: 2, alignSelf: "center" }}
            >
              Mostrando {libros.length} de {totalBooks} libros
            </Typography>
          </Box>
        )}

        {/* Dialog para agregar/editar libro */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingLibro ? "Editar Libro" : "Agregar Nuevo Libro"}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Título"
                    value={formData.titulo}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, titulo: e.target.value })
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Editorial"
                    value={formData.editorial}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, editorial: e.target.value })
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Autor"
                    value={formData.autor}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, autor: e.target.value })
                    }
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Género</InputLabel>
                    <Select
                      value={formData.generoId.toString()}
                      label="Género"
                      onChange={(e: SelectChangeEvent) =>
                        setFormData({
                          ...formData,
                          generoId: Number(e.target.value),
                        })
                      }
                    >
                      {generos.map((genero) => (
                        <MenuItem key={genero.id} value={genero.id}>
                          {genero.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Cantidad Disponible"
                    type="number"
                    value={formData.disponibilidad}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({
                        ...formData,
                        disponibilidad: parseInt(e.target.value) || 0,
                      })
                    }
                    inputProps={{ min: 0 }}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Precio (CLP)"
                    type="number"
                    value={formData.precio || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({
                        ...formData,
                        precio: parseInt(e.target.value) || 0,
                      })
                    }
                    inputProps={{
                      min: 0,
                      step: 1,
                    }}
                    InputProps={{
                      startAdornment: (
                        <span style={{ marginRight: "8px" }}>$</span>
                      ),
                    }}
                    placeholder="Ej: 15990"
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

                    {imagePreview && (
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
                          src={imagePreview}
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

                    {editingLibro &&
                      editingLibro.imagenUrl &&
                      !imagePreview && (
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
                            src={`http://localhost:3001${editingLibro.imagenUrl}`}
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
            </DialogContent>
            <DialogActions>
              <Button type="button" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={
                  !formData.titulo ||
                  !formData.autor ||
                  !formData.editorial ||
                  !formData.generoId ||
                  !formData.precio ||
                  formData.generoId === 0
                }
              >
                {editingLibro ? "Actualizar" : "Crear"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </>
  );
};

export default Libros;
