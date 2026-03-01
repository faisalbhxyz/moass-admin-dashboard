# এখনই ডিপ্লয় করুন (Hostinger)

SSH পাসওয়ার্ড দিয়ে আমি সরাসরি কানেক্ট করতে পারি না। নিচের যেকোনো একটা উপায় অনুসরণ করুন।

---

## Option A: SSH কী দিয়ে একবার সেটআপ (পরবর্তীতে আমি ডিপ্লয় চালাতে পারব)

১. **আপনার পাবলিক কী** Hostinger-এ অ্যাড করুন:
   - hPanel → **Advanced** → **SSH Access** → **Manage SSH Keys**
   - নিচের কীটি অ্যাড করুন (কপি করুন):

   ```
   ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC4Ing3rEJ18iHvmmhdVRleIEKGlZ5PepmfCUq2jo4wpVdJvpA5u448XBCz9X3LnJGnZ2ycOghSmJnwscVmFpmDLk0rCN9+Sdgy5FGBmaHUjmI8w8ocdr4sZvTEQX+Ezzoy+YA11lGAL3DBGijlSrH01ifwY3KuHhKiUasBEl8FNfev3cOegxxDeK1FE6PqUzNS3KiovncaroN0Uq1xmtjjkr5vrjZztlthdt6jmPKpljL9ur/AAI27elh59VXR6MCKBoeBQEB8oq/lh3SeLE6TA2h+hlCSajQznT368/zi2FsUbFUb5JSSbol7ZIBZH+O4RWtPZ5gL4UV49L7fMpojI9rdI2gqzYJlxwmPngKZilLGV91GckSKQvbiy3EcAlCqtRrJJCkVtmtiizYJASFklpu5h3Z3os/pT866cO4CCBLvu5Ve7h9v7GCXjWPaM8EITHDpbOvau29JET1KCekuvtWSNpThimTrMnoCurN9qiCFaDj/95RZS77b+mNi72PZKJvqDXIZWwe3xE3dSYt3xvlqQ19BwhEaQ13Hzb4NaXS+1m6gbteG2isE/oIxPUfQtdhRWu44bnW95O9Djb06AVx/dF4sIxuTyvwaQhyI34ij5QactCjRFEYZz/GcP5yweuoQGDXB5Lj9W4i+gFQU2wvgKeqQIO0SC4ksUZ1bCQ== faisalbh@Faisals-MacBook-Air.local
   ```

২. কী অ্যাড করার পর আমাকে লিখুন — আমি আবার ডিপ্লয় চালানোর চেষ্টা করব (আপলোড + ডিপ্লয় স্ক্রিপ্ট রান)।

---

## Option B: আপনি নিজে একবার ডিপ্লয় করুন (কপি-পেস্ট)

### ধাপ ১: জিপ আপলোড

- প্রজেক্ট ফোল্ডারে **`moass-deploy.zip`** বানানো আছে।
- Hostinger **File Manager** (hPanel → Files → File Manager) এ যান।
- সাধারণত হোম ফোল্ডার: `domains/yourdomain.com` বা `private_html` — যেখানে Node অ্যাপ চালাতে চান সেখানে যান (উদাহরণ: `private_html` বা নতুন ফোল্ডার `moass` বানান)।
- **Upload** করে `moass-deploy.zip` আপলোড করুন।
- আপলোডের পর সেই ফোল্ডারে **Extract** করুন (unzip)। ফলে সব ফাইল সেই ফোল্ডারে থাকবে (যেমন `package.json`, `scripts/` ইত্যাদি)।

### ধাপ ২: SSH দিয়ে লগইন

টার্মিনালে:

```bash
ssh -p 65002 u410218618@145.79.26.13
```

পাসওয়ার্ড দিন। তারপর প্রজেক্ট ফোল্ডারে যান (যেখানে `package.json` আছে)। উদাহরণ:

```bash
cd ~/domains/yourdomain.com/private_html
# অথবা যেখানে জিপ এক্সট্রাক্ট করেছেন, যেমন:
# cd ~/private_html/moass
ls -la
# package.json, scripts/ দেখা যাবে
```

### ধাপ ৩: ডিপ্লয় স্ক্রিপ্ট চালান

```bash
bash scripts/deploy-remote-full.sh
```

এটা অটোভাবে `.env` বানাবে (ডাটাবেস: `moass_db`, পাসওয়ার্ড যা দিয়েছেন), তারপর `npm install`, Prisma, মাইগ্রেশন, বিল্ড করবে।

**যদি ডাটাবেস কানেকশন এড়ার দেয়:** Hostinger hPanel → **MySQL Databases** থেকে **exact MySQL username** দেখে নিন (যেমন `u410218618_moass` বা `u410218618_admin`)। তারপর সার্ভারে এডিট করুন:

```bash
nano .env
```

`DATABASE_URL`-এ শুধু username অংশটা সঠিকটা দিয়ে সেভ করুন।

### ধাপ ৪: অ্যাপ চালু করুন

```bash
npm start
```

ব্রাউজারে আপনার ডোমেইন + পোর্ট (Hostinger Node অ্যাপ যেই পোর্টে চালায়) দিয়ে চেক করুন।

**ব্যাকগ্রাউন্ডে চালাতে:**

```bash
nohup npm start > app.log 2>&1 &
```

অথবা PM2 (একবার ইন্সটল):

```bash
npm install -g pm2
pm2 start npm --name moass -- start
pm2 save
pm2 startup
```

### ধাপ ৫ (ঐচ্ছিক): অ্যাডমিন ইউজার

প্রথমবার অ্যাডমিন লগইন চাইলে একবার চালান:

```bash
npm run db:seed
```

(সিডে সাধারণত `admin@example.com` / `admin123` — লগইনের পর পাসওয়ার্ড বদলান।)

---

## সংক্ষেপে

| কী জিনিস        | মান |
|------------------|-----|
| SSH             | `ssh -p 65002 u410218618@145.79.26.13` |
| Database        | `moass_db` |
| DB password     | (যা Hostinger এ সেট করেছেন) |
| MySQL username  | hPanel → MySQL থেকে দেখুন (সাধারণত `u410218618_...`) |
| Deploy script   | `bash scripts/deploy-remote-full.sh` |
| Start app       | `npm start` |

Option A করলে পরবর্তীতে বলুন — আমি আবার পুরো ডিপ্লয় চালানোর চেষ্টা করব।
