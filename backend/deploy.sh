#!/bin/bash

# ExamCraft Backend Deployment Script
# This script automates the deployment process for production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Docker installation
check_docker() {
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Function to check environment file
check_env_file() {
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_warning "Please edit .env file with your production values before continuing"
            print_warning "Run: nano .env"
            exit 1
        else
            print_error ".env.example file not found. Please create .env file manually"
            exit 1
        fi
    fi
    
    print_success ".env file found"
}

# Function to stop existing containers
stop_containers() {
    print_info "Stopping existing containers..."
    docker-compose down --remove-orphans || true
    print_success "Existing containers stopped"
}

# Function to build and start containers
build_and_start() {
    print_info "Building Docker image..."
    docker-compose build --no-cache
    
    print_info "Starting containers..."
    docker-compose up -d
    
    print_success "Containers started successfully"
}

# Function to check health
check_health() {
    print_info "Checking application health..."
    
    # Wait for application to start
    sleep 10
    
    # Try to connect to health endpoint
    for i in {1..30}; do
        if curl -f http://localhost:5001/api/v1/health >/dev/null 2>&1; then
            print_success "Application is healthy and responding"
            return 0
        fi
        print_info "Waiting for application to start... (attempt $i/30)"
        sleep 2
    done
    
    print_error "Application failed to start or health check failed"
    print_info "Checking container logs..."
    docker-compose logs --tail=50
    exit 1
}

# Function to show status
show_status() {
    print_info "Container status:"
    docker-compose ps
    
    print_info "Resource usage:"
    docker stats --no-stream || true
    
    print_info "Recent logs:"
    docker-compose logs --tail=20
}

# Function to cleanup
cleanup() {
    print_info "Cleaning up unused Docker resources..."
    docker system prune -f
    print_success "Cleanup completed"
}

# Function to show help
show_help() {
    echo "ExamCraft Backend Deployment Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  deploy      Deploy the application (default)"
    echo "  stop        Stop the application"
    echo "  restart     Restart the application"
    echo "  logs        Show application logs"
    echo "  status      Show application status"
    echo "  cleanup     Clean up unused Docker resources"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy    # Deploy the application"
    echo "  $0 stop      # Stop the application"
    echo "  $0 logs      # Show logs"
}

# Main deployment function
deploy() {
    print_info "Starting ExamCraft Backend deployment..."
    
    check_docker
    check_env_file
    stop_containers
    build_and_start
    check_health
    show_status
    
    print_success "Deployment completed successfully!"
    print_info "Application is running on http://localhost:5001"
    print_info "Health check: http://localhost:5001/api/v1/health"
}

# Main script logic
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "stop")
        print_info "Stopping application..."
        docker-compose down
        print_success "Application stopped"
        ;;
    "restart")
        print_info "Restarting application..."
        docker-compose restart
        print_success "Application restarted"
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "status")
        show_status
        ;;
    "cleanup")
        cleanup
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac 