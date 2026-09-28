#!/usr/bin/env bash
# Decrypts deploy/secrets/*.sops.yaml and applies them. Run on a new cluster after install-argocd.sh
# (Argo CD creates the monitoring namespace), or after changing a secret.
# Usage (server, repo root): SOPS_AGE_KEY_FILE=<file with the age private key> deploy/bootstrap/apply-secrets.sh
# The private key lives in the password manager; put it in a temp file only for this run, then delete it.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
[ -n "${SOPS_AGE_KEY_FILE:-}${SOPS_AGE_KEY:-}" ] || { echo "set SOPS_AGE_KEY_FILE (age private key)" >&2; exit 1; }

for ns in argocd monitoring; do
  timeout 600 bash -c "until kubectl get namespace $ns >/dev/null 2>&1; do sleep 5; done" \
    || { echo "namespace $ns does not exist; run install-argocd.sh and wait for Argo CD" >&2; exit 1; }
done

for file in "$root"/deploy/secrets/*.sops.yaml; do
  # apply merges keys into an existing Secret: argocd-secret keeps the keys the Argo CD chart and server manage.
  sops --decrypt "$file" | kubectl apply -f -
done
