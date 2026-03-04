# সিকিউরিটি লেয়ার ও API এন্ডপয়েন্ট

এই ডকুমেন্টে অ্যাডমিন ড্যাশবোর্ডের সিকিউরিটি মডেল ও অথেন্টিকেশন-সম্পর্কিত API গুলো বর্ণনা করা হয়েছে।

---

## ১. সারাংশ

| দিক | বর্তমান অবস্থা |
|-----|-----------------|
| **অ্যাডমিন API** | সেশন কুকি দিয়ে প্রটেক্টেড; লগইন ছাড়া অ্যাক্সেস করা যায় না |
| **স্টোরফ্রন্ট (ecommerce) API** | পাবলিক; কোনো অথেন্টিকেশন নেই (ডিজাইন অনুযায়ী) |
| **অথেন্টিকেশন** | JWT সেশন কুকি (`ecomdash_session`), HTTP-only, SameSite=Lax |
| **মিডলওয়্যার** | নেই (প্রতিটি অ্যাডমিন রাউট নিজে `requireUser()` চালায়) |
| **রেট লিমিটিং** | হ্যাঁ – প্রতি IP প্রতি মিনিট: অ্যাডমিন লগইন ৩, কাস্টমার লগইন ৩, রেজিস্ট্রেশন ২, অর্ডার ৩ (ফ্রড প্রটেকশন) |
| **API কী (স্টোরফ্রন্ট)** | নেই |

---

## ২. কিভাবে প্রটেকশন কাজ করে

### অ্যাডমিন ড্যাশবোর্ড (পেজ)

- ড্যাশবোর্ডের প্রতিটি পেজে `getCurrentUser()` কল হয়; ইউজার না থাকলে **রিডাইরেক্ট** → `/auth/v2/login`।
- ড্যাশবোর্ড লেআউট সাইডবার দেখায়; লগইন চেক পেজ লেভেলে হয়।

### অ্যাডমিন API (`/api/admin/*` ও কিছু `/api/auth/*`)

- প্রতিটি রাউটে **`requireUser()`** ব্যবহার করা হয় (`src/lib/api-auth.ts`)।
- `requireUser()` ভিতরে `getCurrentUser()` চালায় → কুকি থেকে সেশন পড়ে → JWT ভেরিফাই করে → ইউজার ডিবি থেকে নিয়ে আসে।
- ইউজার না থাকলে **401 Unauthorized** + `{ "error": "Unauthorized" }` রিটার্ন হয়।
- ব্রাউজার একই অরিজিন থেকে ড্যাশবোর্ড ব্যবহার করলে কুকি অটোমেটিক যাবে; অন্য ডোমেইন/Postman থেকে অ্যাডমিন API কল করতে হলে সেশন কুকি দিতে হবে।

### স্টোরফ্রন্ট API (`/api/ecommerce/*`)

- **কোনো অথেন্টিকেশন নেই** – ডিজাইন অনুযায়ী পাবলিক।
- প্রোডাক্ট, ক্যাটাগরি, ব্যানার, শিপিং, কুপন ভ্যালিডেট, অর্ডার প্লেস – সব বিনা লগইনে কল করা যায়।
- **রেট লিমিটিং** (`src/lib/rate-limit.ts`): প্রতি IP প্রতি মিনিট লিমিট – লগইন ৩, রেজিস্ট্রেশন ২, অর্ডার প্লেস ৩। লিমিট অতিক্রম করলে 429 এবং বাংলা এরর মেসেজ।

---

## ৩. অথেন্টিকেশন রিলেটেড API এন্ডপয়েন্ট

এগুলো অ্যাডমিন/লগইন ফ্লোর জন্য।

| এন্ডপয়েন্ট | মেথড | অথেন্টিকেশন | বর্ণনা |
|-------------|--------|----------------|--------|
| `/api/auth/login` | POST | না (পাবলিক) | ইমেইল + পাসওয়ার্ড দিয়ে লগইন; সেশন কুকি সেট হয় |
| `/api/auth/register` | POST | — | **বন্ধ** (403); অ্যাডমিন রেজিস্ট্রেশন বন্ধ। নতুন অ্যাডমিন seed বা DB দিয়ে তৈরি করতে হবে |
| `/api/auth/logout` | POST | না | সেশন কুকি ডিলিট করে |
| `/api/auth/me` | GET | হ্যাঁ (`requireUser`) | বর্তমান লগড-ইন ইউজার রিটার্ন করে |
| `/api/auth/password` | POST | হ্যাঁ (`requireUser`) | পাসওয়ার্ড চেঞ্জ |
| `/api/upload` | POST | হ্যাঁ (`requireUser`) | ফাইল আপলোড (অ্যাডমিন); ১০MB লিমিট, শুধু ছবি, magic-bytes ভ্যালিডেশন |

