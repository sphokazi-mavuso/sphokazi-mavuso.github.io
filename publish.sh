#!/usr/bin/env bash
set -euo pipefail

ORG="sphokazi-mavuso"
REPO="sphokazi-mavuso.github.io"
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "Checking org $ORG..."
gh api "orgs/$ORG" -q .login >/dev/null

echo "Creating repo $ORG/$REPO (if needed)..."
if ! gh api "repos/$ORG/$REPO" -q .full_name >/dev/null 2>&1; then
  gh repo create "$ORG/$REPO" --public --description "Siphokazi Mavuso media kit" --disable-wiki --disable-issues
fi

echo "Pushing site..."
cd "$ROOT"
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$ORG/$REPO.git"
git push -u origin main --force

echo "Enabling GitHub Pages..."
gh api --method POST "repos/$ORG/$REPO/pages" \
  -H "Accept: application/vnd.github+json" \
  -f "build_type=legacy" \
  -f "source[branch]=main" \
  -f "source[path]=/" 2>/dev/null \
  || gh api --method PUT "repos/$ORG/$REPO/pages" \
    -H "Accept: application/vnd.github+json" \
    -f "build_type=legacy" \
    -f "source[branch]=main" \
    -f "source[path]=/" 2>/dev/null \
  || true

# Prefer modern pages config
gh api --method PUT "repos/$ORG/$REPO/pages" \
  -H "Accept: application/vnd.github+json" \
  --input - <<'JSON' 2>/dev/null || true
{
  "build_type": "legacy",
  "source": { "branch": "main", "path": "/" }
}
JSON

sleep 2
gh api "repos/$ORG/$REPO/pages" -q .html_url 2>/dev/null || echo "https://$ORG.github.io"
echo "DONE"
