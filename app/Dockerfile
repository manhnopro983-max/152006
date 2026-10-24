FROM node:20-alpine

# Non-root user for security (hardening)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source
COPY src/ ./src/

# Switch to non-root user
USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "src/index.js"]
