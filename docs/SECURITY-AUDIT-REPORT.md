# Security Audit Report – MOASS Admin Dashboard

**তারিখ:** মার্চ ২০২৫ (আপডেট: মার্চ ২০২৬)  
**অডিট স্কোপ:** পূর্ণ কোডবেস রিভিউ ও আগে চিহ্নিত ইস্যু রিমিডিয়েশন  
**স্ট্যাটাস:** নতুন ইস্যু চিহ্নিত – নিচে তালিকাভুক্ত করুন

---

## Executive Summary

অ্যাপ্লিকেশনটিতে একটি পূর্ণ নিরাপত্তা অডিট সম্পন্ন হয়েছে। আগে ঠিক করা ইস্যুগুলো এখনও ঠিক আছে। কিন্তু **নতুন ক্রিটিকাল ও মিডিয়াম লেভেলের ইস্যু** চিহ্নিত হয়েছে যা প্রোডাকশনে যাওয়ার আগে ঠিক করা উচিত।

---

## নতুন চিহ্নিত ইস্যু (২০২৬ অডিট) – সব ঠিক করা হয়েছে

### 1. Order Tracking API – IDOR (FIXED)

| দিক | বিস্তারিত |
|-----|-----------|
| **সমাধান** | `orderNumber` ও `email` উভয় প্রয়োজন; email অর্ডারের customer ইমেইলের সাথে মিলতে হবে। Rate limit (১০/মিনিট) যোগ করা হয়েছে |
| **স্টোরফ্রন্ট** | Order tracking ফর্মে orderNumber ও email দুটোই পাঠাতে হবে |

### 2. debug-log API (FIXED)

| দিক | বিস্তারিত |
|-----|-----------|
| **সমাধান** | `NODE_ENV === "production"` হলে 404 রিটার্ন; শুধু development এ চালে |

### 3. search/log Rate Limit (FIXED)

| দিক | বিস্তারিত |
|-----|-----------|
| **সমাধান** | `LIMITS.SEARCH_LOG` (৬০/মিনিট) যোগ করা হয়েছে |

### 4. Page/Product Content sanitization (FIXED)

| দিক | বিস্তারিত |
|-----|-----------|
| **সমাধান** | `sanitize-html` দিয়ে সার্ভারে সংরক্ষণের আগে HTML sanitize; pages ও products API তে প্রয়োগ করা হয়েছে |

### ⚠️ সতর্কতা: .env ও ক্রেডেনশিয়াল

| দিক | বিস্তারিত |
|-----|-----------|
| **পরামর্শ** | কখনো `.env` Git এ commit করবেন না; প্রোডে Vercel/Hostinger env vars ব্যবহার করুন |

---

## আগে ঠিক করা ইস্যু (যা এখনও ঠিক আছে)

### 1. 🔴 Critical: Script এ Hardcoded Credentials (FIXED)

| দিক | বিস্তারিত |
|-----|-----------|
| **ইস্যু** | `scripts/deploy-remote-full.sh` এ `DATABASE_URL` ও `AUTH_SECRET` সরাসরি লিখা ছিল |
| **ঝুঁকি** | রিপো যদি Git এ push হয়, credentials পাবলিক হয়ে যায় |
| **সমাধান** | স্ক্রিপ্ট থেকে credentials সরানো হয়েছে। `.env` না থাকলে স্ক্রিপ্ট exit করে এবং ব্যবহারকারীকে `.env.example` থেকে `.env` বানাতে বলে |
| **ফাইল** | `scripts/deploy-remote-full.sh` |

### 2. 🟠 Medium: File Upload Validation (FIXED)

| দিক | বিস্তারিত |
|-----|-----------|
| **ইস্যু** | আপলোডে size limit, MIME validation, বা magic bytes চেক ছিল না |
| **ঝুঁকি** | DoS (বড় ফাইল), malicious file upload, MIME spoofing |
| **সমাধান** | (ক) সর্বোচ্চ ১০MB size limit (খ) শুধু image/jpeg, image/png, image/webp, image/gif অনুমোদিত (গ) magic bytes দিয়ে প্রকৃত ইমেজ ফরম্যাট যাচাই |
| **ফাইল** | `src/app/api/upload/route.ts` |

### 3. 🟠 Medium: XSS in Page Content Preview (FIXED)

