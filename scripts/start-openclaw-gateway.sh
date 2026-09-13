#!/usr/bin/env bash
set -Eeuo pipefail

if [ -f /usr/local/share/nvm/nvm.sh ]; then
  # shellcheck source=/dev/null
  . /usr/local/share/nvm/nvm.sh 2>/dev/null || true
  nvm use 24 >/dev/null 2>&1 || true
fi

LOG_DIR="/tmp/openclaw"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/gateway-auto.log"
PID_FILE="$LOG_DIR/openclaw-gateway.pid"
HOST="${OPENCLAW_GATEWAY_HOST:-127.0.0.1}"
PORT="${OPENCLAW_GATEWAY_PORT:-18789}"
START_TIMEOUT="${OPENCLAW_GATEWAY_START_TIMEOUT:-30}"
MAX_RETRIES="${OPENCLAW_GATEWAY_MAX_RETRIES:-3}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRIDGE_ENV_FILE="${OPENCLAW_BRIDGE_ENV_FILE:-$SCRIPT_DIR/../whatsapp-openclaw-bridge/.env}"

if [ -z "${OPENCLAW_GATEWAY_TOKEN:-}" ] && [ -f "$BRIDGE_ENV_FILE" ]; then
  set -a
  # shellcheck source=/dev/null
  . "$BRIDGE_ENV_FILE"
  set +a
fi

if [ -z "${OPENCLAW_GATEWAY_TOKEN:-}" ]; then
  echo "[openclaw-gateway] OPENCLAW_GATEWAY_TOKEN is required; set it in $BRIDGE_ENV_FILE" >&2
  exit 1
fi

export PATH="/usr/local/share/nvm/current/bin:/home/codespace/nvm/current/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

OPENCLAW_BIN="${OPENCLAW_BIN:-}"
if [ -z "$OPENCLAW_BIN" ]; then
  for candidate in \
    "$(command -v openclaw 2>/dev/null || true)" \
    "$HOME/.local/bin/openclaw" \
    "$HOME/.nvm/current/bin/openclaw" \
    "/home/codespace/nvm/current/bin/openclaw" \
    "/usr/local/share/nvm/current/bin/openclaw" \
    "/usr/local/share/nvm/versions/node/v24.20.0/bin/openclaw" \
    "/usr/local/bin/openclaw" \
    "/usr/bin/openclaw"; do
    if [ -n "$candidate" ] && [ -x "$candidate" ]; then
      OPENCLAW_BIN="$candidate"
      break
    fi
  done
fi

if [ -z "$OPENCLAW_BIN" ]; then
  OPENCLAW_BIN="npx"
  OPENCLAW_NPX_FALLBACK=1
else
  OPENCLAW_NPX_FALLBACK=0
fi

OPENCLAW_CMD="$OPENCLAW_BIN"

check_health() {
  curl -fsS "http://${HOST}:${PORT}/" >/dev/null 2>&1
}

cleanup_stale_pid() {
  if [ -f "$PID_FILE" ]; then
    OLD_PID="$(cat "$PID_FILE" 2>/dev/null || true)"
    if [ -n "${OLD_PID}" ] && kill -0 "$OLD_PID" 2>/dev/null; then
      echo "[openclaw-gateway] Cleaning stale pid file and terminating previous process: $OLD_PID"
      kill "$OLD_PID" 2>/dev/null || true
      sleep 2
    fi
    rm -f "$PID_FILE"
  fi

  local port_pid
  port_pid="$(lsof -ti tcp:"$PORT" 2>/dev/null || true)"
  if [ -n "${port_pid}" ]; then
    echo "[openclaw-gateway] Port $PORT is occupied by pid(s) $port_pid; terminating them to avoid conflicts"
    kill $port_pid 2>/dev/null || true
    sleep 2
  fi
}

launch_gateway() {
  echo "[openclaw-gateway] Starting OpenClaw Gateway in background..."
  if [ "$OPENCLAW_NPX_FALLBACK" -eq 1 ]; then
    nohup npx --yes openclaw gateway run --allow-unconfigured --auth token --token "$OPENCLAW_GATEWAY_TOKEN" --bind loopback --port "$PORT" --verbose >"$LOG_FILE" 2>&1 &
  else
    nohup "$OPENCLAW_CMD" gateway run --allow-unconfigured --auth token --token "$OPENCLAW_GATEWAY_TOKEN" --bind loopback --port "$PORT" --verbose >"$LOG_FILE" 2>&1 &
  fi
  local new_pid=$!
  printf '%s\n' "$new_pid" > "$PID_FILE"
  echo "[openclaw-gateway] Spawned pid $new_pid"
  local waited=0
  while [ "$waited" -lt "$START_TIMEOUT" ]; do
    if check_health; then
      echo "[openclaw-gateway] Gateway started successfully (pid $new_pid)"
      return 0
    fi
    sleep 1
    waited=$((waited + 1))
  done

  echo "[openclaw-gateway] Gateway did not become healthy within ${START_TIMEOUT}s" >&2
  if [ -f "$LOG_FILE" ]; then
    echo "--- gateway log tail ---" >&2
    tail -n 80 "$LOG_FILE" >&2 || true
  fi
  return 1
}

if check_health; then
  echo "[openclaw-gateway] Gateway already running at http://${HOST}:${PORT}/"
  exit 0
fi

retry_count=0
while [ "$retry_count" -lt "$MAX_RETRIES" ]; do
  cleanup_stale_pid
  if launch_gateway; then
    exit 0
  fi
  retry_count=$((retry_count + 1))
  echo "[openclaw-gateway] Retry $retry_count/$MAX_RETRIES after startup failure"
  if [ "$retry_count" -lt "$MAX_RETRIES" ]; then
    sleep 3
  fi
done

echo "[openclaw-gateway] Startup failed after $MAX_RETRIES attempts." >&2
exit 1
