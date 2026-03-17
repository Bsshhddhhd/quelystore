# 🚀 متجر بوتات Discord - دليل الإعداد الكامل

## ✅ تم إكمال المشروع بنجاح!

تم بناء متجر إلكتروني احترافي لبيع بوتات Discord مع جميع المميزات المطلوبة.

---

## 🎯 المميزات المُنجزة

### ✨ واجهة المستخدم
- ✅ الصفحة الرئيسية جذّابة مع معلومات المتجر
- ✅ صفحة عرض المنتجات مع تصفية بالفئات
- ✅ صفحة دفع متقدمة مع فورم جمع البيانات
- ✅ صفحة تأكيد النجاح بعد الدفع
- ✅ تصميم متجاوب (Responsive) - يعمل على جميع الأجهزة
- ✅ دعم اللغة العربية كاملاً (RTL)

### 💳 طرق الدفع
- ✅ **KPAY** - تحويل بنكي كويتي (التحويل الفوري)
- ✅ **Stripe** - بطاقات ائتمان/خصم/Mastercard
- ✅ **PayPal** - الدفع عبر PayPal

### 🔔 التكامل مع Discord
- ✅ إرسال إشعارات عند كل عملية شراء جديدة
- ✅ إرسال بيانات المنتج والعميل للإدارة
- ✅ تأكيد الطلب للعميل عبر Discord
- ✅ Webhook integration جاهزة

### 📊 لوحة التحكم
- ✅ إدارة المنتجات (إضافة/تعديل/حذف)
- ✅ عرض جميع الطلبات مع تفاصيلها الكاملة
- ✅ متابعة حالة الدفع لكل طلب
- ✅ إعدادات Webhook و API Keys

### 🗄️ قاعدة البيانات
- ✅ نماذج MongoDB محسّنة (Product, Order, User)
- ✅ Schema مع validation
- ✅ العلاقات بين الكيانات

### 🔒 الأمان
- ✅ تشفير كلمات المرور (bcryptjs)
- ✅ JWT للمصادقة
- ✅ بيانات آمنة في .env.local
- ✅ SSL ready

---

## 🚀 كيفية الاستخدام

### البدء السريع

1. **فتح الصفحة الرئيسية**
   ```
   http://localhost:8080
   ```

2. **قائمة الملاحات**
   - المتجر: عرض جميع المنتجات
   - لوحة التحكم: إدارة كاملة للمتجر

3. **عملية الشراء**
   - اختر منتج
   - اضغط "اشتري الآن"
   - ملء البيانات (الاسم، البريد، Discord ID)
   - اختر طريقة دفع
   - إتمام الدفع

### لوحة التحكم (/admin)

#### المنتجات 📦
```
اضغط "➕ منتج جديد"
- أدخل اسم المنتج
- الوصف والسعر
- الفئة (moderation, music, entertainment, utility)
- رابط الصورة
- المميزات مفصولة بفواصل
```

#### الطلبات 📋
```
عرض جميع الطلبات مع:
- رقم الطلب
- اسم المنتج والعميل
- المبلغ وطريقة الدفع
- حالة الدفع (مكتمل/قيد المعالجة/فشل)
- معرف Discord
```

#### الإعدادات ⚙️
```
تقم بتحديث:
- Discord Webhook URL
- MongoDB Connection String
- Stripe Secret Key
- KPAY Credentials
```

---

## ⚙️ الإعدادات المهمة

### 1️⃣ MongoDB Atlas

```
1. اذهب إلى https://www.mongodb.com/cloud/atlas
2. أنشئ حسابً مجاني
3. إنشاء Cluster جديد
4. احصل على Connection String
5. ضعها في .env.local:
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
```

### 2️⃣ Discord Webhook

```
1. اذهب إلى إعدادات سيرفر Discord
2. اختر Integrations > Webhooks
3. أنشئ Webhook جديد
4. نسخ الرابط وضعه في .env.local:
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

### 3️⃣ Stripe (للبطاقات)

```
1. سجل في https://dashboard.stripe.com
2. احصل على API Keys
3. أضف إلى .env.local:
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4️⃣ KPAY (التحويل البنكي الكويتي)

```
1. تسجيل على https://kpay.kw
2. احصل على Merchant ID و API Key
3. أضف إلى .env.local:
   KPAY_API_KEY=your_api_key
   KPAY_MERCHANT_ID=your_merchant_id
```

