#!/usr/bin/env bash
# ================================================================
# weekly-traffic-report.sh — Weekly traffic summary from GoatCounter
# Sends a summary via cron to keep you informed.
# ================================================================

SITE="disclosurehk"
echo "📊 Weekly Traffic Report for disclosurehk.com"
echo ""

# Fetch GoatCounter stats
STATS=$(curl -s "https://${SITE}.goatcounter.com/counter//count.json" 2>/dev/null)
echo "$STATS" | python3 -c "
import json, sys

try:
    data = json.loads('\n'.join(sys.stdin.readlines()))
    print(json.dumps(data, indent=2)[:500])
except:
    print('(Stats not available via public API)')
" 2>/dev/null || echo "(GoatCounter API requires authentication for detailed stats)"

echo ""
echo "Check full stats at: https://${SITE}.goatcounter.com"
