#!/usr/bin/env bash
# Fails if a container lacks memory request/limit or a hardened securityContext. Needs yq v4.
set -euo pipefail

problems=$(yq -N '
  select(.kind == "Deployment" or .kind == "StatefulSet" or .kind == "DaemonSet") |
  .kind as $kind | .metadata.name as $name |
  .spec.template.spec.containers[] |
  select(
    .resources.requests.memory == null or
    .resources.limits.memory == null or
    .securityContext.allowPrivilegeEscalation != false or
    .securityContext.readOnlyRootFilesystem != true
  ) |
  $kind + "/" + $name + " container " + .name
' "$@")

if [ -n "$problems" ]; then
  echo "Missing memory request/limit or hardened securityContext:" >&2
  echo "$problems" >&2
  exit 1
fi
echo "OK"
