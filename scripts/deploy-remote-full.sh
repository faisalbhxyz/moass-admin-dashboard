#!/bin/bash
# Hostinger-এ একবার চালান (প্রজেক্ট রুটে)
# SSH: ssh -p 65002 YOUR_USER@YOUR_HOST
#
# SECURITY: Never put real DATABASE_URL or AUTH_SECRET in this file.
# Create .env manually with: cp .env.example .env && nano .env

set -e
cd "$(dirname "$0")/.."
echo "=== MOASS Admin – Full deploy on Hostinger ==="

if [ ! -f .env ]; then
  echo "ERROR: .env not found. Create it from .env.example:"
  echo "  cp .env.example .env"
  echo "  nano .env   # Add your DATABASE_URL and AUTH_SECRET"
  echo ""
  echo "AUTH_SECRET: openssl rand -base64 32"
  exit 1
fi

echo "1. npm install..."
npm install

echo "2. Prisma generate..."
npx prisma generate

echo "3. Prisma migrate deploy..."
npx prisma migrate deploy || true

echo "4. Build..."
npm run build

echo "5. (Optional) Seed admin user - run once: npm run db:seed"
echo "=== Deploy done. Start app: npm start ==="
echo "To run in background: nohup npm start > app.log 2>&1 &"
echo "Or install PM2: npm i -g pm2 && pm2 start npm --name moass -- start"
