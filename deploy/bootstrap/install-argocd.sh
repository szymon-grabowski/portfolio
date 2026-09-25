#!/usr/bin/env bash
# Usage (server, repo root, normal user): deploy/bootstrap/install-argocd.sh
set -euo pipefail

ARGOCD_CHART_VERSION="10.9.2"

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

helm repo add argo https://argoproj.github.io/argo-helm >/dev/null 2>&1 || true
helm repo update argo >/dev/null

helm upgrade --install argocd argo/argo-cd \
  --version "$ARGOCD_CHART_VERSION" \
  --namespace argocd --create-namespace \
  --values "$root/deploy/values/argocd.yaml" \
  --wait --timeout 10m

kubectl apply -f "$root/deploy/argocd/root-application.yaml"
