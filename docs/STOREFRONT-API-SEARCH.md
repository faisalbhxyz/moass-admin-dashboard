# স্টোরফ্রন্ট: স্মার্ট সার্চ (ট্রেন্ডিং + হিস্ট্রি)

স্টোরফ্রন্টে সার্চ বক্সে দুইটা ফিচার যোগ করার স্পেক ও ব্যবহার পদ্ধতি:

1. **ট্রেন্ডিং নাও** – গ্লোবালি সবচেয়ে বেশি খোঁজা টার্ম (শেষ ৭ দিন, টপ ৯)
2. **আমার আগের খোঁজ** – লগইন ইউজারের DB হিস্ট্রি অথবা গেস্টের `localStorage` হিস্ট্রি

এই ডক পড়ে আপনি স্টোরফ্রন্টে কীভাবে API কল করবেন এবং UI কীভাবে বানাবেন সেটা পারবেন।

---

## বেস URL ও credentials

অন্য কাস্টমার API এর মতোই:

| পরিবেশ | Base URL |
|--------|----------|
| লোকাল | `http://localhost:3000` (অথবা অ্যাডমিন যে পোর্টে চালাচ্ছেন) |
| প্রোডাকশন | `https://your-admin-domain.com` |

```env
NEXT_PUBLIC_API_BASE_URL=https://admin.yourstore.com
```

- **ট্রেন্ডিং ও লগ:** পাবলিক/অপশনাল অথেন্টিকেশন – কুকি না দিলেও কাজ করবে।
- **হিস্ট্রি দেখা/ডিলিট:** কাস্টমার লগইন থাকতে হবে। তাই **GET/DELETE `/api/search/history`** কল করার সময় `credentials: "include"` দিতে হবে।

---

## API এন্ডপয়েন্ট

### ১. ট্রেন্ডিং সার্চ (টপ ৯)

| Method | Path | অথেন্টিকেশন |
|--------|------|----------------|
| GET | `/api/search/trending` | লাগে না |

সার্ভারে শেষ ৭ দিনের ডেটা থেকে সবচেয়ে বেশি খোঁজা ৯টা কুয়েরি রিটার্ন করে। রেজাল্ট ১০ মিনিট ক্যাশ করা থাকে।

**সফল (200):**
```json
{
  "trending": ["শার্ট", "জিন্স", "মোবাইল", ...]
}
```

**ব্যর্থ (500):** `{ "error": "Failed to load trending searches" }`

---

### ২. আমার সার্চ হিস্ট্রি (লগইন ইউজার)

| Method | Path | অথেন্টিকেশন |
|--------|------|----------------|
| GET | `/api/search/history` | **কাস্টমার সেশন লাগে** |

লগইন করা কাস্টমারের শেষ ৮টা ইউনিক সার্চ, নতুন থেকে পুরনো।

**সফল (200):**
```json
{
  "history": [
    { "query": "শার্ট", "searchedAt": "2025-03-02T10:30:00.000Z" },
    { "query": "জিন্স", "searchedAt": "2025-03-01T14:00:00.000Z" }
  ]
}
```

**ব্যর্থ (401):** `{ "error": "লগইন করা নেই।" }`  
**ব্যর্থ (500):** `{ "error": "Failed to load search history" }`

---

### ৩. সার্চ লগ করা (সার্চ সাবমিটের সময়)

| Method | Path | অথেন্টিকেশন |
|--------|------|----------------|
| POST | `/api/search/log` | অপশনাল (লগইন থাকলে ইউজার হিস্ট্রিতেও সেভ হয়) |

ইউজার যখন একটা সার্চ সাবমিট করে (Enter বা সাজেশন ক্লিক), তখন এই API একবার কল করুন। সব সার্চ `search_logs` এ যায়; লগইন থাকলে `user_search_history` এও আপডেট হয় (ডুপ্লিকেট হলে শুধু `searchedAt` আপডেট)।

**Body (JSON):**
```json
{
  "query": "শার্ট"
}
```

**সফল (200):** `{ "ok": true }`

**ব্যর্থ (400):** `{ "error": "Invalid query" }` – খালি বা অনেক বড় স্ট্রিং  
**ব্যর্থ (500):** `{ "error": "Failed to log search" }`

---

### ৪. হিস্ট্রি ক্লিয়ার করা

| Method | Path | অথেন্টিকেশন |
|--------|------|----------------|
| DELETE | `/api/search/history` | **কাস্টমার সেশন লাগে** |
| DELETE | `/api/search/history?query=শার্ট` | **কাস্টমার সেশন লাগে** |

- **কুয়েরি ছাড়া:** ওই ইউজারের সব হিস্ট্রি ডিলিট।
- **`?query=...` দিলে:** শুধু ওই কুয়েরির একটা এন্ট্রি ডিলিট।

**সফল (200):** `{ "ok": true }`  
**ব্যর্থ (401):** `{ "error": "লগইন করা নেই।" }`

---

## স্টোরফ্রন্টে কীভাবে করবেন

### ধাপ ১: ডাটাবেজ চেক

অ্যাডমিন সাইটের ডাটাবেজে টেবিল দুটো থাকতে হবে:

- `search_logs` – ট্রেন্ডিং এর জন্য
- `user_search_history` – লগইন ইউজার হিস্ট্রির জন্য

