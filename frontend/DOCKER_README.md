# ExamCraft Frontend - Docker Deployment Guide

This guide provides instructions for building and deploying the ExamCraft frontend using Docker in production environments.

## 🐳 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 2GB RAM available
- Port 3000 available on your host machine

## 📁 Project Structure

```
frontend/
├── Dockerfile              # Production Docker configuration
├── docker-compose.yml      # Docker Compose configuration
├── .dockerignore          # Files to exclude from Docker build
├── deploy.sh              # Automated deployment script
├── package.json           # Node.js dependencies
├── next.config.ts         # Next.js configuration
└── src/                   # Application source code
```

## 🚀 Quick Start

### 1. Build and Run with Docker Compose

```bash
# Navigate to frontend directory
cd frontend

# Build and start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### 2. Manual Docker Build

```bash
# Build the Docker image
docker build -t examcraft-frontend:latest .

# Run the container
docker run -d \
  --name examcraft-frontend \
  -p 3000:3000 \
  --restart unless-stopped \
  examcraft-frontend:latest
```

### 3. Using Deployment Script

```bash
# Make script executable
chmod +x deploy.sh

# Deploy the application
./deploy.sh

# Check status
./deploy.sh status

# View logs
./deploy.sh logs
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
cd examcraft/frontend

# Deploy
./deploy.sh
```

3. **Verify Deployment:**
```bash
# Check container status
docker-compose ps

# Test application
curl http://localhost:3000/api/health
```

### Production Best Practices

1. **Use a Reverse Proxy (Nginx):**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
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

3. **Environment Configuration:**
```bash
# No .env files needed for frontend
# All configuration is handled through Next.js config
# Backend URL is configured in src/lib/api-client.ts
```

## 📊 Monitoring and Logs

### View Application Logs
```bash
# Docker Compose logs
docker-compose logs -f examcraft-frontend

# Docker container logs
docker logs -f examcraft-frontend

# Real-time logs with timestamps
docker-compose logs -f --timestamps examcraft-frontend
```

### Health Check
```bash
# Check application health
curl http://localhost:3000/api/health

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
docker stats examcraft-frontend

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
# Backup current image
docker save examcraft-frontend:latest > examcraft-frontend-backup.tar

# Restore from backup
docker load < examcraft-frontend-backup.tar
```

### Cleanup
```bash
# Remove unused Docker resources
docker system prune -a

# Remove specific images
docker rmi examcraft-frontend:latest
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port Already in Use:**
```bash
# Check what's using port 3000
sudo netstat -tulpn | grep :3000

# Kill the process or change port in docker-compose.yml
```

2. **Container Won't Start:**
```bash
# Check container logs
docker logs examcraft-frontend

# Check container status
docker ps -a
```

3. **Build Failures:**
```bash
# Check build logs
docker-compose build --no-cache

# Verify .dockerignore is correct
cat .dockerignore
```

4. **Memory Issues:**
```bash
# Check memory usage
docker stats examcraft-frontend

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
  examcraft-frontend:
    # ... existing config ...
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'
```

### Multi-Instance Deployment
```yaml
services:
  examcraft-frontend:
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

1. **Non-root user execution**
2. **Minimal base image (Alpine Linux)**
3. **No sensitive data in image**
4. **Regular security updates**
5. **Network isolation**

## 🌐 Full-Stack Deployment

### Combined Backend and Frontend
Create a root `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5001:5001"
    environment:
      - NODE_ENV=production
    env_file:
      - ./backend/.env
    networks:
      - examcraft-network

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - backend
    networks:
      - examcraft-network

networks:
  examcraft-network:
    driver: bridge
```

### Deploy Full Stack
```bash
# From project root
docker-compose up -d

# Check both services
docker-compose ps
```

## 📞 Support

For issues or questions:
- Check the application logs
- Review this documentation
- Check the main README.md
- Open an issue in the repository

---

**Note:** This Docker setup is optimized for production use. The frontend is configured to work with the backend API running on port 5001.
