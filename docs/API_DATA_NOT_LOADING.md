# API থেকে ডেটা লোড হচ্ছে না – ট্রাবলশুটিং

স্টোরফ্রন্টে যদি এই মেসেজ দেখেন:

**"Failed to load data from API. Check NEXT_PUBLIC_API_BASE_URL in .env.local, that the API site is running, and CORS is set on the admin."**

তাহলে নিচের স্টেপগুলো **অর্ডার অনুযায়ী** চেক করুন।

---

## ১. স্টোরফ্রন্ট প্রজেক্টে – `NEXT_PUBLIC_API_BASE_URL`

স্টোরফ্রন্ট যে প্রজেক্টে চালাচ্ছেন (যেখানে এই এরর দেখাচ্ছে), সেখানে **`.env.local`** (বা `.env`) ফাইলে অ্যাডমিন API-র বেস URL থাকতে হবে।

| পরিবেশ | মান |
|--------|-----|
| লোকাল (অ্যাডমিনও localhost এ) | `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000` |
| প্রোড (অ্যাডমিন আলাদা ডোমেইনে) | `NEXT_PUBLIC_API_BASE_URL=https://your-admin-domain.com` |

- ভেরিয়েবলের নাম **ঠিক** `NEXT_PUBLIC_API_BASE_URL` হতে হবে (কপি-পেস্ট করুন)।
- URL-এর শেষে **`/`** দেবেন না। উদাহরণ: `http://localhost:3000` ঠিক আছে, `http://localhost:3000/` এড়িয়ে চলুন।
- পরিবর্তন করার পর স্টোরফ্রন্ট অ্যাপ **রিস্টার্ট** করুন (Next.js env একবার বিল্ড টাইমে লোড হয়)।

---

## ২. অ্যাডমিন ড্যাশবোর্ড (API সাইট) চালু আছে কিনা

অ্যাডমিন প্রজেক্ট (এই MOASS Admin Dashboard) চালু থাকতে হবে, নাহলে স্টোরফ্রন্ট API কল করতে পারবে না।

- **লোকাল:** টার্মিনালে `npm run dev` চালু থাকলে সাধারণত `http://localhost:3000` এ অ্যাডমিন চলে।
- ব্রাউজারে সরাসরি খুলে চেক করুন: `http://localhost:3000/api/ecommerce/categories` (অথবা আপনার অ্যাডমিন বেস URL + `/api/ecommerce/categories`)। এখানে JSON (ক্যাটাগরি লিস্ট বা `[]`) আসা উচিত।

যদি এই URL এ **কোনো রেসপন্স না আসে** বা **connection error** আসে, তাহলে আগে অ্যাডমিন অ্যাপ চালু করুন এবং ডাটাবেস (Prisma) সেট আপ আছে কিনা দেখুন।

---

## ৩. অ্যাডমিনে CORS সেট আছে কিনা

স্টোরফ্রন্ট যখন **অ্যাডমিন থেকে আলাদা অরিজিন** (যেমন স্টোর `localhost:3001`, অ্যাডমিন `localhost:3000`) থেকে API কল করে, ব্রাউজার **CORS** চেক করে। অ্যাডমিনে CORS হেডার না থাকলে ব্রাউজার রেসপন্স ব্লক করে – তাই স্টোরফ্রন্টে “Failed to load data” দেখা যায়।

### এই অ্যাডমিন প্রজেক্টে যা করা আছে

- **`src/proxy.ts`** – এখানে CORS লজিক আছে (`/api/ecommerce`, `/api/image`, `/api/banner-image` এর জন্য)।
- **`src/middleware.ts`** – এই ফাইল **অবশ্যই থাকতে হবে**। এটা `proxy` কে Next.js middleware হিসেবে চালায়। `middleware.ts` না থাকলে CORS হেডার সেট হয় না।

চেক করুন:

