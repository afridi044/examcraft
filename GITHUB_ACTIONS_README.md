# GitHub Actions CI/CD Setup for ExamCraft

This guide explains how to set up automated deployment using GitHub Actions for your ExamCraft project.

## 🚀 Overview

The GitHub Actions workflow will automatically deploy your application to production when you push to the `master` branch.

## 📋 Prerequisites

1. **VM with Ubuntu/Debian**
2. **GitHub repository with your code**
3. **SSH access to your VM**

## 🔧 VM Setup

### 1. Run the VM Setup Script

```bash
# On your VM, run:
chmod +x vm-setup.sh
./vm-setup.sh
```

### 2. Manual VM Setup (if script fails)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
sudo mkdir -p /opt/examcraft
sudo chown $USER:$USER /opt/examcraft

# Clone repository
cd /opt/examcraft
git clone https://github.com/afridi044/examcraft.git .

# Generate SSH key
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
```

## 🔐 GitHub Secrets Setup

Add these secrets to your GitHub repository:

### 1. Go to GitHub Repository Settings
- Navigate to your repository
- Go to `Settings` → `Secrets and variables` → `Actions`

### 2. Add the Following Secrets

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `PRODUCTION_HOST` | Your VM IP address | The IP address of your production VM |
| `PRODUCTION_USER` | Your VM username | The username to SSH into your VM |
| `PRODUCTION_SSH_KEY` | Your private SSH key | The private SSH key for VM access |

### 3. Get Your VM Information

```bash
# Get your VM IP
curl -s ifconfig.me

# Get your SSH public key
cat ~/.ssh/id_rsa.pub

# Your username
echo $USER
```

## 📁 Repository Structure

```
examcraft/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
├── backend/
│   ├── Dockerfile              # Backend container
│   ├── docker-compose.yml      # Backend orchestration
│   └── .env                    # Backend environment variables
├── frontend/
│   ├── Dockerfile              # Frontend container
│   ├── docker-compose.yml      # Frontend orchestration
│   └── ...                     # Frontend files
└── vm-setup.sh                 # VM setup script
```

## 🔄 Deployment Process

### Automatic Deployment
1. **Push to master branch**
2. **GitHub Actions triggers**
3. **SSH to production VM**
4. **Pull latest code**
5. **Build Docker images**
6. **Deploy applications**
7. **Health checks**

### Manual Deployment
1. Go to GitHub repository
2. Click `Actions` tab
3. Select `Deploy to Production`
4. Click `Run workflow`

## 📊 Deployment Steps

### Backend Deployment
```bash
cd /opt/examcraft/backend
git fetch origin
git reset --hard origin/master
cp .env.example .env
docker-compose down --volumes --remove-orphans
docker system prune -f
docker-compose build --no-cache --force-rm
docker-compose up -d
```

### Frontend Deployment
```bash
cd /opt/examcraft/frontend
git fetch origin
git reset --hard origin/master
docker-compose down --volumes --remove-orphans
docker system prune -f
docker-compose build --no-cache --force-rm
docker-compose up -d
```

## 🌐 Access Your Application

After deployment, your application will be available at:

- **Frontend**: `http://YOUR_VM_IP:3000`
- **Backend**: `http://YOUR_VM_IP:5001`
- **Health Check Frontend**: `http://YOUR_VM_IP:3000/api/health`
- **Health Check Backend**: `http://YOUR_VM_IP:5001/api/v1/health`

## 🔍 Monitoring

### Check Deployment Status
```bash
# Check GitHub Actions
# Go to: https://github.com/afridi044/examcraft/actions

# Check containers on VM
docker ps

# Check logs
docker-compose logs -f
```

### Health Checks
```bash
# Backend health
curl http://localhost:5001/api/v1/health

# Frontend health
curl http://localhost:3000/api/health
```

## 🛠️ Troubleshooting

### Common Issues

1. **SSH Connection Failed**
   - Verify SSH key is added to GitHub Secrets
   - Check VM IP address
   - Ensure SSH service is running

2. **Docker Build Failed**
   - Check Docker installation
   - Verify Docker Compose is installed
   - Check disk space

3. **Application Not Starting**
   - Check environment variables
   - Verify ports are not in use
   - Check Docker logs

### Debug Commands
```bash
# Check SSH connection
ssh user@your-vm-ip

# Check Docker status
docker ps
docker system df

# Check application logs
docker-compose logs -f

# Check disk space
df -h

# Check memory usage
free -h
```

## 🔒 Security Considerations

1. **Firewall Setup**
   - Only open necessary ports
   - Use UFW or iptables

2. **SSH Security**
   - Use key-based authentication
   - Disable password authentication
   - Change default SSH port

3. **Environment Variables**
   - Never commit .env files
   - Use GitHub Secrets for sensitive data

## 📞 Support

For issues:
1. Check GitHub Actions logs
2. Check VM logs
3. Verify all secrets are set correctly
4. Ensure VM has sufficient resources

---

**Note**: This setup is for production deployment. For development, use local Docker setup.