---

## 📁 بنية المشروع

```
المشروع/
├── src/
│   ├── app/                    # صفحات وAPI
│   │   ├── page.tsx           # الصفحة الرئيسية
│   │   ├── admin/             # لوحة التحكم
│   │   ├── products/          # صفحة المنتجات
│   │   ├── checkout/          # صفحة الدفع
│   │   ├── success/           # صفحة النجاح
│   │   ├── api/               # API endpoints
│   │   │   ├── products/      # إدارة المنتجات
│   │   │   ├── orders/        # إدارة الطلبات
│   │   │   └── payments/      # معالجة الدفع
│   │   └── layout.tsx         # الـ Layout الرئيسي
│   ├── components/             # مكونات React
│   ├── models/                 # نماذج Mongoose
│   │   ├── Product.ts
│   │   ├── Order.ts
│   │   └── User.ts
│   ├── lib/                    # مكتبات مساعدة
│   ├── styles/                 # CSS
│   └── utils/                  # دوال مساعدة
├── public/                     # صور وملفات ثابتة
├── package.json               # المكتبات
├── next.config.js             # إعدادات Next.js
├── tsconfig.json              # إعدادات TypeScript
├── tailwind.config.js         # إعدادات Tailwind
├── postcss.config.js          # إعدادات PostCSS
└── .env.local                 # متغيرات البيئة (سري)
```

---

## 🌍 نشر المشروع

### Vercel (الأسهل والأسرع)

```bash
npm install -g vercel
vercel
```

ثم:
1. اختر المشروع
2. أضف متغيرات البيئة
3. انتظر النشر

### Railway

```bash
npm install -g @railway/cli
railway login
railway link
railway deploy
```

### DigitalOcean / Heroku / AWS

تأكد من:
- نسخ `.env.local` إلى البيئة
- تشغيل `npm run build`
- استخدام `npm run start`

---

## 🐛 معالجة الأخطاء الشائعة

### المشكلة: Port مشغول
```powershell
$env:PORT=3000
npm run dev
```

### المشكلة: MongoDB غير متصل
- تحقق من MONGODB_URI في .env.local
- تأكد من الاتصال بالإنترنت
- السماح بـ IP في MongoDB Atlas

### المشكلة: Stripe عدم الاتصال
- تحقق من STRIPE_SECRET_KEY
- استخدم مفاتيح Test حالياً
- في الإنتاج، استخدم Live Keys

### المشكلة: Discord Webhook لا يعمل
- تحقق من الرابط صحيح
- تأكد من أن Bot له صلاحيات الإرسال
- قد يكون الرابط منتهي الصلاحية

---

## 📞 الدعم والمساعدة

للمزيد من المعلومات:
- اقرأ README.md الشامل
- تحقق من البيانات في .env.local
- راجع الأخطاء في الـ Console

---

## 🎨 التخصيص

### تغيير الألوان
في `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#7c3aed',    // اللون الأساسي
      secondary: '#ec4899',   // اللون الثانوي
    },
  },
},
```

### تغيير اللغة
تم تعريبها تماماً. للعودة للإنجليزية:
- غيّر `lang="ar"` إلى `lang="en"`
- أزل `dir="rtl"` من layout.tsx

---

## ✅ قائمة التحقق النهائية

قبل النشر:
- [ ] أضفت MONGODB_URI
- [ ] أضفت DISCORD_WEBHOOK_URL
- [ ] أضفت STRIPE_SECRET_KEY و NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- [ ] أضفت KPAY_API_KEY و KPAY_MERCHANT_ID
- [ ] غيّرت JWT_SECRET إلى قيمة آمنة
- [ ] اختبرت عملية الشراء الكاملة
- [ ] تحققت من الإشعارات على Discord
- [ ] استعرضت لوحة التحكم

---

## 🚀 تشغيل المشروع حالياً

```bash
# التطوير
npm run dev

# البناء والإنتاج
npm run build
npm run start

# الاختبار
npm run lint
```

المشروع يعمل على: **http://localhost:8080**

---

**تم بناء المشروع بـ ❤️ باستخدام Next.js 13 + TypeScript + Tailwind CSS + MongoDB + Stripe + KPAY**

استمتع بمتجرك الاحترافي! 🎉
