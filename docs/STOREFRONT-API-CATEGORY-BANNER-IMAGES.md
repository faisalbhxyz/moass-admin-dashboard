# ক্যাটাগরি ও ব্যানার ইমেজ API (স্টোরফ্রন্ট)

ক্যাটাগরি এবং ব্যানারের ইমেজ স্টোরফ্রন্টে কিভাবে পাবেন ও দেখাবেন তার সংক্ষিপ্ত গাইড। **অ্যাডমিনে ক্যাটাগরিতে ইমেজ অ্যাড করলে** সেই ইমেজ `GET /api/ecommerce/categories` রেসপন্সে চলে আসে। **ব্যানারে ইমেজ অ্যাড/আপলোড করলে** `GET /api/ecommerce/banners` তে `image` ফিল্ডে পাবেন। ক্যাটাগরি ইমেজ অ্যাডমিন API দিয়ে সেট করা যায়: `PATCH /api/admin/categories/[id]` বডিতে `{ "image": "/api/image/xyz" }` বা কোনো ফুল URL দিন।

---

## স্টোরফ্রন্টে দেখানোর সংক্ষিপ্ত স্টেপ

| ধাপ | ক্যাটাগরি | ব্যানার |
|-----|-----------|---------|
| ১. ডেটা নিন | `GET /api/ecommerce/categories` | `GET /api/ecommerce/banners` |
| ২. ইমেজ ফিল্ড | প্রতিটি আইটেমে `image` (string \| null) | প্রতিটি আইটেমে `image` (string \| null) |
| ৩. ফুল URL | রিলেটিভ হলে `API_BASE + image` | রিলেটিভ হলে `API_BASE + image` |
| ৪. UI তে দেখান | `<img src={fullUrl} alt={cat.name} />` | `<img src={fullUrl} alt={b.title} />` |

**বেস URL:** স্টোরফ্রন্টে `NEXT_PUBLIC_API_BASE_URL` = অ্যাডমিন সাইটের URL। রিলেটিভ পাথের আগে এই মান যোগ করলেই ফুল URL।

---

## ১. ক্যাটাগরি ইমেজ

### কোথায় পাবেন

| API | পাথ | ইমেজ ফিল্ড |
|-----|-----|-------------|
| ক্যাটাগরি লিস্ট | `GET /api/ecommerce/categories` | প্রতিটি ক্যাটাগরিতে `image` |

### ফিল্ড ফরম্যাট

| ফিল্ড | টাইপ | বর্ণনা |
|-------|------|--------|
| `image` | string \| null | ক্যাটাগরি ইমেজ। অ্যাডমিনে ক্যাটাগরিতে ইমেজ দিলে এখানে আসে। রিলেটিভ পাথ (যেমন `/api/image/xyz`) অথবা এক্সটার্নাল ফুল URL। খালি থাকতে পারে `null`। |

- **রিলেটিভ পাথ** (যেমন `/api/image/clxx...`): স্টোরফ্রন্ট আলাদা ডোমেইনে থাকলে **বেস URL** (`NEXT_PUBLIC_API_BASE_URL`) সামনে যোগ করে ফুল URL বানাবেন।
- **ইমেজ সার্ভ:** রিলেটিভ পাথ `/api/image/...` হলে ইমেজ অ্যাডমিন অ্যাপে **`GET /api/image/[id]`** দিয়ে সার্ভ হয় (পাবলিক)। প্রোডাক্ট ইমেজের মতো একই এন্ডপয়েন্ট।

### স্টোরফ্রন্টে ব্যবহার

```javascript
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

function categoryImageUrl(category) {
  const img = category?.image;
  if (!img || !img.trim()) return null;
  if (img.startsWith("http")) return img;
  return `${API_BASE}${img.startsWith("/") ? "" : "/"}${img}`;
}

// ব্যবহার
const categories = await apiGet("/api/ecommerce/categories");
// প্রতিটি ক্যাটাগরির জন্য
categories.map((cat) => {
  const src = categoryImageUrl(cat);
  return src ? <img key={cat.id} src={src} alt={cat.name} /> : <div key={cat.id} className="no-image">No image</div>;
});
```

---

## ২. ব্যানার ইমেজ

### কোথায় পাবেন

| API | পাথ | ইমেজ ফিল্ড |
|-----|-----|-------------|
| ব্যানার লিস্ট | `GET /api/ecommerce/banners` | প্রতিটি ব্যানারে `image` |

### ফিল্ড ফরম্যাট

| ফিল্ড | টাইপ | বর্ণনা |
|-------|------|--------|
| `image` | string \| null | ব্যানার ইমেজ। অ্যাডমিনে **আপলোড** করলে রিলেটিভ পাথ আসে: `"/api/banner-image/[bannerId]"`। বাইরের URL দিলে সেই ফুল URL। খালি হতে পারে `null`। |

