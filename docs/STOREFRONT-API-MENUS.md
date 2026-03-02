# স্টোরফ্রন্টে ফুটার/হেডার মেনু দেখানো

অ্যাডমিন ড্যাশবোর্ডের **Menus** পেজে যে মেনু গ্রুপ ও লিংকগুলো কনফিগার করা হয় (যেমন CATEGORY, QUICK LINKS), স্টোরফ্রন্টে ফুটার বা হেডারে সেগুলো কিভাবে ফেচ করে দেখাবেন তার গাইড।

**মেইন API ডক:** [STOREFRONT-API.md](STOREFRONT-API.md) – বেস URL, সেটআপ, অন্যান্য এন্ডপয়েন্ট।

---

## স্টোরফ্রন্টে মেনু কানেক্ট করার ধাপ (সংক্ষেপে)

নিচের ধাপগুলো অনুসরণ করলে অ্যাডমিনের মেনু স্টোরফ্রন্টে চালু করা যাবে।

### ধাপ ১: অ্যাডমিনে মেনু কনফিগার করুন

- অ্যাডমিন ড্যাশবোর্ড → **Menus** (Footer & Header Menus)।
- **Add menu group** দিয়ে গ্রুপ বানান (যেমন "Quick Links", "CATEGORY")। Placement **footer** বা **header** দিন।
- প্রতিটি গ্রুপে **Add item** দিয়ে:
  - **From category** – ক্যাটাগরি সিলেক্ট করলে অটোভাবে লিংক `/categories/{slug}` ও ক্যাটাগরি নাম লেবেল হয়ে যাবে।
  - **Custom link** – নিজে লেবেল ও লিংক দিন (যেমন "Terms", `/terms`)।

### ধাপ ২: স্টোরফ্রন্ট প্রজেক্টে API বেস URL সেট করুন

স্টোরফ্রন্ট যে প্রজেক্টে বিল্ড করছেন (Next.js/React/Vue ইত্যাদি) সেখানে অ্যাডমিন/API-এর বেস URL রাখুন:

```env
# .env.local বা .env (লোকাল)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# প্রোডাকশনে (অ্যাডমিন যেখানে হোস্ট)
NEXT_PUBLIC_API_BASE_URL=https://your-admin.vercel.app
```

অ্যাডমিন ও স্টোরফ্রন্ট একই ডোমেইনে থাকলে (যেমন `https://store.com` ও `https://store.com/admin`) বেস URL হবে সেই ডোমেইন। আলাদা ডোমেইনে থাকলে প্রোডাকশন অ্যাডমিনের URL দিন।

### ধাপ ৩: CORS (স্টোরফ্রন্ট আলাদা ডোমেইনে থাকলে)

স্টোরফ্রন্ট যদি অ্যাডমিন থেকে **ভিন্ন অরিজিন** এ চলে (যেমন স্টোরফ্রন্ট `https://myshop.com`, অ্যাডমিন `https://admin.myshop.com`):

- অ্যাডমিন সাইডে (যেখানে এই ড্যাশবোর্ড ডিপ্লয়) **Environment Variable** সেট করুন:
  - `STOREFRONT_ORIGIN=https://myshop.com`
  - একাধিক ডোমেইন দিতে চাইলে কমা দিয়ে দিন: `https://myshop.com,https://www.myshop.com`

এটা না দিলে ব্রাউজার CORS এর কারণে মেনু API রিকোয়েস্ট ব্লক করতে পারে।

### ধাপ ৪: স্টোরফ্রন্টে ফুটার/হেডারে API কল ও রেন্ডার

- **ফুটার মেনু:** `GET {API_BASE}/api/ecommerce/menus?placement=footer` কল করে যে অ্যারে আসে, প্রতিটি এলিমেন্ট একটা **গ্রুপ** (কলাম)। প্রতিটি গ্রুপের `label` = হেডিং, `items` = লিংক লিস্ট (প্রতিটি আইটেমে `label`, `link`)।
- **হেডার মেনু:** একইভাবে `?placement=header` দিয়ে নিয়ে নেভ/ড্রপডাউনে রেন্ডার করুন।

নিচের সেকশনগুলোতে API স্পেক ও রিয়েক্ট কম্পোনেন্ট উদাহরণ দেওয়া আছে।

### ধাপ ৫: ক্যাটাগরি লিংক ও স্টোরফ্রন্ট রাউট

