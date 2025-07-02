#!/bin/bash

# =============================================================================
# ExamCraft Frontend - Docker Build Script
# =============================================================================
# This script builds Docker images for ExamCraft frontend with support for:
# - Production and development builds
# - Multi-architecture builds
# - Private registry deployment
# - Build caching and optimization
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
Usage: $0 [OPTIONS]

Docker build script for ExamCraft Frontend

OPTIONS:
    -e, --env ENV           Environment (dev|prod) [default: prod]
    -t, --tag TAG          Docker image tag [default: latest]
    -p, --push             Push image to registry after build
    -m, --multi-arch       Build for multiple architectures
    -c, --cache            Use build cache
    -h, --help             Show this help message

EXAMPLES:
    $0                          # Build production image with latest tag
    $0 -e dev                   # Build development image
    $0 -t v1.0.0 -p            # Build and push with tag v1.0.0
    $0 -e prod -m -p           # Build multi-arch production image and push

EOF
}

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running or not accessible"
        exit 1
    fi
}

# Check if buildx is available for multi-arch builds
check_buildx() {
    if ! docker buildx version >/dev/null 2>&1; then
        print_error "Docker buildx is not available for multi-architecture builds"
        exit 1
    fi
}

# Login to Docker registry
docker_login() {
    print_info "Logging in to Docker registry..."
    if ! docker login; then
        print_error "Failed to login to Docker registry"
        exit 1
    fi
}

# Build Docker image
build_image() {
    local env="$1"
    local tag="$2"
    local use_cache="$3"
    local multi_arch="$4"
    
    local dockerfile=""
    local full_tag="${REGISTRY}/${IMAGE_NAME}:${tag}"
    local build_args=""
    
    # Determine Dockerfile based on environment
    if [[ "$env" == "dev" ]]; then
        dockerfile="Dockerfile.dev"
        full_tag="${REGISTRY}/${IMAGE_NAME}:${tag}-dev"
        # Ensure environment file exists for development builds
        if [ ! -f ".env.docker" ]; then
            print_warning "Warning: .env.docker file not found. Environment variables may not be properly configured."
        fi
    else
        dockerfile="Dockerfile"
        # Ensure environment file exists for production builds
        if [ ! -f ".env.production" ]; then
            print_warning "Warning: .env.production file not found. Environment variables may not be properly configured."
        fi
    fi
    
    print_info "Building Docker image..."
    print_info "Environment: $env"
    print_info "Dockerfile: $dockerfile"
    print_info "Tag: $full_tag"
    
    # Change to project root
    cd "$PROJECT_ROOT"
    
    # Build cache options
    local cache_opts=""
    if [[ "$use_cache" == "true" ]]; then
        cache_opts="--cache-from type=local,src=/tmp/.buildx-cache --cache-to type=local,dest=/tmp/.buildx-cache-new,mode=max"
    fi
    
    # Multi-architecture build
    if [[ "$multi_arch" == "true" ]]; then
        check_buildx
        print_info "Building for multiple architectures (linux/amd64, linux/arm64)..."
        
        docker buildx build \
            --platform linux/amd64,linux/arm64 \
            --file "$dockerfile" \
            --tag "$full_tag" \
            $cache_opts \
            --push \
            .
    else
        # Single architecture build
        docker build \
            --file "$dockerfile" \
            --tag "$full_tag" \
            .
    fi
    
    # Move cache to avoid filling up disk
    if [[ "$use_cache" == "true" && -d "/tmp/.buildx-cache-new" ]]; then
        rm -rf /tmp/.buildx-cache
        mv /tmp/.buildx-cache-new /tmp/.buildx-cache
    fi
    
    print_success "Docker image built successfully: $full_tag"
}

# Push Docker image
push_image() {
    local env="$1"
    local tag="$2"
    
    local full_tag="${REGISTRY}/${IMAGE_NAME}:${tag}"
    if [[ "$env" == "dev" ]]; then
        full_tag="${REGISTRY}/${IMAGE_NAME}:${tag}-dev"
    fi
    
    print_info "Pushing Docker image: $full_tag"
    
    if docker push "$full_tag"; then
        print_success "Image pushed successfully: $full_tag"
    else
        print_error "Failed to push image: $full_tag"
        exit 1
    fi
}

# Cleanup old images
cleanup_images() {
    print_info "Cleaning up old Docker images..."
    
    # Remove dangling images
    if docker images -f "dangling=true" -q | grep -q .; then
        docker rmi $(docker images -f "dangling=true" -q) || true
    fi
    
    # Remove old build cache
    docker builder prune -f || true
    
    print_success "Cleanup completed"
}

# -----------------------------------------------------------------------------
# Main Script
# -----------------------------------------------------------------------------

main() {
    local env="prod"
    local tag="$DEFAULT_TAG"
    local push_image_flag="false"
    local multi_arch="false"
    local use_cache="false"
    
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
            -p|--push)
                push_image_flag="true"
                shift
                ;;
            -m|--multi-arch)
                multi_arch="true"
                shift
                ;;
            -c|--cache)
                use_cache="true"
                shift
                ;;
            -h|--help)
                print_usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                print_usage
                exit 1
                ;;
        esac
    done
    
    # Validate environment
    if [[ "$env" != "dev" && "$env" != "prod" ]]; then
        print_error "Invalid environment: $env. Must be 'dev' or 'prod'"
        exit 1
    fi
    
    print_info "Starting Docker build process..."
    print_info "Environment: $env"
    print_info "Tag: $tag"
    print_info "Push: $push_image_flag"
    print_info "Multi-arch: $multi_arch"
    print_info "Use cache: $use_cache"
    
    # Check prerequisites
    check_docker
    
    # Login to registry if pushing
    if [[ "$push_image_flag" == "true" ]]; then
        docker_login
    fi
    
    # Build the image
    build_image "$env" "$tag" "$use_cache" "$multi_arch"
    
    # Push the image if requested
    if [[ "$push_image_flag" == "true" && "$multi_arch" != "true" ]]; then
        push_image "$env" "$tag"
    fi
    
    # Cleanup
    cleanup_images
    
    print_success "Docker build process completed successfully!"
    
    # Print final image information
    local final_tag="${REGISTRY}/${IMAGE_NAME}:${tag}"
    if [[ "$env" == "dev" ]]; then
        final_tag="${REGISTRY}/${IMAGE_NAME}:${tag}-dev"
    fi
    
    # Tag for easy local reference without registry prefix (optional)
    docker tag "${final_tag}" "${IMAGE_NAME}:${tag}"
    print_info "Also tagged as: ${IMAGE_NAME}:${tag} for local use"
    
    echo ""
    print_info "Built image: $final_tag"
    
    if [[ "$push_image_flag" == "true" ]]; then
        print_info "Image available at: $final_tag"
    else
        print_info "To push the image, run:"
        echo "  docker push $final_tag"
    fi
    
    print_info "To run the image locally:"
    if [[ "$env" == "dev" ]]; then
        echo "  docker run -p 3000:3000 --env-file .env.docker $final_tag"
    else
        echo "  docker run -p 3000:3000 --env-file .env.production $final_tag"
    fi
    
    print_info "To check health status:"
    echo "  docker inspect --format='{{json .State.Health}}' container_id | jq"
}

# Run main function with all arguments
main "$@" 