### লগইন রিকোয়েস্ট উদাহরণ

```bash
POST /api/auth/login
Content-Type: application/json

{ "email": "admin@example.com", "password": "your-password" }
```

**সফল (200):** `{ "user": { "id": "...", "email": "...", "name": "...", "role": "admin" } }`  
**ব্যর্থ (401):** `{ "error": "Invalid email or password" }`

লগইন সফল হলে রেসপন্সের **Set-Cookie** হেডারে `ecomdash_session` (JWT) সেট হয়; পরবর্তী অ্যাডমিন API কলের সময় ব্রাউজার এই কুকি পাঠায়।

---

## ৪. প্রটেক্টেড (অ্যাডমিন) API এন্ডপয়েন্ট তালিকা

সবগুলোতে **`requireUser()`** আছে – সেশন কুকি ছাড়া 401।

- `GET/POST` `/api/admin/products`  
- `GET/PATCH/DELETE` `/api/admin/products/[id]`  
- `GET/POST` `/api/admin/categories`  
- `GET/PATCH/DELETE` `/api/admin/categories/[id]`  
- `GET/POST` `/api/admin/banners`  
- `GET/PATCH/DELETE` `/api/admin/banners/[id]`  
- `GET/POST` `/api/admin/coupons`  
- `GET/PATCH/DELETE` `/api/admin/coupons/[id]`  
- `GET` `/api/admin/orders`  
- `GET/PATCH` `/api/admin/orders/[id]`  
- `GET` `/api/admin/customers`  
- `GET/PATCH` `/api/admin/customers/[id]`  
- `GET` `/api/admin/inventory`  
- `PATCH` `/api/admin/inventory/[id]`  
- `GET/POST` `/api/admin/shipping`  
- `PATCH/DELETE` `/api/admin/shipping/[id]`  
- `GET` `/api/admin/dashboard`  
- `GET/PUT` `/api/admin/settings`  
- `GET` `/api/admin/reports/sales`  
- `GET` `/api/admin/reports/top-products`  
- `GET/PUT` `/api/admin/account`  
- `POST` `/api/upload`

---

## ৫. পাবলিক (স্টোরফ্রন্ট) API এন্ডপয়েন্ট

কোনো অথেন্টিকেশন নেই। এই API গুলোতে **কেবল পাবলিক, নন-সেনসিটিভ ডেটা** cache করা হয় (Cache-Control, unstable_cache)। অ্যাডমিন বা কাস্টমার-স্পেসিফিক ডেটা কখনো cache হয় না।

- `GET` `/api/ecommerce/bootstrap` (প্রথম লোড – settings, categories, banners, menus, payment_methods, shipping, pages)  
- `GET` `/api/ecommerce/products`  
- `GET` `/api/ecommerce/products/[id]`  
- `GET` `/api/ecommerce/categories`  
- `GET` `/api/ecommerce/banners`  
- `GET` `/api/ecommerce/shipping`  
- `POST` `/api/ecommerce/coupons/validate`  
- `POST` `/api/ecommerce/orders`  
- `GET` `/api/ecommerce/settings`  

বিস্তারিত: [STOREFRONT-API.md](STOREFRONT-API.md)

---

## ৬. সেশন ও সিক্রেট

- **কুকি নাম:** `ecomdash_session`  
- **কন্টেন্ট:** JWT (HS256), payload এ `sub` (user id), `email`।  
- **সেটিংস:** `httpOnly: true`, `secure: true` প্রোডে, `sameSite: "lax"`, ম্যাক্স এজ ৭ দিন।  
- **সিক্রেট:** `process.env.AUTH_SECRET`। প্রোডাকশনে সেট করা বাধ্যতামূলক (ডিফল্ট `"change-me"` থাকলে অ্যাপ এরর দেয়)।

---

## ৭. রেট লিমিটিং (প্রতি IP প্রতি মিনিট)

