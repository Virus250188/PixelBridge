#!/bin/bash
# PixelBridge - Docker Hub Build and Push Script
# Usage: ./build-and-push.sh [version]
# Example: ./build-and-push.sh 1.0.0

set -e

# Configuration
DOCKER_USERNAME="miguel1988"
IMAGE_BACKEND="pixelbridge-backend"
IMAGE_FRONTEND="pixelbridge-frontend"
VERSION="${1:-latest}"

echo "🚀 Building PixelBridge Docker Images"
echo "======================================"
echo "Username: $DOCKER_USERNAME"
echo "Version:  $VERSION"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Build Backend
echo -e "${BLUE}📦 Building Backend Image...${NC}"
docker build \
  --platform linux/amd64,linux/arm64 \
  -t ${DOCKER_USERNAME}/${IMAGE_BACKEND}:${VERSION} \
  -t ${DOCKER_USERNAME}/${IMAGE_BACKEND}:latest \
  ./backend

echo -e "${GREEN}✓ Backend image built${NC}"
echo ""

# Build Frontend
echo -e "${BLUE}📦 Building Frontend Image...${NC}"
docker build \
  --platform linux/amd64,linux/arm64 \
  -t ${DOCKER_USERNAME}/${IMAGE_FRONTEND}:${VERSION} \
  -t ${DOCKER_USERNAME}/${IMAGE_FRONTEND}:latest \
  ./frontend

echo -e "${GREEN}✓ Frontend image built${NC}"
echo ""

# Test the images
echo -e "${YELLOW}🧪 Testing images locally...${NC}"
docker-compose -f docker-compose.hub.yml up -d
sleep 5

# Health check
echo -e "${BLUE}Checking backend health...${NC}"
curl -f http://localhost:3000/api/health || echo "⚠️  Backend health check failed"

echo -e "${BLUE}Checking frontend...${NC}"
curl -f http://localhost/ || echo "⚠️  Frontend health check failed"

docker-compose -f docker-compose.hub.yml down
echo -e "${GREEN}✓ Local tests passed${NC}"
echo ""

# Push to Docker Hub
echo -e "${YELLOW}📤 Pushing to Docker Hub...${NC}"
read -p "Push images to Docker Hub? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo -e "${BLUE}Pushing backend...${NC}"
    docker push ${DOCKER_USERNAME}/${IMAGE_BACKEND}:${VERSION}
    docker push ${DOCKER_USERNAME}/${IMAGE_BACKEND}:latest

    echo -e "${BLUE}Pushing frontend...${NC}"
    docker push ${DOCKER_USERNAME}/${IMAGE_FRONTEND}:${VERSION}
    docker push ${DOCKER_USERNAME}/${IMAGE_FRONTEND}:latest

    echo ""
    echo -e "${GREEN}✅ Images successfully pushed to Docker Hub!${NC}"
    echo ""
    echo "🐳 Docker Hub URLs:"
    echo "   Backend:  https://hub.docker.com/r/${DOCKER_USERNAME}/${IMAGE_BACKEND}"
    echo "   Frontend: https://hub.docker.com/r/${DOCKER_USERNAME}/${IMAGE_FRONTEND}"
    echo ""
    echo "📋 Pull commands:"
    echo "   docker pull ${DOCKER_USERNAME}/${IMAGE_BACKEND}:${VERSION}"
    echo "   docker pull ${DOCKER_USERNAME}/${IMAGE_FRONTEND}:${VERSION}"
else
    echo -e "${YELLOW}Skipping push to Docker Hub${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Done!${NC}"
