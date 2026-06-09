#!/usr/bin/env bash
# Re-run the chapter-1 pre-gen until all 288 variants (4 adventures x 72) are
# cached or progress stalls. Each pass skips already-cached rows and retries the
# ones that failed (e.g. transient 503s), so successive passes converge.
set -u
cd "$(dirname "$0")/.."

SUPA="https://nicbjkcpsnqjdxzesxyb.supabase.co"
ANON="sb_publishable_QC1pzwIuhm9y2JgDNYfavw_FgYQoM27"
ADVS="the-kitchen cedar-hollow the-acquisition the-inheritance"

count() {
  curl -s "$SUPA/rest/v1/chapters_cache?chapter_no=eq.1&select=id" \
    -H "apikey: $ANON" -H "Authorization: Bearer $ANON" \
    -H "Prefer: count=exact" -H "Range: 0-0" -I 2>/dev/null \
    | grep -i content-range | sed 's/.*\///' | tr -d '\r'
}

prev=-1
for pass in $(seq 1 14); do
  total=$(count); total=${total:-0}
  echo "[warm] pass $pass start — cached $total/288"
  if [ "$total" -ge 288 ]; then echo "[warm] complete: $total/288"; exit 0; fi
  if [ "$total" -le "$prev" ] && [ "$pass" -gt 2 ]; then
    echo "[warm] no progress since last pass ($prev -> $total); stopping. Remaining will fill on-demand."
    exit 0
  fi
  prev=$total
  npx tsx scripts/pre-generate-chapter-1-all.ts $ADVS
done

final=$(count)
echo "[warm] done after 14 passes — cached ${final:-?}/288"
