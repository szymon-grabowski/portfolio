#!/usr/bin/env bash
# Fails if a file in deploy/secrets/ is not SOPS-encrypted or has a plain value under data/stringData.
set -euo pipefail

status=0
for file in deploy/secrets/*; do
  [ -e "$file" ] || continue
  case "$file" in *.sops.yaml) ;; *) echo "$file: only *.sops.yaml belongs in deploy/secrets/" >&2; status=1; continue ;; esac
  yq -e '.sops.age' "$file" >/dev/null 2>&1 || { echo "$file: not encrypted with SOPS/age" >&2; status=1; continue; }
  plain=$(yq '[(.data // {}), (.stringData // {})] | .[] | to_entries | .[] | select(.value | test("^ENC.AES256_GCM,") | not) | .key' "$file")
  [ -z "$plain" ] || { echo "$file: plain values: $plain" >&2; status=1; }
done
[ "$status" -eq 0 ] && echo "OK"
exit "$status"
