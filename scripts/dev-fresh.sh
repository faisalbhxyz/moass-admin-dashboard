#!/bin/bash
# Fresh dev start - kills old servers, clears cache, starts clean
cd "$(dirname "$0")/.."
echo "Stopping any running Next.js processes..."
lsof -ti:3000,3001,3002,3003,3004 2>/dev/null | xargs kill -9 2>/dev/null || true
echo "Clearing .next cache..."
rm -rf .next
echo "Starting dev server..."
npm run dev
