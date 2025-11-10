# 🛠️ دليل إصلاح مشكلة 404 - حل تلقائي كامل

## 🔴 المشكلة

جميع صفحات المنتجات تعطي **404 Not Found** عند محاولة فتحها.

### السبب:
- ملفات المنتجات مسماة: `product-{id}-{name-with-details}.html`
- الكود يولد روابط: `product-{id}-{simplified-slug}.html`
- **عدم التطابق** بين الاسم الفعلي والرابط = **404**

---

## ✅ الحل (تم تنفيذه تلقائياً)

### الخطوة 1: تعديل كود التطبيق ✅

تم تعديل ملف `app.js` ليستخدم فقط **product ID** بدون slug:

```javascript
// قبل:
const productLink = `products-pages/product-${product.id}-${productSlug}.html`;

// بعد:
const productLink = `products-pages/product-${product.id}.html`;
```

✅ **تم التعديل والنشر على GitHub**

---

### الخطوة 2: إعادة تسمية ملفات المنتجات ⚠️

يجب إعادة تسمية جميع ملفات المنتجات (أكثر من 250 ملف) من:
```
product-1-جهاز-ديناميك-لإعادة-تأهيل-اليد.html
```
إلى:
```
product-1.html
```

---

## 🚀 طرق الحل التلقائي

### ⭐ الحل الموصى به: سكريبت Python مع GitHub API

هذا الحل يقرأ ويعدل الملفات **مباشرة على GitHub** بدون حاجة لتحميل الريبو!

#### المتطلبات:
```bash
pip install requests
```

#### الخطوات:

**1. إنشاء GitHub Personal Access Token:**
   - اذهب إلى: [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
   - اضغط **Generate new token (classic)**
   - اختر صلاحية: **repo** (إدارة كاملة للريبو)
   - اضغط **Generate token**
   - انسخ التوكن (لن يظهر مرة أخرى!)

**2. تحميل السكريبت:**
```bash
curl -O https://raw.githubusercontent.com/sherow1982/sooq-masr/main/auto-rename-github.py
```

**3. تشغيل السكريبت:**
```bash
python auto-rename-github.py
```

سيطلب منك إدخال Token، وسيبدأ فوراً في إعادة تسمية جميع الملفات تلقائياً!

---

### 💻 حل بديل: PowerShell (للويندوز)

إذا كنت تفضل العمل محلياً:

**1. استنسخ الريبو:**
```powershell
git clone https://github.com/sherow1982/sooq-masr.git
cd sooq-masr/products-pages
```

**2. شغّل سكريبت إعادة التسمية:**
```powershell
Get-ChildItem -Filter "product-*.html" | ForEach-Object {
    if ($_.Name -match '^product-(\d+)') {
        $newName = "product-$($matches[1]).html"
        if ($_.Name -ne $newName) {
            Rename-Item $_.FullName -NewName $newName
            Write-Host "✅ $($_.Name) -> $newName"
        }
    }
}
```

**3. ارفع التغييرات:**
```powershell
cd ..
git add products-pages/
git commit -m "Fix: rename all product pages to product-{id}.html"
git push origin main
```

---

### 🐧 حل بديل: Git Bash

```bash
git clone https://github.com/sherow1982/sooq-masr.git
cd sooq-masr/products-pages

for file in product-*.html; do
    if [[ $file =~ ^product-([0-9]+) ]]; then
        id="${BASH_REMATCH[1]}"
        newname="product-${id}.html"
        if [ "$file" != "$newname" ]; then
            mv "$file" "$newname"
            echo "✅ $file -> $newname"
        fi
    fi
done

cd ..
git add products-pages/
git commit -m "Fix: rename all product pages"
git push origin main
```

---

### 🐍 حل بديل: Python محلي

إذا كنت تفضل Python ولديك الريبو محلياً:

```python
import os
import re

os.chdir('products-pages')

renamed = 0
for filename in os.listdir('.'):
    if filename.endswith('.html') and filename.startswith('product-'):
        match = re.match(r'product-(\d+)', filename)
        if match:
            new_name = f"product-{match.group(1)}.html"
            if filename != new_name:
                os.rename(filename, new_name)
                print(f"✅ {filename} -> {new_name}")
                renamed += 1

print(f"\n✨ Done! Renamed {renamed} files")
```

ثم ارفع التغييرات:
```bash
git add products-pages/
git commit -m "Fix: rename all products"
git push origin main
```

---

## 🧪 الخطوة النهائية: الاختبار

بعد رفع التغييرات:

1. ⛳ انتظر **1-2 دقيقة** حتى يتم نشر GitHub Pages

2. 🧽 امسح الذاكرة المؤقتة (Cache):
   - **Chrome/Edge**: `Ctrl + Shift + Delete`
   - اختر "الصور والملفات المخزنة"
   - اضغط "مسح"

3. 🌍 افتح الموقع: [https://sooq-masr.arabsad.com](https://sooq-masr.arabsad.com)

4. ✅ جرّب فتح أي صفحة منتج

5. 🎉 إذا فتحت بنجاح = **تم الإصلاح!**

---

## 📝 ملاحظات مهمة

- ✅ تم تعديل `app.js` ونشره على GitHub
- ✅ ملف `styles.css` موجود وصحيح
- ⚠️ يتبقى فقط إعادة تسمية 250+ ملف
- 🚀 **الحل الموصى به**: استخدم `auto-rename-github.py` للعمل مباشرة على GitHub

---

## ❓ ماذا إذا استمرت المشكلة؟

1. تأكد أن GitHub Pages مفعّل ويعمل
2. تأكد أن الملفات تم رفعها بنجاح
3. افتح Console في المتصفح (F12) وانظر للأخطاء
4. تأكد من الرابط في Network tab

---

## 👨‍💻 للدعم

إذا واجهت أي مشكلة، أرسل:
1. رسالة الخطأ من Console
2. رابط صفحة منتج تعطي 404
3. صورة شاشة من Network tab

---

🎉 **بعد تطبيق أي حل من الحلول أعلاه، سيعمل موقعك بشكل مثالي!**
