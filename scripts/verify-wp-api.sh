#!/usr/bin/env bash
# Reproducible smoke for production API checklist §2 (reachability + anon GET).
# Usage: export WP_API_URL=...  OR:  set -a && source .env.local && set +a && npm run verify:wp-api
set -euo pipefail

# Some hosts (e.g. WAF) return 403 for curl's default User-Agent; use a neutral browser UA.
UA="Mozilla/5.0 (compatible; KatsumaScore-verify/1.0; +https://katsumascore.blog)"

base="${WP_API_URL:-}"
if [[ -z "$base" ]]; then
  echo "verify-wp-api: WP_API_URL is not set." >&2
  exit 1
fi
base="${base%/}"
url_ja="${base}/posts?per_page=1&_embed=1&acf_format=standard&lang=ja"
url_en="${base}/posts?per_page=1&_embed=1&acf_format=standard&lang=en"

code_ja=$(curl -sS -A "$UA" -o /dev/null -w "%{http_code}" "$url_ja")
if [[ "$code_ja" != "200" ]]; then
  echo "verify-wp-api: expected HTTP 200 for lang=ja, got ${code_ja}" >&2
  echo "  $url_ja" >&2
  exit 1
fi

code_en=$(curl -sS -A "$UA" -o /dev/null -w "%{http_code}" "$url_en")
if [[ "$code_en" != "200" ]]; then
  echo "verify-wp-api: expected HTTP 200 for lang=en, got ${code_en}" >&2
  echo "  $url_en" >&2
  exit 1
fi

headers=$(curl -sS -A "$UA" -D - -o /dev/null "$url_ja" | tr -d '\r')
if ! echo "$headers" | grep -qi '^X-WP-Total:'; then
  echo "verify-wp-api: warning: X-WP-Total header not present (pagination may break)" >&2
fi

echo "verify-wp-api: OK (ja/en GET 200, base=${base})"
