import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  CardMedia,
} from "@mui/material";
import {
  Book as BookIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
} from "@mui/icons-material";

interface LibroCardProps {
  libro: {
    id: number;
    titulo: string;
    autor: string;
    editorial: string;
    precio: number;
    genero?: {
      id: number;
      nombre: string;
      descripcion?: string;
    };
    estado: {
      id: number;
      nombre: string;
    };
    disponibilidad: number;
    imagenUrl?: string;
  };
  canEdit?: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onRestore?: (id: number) => void;
}

const LibroCard: React.FC<LibroCardProps> = ({
  libro,
  canEdit = false,
  onEdit,
  onDelete,
  onRestore,
}) => {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 4,
        },
      }}
    >
      {/* Imagen del libro */}
      {libro.imagenUrl ? (
        <CardMedia
          component="img"
          height="200"
          image={`http://localhost:3001${libro.imagenUrl}`}
          alt={libro.titulo}
          sx={{ objectFit: "cover" }}
        />
      ) : (
        <Box
          sx={{
            height: 200,
            backgroundColor: "#f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
          }}
        >
          <BookIcon sx={{ fontSize: 60, opacity: 0.3 }} />
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "3em",
          }}
        >
          <BookIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          {libro.titulo}
        </Typography>

        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          por {libro.autor}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Editorial: {libro.editorial}
        </Typography>

        <Typography
          variant="h6"
          color="primary"
          sx={{
            fontWeight: "bold",
            mb: 2,
            display: "flex",
            alignItems: "center",
          }}
        >
          ${libro.precio?.toLocaleString("es-CL") || "No disponible"}
        </Typography>

        <Chip
          label={libro.genero?.nombre || "Sin género"}
          variant="outlined"
          size="small"
          sx={{ mb: 1, mr: 1 }}
        />

        <Chip
          label={libro.estado.nombre}
          color={libro.estado.nombre === "activo" ? "success" : "error"}
          size="small"
          sx={{ mb: 1, mr: 1 }}
        />

        <Chip
          label={`${libro.disponibilidad} disponibles`}
          color={libro.disponibilidad > 0 ? "success" : "error"}
          variant={libro.disponibilidad > 0 ? "filled" : "outlined"}
          size="small"
          sx={{ mb: 1 }}
        />
      </CardContent>

      {canEdit && (
        <CardActions>
          {libro.estado.nombre === "activo" && (
            <>
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={() => onEdit?.(libro.id)}
              >
                Editar
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => onDelete?.(libro.id)}
              >
                Eliminar
              </Button>
            </>
          )}
          {libro.estado.nombre === "eliminado" && (
            <Button
              size="small"
              color="success"
              startIcon={<RestoreIcon />}
              onClick={() => onRestore?.(libro.id)}
            >
              Restaurar
            </Button>
          )}
        </CardActions>
      )}
    </Card>
  );
};

export default LibroCard;
