# স্টোরফ্রন্ট গাইড: পলিসি, টার্মস, রিটার্ন পলিসি পেজ

স্টোরফ্রন্ট প্রজেক্টে অ্যাডমিনের **Pages** (Policy, Terms, Return Policy ইত্যাদি) কিভাবে কানেক্ট করে দেখাবেন — শুধু স্টোরফ্রন্ট ডেভেলপারদের জন্য এই ডক।

---

## ১. API বেস URL সেট করুন

স্টোরফ্রন্ট প্রজেক্টে (Next.js / React / Vue) env ফাইলে অ্যাডমিনের বেস URL দিন:

```env
# .env.local বা .env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# প্রোডাকশনে (অ্যাডমিন যেখানে হোস্ট)
NEXT_PUBLIC_API_BASE_URL=https://your-admin.vercel.app
```

স্টোর ও অ্যাডমিন একই ডোমেইনে থাকলে সেই ডোমেইনই বেস URL।

---

## ২. পেজ দেখানোর জন্য একটা রাউট বানান

**একটা ডায়নামিক রাউট** দিয়েই সব পেজ (Terms, Privacy Policy, Return Policy) দেখানো যাবে। প্রতিটি পেজের জন্য আলাদা পেজ বানানোর দরকার নেই।

### Next.js (App Router)

**ফাইল:** `app/page/[slug]/page.tsx`

```tsx
import { notFound } from "next/navigation";

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
      <div
        className="prose prose-gray"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
```

এটা দিলে URL হবে: `/page/terms`, `/page/privacy-policy`, `/page/return-policy` ইত্যাদি।

### Next.js (Pages Router)

**ফাইল:** `pages/page/[slug].tsx`

```tsx
export async function getServerSideProps({ params }) {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${API_BASE}/api/ecommerce/pages/${params.slug}`);
  if (!res.ok) return { notFound: true };
  const page = await res.json();
  return { props: { page } };
}

export default function ContentPage({ page }) {
  return (
    <div className="container mx-auto max-w-3xl py-8">
      <h1 className="mb-6 text-2xl font-bold">{page.title}</h1>
      <div
        className="prose prose-gray"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
```

### React (ক্লায়েন্ট-সাইড)

রাউট যেভাবে আছে (যেমন `/page/:slug`) সেখানে:

```tsx
const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

function ContentPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/ecommerce/pages/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setPage)
      .catch(() => setPage(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (!page) return <div>Page not found</div>;

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <h1 className="mb-6 text-2xl font-bold">{page.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
}
```

**মনে রাখুন:** `content` অবশ্যই **HTML হিসেবে** রেন্ডার করতে হবে (`dangerouslySetInnerHTML` বা Vue-তে `v-html`)। প্লেইন টেক্সট দেখালে ট্যাগগুলোই দেখা যাবে।

---

## ৩. লিংক কোথায় দেবেন

- **ফুটার/হেডার মেনু:** অ্যাডমিনে Menus-এ **From page** দিয়ে পেজ অ্যাড করলে লিংক নিজে থেকেই `/page/terms`, `/page/privacy-policy` ইত্যাদি হয়ে যায়। স্টোরফ্রন্টে মেনু API (`GET /api/ecommerce/menus`) দিয়ে মেনু লোড করলে ওই লিংকগুলোই পাবেন।
- **নিজে লিংক দিতে চাইলে:**  
  `<Link href={`/page/${slug}`}>Terms</Link>` — `slug` মানে অ্যাডমিনে যে slug সেভ করা (যেমন `terms`, `return-policy`)।

---

## ৪. API সারাংশ

| কাজ | Method | URL |
|-----|--------|-----|
| পেজ লিস্ট (ফুটার লিংক) | GET | `{API_BASE}/api/ecommerce/pages` |
| একটি পেজ (title + HTML) | GET | `{API_BASE}/api/ecommerce/pages/{slug}` |

- **পেজ লিস্ট:** শুধু **active** পেজগুলো আসে। প্রতিটি আইটেমে `id`, `slug`, `title`।
- **সিঙ্গেল পেজ:** রেসপন্সে `title`, `content` (HTML)। ইন্যাক্টিভ পেজে 404।

কোনো অথেন্টিকেশন লাগে না।

---

## ৫. CORS (স্টোর আলাদা ডোমেইনে থাকলে)

স্টোরফ্রন্ট যদি অ্যাডমিন থেকে **ভিন্ন ডোমেইন** এ চলে (যেমন স্টোর `https://myshop.com`, অ্যাডমিন `https://admin.myshop.com`), অ্যাডমিন সাইডে env সেট করুন:

```env
STOREFRONT_ORIGIN=https://myshop.com
```

বিস্তারিত: [SECURE-CONNECTION.md](SECURE-CONNECTION.md)।

---

এই ডক দিয়ে স্টোরফ্রন্টে পেজ ফিচার কানেক্ট করতে পারবেন। অ্যাডমিন/API-এর বিস্তারিত: [STOREFRONT-API-PAGES.md](STOREFRONT-API-PAGES.md)।
