# PixelBridge Backend - Production Image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies for better-sqlite3 native bindings
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --production && npm cache clean --force

# Copy application code
COPY . .

# Create storage directories
RUN mkdir -p /app/storage/roms \
             /app/storage/covers \
             /app/storage/metadata \
             /app/storage/saves \
             /app/storage/temp \
             /app/database

# Set permissions
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "server.js"]
