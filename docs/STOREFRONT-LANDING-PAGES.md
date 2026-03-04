# স্টোরফ্রন্ট গাইড: প্রোডাক্ট ল্যান্ডিং পেজ

স্টোরফ্রন্ট প্রজেক্টে **প্রোডাক্ট ল্যান্ডিং পেজ** কিভাবে বানাবেন — প্রতিটি প্রোডাক্টের জন্য `landing/[slug]` URL এ প্রোডাক্ট ডিটেইলস + চেকআউট ফর্ম এক পেজেই, যাতে কাস্টমার এক ক্লিকে অর্ডার করতে পারে।

**মেইন API ডক:** [STOREFRONT-API.md](STOREFRONT-API.md) – বেস URL, প্রোডাক্ট, অর্ডার, শিপিং ইত্যাদি।

**পেমেন্ট মেথড:** [STOREFRONT-API-PAYMENT-METHODS.md](STOREFRONT-API-PAYMENT-METHODS.md) – চেকআউটে পেমেন্ট UI লজিক।

---

## ১. URL ও রাউট

| URL উদাহরণ | বর্ণনা |
|------------|--------|
| `/landing/blue-tshirt` | `blue-tshirt` slug বিশিষ্ট প্রোডাক্টের ল্যান্ডিং পেজ |
| `/landing/summer-dress` | `summer-dress` slug বিশিষ্ট প্রোডাক্টের ল্যান্ডিং পেজ |

### Next.js (App Router)

**ফাইল:** `app/landing/[slug]/page.tsx`

```tsx
import { notFound } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export default async function LandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const productRes = await fetch(`${API_BASE}/api/ecommerce/products/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!productRes.ok) notFound();
  const product = await productRes.json();

  return (
    <div className="container mx-auto max-w-4xl py-8">
      {/* প্রোডাক্ট ডিটেইলস (উপরে) */}
      <ProductDetails product={product} />
      {/* চেকআউট ফর্ম (নিচে) */}
      <CheckoutForm product={product} />
    </div>
  );
}
```

অ্যাডমিন ড্যাশবোর্ডের "Landing Page" সেকশনে যে লিংক ক্রিয়েট করা হয় (যেমন `https://shop.example.com/landing/blue-tshirt`) সেই URL এই রাউটেই ওপেন হবে।

---

## ২. পেজ লেআউট

লেআউট দুই অংশে:

1. **উপরের অংশ (Product details):** ইমেজ, নাম, প্রাইস, বিবরণ, ভ্যারিয়েশন — সাধারণ প্রোডাক্ট ডিটেইল পেজের মতো।
2. **নিচের অংশ (Checkout form):** কাস্টমার ফিল্ড, কোয়ান্টিটি, শিপিং জোন, কুপন, পেমেন্ট মেথড, অর্ডার বাটন।

স্ক্রল করলে প্রোডাক্ট দেখে নিচে এসে ফর্ম পূরণ করে এক পেজেই অর্ডার সম্পন্ন করা যায়।

---

## ৩. API কল

সব API অ্যাডমিন ড্যাশবোর্ডে বিদ্যমান; নতুন API লাগে না।

| কাজ | API | ব্যবহার |
|-----|-----|---------|
| প্রোডাক্ট লোড | `GET /api/ecommerce/products/[slug]` | `[slug]` = প্রোডাক্ট slug (যেমন `blue-tshirt`) |
| শিপিং জোন | `GET /api/ecommerce/shipping` | ড্রপডাউনে শিপিং অপশন |
| কুপন চেক | `POST /api/ecommerce/coupons/validate` | কোড ভ্যালিডেশন |
| পেমেন্ট মেথড | `GET /api/ecommerce/payment-methods` | COD/bKash ইত্যাদি |
| অর্ডার প্লেস | `POST /api/ecommerce/orders` | ফর্ম সাবমিট করলে কল |

API বেস URL: `NEXT_PUBLIC_API_BASE_URL` (অ্যাডমিন ড্যাশবোর্ডের URL)

---

## ৪. চেকআউট ফর্ম ফিল্ড

| ফিল্ড | ধরন | বাধ্যতামূলক | মন্তব্য |
|-------|-----|-------------|---------|
| নাম | text | হ্যাঁ | `customer.name` |
| ফোন | tel | হ্যাঁ | `customer.phone` — গেস্ট অর্ডারের জন্য বাধ্যতামূলক |
| ইমেইল | email | না | `customer.email` |
| ঠিকানা | textarea | হ্যাঁ | `shippingAddress` |
| কোয়ান্টিটি | number | হ্যাঁ | ১ থেকে শুরু, `items[0].quantity` |
| শিপিং জোন | select | না | `shippingZoneId` — API থেকে লোড |
| কুপন কোড | text | না | `couponCode` — ভ্যালিডেশন API দিয়ে চেক |
| পেমেন্ট মেথড | select | না | `payment_method_id` |
| ট্রানজেকশন আইডি | text | bKash ইত্যাদির জন্য | `transaction_id` — MANUAL হলে বাধ্যতামূলক |
| নোট | textarea | না | `notes` |

### অর্ডার বডি উদাহরণ

