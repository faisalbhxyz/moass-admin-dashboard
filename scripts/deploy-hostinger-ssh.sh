#!/bin/bash
# MOASS Admin Dashboard – Hostinger এ SSH দিয়ে ম্যানুয়াল ডিপ্লয়
# ব্যবহার: প্রজেক্ট রুটে (যেখানে package.json আছে) চালান: bash scripts/deploy-hostinger-ssh.sh

set -e
echo "=== MOASS Admin – Hostinger ডিপ্লয় শুরু ==="

# ১. ডিপেন্ডেন্সি
echo "১. npm install..."
npm install

# ২. Prisma ক্লায়েন্ট
echo "২. Prisma generate..."
npx prisma generate

# ৩. মাইগ্রেশন (টেবিল নেই থাকলে)
echo "৩. Prisma migrate deploy..."
npx prisma migrate deploy || echo "মাইগ্রেশন ইতিমধ্যে অ্যাপ্লাই থাকতে পারে। phpMyAdmin দিয়ে টেবিল করলে উপেক্ষা করুন।"

# ৪. (ঐচ্ছিক) সিড – প্রথমবার ডিপ্লয়ের পর চালান
# echo "৪. DB seed..."
# npm run db:seed

# ৫. বিল্ড
echo "৫. Build..."
npm run build

echo "=== ডিপ্লয় সম্পন্ন ==="
echo "চালান: npm start"
echo "অথবা PM2/systemd দিয়ে: npm start ব্যাকগ্রাউন্ডে চালান।"
