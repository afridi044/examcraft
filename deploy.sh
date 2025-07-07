#!/bin/bash

set -e

echo "🚀Starting deployment script..."


cd /opt/examcraft

git pull origin master || echo "No changes to pull"

# Copy environment file
cp /home/seed/env_folder/.env.local /opt/examcraft/backend/.env|| echo "No .env.example found, using existing .env"
cp /home/seed/env_folder/.env.production /opt/examcraft/backend/.env|| echo "No .env.example found, using existing .env"

echo "dcoker compose backend"

cd /opt/examcraft/backend

docker-compose -f docker-compose.yml down
docker-compose -f docker-compose.yml up --build -d

echo "Waiting for backend to be ready..."
sleep 30

echo "dcoker compose frontend"

cd /opt/examcraft/frontend
docker-compose -f docker-compose.yml down
docker-compose -f docker-compose.yml up --build -d

docker ps -a

echo "Deployment completed successfully! 🎉"