যদি আগে মাইগ্রেট/স্ক্রিপ্ট রান না করে থাকেন তাহলে `scripts/mysql-search-tables.sql` রান করুন, তারপর `npx prisma generate`।

---

### ধাপ ২: লজিক সিদ্ধান্ত

| ইউজার | “আমার আগের খোঁজ” ডেটা কোথায় | ক্লিয়ার করলে |
|--------|------------------------------|----------------|
| **লগইন** | GET `/api/search/history` | DELETE `/api/search/history` |
| **গেস্ট** | `localStorage` key: `searchHistory` (array of strings) | `localStorage.removeItem('searchHistory')` |

গেস্টের হিস্ট্রি সেভ করার নিয়ম (সার্চ সাবমিটের পর):

```ts
const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
const updated = [query, ...history.filter((q) => q !== query)].slice(0, 8);
localStorage.setItem("searchHistory", JSON.stringify(updated));
```

---

### ধাপ ৩: UI ফ্লো

1. **সার্চ বক্সে ফোকাস** → ড্রপডাউন দেখান:
   - সেকশন ১: **আমার আগের খোঁজ**  
     - লগইন: GET `/api/search/history`  
     - গেস্ট: `localStorage.getItem('searchHistory')` পার্স করে অ্যারেটা দেখান  
     - আইটেম: 🕐 ক্লক আইকন + কুয়েরি টেক্সট + ✕ (সিঙ্গেল ডিলিট)
   - সেকশন ২: **Trending Now**  
     - GET `/api/search/trending` (একবার লোড করে স্টেটে রাখতে পারেন)  
     - আইটেম: 🔍 সার্চ আইকন + কুয়েরি টেক্সট (পিল/চিপ বাটন)

2. **টাইপ করলে** → দুই সেকশনই টাইপ করা টেক্সট দিয়ে ক্লায়েন্ট সাইডে ফিল্টার করুন।

3. **সার্চ সাবমিট (Enter অথবা সাজেশন ক্লিক)**  
   - POST `/api/search/log` body `{ query }`  
   - গেস্ট হলে উপরের নিয়মে `localStorage` আপডেট  
   - তারপর আপনার বর্তমান সার্চ লজিক চালান (যেমন সার্চ পেজে রিডাইরেক্ট)।

4. **ড্রপডাউন বন্ধ** → বাইরে ক্লিক অথবা ESC।

5. **Clear History বাটন**  
   - লগইন: DELETE `/api/search/history`  
   - গেস্ট: `localStorage.removeItem('searchHistory')`  
   - তারপর ড্রপডাউনের হিস্ট্রি সেকশন আপডেট/খালি করুন।

লিমিট: হিস্ট্রি সর্বোচ্চ ৮, ট্রেন্ডিং সর্বোচ্চ ৯।

---

### ধাপ ৪: অ্যাডমিন রিপোতে থাকা কম্পোনেন্ট ব্যবহার (যদি একই রিপো)

যদি স্টোরফ্রন্ট এই অ্যাডমিন ড্যাশবোর্ড রিপোর ভেতরেই থাকে, তাহলে সরাসরি `SearchDropdown` ব্যবহার করতে পারবেন:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchDropdown } from "@/components/SearchDropdown";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export function HeaderSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");

  return (
    <SearchDropdown
      value={value}
      onChange={setValue}
      onSubmit={(query) => {
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }}
      placeholder="পণ্য খুঁজুন..."
      apiBase={API_BASE}
    />
  );
}
```

- **একই অরিজিন:** `apiBase` খালি রাখলেই হবে।
- **স্টোরফ্রন্ট আলাদা ডোমেইনে:** `apiBase` এ অ্যাডমিন সাইটের বেস URL দিন; CORS ও কাস্টমার সেশন কুকি সেটআপ থাকতে হবে।

---

### ধাপ ৫: আলাদা স্টোরফ্রন্ট প্রজেক্টে (কম্পোনেন্ট নেই)

যদি স্টোরফ্রন্ট সম্পূর্ণ আলাদা রিপো হয়:

1. উপরের API গুলো দিয়ে নিজের কম্পোনেন্ট বানান, অথবা
2. এই রিপো থেকে `src/components/SearchDropdown.tsx` কপি করে নিজের প্রজেক্টে নিন এবং ইমপোর্ট পাথ ঠিক করুন।

API কল ও `localStorage` লজিক উপরের স্পেক অনুযায়ী রাখুন।

---

## সংক্ষিপ্ত এন্ডপয়েন্ট তালিকা (সার্চ)

| কাজ | Method | Path | অথেন্টিকেশন |
|-----|--------|------|----------------|
| ট্রেন্ডিং (টপ ৯) | GET | `/api/search/trending` | লাগে না |
| আমার হিস্ট্রি | GET | `/api/search/history` | কাস্টমার সেশন |
| সার্চ লগ | POST | `/api/search/log` | অপশনাল |
| হিস্ট্রি ক্লিয়ার (সব) | DELETE | `/api/search/history` | কাস্টমার সেশন |
| একটা হিস্ট্রি ডিলিট | DELETE | `/api/search/history?query=...` | কাস্টমার সেশন |

হিস্ট্রি সম্পর্কিত GET/DELETE কল **credentials: "include"** দিয়ে করুন।