- **অ্যাডমিনে আপলোড করলে:** API রেসপন্সে `image` হবে `"/api/banner-image/clxx..."` (ব্যানারের `id` দিয়ে)। স্টোরফ্রন্টে ফুল URL = বেস URL + এই পাথ।
- **ইমেজ সার্ভ:** **`GET /api/banner-image/[id]`** — `[id]` = ব্যানারের আইডি। পাবলিক, অথেন্টিকেশন লাগে না। ২০০ = ইমেজ বডি + `Content-Type` (যেমন `image/jpeg`); ৪০৪ = ইমেজ নেই।

### স্টোরফ্রন্টে ব্যবহার

```javascript
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

function bannerImageUrl(banner) {
  const img = banner?.image;
  if (!img || !img.trim()) return null;
  if (img.startsWith("http")) return img;
  return `${API_BASE}${img.startsWith("/") ? "" : "/"}${img}`;
}

// ব্যবহার (স্লাইডার)
const banners = await apiGet("/api/ecommerce/banners");
banners.map((b) => (
  <a key={b.id} href={b.link || "#"}>
    <img src={bannerImageUrl(b)} alt={b.title || ""} />
  </a>
));
```

---

## ৩. ইমেজ সার্ভ এন্ডপয়েন্ট সামারি

| ধরন | রিলেটিভ পাথ উদাহরণ | সার্ভ এন্ডপয়েন্ট | পাবলিক |
|-----|---------------------|-------------------|--------|
| ক্যাটাগরি ইমেজ | `/api/image/xyz` | `GET /api/image/[id]` | হ্যাঁ |
| ব্যানার ইমেজ | `/api/banner-image/xyz` | `GET /api/banner-image/[id]` | হ্যাঁ |

- ক্যাটাগরি ইমেজ অ্যাডমিনে প্রোডাক্ট ইমেজের মতো আপলোড করলে সাধারণত `/api/image/[storedImageId]` সেভ হয়।
- ব্যানার ইমেজ অ্যাডমিনে আপলোড করলে DB-তে জমা হয় এবং API রেসপন্সে `image` হয় `/api/banner-image/[bannerId]`।

---

## ৪. CORS (স্টোরফ্রন্ট আলাদা ডোমেইনে থাকলে)

স্টোরফ্রন্ট অ্যাডমিন থেকে **ভিন্ন ডোমেইন** এ থাকলে অ্যাডমিন অ্যাপে নিচের রাউটগুলোর জন্য CORS দিতে হবে (ইতিমধ্যে দেওয়া থাকলে ঠিক আছে):

| রাউট | উদ্দেশ্য |
|-------|----------|
| `/api/image/:path*` | প্রোডাক্ট/ক্যাটাগরি ইমেজ (StoredImage) |
| `/api/banner-image/:path*` | ব্যানার ইমেজ |

অ্যাডমিনের `next.config.ts` এ দুটোই থাকা উচিত; না থাকলে যোগ করুন। প্রোডাকশনে `Access-Control-Allow-Origin` এ স্টোর ডোমেইন বা `*` দিতে পারেন।

---

## ৫. সংক্ষিপ্ত চেকলিস্ট

**ক্যাটাগরি**

- [ ] `GET /api/ecommerce/categories` দিয়ে ক্যাটাগরি নিচ্ছেন
- [ ] প্রতিটি ক্যাটাগরির `image` চেক করছেন; রিলেটিভ হলে বেস URL দিয়ে ফুল URL বানিয়েছেন
- [ ] `<img src={fullUrl}>` বা প্লেসহোল্ডার দিয়ে ক্যাটাগরি ইমেজ দেখাচ্ছেন

**ব্যানার**

- [ ] `GET /api/ecommerce/banners` দিয়ে ব্যানার নিচ্ছেন
- [ ] প্রতিটি ব্যানারের `image` চেক করছেন; রিলেটিভ (`/api/banner-image/...`) হলে বেস URL দিয়ে ফুল URL বানিয়েছেন
- [ ] `<img src={fullUrl}>` দিয়ে ব্যানার ইমেজ দেখাচ্ছেন
- [ ] স্টোর ভিন্ন ডোমেইনে থাকলে `/api/banner-image/:path*` এর জন্য CORS আছে কিনা চেক করেছেন

---

**সংক্ষেপে:** অ্যাডমিনে ক্যাটাগরি/ব্যানারে ইমেজ অ্যাড করলে API রেসপন্সে সেই ইমেজের মান (`image` ফিল্ড) চলে আসে। রিলেটিভ পাথ হলে স্টোরফ্রন্টে বেস URL যোগ করে ফুল URL বানিয়ে ইমেজ দেখান; CORS সেট থাকলে ক্রস-ডোমেইনেও কাজ করবে।

প্রোডাক্ট ইমেজের বিস্তারিত: [প্রোডাক্ট ইমেজ API](STOREFRONT-API-PRODUCT-IMAGES.md)। বাকি এন্ডপয়েন্ট: [STOREFRONT-API.md](STOREFRONT-API.md)।
