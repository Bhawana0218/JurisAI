#!/bin/bash
set -euo pipefail

# JurisAI Deployment Script
# Usage: ./scripts/deployment/deploy.sh [environment] [tag]

ENVIRONMENT=${1:-staging}
TAG=${2:-latest}
REGION=${REGION:-us-central1}
PROJECT_ID=${PROJECT_ID:-jurisai-production}
GAR_REPOSITORY=${GAR_REPOSITORY:-jurisai}
GAR_LOCATION=${GAR_LOCATION:-us-central1}

echo "=== JurisAI Deployment ==="
echo "Environment: $ENVIRONMENT"
echo "Tag: $TAG"
echo "Region: $REGION"

# Build all services
echo "--- Building Docker images ---"
docker build --target runner -t $GAR_LOCATION-docker.pkg.dev/$PROJECT_ID/$GAR_REPOSITORY/jurisai-web:$TAG -f Dockerfile .
docker build --target runner -t $GAR_LOCATION-docker.pkg.dev/$PROJECT_ID/$GAR_REPOSITORY/jurisai-ws:$TAG -f Dockerfile --build-arg SERVICE=ws-server .
docker build --target runner -t $GAR_LOCATION-docker.pkg.dev/$PROJECT_ID/$GAR_REPOSITORY/jurisai-worker:$TAG -f Dockerfile --build-arg SERVICE=worker .

# Push images
echo "--- Pushing Docker images ---"
docker push $GAR_LOCATION-docker.pkg.dev/$PROJECT_ID/$GAR_REPOSITORY/jurisai-web:$TAG
docker push $GAR_LOCATION-docker.pkg.dev/$PROJECT_ID/$GAR_REPOSITORY/jurisai-ws:$TAG
docker push $GAR_LOCATION-docker.pkg.dev/$PROJECT_ID/$GAR_REPOSITORY/jurisai-worker:$TAG

# Deploy to Kubernetes
echo "--- Deploying to Kubernetes ---"
cd infrastructure/k8s/overlays/$ENVIRONMENT
kustomize edit set image \
  gcr.io/$PROJECT_ID/jurisai-web=$GAR_LOCATION-docker.pkg.dev/$PROJECT_ID/$GAR_REPOSITORY/jurisai-web:$TAG \
  gcr.io/$PROJECT_ID/jurisai-ws=$GAR_LOCATION-docker.pkg.dev/$PROJECT_ID/$GAR_REPOSITORY/jurisai-ws:$TAG \
  gcr.io/$PROJECT_ID/jurisai-worker=$GAR_LOCATION-docker.pkg.dev/$PROJECT_ID/$GAR_REPOSITORY/jurisai-worker:$TAG
kustomize build | kubectl apply -f -

# Wait for rollout
echo "--- Waiting for rollout ---"
kubectl rollout status deployment/jurisai-web -n jurisai --timeout=5m
kubectl rollout status deployment/jurisai-ws -n jurisai --timeout=3m
kubectl rollout status deployment/jurisai-worker -n jurisai --timeout=3m

echo "=== Deployment complete ==="
