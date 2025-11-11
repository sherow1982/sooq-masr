# 📋 فييد Google Merchant Center

## 🎯 النظرة العامة

هذا المستودع يحتوي على نظام أوتوماتيكي لتوليد فييد XML متوافق بشكل كامل مع **Google Merchant Center** لجميع منتجات متجر سوق مصر.

---

## 📊 الإحصائيات

- **إجمالي المنتجات**: 860 منتج
- **تنسيق الفييد**: RSS 2.0 XML
- **رابط الفييد**: [https://sooq-masr.com/google-merchant-feed.xml](https://sooq-masr.com/google-merchant-feed.xml)
- **التحديث**: أوتوماتيكي عند كل تغيير

---

## ✅ الميزات

### 📦 الحقول الإلزامية
جميع الحقول الإلزامية حسب متطلبات Google:
- ☑️ `g:id` - معرف فريد للمنتج
- ☑️ `g:title` - عنوان المنتج (أقصى 150 حرف)
- ☑️ `g:description` - وصف المنتج (أقصى 5000 حرف)
- ☑️ `g:link` - رابط صفحة المنتج
- ☑️ `g:image_link` - رابط صورة المنتج
- ☑️ `g:price` - السعر بصيغة "1000.00 EGP"
- ☑️ `g:availability` - التوفر (in stock)
- ☑️ `g:condition` - الحالة (new)

### 🎁 الحقول الموصى بها
- ☑️ `g:brand` - العلامة التجارية
- ☑️ `g:google_product_category` - التصنيف
- ☑️ `g:sale_price` - السعر المخفض
- ☑️ `g:shipping` - معلومات الشحن
- ☑️ `g:product_rating` - تقييم المنتج
- ☑️ `g:product_review_count` - عدد المراجعات
- ☑️ `g:identifier_exists` - وجود معرفات
- ☑️ `g:age_group` - الفئة العمرية

---

## 🚀 كيفية العمل

### توليد تلقائي
يتم توليد الفييد تلقائياً عند:
1. 📝 تحديث `products.json`
2. ⚙️ تحديث `generate-feed.py`
3. ⏰ كل 12 ساعة تلقائياً

### توليد يدوي
يمكنك تشغيل السكريبت يدوياً:

```bash
python3 generate-feed.py
```

أو من GitHub Actions:
1. اذهب إلى **Actions** تب
2. اختر **Generate Google Merchant Feed**
3. اضغط **Run workflow**

---

## 📖 متطلبات التشغيل

- Python 3.11+
- ملف `products.json` في الريبو
- المكتبات: مدمجة في Python (json, xml, re)

---

## 🔗 روابط مفيدة

- 🌐 **الفييد المباشر**: https://sooq-masr.com/google-merchant-feed.xml
- 📋 **Google Merchant Center**: https://merchants.google.com
- 📘 **دليل Google**: https://support.google.com/merchants/answer/7052112

---

## ⚙️ التصنيفات المستخدمة

يتم تعيين التصنيفات التالية حسب نوع المنتج:

- 💄 **Cosmetics/Makeup** → `Health & Beauty > Personal Care > Cosmetics`
- 💇 **Hair Care** → `Health & Beauty > Personal Care > Hair Care`
- 🧔 **Skin Care** → `Health & Beauty > Personal Care > Cosmetics > Skin Care`
- 🛋️ **Furniture** → `Home & Garden > Furniture`
- ⭐ **Default** → `Health & Beauty > Personal Care`

---

## 🛠️ الصيانة

### إضافة منتجات جديدة
1. أضف المنتجات إلى `products.json`
2. ادفع التغييرات إلى GitHub
3. سيتم تحديث الفييد تلقائياً ✅

### تحديث الأسعار
1. عدّل الأسعار في `products.json`
2. ادفع التغييرات
3. سيتم إعادة توليد الفييد تلقائياً ✅

---

## 🐞 معالجة الأخطاء

إذا فشل التوليد:

1. تحقق من صحة تنسيق `products.json`
2. تأكد من وجود جميع الحقول الإلزامية
3. راجع سجلات Actions لرؤية الأخطاء

---

## 📝 مثال على منتج في الفييد

```xml
<item>
  <g:id>1</g:id>
  <g:title>جهاز ديناميك لإعادة تأهيل اليد ايسر</g:title>
  <g:description>منتج أصلي جهاز ديناميك لإعادة تأهيل اليد ايسر بأفضل سعر في مصر...</g:description>
  <g:link>https://sooq-masr.com/products-pages/جهاز-ديناميك-لإعادة-تأهيل-اليد-ايسر-1.html</g:link>
  <g:image_link>https://media.taager.com/360x360/86971a57-a2e0-4a39-a3c3-75a7c2663117.jpg</g:image_link>
  <g:price>6750.00 EGP</g:price>
  <g:sale_price>6250.00 EGP</g:sale_price>
  <g:availability>in stock</g:availability>
  <g:condition>new</g:condition>
  <g:brand>Generic</g:brand>
  <g:google_product_category>Health & Beauty > Personal Care > Cosmetics</g:google_product_category>
  <g:shipping>
    <g:country>EG</g:country>
    <g:service>Standard</g:service>
    <g:price>100.00 EGP</g:price>
  </g:shipping>
  <g:product_rating>4.6</g:product_rating>
  <g:product_review_count>24</g:product_review_count>
  <g:identifier_exists>false</g:identifier_exists>
  <g:age_group>adult</g:age_group>
</item>
```

---

## ✅ التحقق من الفييد

يمكنك التحقق من صحة الفييد باستخدام:
- [Google Merchant Center Feed Rules](https://support.google.com/merchants/answer/7052112)
- [Feed Validator](https://www.feedvalidator.org/)

---

## 📞 الدعم

لأي استفسارات أو مشاكل:
- فتح Issue في GitHub
- راجع سجلات Actions للتفاصيل

---

❤️ **متجر سوق مصر** - منتجات أصلية بأفضل الأسعار
