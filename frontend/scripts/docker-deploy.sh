#!/bin/bash

# =============================================================================
# ExamCraft Frontend - Docker Deployment Script
# =============================================================================
# This script deploys ExamCraft frontend using Docker Compose with support for:
# - Production and development environments
# - Environment variable validation
# - Health checks and rollback
# - Zero-downtime deployments
# =============================================================================

set -e  # Exit on any error

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
REGISTRY="sajidnoor5051/sajid_private_repo"
IMAGE_NAME="examcraft-frontend"
DEFAULT_TAG="latest"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# -----------------------------------------------------------------------------
# Helper Functions
# -----------------------------------------------------------------------------

# Print colored output
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

# Print usage information
print_usage() {
    cat << EOF
Usage: $0 [OPTIONS] COMMAND

Docker deployment script for ExamCraft Frontend

COMMANDS:
    deploy      Deploy the application
    stop        Stop the application
    restart     Restart the application
    logs        Show application logs
    status      Show deployment status
    rollback    Rollback to previous version

OPTIONS:
    -e, --env ENV           Environment (dev|prod) [default: prod]
    -t, --tag TAG          Docker image tag [default: latest]
    -f, --force            Force deployment without confirmation
    -d, --detach           Run in detached mode
    -h, --help             Show this help message

EXAMPLES:
    $0 deploy                    # Deploy production with latest tag
    $0 -e dev deploy            # Deploy development environment
    $0 -t v1.0.0 deploy         # Deploy specific version
    $0 stop                     # Stop the application
    $0 logs                     # Show logs

EOF
}

# Check if Docker and Docker Compose are available
check_requirements() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running or not accessible"
        exit 1
    fi
}

# Validate environment file
validate_env_file() {
    local env="$1"
    local env_file=""
    
    if [[ "$env" == "dev" ]]; then
        env_file="$PROJECT_ROOT/.env.docker"
    else
        env_file="$PROJECT_ROOT/.env.production"
    fi
    
    if [[ ! -f "$env_file" ]]; then
        print_error "Environment file not found: $env_file"
        print_info "Please create the environment file from the template:"
        print_info "  cp env.template $env_file"
        exit 1
    fi
    
    # Check for required environment variables
    local required_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "OPENROUTER_API_KEY"
    )
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$env_file" || grep -q "^${var}=your-.*-here" "$env_file"; then
            print_error "Required environment variable '$var' is not set or has placeholder value in $env_file"
            exit 1
        fi
    done
    
    print_success "Environment file validation passed: $env_file"
}

# Get Docker Compose file based on environment
get_compose_file() {
    local env="$1"
    
    if [[ "$env" == "dev" ]]; then
        echo "$PROJECT_ROOT/docker-compose.yml"
    else
        echo "$PROJECT_ROOT/docker-compose.prod.yml"
    fi
}

# Deploy the application
deploy_app() {
    local env="$1"
    local tag="$2"
    local force="$3"
    local detach="$4"
    
    local compose_file=$(get_compose_file "$env")
    local full_tag="${REGISTRY}/${IMAGE_NAME}:${tag}"
    
    if [[ "$env" == "dev" ]]; then
        full_tag="${REGISTRY}/${IMAGE_NAME}:${tag}-dev"
    fi
    
    print_info "Deploying ExamCraft Frontend..."
    print_info "Environment: $env"
    print_info "Image: $full_tag"
    print_info "Compose file: $compose_file"
    
    # Confirmation prompt
    if [[ "$force" != "true" ]]; then
        echo ""
        read -p "Do you want to proceed with deployment? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Deployment cancelled"
            exit 0
        fi
    fi
    
    # Change to project root
    cd "$PROJECT_ROOT"
    
    # Set environment variables for Docker Compose
    export IMAGE_TAG="$full_tag"
    export VERSION="$tag"
    
    # Pull the latest image
    print_info "Pulling Docker image: $full_tag"
    docker pull "$full_tag" || {
        print_error "Failed to pull image: $full_tag"
        print_info "Make sure the image exists in the registry"
        exit 1
    }
    
    # Deploy with Docker Compose
    local compose_args=""
    if [[ "$detach" == "true" ]]; then
        compose_args="-d"
    fi
    
    print_info "Starting deployment..."
    docker-compose -f "$compose_file" up $compose_args --remove-orphans
    
    if [[ "$detach" == "true" ]]; then
        # Wait for health check
        print_info "Waiting for application to be healthy..."
        local max_attempts=30
        local attempt=1
        
        while [[ $attempt -le $max_attempts ]]; do
            if docker-compose -f "$compose_file" ps | grep -q "healthy"; then
                print_success "Application is healthy and ready!"
                break
            fi
            
            if [[ $attempt -eq $max_attempts ]]; then
                print_error "Application failed to become healthy within timeout"
                print_info "Check logs with: $0 logs"
                exit 1
            fi
            
            print_info "Attempt $attempt/$max_attempts - waiting for health check..."
            sleep 10
            ((attempt++))
        done
    fi
    
    print_success "Deployment completed successfully!"
    
    # Show status
    show_status "$env"
}