অ্যাডমিনে **From category** দিয়ে যে আইটেমগুলো যোগ করা হয়, তাদের `link` হয় **`/categories/{slug}`** (যেমন `/categories/electronics`)।

স্টোরফ্রন্টে এই পাথের জন্য একটা পেজ/রাউট থাকতে হবে যেখানে ওই `slug` দিয়ে প্রোডাক্ট লিস্ট বা ক্যাটাগরি পেজ দেখাবেন। উদাহরণ: Next.js এ `app/categories/[slug]/page.tsx` বা `pages/categories/[slug].js`। ক্যাটাগরি ডেটা পেতে `GET /api/ecommerce/categories` ব্যবহার করতে পারেন ([STOREFRONT-API.md](STOREFRONT-API.md) দেখুন)।

---

## ১. মেনু API (পাবলিক)

ফুটার/হেডার মেনু ডেটা পেতে এই API কল করুন। **অথেন্টিকেশন লাগে না**।

| বিষয় | মান |
|-------|-----|
| **Method** | `GET` |
| **Path** | `/api/ecommerce/menus` |

### Query Parameters (ঐচ্ছিক)

| Parameter | মান | বর্ণনা |
|-----------|-----|--------|
| `placement` | `footer` বা `header` | শুধু ফুটার মেনু চাইলে `?placement=footer`, শুধু হেডার চাইলে `?placement=header`। না দিলে সব মেনু গ্রুপ আসে। |

### Request উদাহরণ

```bash
# সব মেনু (ফুটার + হেডার)
curl "${API_BASE}/api/ecommerce/menus"

# শুধু ফুটার মেনু (ফুটার কম্পোনেন্টে ব্যবহার)
curl "${API_BASE}/api/ecommerce/menus?placement=footer"

# শুধু হেডার মেনু
curl "${API_BASE}/api/ecommerce/menus?placement=header"
```

```javascript
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

async function getMenus(placement) {
  const url = placement
    ? `${API_BASE}/api/ecommerce/menus?placement=${placement}`
    : `${API_BASE}/api/ecommerce/menus`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load menus");
  return res.json();
}

// ফুটারে ব্যবহার
const footerMenus = await getMenus("footer");

// হেডারে ব্যবহার
const headerMenus = await getMenus("header");
```

### Response (200)

মেনু **গ্রুপ** এর অ্যারে। প্রতিটি গ্রুপের ভেতরে সেই গ্রুপের **আইটেম** (লেবেল + লিংক) থাকে।

```json
[
  {
    "id": "clxx...",
    "key": "footer_category",
    "label": "CATEGORY",
    "placement": "footer",
    "sortOrder": 0,
    "items": []
  },
  {
    "id": "clxy...",
    "key": "footer_quick_links",
    "label": "QUICK LINKS",
    "placement": "footer",
    "sortOrder": 1,
    "items": [
      {
        "id": "clx1...",
        "menuGroupId": "clxy...",
        "label": "Terms & Conditions",
        "link": "/terms",
        "sortOrder": 0
      },
      {
        "id": "clx2...",
        "menuGroupId": "clxy...",
        "label": "Return & Refund Policy",
        "link": "/return-refund",
        "sortOrder": 1
      },
      {
        "id": "clx3...",
        "menuGroupId": "clxy...",
        "label": "Privacy Policy",
        "link": "/privacy",
        "sortOrder": 2
      },
      {
        "id": "clx4...",
        "menuGroupId": "clxy...",
        "label": "About Us",
        "link": "/about",
        "sortOrder": 3
      },
      {
        "id": "clx5...",
        "menuGroupId": "clxy...",
        "label": "Shipping Policy",
        "link": "/shipping",
        "sortOrder": 4
      },
      {
        "id": "clx6...",
        "menuGroupId": "clxy...",
        "label": "Blog",
        "link": "/blog",
        "sortOrder": 5
      }
    ]
  }
]
```

- **`label`** = গ্রুপের হেডিং (যেমন "CATEGORY", "QUICK LINKS")।
- **`items`** = সেই কলামের লিংকগুলো; প্রতিটি আইটেমে **`label`** (দেখানোর টেক্সট) ও **`link`** (URL বা পাথ)।

---

## ২. ফুটারে মেনু কিভাবে দেখাবেন

### ধারণা

- একবার `GET /api/ecommerce/menus?placement=footer` দিয়ে ডেটা নিন।
- প্রতিটি **গ্রুপ** = এক একটা কলাম; গ্রুপের **`label`** কলামের উপরের হেডিং, **`items`** দিয়ে নিচে লিংক লিস্ট।

