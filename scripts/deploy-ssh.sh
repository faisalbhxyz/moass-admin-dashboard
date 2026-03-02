#!/usr/bin/env bash
# Deploy MOASS Admin Dashboard to SSH server (u410218618@145.79.26.13:65002)
# Run from project root: ./scripts/deploy-ssh.sh
# You will be prompted for SSH password (once per: rsync, scp, ssh).

set -e
SSH_USER="u410218618"
SSH_HOST="145.79.26.13"
SSH_PORT="65002"
REMOTE_DIR="~/moass-admin"
PROJECT_DIR="/Users/faisalbh/Documents/MOASS Admin Dashboard"

echo "=== 1/4 Syncing project to server (excluding node_modules, .next) ==="
rsync -avz -e "ssh -p $SSH_PORT" \
  --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  "$PROJECT_DIR/" "$SSH_USER@$SSH_HOST:$REMOTE_DIR/"

echo "=== 2/4 Copying .env to server ==="
scp -P "$SSH_PORT" "$PROJECT_DIR/.env" "$SSH_USER@$SSH_HOST:$REMOTE_DIR/.env"

echo "=== 3/4 Installing deps, Prisma, building on server ==="
ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "cd $REMOTE_DIR && npm install && npx prisma generate && npx prisma migrate deploy && npm run build"

echo "=== 4/4 Starting app with PM2 (restart if already running) ==="
ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "cd $REMOTE_DIR && (command -v pm2 >/dev/null 2>&1 || npm i -g pm2) && pm2 delete moass-admin 2>/dev/null; pm2 start npm --name moass-admin -- start && pm2 save && pm2 startup 2>/dev/null || true"

echo "Done. App should be running. Check: ssh -p $SSH_PORT $SSH_USER@$SSH_HOST 'pm2 status'"
