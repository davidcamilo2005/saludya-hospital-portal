# =========================================================
# SaludYa Frontend - build multi-stage (Vite -> Nginx)
# =========================================================

# ---- Etapa 1: build de producción ----
FROM node:20-alpine AS build
WORKDIR /app

# Instalar dependencias primero (cache de capas de Docker).
COPY package*.json ./
RUN npm ci

COPY . .

# VITE_API_URL se puede sobreescribir en build-time vía --build-arg;
# por defecto asume que Nginx (mismo dominio) hace de proxy a /api.
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- Etapa 2: servir con Nginx ----
FROM nginx:1.27-alpine AS final
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=5 \
    CMD wget -q --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
