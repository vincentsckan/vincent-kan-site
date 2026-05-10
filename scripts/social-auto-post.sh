#!/usr/bin/env bash
# ================================================================
# social-auto-post.sh — Unified Social Media Auto-Poster
# 
# Posts latest UFO article to:
#   1. X/Twitter (via xurl)
#   2. Telegram Channel (via Telegram Bot API)
#   3. Reddit case study (via reddit-auto-poster.py)
#
# Designed to be run via cron (set and forget).
# ================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SITE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$SITE_DIR/logs/social-auto-post.log"
STATE_FILE="$SITE_DIR/.social-post-state.json"

# Ensure logs dir exists
mkdir -p "$SITE_DIR/logs"

log() {
  local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $*"
  echo "$msg" | tee -a "$LOG_FILE"
}

# ─── X/Twitter Post ────────────────────────────────────────────
post_to_x() {
  log "📱 Posting to X/Twitter..."
  if ! command -v xurl &>/dev/null; then
    log "   ⚠️ xurl not found, skipping X post"
    return
  fi
  cd "$SITE_DIR"
  node scripts/twitter-auto-post.cjs 2>&1 | tee -a "$LOG_FILE"
  local exitcode=$?
  if [ $exitcode -eq 0 ]; then
    log "   ✅ X/Twitter post successful"
  else
    log "   ⚠️ X/Twitter post failed (exit $exitcode)"
  fi
}

# ─── Telegram Post ──────────────────────────────────────────────
post_to_telegram() {
  # Hardcoded from OpenClaw config — zero setup needed
  local bot_token="8778715231:AAG1KurHJg8KpIAsyn3S6NLOpXmVJs-94x8"
  local chat_id="8187970729"
  
  log "📱 Posting to Telegram..."
  cd "$SITE_DIR"
  node scripts/telegram-auto-post.cjs --webhook "$bot_token" "$chat_id" 2>&1 | tee -a "$LOG_FILE"
  local exitcode=$?
  if [ $exitcode -eq 0 ]; then
    log "   ✅ Telegram post successful"
  else
    log "   ⚠️ Telegram post failed (exit $exitcode)"
  fi
}

# ─── Reddit Post ────────────────────────────────────────────────
post_to_reddit() {
  log "📱 Posting to Reddit..."
  cd "$SITE_DIR"
  python3 scripts/reddit-auto-poster.py 2>&1 | tee -a "$LOG_FILE"
  local exitcode=$?
  if [ $exitcode -eq 0 ]; then
    log "   ✅ Reddit post attempt completed"
  else
    log "   ⚠️ Reddit post failed (exit $exitcode)"
  fi
}

# ─── Main ───────────────────────────────────────────────────────
log "🚀 Social Auto-Poster starting..."

# Parse args
case "${1:-all}" in
  x|twitter)
    post_to_x
    ;;
  tg|telegram)
    post_to_telegram
    ;;
  reddit)
    post_to_reddit
    ;;
  all)
    post_to_x
    post_to_telegram
    post_to_reddit
    ;;
  *)
    echo "Usage: $0 {x|telegram|reddit|all}"
    exit 1
    ;;
esac

log "✅ Social Auto-Poster done."
