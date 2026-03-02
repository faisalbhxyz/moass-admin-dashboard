# স্টোরফ্রন্টে পলিসি, টার্মস ও রিটার্ন পলিসি পেজ কানেক্ট করা

অ্যাডমিন ড্যাশবোর্ডের **Pages** সেকশনে যে কন্টেন্ট পেজগুলো এডিট করা হয় (Privacy Policy, Terms & Conditions, Return Policy ইত্যাদি), স্টোরফ্রন্টে কিভাবে API দিয়ে নিয়ে একই ডিজাইনে দেখাবেন তার গাইড।

**স্টোরফ্রন্ট টিমের জন্য আলাদা সংক্ষিপ্ত ডক:** [STOREFRONT-PAGES.md](STOREFRONT-PAGES.md) – শুধু স্টোরফ্রন্ট সেটআপ, রাউট ও কোড উদাহরণ (কপি-পেস্ট রেডি).

**মেইন API ডক:** [STOREFRONT-API.md](STOREFRONT-API.md) – বেস URL, সেটআপ, অন্যান্য এন্ডপয়েন্ট।

---

## গুরুত্বপূর্ণ: স্টোরফ্রন্টে আলাদা পেজ অ্যাড করার দরকার নেই

অ্যাডমিন **Menus**-এ **From page** দিয়ে যে পেজগুলো লিংক করবেন (যেমন Terms, Return Policy), সেই লিংকগুলোই `/page/[slug]` হয়ে যায়। স্টোরফ্রন্টে **শুধু একটা ডায়নামিক রাউট** বানান: `/page/[slug]`। ইউজার মেনু থেকে যে লিংকেই ক্লিক করুক (Terms, Policy, Return Policy), একই রাউট সেই slug দিয়ে API থেকে কন্টেন্ট নিয়ে দেখাবে। তাই স্টোরফ্রন্টে প্রতিটি পেজ আলাদা করে অ্যাড করার কোনো দরকার নেই — **মেনু থেকেই সব লিংক চলে আসে**।

---

## স্টোরফ্রন্টে পেজ কানেক্ট করার ধাপ (সংক্ষেপে)

### ধাপ ১: অ্যাডমিনে পেজ তৈরি করুন

- অ্যাডমিন ড্যাশবোর্ড → **Pages** (সাইডবারে)।
- **Add page** দিয়ে নতুন পেজ বানান (যেমন "Privacy Policy", "Terms & Conditions", "Return Policy")।
- **Slug** দিন URL-friendly (যেমন `privacy-policy`, `terms`, `return-policy`)।
- **Content** ফিল্ডে HTML লিখুন বা পেস্ট করুন। অ্যাডমিনে যে ডিজাইন প্রিভিউ দেখছেন, স্টোরফ্রন্টে API দিয়ে নিয়ে সেই একই HTML রেন্ডার করলে একই ডিজাইন দেখা যাবে।

### ধাপ ২: স্টোরফ্রন্ট প্রজেক্টে API বেস URL সেট করুন

```env
# .env.local বা .env (লোকাল)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# প্রোডাকশনে (অ্যাডমিন যেখানে হোস্ট)
NEXT_PUBLIC_API_BASE_URL=https://your-admin.vercel.app
```

অ্যাডমিন ও স্টোরফ্রন্ট একই ডোমেইনে থাকলে সেই ডোমেইন বেস URL। আলাদা ডোমেইনে থাকলে অ্যাডমিনের URL দিন।

### ধাপ ৩: CORS (স্টোরফ্রন্ট আলাদা ডোমেইনে থাকলে)

স্টোরফ্রন্ট যদি অ্যাডমিন থেকে **ভিন্ন অরিজিন** এ চলে:

- অ্যাডমিন সাইডে **Environment Variable** সেট করুন: `STOREFRONT_ORIGIN=https://your-store.com`
- একাধিক ডোমেইন দিতে চাইলে কমা দিয়ে দিন।

বিস্তারিত: [SECURE-CONNECTION.md](SECURE-CONNECTION.md)।

### ধাপ ৪: মেনু থেকেই লিংক আসে (অথবা পেজ লিস্ট API)

