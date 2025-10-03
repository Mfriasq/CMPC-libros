import { Injectable, BadRequestException } from "@nestjs/common";
import {
  MulterOptionsFactory,
  MulterModuleOptions,
} from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  createMulterOptions(): MulterModuleOptions {
    return {
      storage: diskStorage({
        destination: "./uploads/libros",
        filename: (req, file, callback) => {
          // Generar nombre único: libro-{timestamp}-{random}.{extension}
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `libro-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Solo permitir imágenes
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(
            new BadRequestException(
              "Solo se permiten archivos de imagen (jpg, jpeg, png, gif, webp)"
            ),
            false
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
      },
    };
  }
}
