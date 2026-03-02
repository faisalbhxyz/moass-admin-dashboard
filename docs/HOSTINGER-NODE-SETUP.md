# Hostinger-এ Node.js কীভাবে চালাবেন

Hostinger-এ Node.js অ্যাপ চালানোর দুটো সাধারণ উপায় আছে।

---

## ১. প্ল্যান চেক করুন

Node.js **শুধু এই প্ল্যানগুলোতে** আছে:

- **Business Web Hosting**
- **Cloud Startup / Cloud Professional / Cloud Enterprise / Cloud Enterprise Plus**

যদি **Standard/Shared** প্ল্যান থাকে তাহলে Node.js অপশন প্যানেলে নাও থাকতে পারে। সেক্ষেত্রে প্ল্যান আপগ্রেড করতে হয়।

---

## ২. উপায় ক: নতুন Node.js ওয়েবসাইট অ্যাড করা (সবচেয়ে সহজ)

এটাই Hostinger-এর বর্তমান রেকমেন্ডেড উপায়। এখানে **GitHub** বা **ZIP** দিয়ে অ্যাপ দিলে Hostinger নিজে বিল্ড ও রান করে।

### ধাপগুলো

1. **hPanel** এ লগইন করুন।
2. বাম পাশে **Websites** → **Add Website** এ ক্লিক করুন।
3. **Node.js Apps** (বা “Node.js Web App”) সিলেক্ট করুন।
4. **কোড কোথা থেকে নেবেন:**
   - **Import Git Repository** – GitHub রিপো কানেক্ট করুন, তারপর ব্রাঞ্চ ও বিল্ড সেটিংস দিন।
   - **Upload your website files** – প্রজেক্টের একটা **ZIP** আপলোড করুন (মনে রাখুন: `node_modules` আর `.next` বাদ দিয়ে জিপ করলে আপলোড দ্রুত হয়)।
5. **Build settings** ঠিক করুন (Next.js অটো ডিটেক্ট হতে পারে):
   - Build command: `npm run build` বা `prisma generate && next build`
   - Output / Start: `npm start`
6. **Environment variables** দিন (`.env` এর মানগুলো – যেমন `DATABASE_URL`, `AUTH_SECRET`)।
7. **Deploy** চাপুন।

এরপর Hostinger নিজে `npm install`, বিল্ড ও স্টার্ট করে দেয়; আলাদা SSH থেকে Node চালানোর দরকার পড়ে না।

---

## ৩. উপায় খ: আগে থেকে আপলোড করা ফোল্ডার দিয়ে (Advanced → Node.js)

কোনো কোন Hostinger অ্যাকাউন্টে **Advanced** সেকশনে **Node.js** বা **Applications → Node.js** মেনু থাকে। সেখানে “Add Application” দিয়ে একটা অ্যাপ বানিয়ে **পাথ** আর **রান কমান্ড** দিতে হয়।

আপনার প্রজেক্ট এখন সার্ভারে আছে: **`~/moass-admin`**।

### ধাপগুলো

1. **hPanel** → **Advanced** → **Node.js** (বা **Applications** → **Node.js**)।
2. **Add Application** / **Create Application**।
3. সেটিংস:
   - **Application root / Path:** `moass-admin` (অথবা ফুল পাথ যেমন `~/moass-admin` – প্যানেল যেরকম পাথ নেয় সেরকম দিন)।
   - **Node.js version:** 20 (বা 18/22 যেটা থাকে)।
   - **Run command:**  
     `npm start`  
     অথবা যদি SSH-তে Node পাথ আলাদা থাকে:  
     `export PATH=/opt/alt/alt-nodejs20/root/usr/bin:$PATH && npm start`
4. সেভ করে অ্যাপ **Start** করুন।

এই ফ্লোতে আগে SSH দিয়ে সেই ফোল্ডারে `npm install`, `npx prisma generate`, `npx prisma migrate deploy`, `npm run build` একবার চালিয়ে নিতে হতে পারে (যদি প্যানেল ওই কমান্ডগুলো নিজে না চালায়)।

---

## ৪. শুধু SSH দিয়ে চালাতে চাইলে (Node পাথ দিয়ে)

কোনো সার্ভারে Node ইন্সটল থাকলেও ডিফল্ট `PATH`-এ না থাকতে পারে। Hostinger-এর অনেক শেয়ার্ড সার্ভারে Node এমন পাথে থাকে:

```bash
/opt/alt/alt-nodejs20/root/usr/bin
```

SSH দিয়ে লগইন করে প্রতিবার এইভাবে চালান:

```bash
export PATH=/opt/alt/alt-nodejs20/root/usr/bin:$PATH
cd ~/moass-admin
node -v
npm -v
```

যদি `node -v` / `npm -v` কাজ করে, তাহলে ওই একই শেলেই:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```

যদি `node` না মেলে, তাহলে সেই অ্যাকাউন্টে Node হয়তো শুধু **উপায় ক** (Add Website → Node.js Apps) দিয়ে চলে, SSH-র সাধারণ পাথে দেওয়া নেই।

---

## সংক্ষেপ

| কী করতে চান | কোথায় যাবেন |
|-------------|----------------|
| নতুন সাইট হিসেবে Node অ্যাপ ডিপ্লয় (বিল্ড অটো) | hPanel → **Websites** → **Add Website** → **Node.js Apps** → GitHub বা ZIP |
| আগে আপলোড করা ফোল্ডার দিয়ে চালানো | hPanel → **Advanced** → **Node.js** → Add Application → Path: `moass-admin`, Run: `npm start` |
| শুধু SSH থেকে চালানো | `export PATH=/opt/alt/alt-nodejs20/root/usr/bin:$PATH` তারপর `npm install` ইত্যাদি |

আপনার প্রজেক্ট ইতিমধ্যে `~/moass-admin` এ পুশ করা আছে; প্ল্যানে Node সাপোর্ট থাকলে উপরের যেকোনো একটা উপায় দিয়ে Node চালু করে অ্যাপ রান করতে পারবেন।
