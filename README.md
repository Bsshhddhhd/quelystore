# متجر بوتات Discord - اشتر بثقة 🤖

متجر إلكتروني احترافي لبيع بوتات Discord مع تكامل كامل مع طرق دفع متعددة وإرسال إشعارات فورية عبر Discord.

## المميزات ✨

- 🛍️ **عرض منتجات متقدم** - تصفح آلاف البوتات بسهولة
- 💳 **طرق دفع متعددة** -  KPAY (التحويل البنكي الكويتي)، Stripe (البطاقات)، PayPal
- 🔒 **دفع آمن** - تشفير SSL وحماية بيانات العملاء
- ⚡ **تسليم فوري** - احصل على المنتج فوراً بعد الدفع
- 📊 **لوحة تحكم شاملة** - إدارة المنتجات والطلبات والإعدادات
- 💬 **تكامل Discord** - إخطارات فورية للعملاء والإدارة
- 📱 **تصميم متجاوب** - يعمل على جميع الأجهزة
- 🌍 **دعم اللغة العربية** - واجهة عربية كاملة

## المتطلبات 📋

- Node.js 18.0 أو أحدث
- npm أو yarn
- حساب Stripe (اختياري - للدفع ببطاقات)
- حساب KPAY (للتحويل البنكي الكويتي)
- Discord Server و Webhook

## التثبيت 🚀

### 1. استنساخ المستودع

```bash
git clone <repo-url>
cd discord-bot-store
```

### 2. تثبيت المكتبات

```bash
npm install
```

### 3. إعداد متغيرات البيئة

انسخ `.env.local` وملأ البيانات:

```bash
cp .env.local .env.local
```

ثم عدّل `.env.local` بناءً على خدماتك:

```env
# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
DISCORD_GUILD_ID=your_guild_id
DISCORD_BOT_TOKEN=your_bot_token

# Stripe (للدفع ببطاقات)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# KPAY (للتحويل البنكي الكويتي)
KPAY_API_KEY=your_kpay_api_key
KPAY_MERCHANT_ID=your_merchant_id

# JWT
JWT_SECRET=your-secret-key-change-this

# Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=hashed_password

# API
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. إعداد البيانات المحلية

الموقع يستخدم ملفات JSON محلية لتخزين البيانات:

- `data/products.json` - يحتوي على المنتجات
- `data/orders.json` - يحتوي على الطلبات

المنتجات الأولية مضافة مسبقاً، يمكنك تعديلها حسب الحاجة.

### 4. تشغيل التطبيق

#### في بيئة التطوير:

```bash
npm run dev
```

ثم افتح المتصفح على `http://localhost:3000`

#### في بيئة الإنتاج:

```bash
npm run build
npm run start
```

## الاستخدام 📖

### المتجر العام

1. **الصفحة الرئيسية** (`/`): عرض معلومات المتجر والمميزات
2. **المتجر** (`/products`): تصفح جميع البوتات والمنتجات
3. **الدفع** (`/checkout?product=id`): إتمام عملية الشراء

### لوحة التحكم (`/admin`)

#### المنتجات 📦
- عرض جميع المنتجات
- إضافة منتج جديد
- تعديل بيانات المنتج
- حذف المنتج

#### الطلبات 📋
- عرض جميع الطلبات
- متابعة حالة الدفع
- معلومات العميل والمنتج

#### الإعدادات ⚙️
- إعدادات Discord Webhook
- إعدادات قاعدة البيانات
- مفاتيح الدفع

## البنية المشروع 📁

```
discord-bot-store/
├── data/
│   ├── products.json       # ملف المنتجات المحلي
│   └── orders.json         # ملف الطلبات المحلي
├── src/
│   ├── app/
│   │   ├── api/              # API endpoints
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   └── payments/
│   │   ├── admin/            # لوحة التحكم
│   │   ├── checkout/         # صفحة الدفع
│   │   ├── products/         # صفحة المنتجات
│   │   ├── success/          # صفحة النجاح
│   │   ├── layout.tsx        # التخطيط الرئيسي
│   │   └── page.tsx          # الصفحة الرئيسية
│   ├── components/           # مكونات React
│   ├── lib/                  # مكتبات مساعدة
│   │   ├── data.ts           # إدارة البيانات المحلية
│   │   └── mongodb.ts        # اتصال MongoDB (غير مستخدم)
│   ├── models/               # نماذج Mongoose (غير مستخدمة)
│   │   ├── Product.ts
│   │   ├── Order.ts
│   │   └── User.ts
│   ├── styles/               # أنماط CSS
│   │   └── globals.css
│   └── utils/                # دوال مساعدة
│       ├── discord.ts        # وظائف Discord
│       └── payment.ts        # وظائف الدفع
├── public/                   # الملفات الثابتة
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
├── postcss.config.js
└── .env.local               # متغيرات البيئة
```

## API Endpoints 🔌

### المنتجات

- `GET /api/products` - الحصول على جميع المنتجات
- `POST /api/products` - إضافة منتج جديد
- `GET /api/products/[id]` - الحصول على منتج معين
- `PUT /api/products/[id]` - تعديل المنتج
- `DELETE /api/products/[id]` - حذف المنتج

### الطلبات

- `GET /api/orders` - الحصول على جميع الطلبات
- `POST /api/orders` - إنشاء طلب جديد
- `GET /api/orders/[id]` - الحصول على تفاصيل الطلب

### الدفع

- `POST /api/payments/kpay/callback` - معالجة رد الاتصال من KPAY
- `POST /api/payments/stripe/webhook` - معالجة webhook من Stripe
- `GET /api/payments/paypal/success` - معالجة نجاح الدفع عبر PayPal

## الإعدادات المهمة ⚙️

### MongoDB

1. اذهب إلى [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. أنشئ حسابًا مجانيًا
3. أنشئ مجموعة (Cluster)
4. احصل على سلسلة الاتصال (Connection String)
5. ضعها في `MONGODB_URI`

### Discord Webhook

1. افتح إعدادات السيرفر
2. اذهب إلى Webhooks
3. أنشئ Webhook جديد
4. انسخ الرابط وضعه في `DISCORD_WEBHOOK_URL`

### Stripe

1. اذهب إلى [Stripe Dashboard](https://dashboard.stripe.com)
2. احصل على مفاتيح API
3. ضع المفاتيح في متغيرات البيئة

### KPAY

1. سجل حسابك على [KPAY](https://kpay.kw)
2. احصل على API Key و Merchant ID
3. ضعهما في متغيرات البيئة

## النشر 🌐

### Vercel (موصى به)

```bash
npm install -g vercel
vercel
```

### Railway

```bash
npm install -g @railway/cli
railway link
railway deploy
```

### DigitalOcean / Heroku / أي استضافة أخرى

تأكد من:
- تعيين متغيرات البيئة
- تشغيل `npm run build` قبل البدء
- استخدام `npm run start` للإنتاج

## التصحيح 🐛

للاطلاع على السجلات:

```bash
npm run dev
```

ستظهر الأخطاء في الطرفية (Terminal).

## الترخيص 📄

هذا المشروع مرخص تحت MIT License

## الدعم 💬

للمساعدة والدعم:
- افتح issue على GitHub
- تواصل عبر Discord
- أرسل بريد إلكتروني

## المساهمون 👥

شكر خاص لجميع المساهمين في تطوير هذا المشروع.

---

🚀 تم إنشاؤه بـ Next.js و TypeScript و Tailwind CSS

اشتري بثقة! 🛒✨