- **সাধারণত:** অ্যাডমিন **Menus**-এ **From page** দিয়ে পেজ অ্যাড করলে লিংক অটো `/page/[slug]` হয়ে যায়। স্টোরফ্রন্টে মেনু API (`GET /api/ecommerce/menus`) দিয়ে যে `items` আসে, সেখানেই ওই লিংকগুলো থাকবে — আলাদা করে পেজ লিস্ট নেওয়ার দরকার নেই।
- ফুটার/হেডারে শুধু মেনু রেন্ডার করলেই Terms, Policy ইত্যাদির লিংক দেখাবে। ক্লিক করলে `/page/terms`, `/page/return-policy` ইত্যাদিতে যাবে।
- ঐচ্ছিক: শুধু পেজ লিংক লিস্ট চাইলে **`GET {API_BASE}/api/ecommerce/pages`** দিয়ে নিতে পারেন। স্টোরফ্রন্টে একটাই ডায়নামিক রাউট বানান: **`/page/[slug]`** — সব পেজ এই রাউট দিয়েই খুলবে।

### ধাপ ৫: একটি পেজের কন্টেন্ট (HTML) নিয়ে রেন্ডার করুন

- একটি পেজের পুরো কন্টেন্ট (HTML সহ) পেতে: **`GET {API_BASE}/api/ecommerce/pages/[slug]`** কল করুন।
- রেসপন্সে `title` ও `content` (HTML স্ট্রিং) আসে। এই `content` স্টোরফ্রন্টে **যেমন আছে তেমন** রেন্ডার করলে অ্যাডমিনে যে ডিজাইন দেখাচ্ছে সেই একই ডিজাইন দেখা যাবে।

**রেন্ডার করার নিয়ম:** API থেকে যে HTML কোড আসে, সেটা যেন পেজে **HTML হিসেবে** রেন্ডার হয় (যেমন React-এ `dangerouslySetInnerHTML`, Vue-তে `v-html`)। প্লেইন টেক্সট হিসেবে দেখালে ট্যাগগুলো দেখা যাবে, ডিজাইন আসবে না।

---

## আলাদা পেজ কিভাবে দেখাবেন (সংক্ষেপে)

যেকোনো একটা পেজ (Terms, Privacy Policy, Return Policy ইত্যাদি) **আলাদা URL-এ** দেখাতে চাইলে নিচের মতো করবেন।

### ১. একটা ডায়নামিক রাউট বানান

একটা রাউট দিয়েই সব পেজ (যেকোনো slug) হ্যান্ডল হবে। প্রতিটি পেজের জন্য আলাদা ফাইল বানানোর দরকার নেই।

| ফ্রেমওয়ার্ক | রাউট ফাইল | URL উদাহরণ |
|--------------|------------|------------|
| Next.js (App Router) | `app/page/[slug]/page.tsx` | `/page/terms`, `/page/privacy-policy` |
| Next.js (Pages Router) | `pages/page/[slug].tsx` | একই |
| অন্য (React/Vue) | `/page/:slug` যেভাবে রাউট করা থাকে | একই |

### ২. সেই রাউটে API কল করে কন্টেন্ট নিয়ে রেন্ডার করুন

- URL থেকে **slug** নিন (যেমন `terms`, `privacy-policy`)।
- **`GET {API_BASE}/api/ecommerce/pages/{slug}`** কল করুন।
- রেসপন্সে `title` ও `content` (HTML) পাবেন। `content` কে পেজে **HTML হিসেবে** রেন্ডার করুন (নিচে কোড উদাহরণ আছে)।

### ৩. লিংক কোথায় দেবেন

- **মেনু:** অ্যাডমিন Menus-এ **From page** দিয়ে পেজ অ্যাড করলে লিংক অটো `/page/{slug}` হয়ে যায়। স্টোরফ্রন্টে মেনু রেন্ডার করলেই ওই লিংকগুলো চলে আসে।
- **যেকোনো জায়গা:** নিজে লিংক দিতে চাইলে `<Link href={/page/${slug}}>...</Link>` বা `<a href={/page/${slug}}>...</a>` দিন। slug মানে অ্যাডমিনে যে slug দিয়েছেন (যেমন `terms`, `return-policy`)।

এভাবে এক রাউটেই সব আলাদা পেজ দেখানো যাবে; আলাদা আলাদা পেজ কম্পোনেন্ট বানানোর দরকার নেই।

---

## ১. পেজ লিস্ট API (পাবলিক)

ফুটার/হেডারে লিংক লিস্ট বানানোর জন্য। **অথেন্টিকেশন লাগে না**।

| বিষয় | মান |
|-------|-----|
| **Method** | `GET` |
| **Path** | `/api/ecommerce/pages` |

### Response

একটি অ্যারে; প্রতিটি আইটেমে:

| ফিল্ড | টাইপ | বর্ণনা |
|-------|------|--------|
| `id` | string | পেজ আইডি |
| `slug` | string | URL slug (যেমন `terms`, `return-policy`) |
| `title` | string | পেজ শিরোনাম |

