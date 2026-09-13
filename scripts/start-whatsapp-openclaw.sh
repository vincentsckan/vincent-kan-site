#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BRIDGE_DIR="$ROOT_DIR/whatsapp-openclaw-bridge"
LOG_DIR="/tmp/openclaw"
BRIDGE_LOG="$LOG_DIR/whatsapp-bridge.log"
BRIDGE_PID_FILE="$LOG_DIR/whatsapp-bridge.pid"

"$SCRIPT_DIR/start-openclaw-gateway.sh"

if curl -fsS --max-time 2 http://127.0.0.1:3000/health >/dev/null 2>&1; then
  echo "[whatsapp-bridge] Already running at http://127.0.0.1:3000"
  exit 0
fi

mkdir -p "$LOG_DIR"
nohup npm start --prefix "$BRIDGE_DIR" >"$BRIDGE_LOG" 2>&1 &
printf '%s\n' "$!" > "$BRIDGE_PID_FILE"
echo "[whatsapp-bridge] Started with pid $!; log: $BRIDGE_LOG"