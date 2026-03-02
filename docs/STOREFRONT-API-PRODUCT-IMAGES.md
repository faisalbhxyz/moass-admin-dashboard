# প্রোডাক্ট ইমেজ API (স্টোরফ্রন্ট)

স্টোরফ্রন্টে প্রোডাক্ট ইমেজ দেখানোর জন্য শুধু এই অংশটা ব্যবহার করুন। বাকি API ইতিমধ্যে কানেক্ট থাকলে কেবল ইমেজ ফিল্ড ও ইমেজ URL বানানোর নিয়ম মানলেই হবে।

---

## ১. প্রোডাক্টে ইমেজ কোথায় পাবেন

কোনো আলাদা “প্রোডাক্ট ইমেজ API” নেই। ইমেজ **প্রোডাক্ট লিস্ট ও সিঙ্গেল প্রোডাক্ট** রেসপন্সের ভেতরেই আসে।

| API | পাথ | ইমেজ ফিল্ড |
|-----|-----|-------------|
| প্রোডাক্ট লিস্ট | `GET /api/ecommerce/products` | প্রতিটি প্রোডাক্টে `images` |
| সিঙ্গেল প্রোডাক্ট | `GET /api/ecommerce/products/[id]` | প্রোডাক্ট অবজেক্টে `images` |

---

## ২. `images` ফিল্ডের ফরম্যাট

| ফিল্ড | টাইপ | বর্ণনা |
|-------|------|--------|
| `images` | string | একাধিক URL **কমা দিয়ে** জড়ানো (comma-separated)। ফাঁকা বা null হতে পারে। |

উদাহরণ রেসপন্স:

```json
{
  "id": "clxx...",
  "name": "Product Name",
  "images": "/api/image/clxx111,/api/image/clxx222",
  ...
}
```

অন্য উদাহরণ (পাবলিক আপলোড ফোল্ডার ব্যবহার করলে):

```json
"images": "/uploads/1709123456-abc12.jpg"
```

- একটির বেশি ইমেজ থাকলে: `"url1,url2,url3"`
- ইমেজ না থাকলে: `""` বা `null`

---

## ৩. স্টোরফ্রন্টে ইমেজ URL বানানো (জরুরি)

API থেকে যে মান আসে সেটা **অ্যাডমিন সাইটের রিলেটিভ পাথ** (যেমন `/api/image/xyz` বা `/uploads/foo.jpg`)।  
স্টোরফ্রন্ট **আলাদা ডোমেইনে** থাকলে (যেমন `https://shop.com`), `<img src="/api/image/xyz">` দিলে ব্রাউজার `https://shop.com/api/image/xyz` হিট করবে — সেখানে ইমেজ নেই, তাই **ইমেজ দেখাবে না**।

তাই প্রতিটি ইমেজ পাথের সামনে **অ্যাডমিন/API-র বেস URL** যোগ করতে হবে।

### বেস URL

একই env যেটা বাকি API-তে ব্যবহার করছেন:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-admin-domain.com
```

লোকাল অ্যাডমিনের জন্য: `http://localhost:3000`

### ফুল ইমেজ URL বানানোর নিয়ম

1. `images` string টা কমা দিয়ে স্প্লিট করুন → অ্যারে।
2. প্রতিটি আইটেম যেটা রিলেটিভ পাথ (যা `/` দিয়ে শুরু) সেটার আগে `API_BASE` যোগ করুন।

জাভাস্ক্রিপ্ট উদাহরণ:

```javascript
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

function getProductImageUrls(imagesString) {
  if (!imagesString || !imagesString.trim()) return [];
  return imagesString.split(",").map((url) => {
    const trimmed = url.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("http")) return trimmed;
    return `${API_BASE}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
  });
}

