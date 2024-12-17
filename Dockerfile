# Backend Dockerfile for Development
FROM node:22.11.0-alpine

# Add labels for image identification
LABEL name="srms-products-ms"
LABEL version="dev"
LABEL description="Products Microservice development image"
LABEL maintainer="AymanNagy.Ahmed@gmail.com"

# Install npm
RUN npm install -g npm@10.9.0

# Set working directory
WORKDIR /var/www/products-ms

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    wget \
    build-base \
    g++ \
    libstdc++ \
    python3 \
    openssl

# Create node user and set permissions
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install dependencies first
COPY package*.json ./
RUN npm ci

# Copy the rest of the code
COPY . .

# Set proper permissions
RUN chown -R appuser:appgroup /var/www/products-ms

# Switch to non-root user
USER appuser

# Expose development port
EXPOSE 4003

# Set environment to development
ENV NODE_ENV=development

# Development command with hot reload
CMD ["npm", "run", "start:dev"]