### লেআউট (উদাহরণ)

আপনার ডিজাইনে যেমন – বামে "CATEGORY", ডানে "QUICK LINKS" – দুই কলাম:

```
┌─────────────────┬──────────────────────────────┐
│ CATEGORY        │ QUICK LINKS                   │
│                 │ Terms & Conditions            │
│ (খালি বা        │ Return & Refund Policy       │
│  ক্যাটাগরি       │ Privacy Policy               │
│  লিংক)          │ About Us                     │
│                 │ Shipping Policy               │
│                 │ Blog                          │
└─────────────────┴──────────────────────────────┘
```

### React/Next.js – ফুটার কম্পোনেন্ট উদাহরণ

```tsx
// components/Footer.tsx (বা layout/footer এ যেখানে ফুটার রেন্ডার করেন)
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

type MenuItem = {
  id: string;
  label: string;
  link: string;
  sortOrder: number;
};

type MenuGroup = {
  id: string;
  key: string;
  label: string;
  placement: string;
  sortOrder: number;
  items: MenuItem[];
};

export function Footer() {
  const [menus, setMenus] = useState<MenuGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/ecommerce/menus?placement=footer`);
        if (res.ok) {
          const data = await res.json();
          setMenus(data);
        }
      } catch (e) {
        console.error("Footer menus load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <footer className="...">Loading...</footer>;

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-6">
      <div className="mx-auto max-w-6xl flex flex-wrap gap-12">
        {menus.map((group) => (
          <div key={group.id} className="min-w-[160px]">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-4">
              {group.label}
            </h3>
            <ul className="space-y-2">
              {(group.items || []).map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.link}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            {(!group.items || group.items.length === 0) && (
              <p className="text-sm text-gray-500">—</p>
            )}
          </div>
        ))}
      </div>
    </footer>
  );
}
```

### লিংক হ্যান্ডলিং

- **`item.link`** অ্যাডমিনে যেভাবে সেভ করা হয়েছে সেভাবে আসে – রিলেটিভ পাথ (যেমন `/terms`, `/privacy`) বা বাহিরের URL (যেমন `https://example.com/blog`)।
- নেক্সট জেসিতে **রিলেটিভ পাথ** হলে `<Link href={item.link}>` দিলেই চলবে।
- বাহিরের সাইটের লিংক হলে `item.link` ইতিমধ্যে ফুল URL, তাই একই `<Link href={item.link}>` বা `<a href={item.link}>` ব্যবহার করুন।

---

## ৩. হেডারে মেনু দেখানো

হেডারে শুধু হেডার মেনু চাইলে একই API থেকে `placement=header` নিয়ে একই প্যাটার্নে রেন্ডার করুন।

```javascript
const res = await fetch(`${API_BASE}/api/ecommerce/menus?placement=header`);
const headerMenus = await res.json();
// headerMenus এর উপর map করে group.label + group.items দিয়ে ড্রপডাউন বা হরাইজন্টাল লিংক বানান
```

উদাহরণ (সংক্ষেপে):

```tsx
<nav className="flex gap-6">
  {headerMenus.map((group) => (
    <div key={group.id} className="relative group">
      <span className="text-sm font-medium">{group.label}</span>
      <ul className="absolute top-full left-0 mt-1 py-2 bg-white shadow-lg rounded min-w-[180px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
        {(group.items || []).map((item) => (
          <li key={item.id}>
            <Link href={item.link} className="block px-4 py-2 text-sm hover:bg-gray-50">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  ))}
</nav>
```

---

## ৪. সারাংশ

| কাজ | API | ব্যবহার |
|-----|-----|--------|
| ফুটার মেনু | `GET /api/ecommerce/menus?placement=footer` | ফুটার লেআউটে গ্রুপ অনুযায়ী কলাম + লিংক |
| হেডার মেনু | `GET /api/ecommerce/menus?placement=header` | হেডার নেভে গ্রুপ/ড্রপডাউন বা লিংক লিস্ট |
| সব মেনু | `GET /api/ecommerce/menus` | ফুটার ও হেডার একসাথে লোড করে ক্লায়েন্টে placement দিয়ে আলাদা করেও ব্যবহার করতে পারবেন |

অ্যাডমিনে Menus পেজে যা কনফিগার করবেন (গ্রুপ লেবেল + আইটেম লেবেল/লিংক), স্টোরফ্রন্টে ঠিক সেভাবেই এই API দিয়ে এসে দেখাতে পারবেন।