1. **`src/middleware.ts`** ফাইল আছে কিনা এবং ভিতরে `proxy` ইম্পোর্ট করে default export করা আছে কিনা।
2. অ্যাডমিন রিপোতে লোকাল ডেভের জন্য **কিছু অতিরিক্ত সেটআপ লাগে না** – `proxy` ইতিমধ্যে `http://localhost:3000`, `http://localhost:3001`, `http://127.0.0.1:3000`, `http://127.0.0.1:3001` অলাউ করে।
3. **প্রোড:** অ্যাডমিন যেখানে ডিপ্লয় (যেমন Vercel), সেখানে env এ **`STOREFRONT_ORIGIN`** সেট করুন = স্টোরফ্রন্ট সাইটের ঠিক URL (প্রোটোকল সহ)। উদাহরণ: `STOREFRONT_ORIGIN=https://your-store.vercel.app`

বিস্তারিত: [docs/LOCAL-CORS-FIX.md](LOCAL-CORS-FIX.md)

---

## ৪. স্টোরফ্রন্ট সঠিক API পাথ ব্যবহার করছে কিনা

স্টোরফ্রন্টে শুধুমাত্র **পাবলিক ইকমার্স API** ব্যবহার করুন। অ্যাডমিন API (লগইন লাগে) স্টোরফ্রন্টে ব্যবহার করবেন না।

| কাজ | সঠিক পাথ (স্টোরফ্রন্টে ব্যবহার করুন) |
|-----|----------------------------------------|
| প্রোডাক্ট লিস্ট | `GET /api/ecommerce/products` |
| ক্যাটাগরি | `GET /api/ecommerce/categories` |
| ব্যানার | `GET /api/ecommerce/banners` |
| সেটিংস | `GET /api/ecommerce/settings` |

**ভুল উদাহরণ:** `/api/admin/categories` – এটা অ্যাডমিনের জন্য, অথেনটিকেশন চায়; স্টোরফ্রন্টে ব্যবহার করলে 401/403 বা রিডাইরেক্ট হতে পারে।

সম্পূর্ণ লিস্ট: [docs/STOREFRONT-API.md](STOREFRONT-API.md)

---

## ৫. ব্রাউজার কনসোলে কী এরর দেখাচ্ছে

স্টোরফ্রন্ট পেজ খুলে **Developer Tools → Console** এবং **Network** ট্যাব দেখুন:

- **CORS error** (লাল মেসেজে “Access-Control-Allow-Origin” বা “CORS” থাকতে পারে) → অ্যাডমিনে CORS চেক করুন (স্টেপ ৩) এবং নিশ্চিত করুন `src/middleware.ts` আছে।
- **Failed to fetch / net::ERR_CONNECTION_REFUSED** → অ্যাডমিন অ্যাপ চালু নেই বা `NEXT_PUBLIC_API_BASE_URL` ভুল (স্টেপ ১ ও ২)।
- **404** → API পাথ ভুল (স্টেপ ৪)।

---

## সংক্ষেপে চেকলিস্ট

| # | জায়গা | চেক |
|---|--------|-----|
| ১ | স্টোরফ্রন্ট `.env.local` | `NEXT_PUBLIC_API_BASE_URL` সেট, শেষে `/` নেই, রিস্টার্ট দিয়েছেন |
| ২ | অ্যাডমিন অ্যাপ | চালু আছে, ব্রাউজারে `/api/ecommerce/categories` এ রেসপন্স আসে |
| ৩ | অ্যাডমিন রিপো | `src/middleware.ts` আছে; প্রোডে `STOREFRONT_ORIGIN` সেট |
| ৪ | স্টোরফ্রন্ট কোড | শুধু `/api/ecommerce/...` পাথ ব্যবহার করা হচ্ছে |

এর পরও সমস্যা থাকলে ব্রাউজার কনসোলে/নেটওয়ার্ক ট্যাবে যে এরর বা স্ট্যাটাস কোড দেখাচ্ছে সেটা নোট করে [docs/STOREFRONT-API.md](STOREFRONT-API.md) ও [docs/README.md](README.md) দেখুন।