| এন্ডপয়েন্ট | লিমিট | উদ্দেশ্য |
|-------------|-------|----------|
| `/api/auth/login` | ৩ | ব্রুট ফোর্স প্রটেকশন |
| `/api/ecommerce/auth/login` | ৩ | ব্রুট ফোর্স প্রটেকশন |
| `/api/ecommerce/auth/register` | ২ | স্প্যাম অ্যাকাউন্ট ঠেকানো |
| `POST /api/ecommerce/orders` | ৩ | ফ্রড অর্ডার প্রটেকশন |
| `GET /api/ecommerce/orders/track` | ১০ | অর্ডার ট্র্যাক – enumeration ঠেকানো |
| `POST /api/search/log` | ৬০ | সার্চ লগ – টেবিল DoS ঠেকানো |

লিমিট অতিক্রম করলে 429 + `{ "error": "বহুবার চেষ্টা করা হয়েছে। কয়েক মিনিট পরে আবার চেষ্টা করুন।" }`। ইন-মেমরি স্টোর; প্রোডে ভারী ট্রাফিকে Upstash Redis যোগ করা যেতে পারে।

**রেট লিমিট IP সোর্স:** `x-forwarded-for` / `x-real-ip` হেডার থেকে IP নেওয়া হয়। প্রোডে reverse proxy (Nginx, Cloudflare, Vercel) নিশ্চিত করুন যে real client IP সেট করে; না হলে আক্রমণকারী fake header দিয়ে লিমিট বাইপাস করতে পারে। Vercel/Cloudflare ডিফল্টে সঠিকভাবে সেট করে।

---

## ৭.১. ফাইল আপলোড সিকিউরিটি

- **সাইজ লিমিট:** সর্বোচ্চ ১০MB  
- **অনুমোদিত ফরম্যাট:** JPEG, PNG, WebP, GIF  
- **ভ্যালিডেশন:** Magic bytes (ফাইলের প্রকৃত কন্টেন্ট) দিয়ে চেক করা হয়; শুধু `Content-Type` হেডারে নির্ভর করা হয় না।

---

## ৭.২. XSS প্রটেকশন

- অ্যাডমিন পেজ এডিটরের প্রিভিউতে `DOMPurify` দিয়ে HTML sanitize করা হয়।  
- **সার্ভার-সাইড:** Page ও Product content সংরক্ষণের সময় `sanitize-html` দিয়ে sanitize করা হয় (`src/lib/sanitize-html.ts`)।  
- স্টোরফ্রন্টে page content দেখানোর সময়ও HTML sanitize করার পরামর্শ দেওয়া হয় (স্টোরফ্রন্ট কোডে)।

---

## ৮. ক্রেডেনশিয়াল সিকিউরিটি

- **কখনোই** `DATABASE_URL` বা `AUTH_SECRET` স্ক্রিপ্টে (যেমন `deploy-remote-full.sh`) হার্ডকোড করবেন না।  
- `.env` ফাইল `.gitignore` এ আছে; `.env.example` শুধু টেমপ্লেট।  
- Deploy স্ক্রিপ্ট `.env` না থাকলে exit করবে এবং ব্যবহারকারীকে ম্যানুয়ালি তৈরি করতে বলবে।

---

## ৯. যা এখন নেই (পরবর্তীতে যোগ করা যেতে পারে)

- **স্টোরফ্রন্ট API কী:** স্টোরফ্রন্ট থেকে অর্ডার/প্রোডাক্ট API কল করতে আলাদা API কী লাগে না।  
- **গ্লোবাল মিডলওয়্যার:** Next.js `middleware.ts` দিয়ে অ্যাডমিন রাউট ব্লক করা হয় না; প্রতিটি রাউট নিজে `requireUser()` ব্যবহার করে।  
- **Role-based অ্যাক্সেস:** ইউজার টেবিলে `role` ফিল্ড আছে, কিন্তু API তে রোল চেক করা হয় না – যে কেউ লগইন করলে সব অ্যাডমিন API একসেস পায়।

এই ডকুমেন্ট দিয়ে বোঝা যাবে অ্যাপে সিকিউরিটি লেয়ার কোথায় আছে এবং অথেন্টিকেশন রিলেটেড API এন্ডপয়েন্টগুলো কী।

**অ্যাডমিন ও স্টোরফ্রন্ট সুরক্ষিত সংযোগ:** [SECURE-CONNECTION.md](SECURE-CONNECTION.md)
