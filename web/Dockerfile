# syntax=docker/dockerfile:1.28@sha256:bb22d9815c728170f72750f4e5b0d672e06176142e1d602c7e66c050100b7e5b

# Build: DOCKER_BUILDKIT=1 docker build -t fyrss-web .
# Run:   docker run -p 4000:4000 fyrss-web

# --- Build stage ---
FROM node:24-bookworm-slim AS build
WORKDIR /app
ENV NG_CLI_ANALYTICS=false

# Only copy package manifests (Dockerignore prevents extra files here)
COPY package*.json ./

# Persistent npm cache for faster installs
RUN --mount=type=cache,target=/root/.npm \
  npm ci --ignore-scripts --prefer-offline --no-audit --no-fund

# Copy all source files now and build
COPY . .
RUN npm run build

# --- Runtime stage ---
FROM nginxinc/nginx-unprivileged:1.31-alpine AS runtime
ENV PORT=4000 \
  API_URL=/api

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/fyrss-web/browser /usr/share/nginx/html

EXPOSE 4000