| দিক | বিস্তারিত |
|-----|-----------|
| **ইস্যু** | PageForm এ `dangerouslySetInnerHTML` দিয়ে content প্রিভিউ করানো হচ্ছিল, sanitization ছাড়া |
| **ঝুঁকি** | Admin যদি (বা কমপ্রোমাইজড হলে) malicious HTML/script সেভ করে, প্রিভিউতে XSS হতে পারত |
| **সমাধান** | `DOMPurify` যোগ করে HTML sanitize করা হচ্ছে। শুধু নিরাপদ tags (p, strong, em, ul, ol, li, a, h1–3, ইত্যাদি) allow করা হয়েছে |
| **ফাইল** | `src/app/(dashboard)/pages/PageForm.tsx` |
| **ডিপেন্ডেন্সি** | `dompurify`, `@types/dompurify` |

### 4. 🟠 Medium: Rate Limit IP Spoofing (Mitigated via Documentation)

| দিক | বিস্তারিত |
|-----|-----------|
| **ইস্যু** | IP `x-forwarded-for` থেকে নেওয়া হয়; client fake header পাঠিয়ে bypass করতে পারত |
| **ঝুঁকি** | Rate limit বাইপাস করে brute force করা |
| **সমাধান** | কোডে security কমেন্ট যোগ করা হয়েছে; `docs/SECURITY.md` এ reverse proxy সঠিকভাবে real client IP সেট করার নির্দেশনা যোগ করা হয়েছে। Vercel/Cloudflare ডিফল্টে সঠিকভাবে সেট করে |
| **ফাইল** | `src/lib/rate-limit.ts`, `docs/SECURITY.md` |

---

## বর্তমান নিরাপত্তা অবস্থা

### ✅ শক্তিশালী দিক

| বিষয় | বর্ণনা |
|-------|--------|
| **Authentication** | JWT session, httpOnly cookie, secure (prod), sameSite=lax |
| **AUTH_SECRET** | প্রোডে default/placeholder থাকলে অ্যাপ throw করে |
| **Admin API** | সব route এ `requireUser()` আছে |
| **Customer data** | Order detail এ customerId চেক – IDOR নেই |
| **Rate limiting** | Login, registration, order এ rate limit |
| **Database** | Prisma – parameterized queries, SQL injection ঝুঁকি ন্যূনতম |
| **Input validation** | Zod দিয়ে API body validate |
| **CORS** | Allowed origins সংজ্ঞায়িত; STOREFRONT_ORIGIN env |
| **File upload** | Size limit, MIME check, magic bytes validation |
| **XSS (admin preview)** | DOMPurify দিয়ে sanitize |
| **Credentials** | Script এ hardcoded credentials নেই |

### ⚠️ জানা সীমাবদ্ধতা / সুপারিশ

| বিষয় | বর্ণনা |
|-------|--------|
| **Role-based access** | role ফিল্ড আছে কিন্তু API তে চেক হয় না; সব admin সমান একসেস পায়। একাধিক admin থাকলে ভবিষ্যতে RBAC যোগ করা যেতে পারে |
| **স্টোরফ্রন্ট page content** | API raw HTML রিটার্ন করে। স্টোরফ্রন্টে দেখানোর সময় storefront কোডে HTML sanitize করার পরামর্শ |
| **Upstash Redis** | Rate limit এখন in-memory। ভারী ট্রাফিকে shared state এর জন্য Redis ব্যবহার করা যেতে পারে |

---

## চেকলিস্ট – প্রোডাকশন ডিপ্লয়

### বাধ্যতামূলক

- [ ] `DATABASE_URL` সেট (MySQL connection string)
- [ ] `AUTH_SECRET` সেট (নিজে generate; `openssl rand -base64 32`)
- [ ] `AUTH_SECRET` "change-me" বা টেমপ্লেট মান না
- [ ] স্ক্রিপ্টে কোনো credentials hardcode নেই
- [ ] Reverse proxy (Vercel/Cloudflare/Nginx) real client IP `x-forwarded-for` / `x-real-ip` এ সেট করছে
- [ ] HTTPS চালু

### নতুন (২০২৬ অডিট – সম্পন্ন)

- [x] Order tracking API – email verification + rate limit
- [x] `/api/debug-log` – প্রোডাকশনে 404
- [x] `/api/search/log` – rate limit ৬০/মিনিট
- [x] Page/Product content – sanitize-html সার্ভার-সাইড
- [ ] `.env` কখনো Git এ commit করবেন না (মানুসরি চেক)

---

## পরীক্ষা ফলাফল

- **Unit tests:** 13/13 পাস
- **Build:** সফল
- **Lint:** কোনো নতুন ইস্যু নেই

---

## সংশ্লিষ্ট নথি

- [SECURITY.md](./SECURITY.md) – সাধারণ সিকিউরিটি মডেল ও API
- [SECURE-CONNECTION.md](./SECURE-CONNECTION.md) – HTTPS ও সুরক্ষিত সংযোগ