```json
{
  "customer": {
    "name": "কাস্টমার নাম",
    "phone": "01XXXXXXXXX",
    "email": "optional@email.com",
    "address": "ডেলিভারি ঠিকানা"
  },
  "items": [{ "productId": "clxx...", "quantity": 1 }],
  "shippingZoneId": "clxx...",
  "shippingAddress": "ডেলিভারি ঠিকানা",
  "couponCode": "SAVE10",
  "payment_method_id": "clxx...",
  "transaction_id": "bKash TrxID (যদি MANUAL)",
  "notes": "ঐচ্ছিক"
}
```

---

## ৫. চেকআউট ফর্ম কম্পোনেন্ট (উদাহরণ)

```tsx
"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export function CheckoutForm({ product }: { product: { id: string } }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [shippingZoneId, setShippingZoneId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/ecommerce/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name, phone, email, address },
          items: [{ productId: product.id, quantity }],
          shippingZoneId: shippingZoneId || undefined,
          shippingAddress: address,
          couponCode: couponCode || undefined,
          payment_method_id: paymentMethodId || undefined,
          transaction_id: transactionId || undefined,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setOrderNumber(data.orderNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order failed");
    } finally {
      setLoading(false);
    }
  }

  if (orderNumber) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6">
        <p className="font-medium text-green-800">অর্ডার সফল!</p>
        <p className="mt-1 text-sm text-green-700">অর্ডার নম্বর: {orderNumber}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-medium">অর্ডার ফর্ম</h3>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <label className="block text-sm font-medium">নাম *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">ফোন *</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">ইমেইল</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">ঠিকানা *</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          rows={3}
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">পরিমাণ *</label>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </div>
      {/* শিপিং জোন, কুপন, পেমেন্ট মেথড — GET /api/ecommerce/shipping, payment-methods দিয়ে লোড করে সিলেক্ট যোগ করুন */}
      <button type="submit" disabled={loading} className="rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50">
        {loading ? "অর্ডার হচ্ছে…" : "অর্ডার সম্পন্ন করুন"}
      </button>
    </form>
  );
}
```

উপরের উদাহরণে শিপিং জোন, কুপন ও পেমেন্ট মেথড সিলেক্ট যোগ করতে হবে। API:

- `GET /api/ecommerce/shipping` → শিপিং জোন ড্রপডাউন
- `GET /api/ecommerce/payment-methods` → পেমেন্ট অপশন (COD/bKash — MANUAL হলে `transaction_id` ফিল্ড দেখান)
- `POST /api/ecommerce/coupons/validate` → কুপন ভ্যালিডেশন (ঐচ্ছিক)

বিস্তারিত: [STOREFRONT-API.md](STOREFRONT-API.md), [STOREFRONT-API-PAYMENT-METHODS.md](STOREFRONT-API-PAYMENT-METHODS.md)।

---

## ৬. প্রোডাক্ট ডিটেইলস সেকশন (সংক্ষিপ্ত)

প্রোডাক্ট অবজেক্টে `id`, `name`, `slug`, `description`, `price`, `compareAt`, `images`, `variationImages`, `stock` ইত্যাদি থাকে। ইমেজ দেখাতে:

- `images` = কমা-সেপারেটেড URL (যেমন `/api/image/xyz,/api/image/abc`)
- ফুল URL = `{API_BASE}` + পাথ (যেমন `http://localhost:3000/api/image/xyz`)

বিস্তারিত: [STOREFRONT-API-PRODUCT-IMAGES.md](STOREFRONT-API-PRODUCT-IMAGES.md)।

---

## ৭. ক্যাশ

অ্যাডমিন API-তে Cache-Control ইতিমধ্যে সেট। স্টোরফ্রন্টে:

- **Next.js Server Component:** `fetch`-এ `next: { revalidate: 60 }` ব্যবহার করুন।
- **SWR/React Query:** `staleTime` বা `revalidate` সেট করুন (উদাহরণ: ৬০ সেকেন্ড)।

---

## ৮. ইমপ্লিমেন্টেশন চেকলিস্ট

- [ ] রাউট তৈরি: `app/landing/[slug]/page.tsx`
- [ ] প্রোডাক্ট ফেচ: `GET /api/ecommerce/products/${slug}`
- [ ] প্রোডাক্ট সেকশন: ইমেজ, নাম, প্রাইস, বিবরণ
- [ ] চেকআউট ফর্ম: নাম, ফোন, ঠিকানা, কোয়ান্টিটি
- [ ] শিপিং জোন সিলেক্ট: `GET /api/ecommerce/shipping`
- [ ] পেমেন্ট মেথড সিলেক্ট: `GET /api/ecommerce/payment-methods` (MANUAL হলে transaction_id ফিল্ড)
- [ ] কুপন ভ্যালিডেশন (ঐচ্ছিক): `POST /api/ecommerce/coupons/validate`
- [ ] অর্ডার সাবমিট: `POST /api/ecommerce/orders`
- [ ] সফল হলে অর্ডার নম্বর দেখান

---

## ৯. লিংক শেয়ার

অ্যাডমিনে Landing Page সেকশনে প্রোডাক্ট সিলেক্ট করে যে লিংক তৈরি হয় (যেমন `https://shop.example.com/landing/blue-tshirt`) — ফেসবুক অ্যাড, WhatsApp, ইমেইল ইত্যাদিতে সরাসরি শেয়ার করা যাবে।
