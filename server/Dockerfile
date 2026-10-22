# syntax=docker/dockerfile:1.28@sha256:bb22d9815c728170f72750f4e5b0d672e06176142e1d602c7e66c050100b7e5b

# Build: DOCKER_BUILDKIT=1 docker build -t fyrss-server .

## Build stage
FROM golang:1.27 AS builder

WORKDIR /src

# Pre-cache dependencies
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download && go mod verify

# Copy the rest of the source
COPY . .

# Build a static binary for Linux, strip symbols for smaller size
ARG TARGETOS=linux
ARG TARGETARCH
ENV CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH}
RUN --mount=type=cache,target=/root/.cache/go-build \
    go build -trimpath -ldflags "-s -w" -o /out/fyrss-server ./cmd/fyrss-server

## Runtime stage (distroless, non-root, includes CA certs)
FROM gcr.io/distroless/base-debian12:nonroot AS runtime

WORKDIR /app

# Copy binary and required assets (migrations for runtime db upgrades)
COPY --from=builder /out/fyrss-server /app/fyrss-server
COPY db/migrations /app/db/migrations

# Default env and port
ENV PORT=8080
EXPOSE 8080

# Run as non-root user provided by base image
ENTRYPOINT ["/app/fyrss-server"]
