# Hostinger-এ MySQL ডাটাবেস কানেক্ট করার ধাপ

প্রজেক্টে Hostinger-এর MySQL ডাটাবেস যুক্ত করতে নিচের ধাপগুলো অনুসরণ করুন।

---

## ১. Hostinger থেকে MySQL তথ্য নিন

1. **Hostinger hPanel** এ লগইন করুন।
2. **Databases** → **MySQL Databases** এ যান।
3. একটা নতুন ডাটাবেস বানান (অথবা থাকলে সেইটা ব্যবহার করুন):
   - **Database name** (যেমন: `u123456789_moass`)
   - **Username** (যেমন: `u123456789_admin`)
   - **Password** সেট করুন এবং সেভ করে রাখুন।
4. নোট করুন:
   - **Database host**: সাধারণত `localhost` অথবা `mysqlXX.hostinger.com` (Hostinger ড্যাশবোর্ডে দেখাবে)
   - **Port**: `3306`
   - **Database name**, **username**, **password**

---

## ২. প্রজেক্টে `.env` সেট করুন

প্রজেক্টের রুটে `.env` ফাইল খুলুন (নাইলে `.env.example` কপি করে `.env` বানান)। নিচের ফরম্যাটে Hostinger-এর মানগুলো দিন:

```env
# Hostinger MySQL – USER, PASSWORD, HOST, DATABASE_NAME নিজের মান দিয়ে বদলান
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE_NAME"

# JWT সিক্রেট (নিজে জেনারেট করুন: openssl rand -base64 32)
AUTH_SECRET="আপনার-লং-র‍্যান্ডম-সিক্রেট"
```

**উদাহরণ:**

```env
DATABASE_URL="mysql://u123456789_admin:YourStrongPassword@localhost:3306/u123456789_moass"
AUTH_SECRET="কোনো-র‍্যান্ডম-৩২-ক্যারেক্টার-স্ট্রিং"
```

**খেয়াল রাখুন:**

- পাসওয়ার্ডে বিশেষ ক্যারেক্টার (যেমন `#`, `@`, `%`) থাকলে URL-এ **encode** করতে হবে।  
  উদাহরণ: `pass#123` → `pass%23123`
- কিছু হোস্টিংয়ে সকেট ব্যবহার করতে হয়। সেক্ষেত্রে URL এর শেষে যোগ করুন:  
  `?socket=/tmp/mysql.sock`

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/DATABASE_NAME?socket=/tmp/mysql.sock"
```

---

## ৩. MySQL এ টেবিল তৈরি করুন

দুইটা উপায়ের যেকোনো একটা ব্যবহার করুন।

### উপায় ক: Prisma Migrate (সার্ভার থেকে SSH/টার্মিনাল থাকলে)

```bash
npx prisma migrate deploy
```

### উপায় খ: phpMyAdmin দিয়ে (Hostinger এ সাধারণত আছে)

1. hPanel থেকে **phpMyAdmin** ওপেন করুন।
2. বাম পাশ থেকে আপনার **ডাটাবেস** সিলেক্ট করুন।
3. **Import** ট্যাবে যান।
4. প্রজেক্টের এই ফাইল সিলেক্ট করুন: **`scripts/hostinger-create-tables.sql`**
5. **Go** ক্লিক করে SQL রান করুন।
6. তারপর টার্মিনালে (লোকাল বা SSH) একবার চালান:

```bash
npx prisma migrate resolve --applied "20260302000000_init"
```

এটা Prisma-কে বলে দেয় যে migration ইতিমধ্যে অ্যাপ্লাই করা হয়েছে।

---

## ৪. Prisma ক্লায়েন্ট ও সিড (ঐচ্ছিক)

```bash
npm install
npx prisma generate
```

অ্যাডমিন ইউজার ও বেসিক সেটিংস চাইলে:

```bash
npm run db:seed
```

(সিডে সাধারণত `admin@example.com` / `admin123` দেওয়া থাকে — প্রথম লগইনের পর পাসওয়ার্ড বদলে নিন।)

---

## ৫. চালিয়ে টেস্ট করুন

```bash
npm run build
npm start
```

অথবা ডেভ মোডে:

```bash
npm run dev
```

ব্রাউজারে অ্যাপ ওপেন করে লগইন/রেজিস্টার চেষ্টা করুন। লগইন কাজ করলে ডাটাবেস কানেকশন ঠিক আছে।

---

## সমস্যা হলে চেকলিস্ট

| সমস্যা | করণীয় |
|--------|--------|
| "Can't reach database" | `DATABASE_URL`-এ host, user, password, database name ঠিক আছে কিনা দেখুন। Hostinger ড্যাশবোর্ডে যে host নাম দেওয়া আছে সেটাই ব্যবহার করুন। |
| Access denied | ইউজারনেম/পাসওয়ার্ড ভুল নয় তো দেখুন। সেই ইউজারকে এই ডাটাবেসের অ্যাক্সেস দেওয়া আছে কিনা hPanel থেকে চেক করুন। |
| টেবিল নেই | `prisma migrate deploy` অথবা `scripts/hostinger-create-tables.sql` phpMyAdmin এ ইম্পোর্ট করা হয়েছে কিনা নিশ্চিত করুন। |
| পাসওয়ার্ডে `#` বা `@` | URL-এ encode করুন (যেমন `#` → `%23`, `@` → `%40`)। |

