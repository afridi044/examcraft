# Multi-stage build for production
FROM node:20-slim AS build

WORKDIR /app

# Install ALL dependencies (including devDependencies for building)
COPY package*.json ./

RUN npm ci


COPY . .

# Build the application
RUN npm run build


# ENV NODE_ENV=production


# Expose the port the app runs on
EXPOSE 5001

# Health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD node -e "require('http').get('http://localhost:5001/api/v1/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application
CMD ["npm", "run", "start:prod"] 