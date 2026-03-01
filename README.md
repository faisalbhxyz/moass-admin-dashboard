# MOASS Admin Dashboard

Next.js 16 (App Router) + MySQL (Prisma) অ্যাডমিন ড্যাশবোর্ড। অথেনটিকেশন, অর্ডার, প্রোডাক্ট, ক্যাটাগরি, ব্যানার, কাস্টমার, কুপন, ইনভেন্টরি, শিপিং, রিপোর্ট ও সেটিংস।

## স্থানীয় চালানোর ধাপ

1. **Environment**
   - `.env.example` কপি করে `.env` বানান
   - `DATABASE_URL` – MySQL connection string (প্রোডে প্রয়োজনে `?socket=/tmp/mysql.sock`)
   - `AUTH_SECRET` – JWT সিক্রেট (`openssl rand -base64 32`)

2. **ডাটাবেস**
   ```bash
   npx prisma migrate deploy
   # অথবা হোস্টিংগার/ম্যানুয়াল: scripts/hostinger-create-tables.sql চালান, তারপর:
   # npx prisma migrate resolve --applied "20260302000000_init"
   npm run db:seed
   ```

3. **ডেভ সার্ভার**
   ```bash
   npm run dev
   ```
   ব্রাউজারে [http://localhost:3000](http://localhost:3000)। প্রথম অ্যাডমিন: `/auth/v2/register` দিয়ে রেজিস্টার অথবা সিড থেকে `admin@example.com` / `admin123`।

## প্রোডাকশন

```bash
npm run build
npm start
```

অথবা PM2:

```bash
pm2 start npm --name "moass-admin" -- start
```

## সংক্ষিপ্ত চেকলিস্ট

- [ ] `DATABASE_URL` সেট (MySQL, প্রয়োজনে `?socket=/tmp/mysql.sock`)
- [ ] `AUTH_SECRET` সেট (টেমপ্লেট মান না, নিজে জেনারেট)
- [ ] MySQL এ টেবিল তৈরি (`prisma migrate deploy` অথবা `scripts/hostinger-create-tables.sql`)
- [ ] (ঐচ্ছিক) `npm run db:seed`
- [ ] `npm run build` ও `npm start` / PM2
- [ ] প্রথম ইউজার রেজিস্টার বা সিড থেকে অ্যাডমিন

## রাউটস

| বিভাগ        | রাউট |
|-------------|------|
| লগইন/রেজিস্টার | `/auth/v2/login`, `/auth/v2/register` |
| ড্যাশবোর্ড   | `/` |
| অর্ডার      | `/orders`, `/orders/[id]` |
| প্রোডাক্ট   | `/products`, `/products/new`, `/products/[id]/edit` |
| ক্যাটাগরি   | `/categories` |
| ব্যানার     | `/banners` |
| কাস্টমার    | `/customers`, `/customers/[id]` |
| কুপন       | `/coupons` |
| ইনভেন্টরি   | `/inventory` |
| শিপিং      | `/shipping` |
| রিপোর্ট     | `/reports` |
| সেটিংস     | `/settings` |
| অ্যাকাউন্ট   | `/account` |

API: `/api/auth/*`, `/api/admin/*`, `/api/ecommerce/*`, `/api/upload` – সব অ্যাডমিন API সেশন চেক দ্বারা প্রটেক্টেড।
