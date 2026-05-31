#!/bin/bash
set -euo pipefail

# JurisAI Cluster Initialization Script
# Run once to set up the GKE cluster and all dependencies

ENVIRONMENT=${1:-production}
PROJECT_ID=${PROJECT_ID:-jurisai-production}
REGION=${REGION:-us-central1}
CLUSTER_NAME="jurisai-cluster-$ENVIRONMENT"

echo "=== Initializing JurisAI Cluster ==="
echo "Environment: $ENVIRONMENT"
echo "Cluster: $CLUSTER_NAME"

# Create GKE cluster
echo "--- Creating GKE cluster ---"
gcloud container clusters create $CLUSTER_NAME \
  --region=$REGION \
  --node-locations=$REGION-a,$REGION-b,$REGION-c \
  --num-nodes=3 \
  --machine-type=e2-standard-4 \
  --enable-autoscaling \
  --min-nodes=3 \
  --max-nodes=20 \
  --enable-private-nodes \
  --master-ipv4-cidr=10.0.0.0/28 \
  --enable-ip-alias \
  --workload-pool=$PROJECT_ID.svc.id.goog \
  --release-channel=regular \
  --addons=HorizontalPodAutoscaling,HttpLoadBalancing \
  --project=$PROJECT_ID

# Get credentials
gcloud container clusters get-credentials $CLUSTER_NAME --region=$REGION --project=$PROJECT_ID

# Create namespace
kubectl create namespace jurisai --dry-run=client -o yaml | kubectl apply -f -

# Install cert-manager for TLS
echo "--- Installing cert-manager ---"
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.0/cert-manager.yaml
kubectl wait --for=condition=Available deployment/cert-manager -n cert-manager --timeout=120s

# Install NGINX Ingress Controller
echo "--- Installing NGINX Ingress ---"
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.0/deploy/static/provider/cloud/deploy.yaml
kubectl wait --for=condition=Available deployment/ingress-nginx-controller -n ingress-nginx --timeout=120s

# Install Prometheus stack for monitoring
echo "--- Installing Prometheus Stack ---"
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace jurisai \
  --create-namespace \
  --set grafana.enabled=true \
  --set grafana.ingress.enabled=true \
  --set grafana.ingress.hosts={"grafana.jurisai.io"}

# Install Temporal
echo "--- Installing Temporal ---"
helm repo add temporal https://temporalio.github.io/helm-charts
helm repo update
helm install temporal temporal/temporal \
  --namespace jurisai \
  --create-namespace \
  --set server.replicas=3 \
  --set persistence.default.store=postgresql

# Configure Workload Identity
echo "--- Configuring Workload Identity ---"
gcloud iam service-accounts create jurisai-k8s-sa \
  --project=$PROJECT_ID || true
gcloud iam service-accounts add-iam-policy-binding jurisai-k8s-sa@$PROJECT_ID.iam.gserviceaccount.com \
  --role roles/iam.workloadIdentityUser \
  --member "serviceAccount:$PROJECT_ID.svc.id.goog[jurisai/jurisai-web]" \
  --project=$PROJECT_ID

echo "=== Cluster initialization complete ==="