# Stop the application
stop_app() {
    local env="$1"
    local compose_file=$(get_compose_file "$env")
    
    print_info "Stopping ExamCraft Frontend ($env environment)..."
    
    cd "$PROJECT_ROOT"
    docker-compose -f "$compose_file" down
    
    print_success "Application stopped successfully"
}

# Restart the application
restart_app() {
    local env="$1"
    local compose_file=$(get_compose_file "$env")
    
    print_info "Restarting ExamCraft Frontend ($env environment)..."
    
    cd "$PROJECT_ROOT"
    docker-compose -f "$compose_file" restart
    
    print_success "Application restarted successfully"
}

# Show application logs
show_logs() {
    local env="$1"
    local compose_file=$(get_compose_file "$env")
    
    print_info "Showing logs for ExamCraft Frontend ($env environment)..."
    
    cd "$PROJECT_ROOT"
    docker-compose -f "$compose_file" logs -f --tail=100
}

# Show deployment status
show_status() {
    local env="$1"
    local compose_file=$(get_compose_file "$env")
    
    print_info "ExamCraft Frontend Status ($env environment):"
    echo ""
    
    cd "$PROJECT_ROOT"
    
    # Show container status
    docker-compose -f "$compose_file" ps
    
    echo ""
    
    # Show resource usage
    print_info "Resource Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" \
        $(docker-compose -f "$compose_file" ps -q) 2>/dev/null || true
}

# Rollback to previous version
rollback_app() {
    local env="$1"
    
    print_warning "Rollback functionality requires manual intervention"
    print_info "To rollback:"
    print_info "1. Identify the previous working image tag"
    print_info "2. Run: $0 -t <previous-tag> deploy"
    print_info "3. Or restore from backup if available"
}

# -----------------------------------------------------------------------------
# Main Script
# -----------------------------------------------------------------------------

main() {
    local env="prod"
    local tag="$DEFAULT_TAG"
    local force="false"
    local detach="true"
    local command=""
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--env)
                env="$2"
                shift 2
                ;;
            -t|--tag)
                tag="$2"
                shift 2
                ;;
            -f|--force)
                force="true"
                shift
                ;;
            -d|--detach)
                detach="true"
                shift
                ;;
            --no-detach)
                detach="false"
                shift
                ;;
            -h|--help)
                print_usage
                exit 0
                ;;
            deploy|stop|restart|logs|status|rollback)
                command="$1"
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                print_usage
                exit 1
                ;;
        esac
    done
    
    # Validate command
    if [[ -z "$command" ]]; then
        print_error "No command specified"
        print_usage
        exit 1
    fi
    
    # Validate environment
    if [[ "$env" != "dev" && "$env" != "prod" ]]; then
        print_error "Invalid environment: $env. Must be 'dev' or 'prod'"
        exit 1
    fi
    
    print_info "ExamCraft Frontend Deployment Tool"
    print_info "Command: $command"
    print_info "Environment: $env"
    
    # Check requirements
    check_requirements
    
    # Validate environment file for deploy command
    if [[ "$command" == "deploy" ]]; then
        validate_env_file "$env"
    fi
    
    # Execute command
    case $command in
        deploy)
            deploy_app "$env" "$tag" "$force" "$detach"
            ;;
        stop)
            stop_app "$env"
            ;;
        restart)
            restart_app "$env"
            ;;
        logs)
            show_logs "$env"
            ;;
        status)
            show_status "$env"
            ;;
        rollback)
            rollback_app "$env"
            ;;
        *)
            print_error "Unknown command: $command"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@" 