// ব্যবহার
const product = await apiGet("/api/ecommerce/products/123");
const imageUrls = getProductImageUrls(product.images);
// প্রথম ইমেজ
<img src={imageUrls[0]} alt={product.name} />
// সব ইমেজ (গ্যালারি)
imageUrls.map((src) => <img key={src} src={src} alt="" />);
```

React/Next.js উদাহরণ:

```tsx
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function ProductImage({ product }: { product: { images: string | null; name: string } }) {
  const urls = product.images
    ? product.images.split(",").map((u) => u.trim()).filter(Boolean)
    : [];
  const fullUrls = urls.map((u) => (u.startsWith("http") ? u : `${API_BASE}${u.startsWith("/") ? "" : "/"}${u}`));
  const main = fullUrls[0];
  if (!main) return <div className="no-image">No image</div>;
  return <img src={main} alt={product.name} />;
}
```

---

## ৪. ইমেজ সার্ভ API (ব্রাউজার যেটা হিট করে)

প্রোডাক্টের `images` স্ট্রিং-এ যে পাথগুলো থাকে (যেমন `/api/image/clxx...`) সেগুলোই ব্রাউজার রিকোয়েস্ট করে। সেই রিকোয়েস্ট যেখানে হ্যান্ডল হয়:

| বিষয় | মান |
|-------|-----|
| Method | `GET` |
| Path | `/api/image/[id]` |
| অথেন্টিকেশন | লাগে না (পাবলিক) |

`[id]` = ডাটাবেইসের StoredImage আইডি (প্রোডাক্টের `images` স্ট্রিং-এ যে ID গুলো আছে)।

- সফল: **২০০** + ইমেজ বডি (binary), হেডারে `Content-Type` (যেমন `image/jpeg`)।
- ইমেজ না পেলে: **৪০৪**।

স্টোরফ্রন্ট শুধু `<img src={fullUrl}>` দিলেই হবে; আলাদা করে এই এন্ডপয়েন্ট কল করার দরকার নেই। শর্ত শুধু একটাই: **ইমেজের ফুল URL** যেন অ্যাডমিন ডোমেইন দিয়ে বানানো হয় (উপরে বর্ণিত নিয়মে)।

---

## ৫. CORS (স্টোরফ্রন্ট আলাদা ডোমেইনে থাকলে)

স্টোরফ্রন্ট যদি অ্যাডমিন থেকে **ভিন্ন ডোমেইন** এ চলে (যেমন স্টোর `https://shop.com`, অ্যাডমিন `https://admin.com`), তাহলে অ্যাডমিন অ্যাপে **ইমেজ এন্ডপয়েন্টের জন্যও CORS** দিতে হবে। নাহলে ব্রাউজার ক্রস-অরিজিন ইমেজ রিকোয়েস্ট ব্লক করতে পারে।

Next.js অ্যাডমিন প্রজেক্টে `next.config.ts` (বা `next.config.js`) এ `/api/image` যোগ করুন:

```ts
async headers() {
  return [
    { source: "/api/ecommerce/:path*", headers: [ ... ] },
    {
      source: "/api/image/:path*",
      headers: [
        { key: "Access-Control-Allow-Origin", value: "*" },
        { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
      ],
    },
  ];
}
```

প্রোডাকশনে `Access-Control-Allow-Origin` এ শুধু স্টোর ডোমেইন দিলে ভালো (যেমন `https://shop.example.com`)।

---

## ৬. সংক্ষিপ্ত চেকলিস্ট

- [ ] প্রোডাক্ট ডেটা নিচ্ছেন: `GET /api/ecommerce/products` বা `GET /api/ecommerce/products/[id]`
- [ ] `product.images` থেকে কমা স্প্লিট করে অ্যারে বানিয়েছেন
- [ ] প্রতিটি রিলেটিভ পাথের আগে `NEXT_PUBLIC_API_BASE_URL` যোগ করে ফুল URL বানিয়েছেন
- [ ] `<img src={fullUrl}>` এ ওই ফুল URL দিয়েছেন
- [ ] স্টোরফ্রন্ট ভিন্ন ডোমেইনে থাকলে `/api/image/:path*` এর জন্য CORS হেডার দিয়েছেন

এই ডক শুধু প্রোডাক্ট ইমেজের জন্য; বাকি এন্ডপয়েন্টের ডিটেইল [STOREFRONT-API.md](STOREFRONT-API.md) তে আছে।
