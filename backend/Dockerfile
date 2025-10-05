# Usar imagen de Node.js con Alpine para menor tamaño
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo dev para el build)
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar la aplicación
RUN npm run build

# Limpiar node_modules y reinstalar solo dependencias de producción
RUN rm -rf node_modules && npm ci --only=production && npm cache clean --force

# Crear usuario no privilegiado
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Crear directorios necesarios con permisos correctos
RUN mkdir -p /app/logs /app/uploads
RUN chmod 755 /app/logs /app/uploads

# Cambiar propietario de archivos
RUN chown -R nestjs:nodejs /app

# Cambiar a usuario no privilegiado
USER nestjs

# Exponer puerto
EXPOSE 3001

# Comando de inicio
# Comando para ejecutar la aplicación
CMD ["node", "dist/src/main"]