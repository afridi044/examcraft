# ExamCraft Backend - Docker Deployment Guide

This guide provides instructions for building and deploying the ExamCraft backend using Docker in production environments.

## 🐳 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 1GB RAM available
- Port 5001 available on your host machine

## 📁 Project Structure

```
backend/
├── Dockerfile              # Production Docker configuration
├── docker-compose.yml      # Docker Compose configuration
├── .dockerignore          # Files to exclude from Docker build
├── .env                   # Environment variables (create from .env.example)
├── package.json           # Node.js dependencies
└── src/                   # Application source code
```

## 🚀 Quick Start

### 1. Environment Setup

First, create your environment file:

```bash
# Copy the example environment file
cp .env.example .env

# Edit the environment variables for production
nano .env
```

**Required Environment Variables:**
```bash
# Application Configuration
NODE_ENV=production
PORT=5001
VERSION=1.0.0

# Frontend URL for CORS
FRONTEND_URL=https://your-frontend-domain.com

# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# OpenRouter API Configuration
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Security Configuration
JWT_SECRET=your-secure-jwt-secret-key
JWT_EXPIRES_IN=24h

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

### 2. Build and Run with Docker Compose

```bash
# Build and start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### 3. Manual Docker Build

```bash
# Build the Docker image
docker build -t examcraft-backend:latest .

# Run the container
docker run -d \
  --name examcraft-backend \
  -p 5001:5001 \
  --env-file .env \
  --restart unless-stopped \
  examcraft-backend:latest
```

## 🔧 Production Deployment

### VM Deployment Steps

1. **Install Docker on your VM:**
```bash
# Update package list
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Clone and Setup:**
```bash
# Clone your repository
git clone <your-repo-url>
cd examcraft/backend

# Create environment file
cp .env.example .env
nano .env  # Edit with production values
```

3. **Deploy:**
```bash
# Build and start
docker-compose up -d

# Verify deployment
docker-compose ps
curl http://localhost:5001/api/v1/health
```

### Production Best Practices

1. **Use a Reverse Proxy (Nginx):**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

2. **SSL/HTTPS Setup:**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

3. **Environment Security:**
```bash
# Generate secure JWT secret
openssl rand -base64 32

# Use strong passwords and API keys
# Never commit .env files to version control
```

## 📊 Monitoring and Logs

### View Application Logs
```bash
# Docker Compose logs
docker-compose logs -f examcraft-backend

# Docker container logs
docker logs -f examcraft-backend

# Real-time logs with timestamps
docker-compose logs -f --timestamps examcraft-backend
```

### Health Check
```bash
# Check application health
curl http://localhost:5001/api/v1/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### Resource Monitoring
```bash
# Check container resource usage
docker stats examcraft-backend

# Check disk usage
docker system df
```

## 🔄 Updates and Maintenance

### Update Application
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Backup and Restore
```bash
# Backup environment file
cp .env .env.backup

# Backup Docker volumes (if using persistent storage)
docker run --rm -v examcraft_data:/data -v $(pwd):/backup alpine tar czf /backup/data-backup.tar.gz -C /data .
```

### Cleanup
```bash
# Remove unused Docker resources
docker system prune -a

# Remove specific images
docker rmi examcraft-backend:latest
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port Already in Use:**
```bash
# Check what's using port 5001
sudo netstat -tulpn | grep :5001

# Kill the process or change port in docker-compose.yml
```

2. **Environment Variables Not Loading:**
```bash
# Verify .env file exists and has correct format
cat .env

# Check if variables are loaded in container
docker exec examcraft-backend env | grep NODE_ENV
```

3. **Container Won't Start:**
```bash
# Check container logs
docker logs examcraft-backend

# Check container status
docker ps -a
```

4. **Memory Issues:**
```bash
# Check memory usage
docker stats examcraft-backend

# Increase memory limit in docker-compose.yml
```

### Debug Mode
```bash
# Run in debug mode
docker-compose down
docker-compose up  # Remove -d flag to see logs in terminal
```

## 📈 Performance Optimization

### Resource Limits
Add to `docker-compose.yml`:
```yaml
services:
  examcraft-backend:
    # ... existing config ...
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
```

### Multi-Instance Deployment
```yaml
services:
  examcraft-backend:
    # ... existing config ...
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
```

## 🔒 Security Considerations

1. **Never expose sensitive data in logs**
2. **Use secrets management for production**
3. **Regular security updates**
4. **Network isolation**
5. **Regular backups**

## 📞 Support

For issues or questions:
- Check the application logs
- Review this documentation
- Check the main README.md
- Open an issue in the repository

---

**Note:** This Docker setup is optimized for production use. For development, consider using the development Dockerfile or running the application directly with `npm run start:dev`. 