#!/usr/bin/env bash
# Usage (server, repo root): sudo deploy/bootstrap/install-k3s.sh
set -euo pipefail

K3S_VERSION="v1.36.4+k3s1"

[ "$(id -u)" -eq 0 ] || { echo "Run with sudo." >&2; exit 1; }
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
user="${SUDO_USER:?Run with sudo from your normal user}"
home="$(getent passwd "$user" | cut -d: -f6)"

install -D -m 644 "$here/k3s-config.yaml" /etc/rancher/k3s/config.yaml   # no secrets; kubectl (k3s) reads it
install -D -m 600 "$here/traefik-config.yaml" /var/lib/rancher/k3s/server/manifests/traefik-config.yaml

curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION="$K3S_VERSION" sh -

install -d -m 700 -o "$user" -g "$user" "$home/.kube"
install -m 600 -o "$user" -g "$user" /etc/rancher/k3s/k3s.yaml "$home/.kube/config"

timeout 120 bash -c "until k3s kubectl get nodes 2>/dev/null | grep -q .; do sleep 2; done"   # node must register first
k3s kubectl wait --for=condition=Ready node --all --timeout=180s
grep -q KUBECONFIG "$home/.bashrc" || echo 'export KUBECONFIG=$HOME/.kube/config' >> "$home/.bashrc"