---

সংক্ষেপে:  
**Hostinger থেকে MySQL এর host, database name, username, password নিয়ে `.env`-এ `DATABASE_URL` দিন → টেবিল তৈরি করুন (migrate অথবা `hostinger-create-tables.sql`) → `prisma generate` ও প্রয়োজন হলে `db:seed` চালান → অ্যাপ চালিয়ে টেস্ট করুন।**

---

## ৬. SSH দিয়ে ম্যানুয়াল ডিপ্লয় (কমান্ডগুলো আপনি চালাবেন)

আমি সরাসরি আপনার Hostinger সারে SSH কানেক্ট করতে পারি না। তাই **আপনি নিজে SSH দিয়ে লগইন করে** নিচের ধাপগুলো বা স্ক্রিপ্ট চালান।

### আগে যা করতে হবে

1. **Hostinger এ SSH চালু**  
   hPanel → **Advanced** → **SSH Access** থেকে SSH চালু করুন এবং ইউজারনেম/পাসওয়ার্ড বা SSH কী সেট করুন।

2. **প্রজেক্ট সার্ভারে আপলোড**  
   - **উপায় ক:** Git থাকলে সার্ভারে `git clone <আপনার-রিপো-ইউআরএল>` করে প্রজেক্ট নিন।  
   - **উপায় খ:** লোকালে জিপ বানান (`zip -r moass.zip . -x "node_modules/*" -x ".next/*" -x ".git/*"`), সেই জিপ Hostinger File Manager বা `scp` দিয়ে আপলোড করে আনজিপ করুন।

3. **সার্ভারে `.env` বানান**  
   প্রজেক্ট রুটে (যেখানে `package.json` আছে) `.env` ফাইল তৈরি করুন এবং Hostinger-এর মান দিন:

   ```env
   DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE_NAME"
   AUTH_SECRET="openssl rand -base64 32 দিয়ে জেনারেট করা মান"
   ```

### সার্ভারে SSH দিয়ে এই কমান্ডগুলো চালান

প্রজেক্ট ফোল্ডারে গিয়ে (যেখানে `package.json` আছে):

```bash
cd /path/to/moass-admin-dashboard   # আপনার প্রকৃত পাথ দিন

# একবারে সব স্টেপ (স্ক্রিপ্ট দিয়ে)
bash scripts/deploy-hostinger-ssh.sh

# অথবা নিজে এক এক করে:
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```

প্রথমবার অ্যাডমিন ইউজার চাইলে (একবারই যথেষ্ট):

```bash
npm run db:seed
```

### অ্যাপ চালু রাখা (ঐচ্ছিক)

- **PM2:** `npm install -g pm2` তারপর `pm2 start npm --name "moass" -- start`  
- অথবা Hostinger hPanel এর **Node.js** সেকশন থেকে **Run command:** `npm start` দিয়ে অ্যাপ চালু রাখা যায়।

এই গাইড অনুসরণ করলে আপনি SSH দিয়ে নিজেই ম্যানুয়াল ডিপ্লয় করতে পারবেন।
