#!/usr/bin/env bash
# Smoke test a wopee-mcp image under the limits the mcp service runs with in
# infra (environment/docker-compose.yml): read-only root, small noexec /tmp, no
# capabilities, no privilege gain, pids/cpu/memory caps.
#   usage: scripts/smoke-image.sh <image>
# Checks: /healthz answers, the OAuth protected-resource metadata is served, and
# POST /mcp without a token is challenged with 401.
set -euo pipefail

image="${1:?usage: $0 <image>}"

# A random loopback port, so parallel runs on one host cannot collide.
id="$(docker run -d --rm -p 127.0.0.1::8080 \
  --read-only --tmpfs /tmp:size=16m,noexec,nosuid,nodev \
  --cap-drop ALL --security-opt no-new-privileges:true \
  --pids-limit 256 --cpus 1 --memory 512m \
  -e MCP_RESOURCE_URL=http://localhost/mcp \
  -e WOPEE_AUTHORIZATION_SERVER=https://api.example.invalid \
  "$image")"
trap 'docker rm -f "$id" >/dev/null 2>&1 || true' EXIT
base="http://$(docker port "$id" 8080/tcp | head -n1)"

healthy=""
for _ in $(seq 1 20); do
  if curl -fsS "$base/healthz"; then healthy=1; break; fi
  sleep 1
done
echo
[ -n "$healthy" ] || { echo "::error::$image: /healthz did not answer within 20 s"; docker logs "$id"; exit 1; }

curl -fsS "$base/.well-known/oauth-protected-resource/mcp"
echo

status="$(curl -s -o /dev/null -w '%{http_code}' -X POST "$base/mcp" \
  -H 'content-type: application/json' -d '{}')"
[ "$status" = "401" ] || { echo "::error::$image: POST /mcp without a token answered $status, not 401"; docker logs "$id"; exit 1; }

echo "$image: healthz, protected-resource metadata and the 401 challenge answer as expected"