### Request উদাহরণ

```bash
curl "${API_BASE}/api/ecommerce/pages"
```

```javascript
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

const pages = await fetch(`${API_BASE}/api/ecommerce/pages`).then((r) => r.json());
// pages = [{ id: "...", slug: "terms", title: "Terms & Conditions" }, ...]
```

---

## ২. সিঙ্গেল পেজ API (পাবলিক) – HTML কন্টেন্ট

একটি পেজের পুরো কন্টেন্ট (HTML সহ) পেতে। **অথেন্টিকেশন লাগে না**।

| বিষয় | মান |
|-------|-----|
| **Method** | `GET` |
| **Path** | `/api/ecommerce/pages/[slug]` |

উদাহরণ: `GET /api/ecommerce/pages/terms` → slug যেটা অ্যাডমিনে দিয়েছেন (যেমন `terms`, `privacy-policy`)।

### Response

| ফিল্ড | টাইপ | বর্ণনা |
|-------|------|--------|
| `id` | string | পেজ আইডি |
| `slug` | string | URL slug |
| `title` | string | পেজ শিরোনাম |
| `content` | string | **HTML কন্টেন্ট** – স্টোরফ্রন্টে এই মানটা HTML হিসেবে রেন্ডার করলে অ্যাডমিনে যে ডিজাইন দেখাচ্ছে সেই একই ডিজাইন দেখা যাবে |
| `updatedAt` | string (ISO date) | শেষ আপডেট সময় |

### Request উদাহরণ

```bash
curl "${API_BASE}/api/ecommerce/pages/terms"
curl "${API_BASE}/api/ecommerce/pages/return-policy"
```

```javascript
const res = await fetch(`${API_BASE}/api/ecommerce/pages/terms`);
const page = await res.json();
// page.content = "<h1>Terms</h1><p>...</p>" – এইটা HTML হিসেবে রেন্ডার করুন
```

---

## ৩. স্টোরফ্রন্টে পেজ রাউট ও HTML রেন্ডার (আলাদা পেজ দেখানোর কোড)

আলাদা পেজ দেখাতে নিচের মতো একটা পেজ বানালেই হয়। Next.js App Router এর উদাহরণ:

```tsx
// app/page/[slug]/page.tsx
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await fetch(`${API_BASE}/api/ecommerce/pages/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) notFound();
  const page = await res.json();

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <h1 className="mb-6 text-2xl font-bold">{page.title}</h1>
      {/* একই HTML ডিজাইন দেখাতে content কে HTML হিসেবে রেন্ডার করুন */}
      <div
        className="prose prose-gray"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
```

**ফাইল পাথ:** `app/page/[slug]/page.tsx` রাখলে URL হবে `/page/terms`, `/page/privacy-policy` ইত্যাদি। একই ফাইলে যেকোনো slug দিয়ে আলাদা পেজ দেখাবে।

### ফুটারে লিংক (পেজ লিস্ট থেকে)

```tsx
const pages = await fetch(`${API_BASE}/api/ecommerce/pages`).then((r) => r.json());

// ফুটারে
pages.map((p) => (
  <Link key={p.id} href={`/page/${p.slug}`}>
    {p.title}
  </Link>
));
```

---

## ৪. সিকিউরিটি নোট (HTML কন্টেন্ট)

`content` শুধুমাত্র অ্যাডমিন থেকে এডিট হয়; পাবলিক ইউজার এডিট করতে পারে না। তবুও যদি ভবিষ্যতে ইউজার জেনারেটেড কন্টেন্ট রাখেন, তখন XSS এড়াতে স্যানিটাইজেশন ব্যবহার করুন (যেমন `DOMPurify`)। বর্তমানে অ্যাডমিন-কন্ট্রোলড HTML এর জন্য `dangerouslySetInnerHTML` / `v-html` ব্যবহার করা সাধারণত নিরাপদ।

---

## ৫. সংক্ষিপ্ত টেবিল

| কাজ | Method | Path |
|-----|--------|------|
| পেজ লিস্ট (slug, title) | GET | `/api/ecommerce/pages` |
| একটি পেজ (title + HTML content) | GET | `/api/ecommerce/pages/[slug]` |

স্টোরফ্রন্টে কানেক্ট করতে: বেস URL সেট করুন → `GET /api/ecommerce/pages` দিয়ে লিংক লিস্ট নিন → `GET /api/ecommerce/pages/[slug]` দিয়ে পেজ কন্টেন্ট নিয়ে সেই HTML পেজে রেন্ডার করুন।
