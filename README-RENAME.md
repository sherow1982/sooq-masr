# 🔧 تعليمات إصلاح مشكلة 404

## المشكلة
جميع صفحات المنتجات تعطي 404 بسبب عدم تطابق أسماء الملفات مع الروابط المولدة.

## الحل
تم تعديل ملف `app.js` ليستخدم فقط `product-{id}.html` بدلاً من `product-{id}-{slug}.html`

## الخطوات المطلوبة

### 1️⃣ إعادة تسمية جميع ملفات المنتجات (اختياري)

**الحل الأول: استخدام سكريبت Python**

```python
import os
import re

products_dir = "products-pages"

for filename in os.listdir(products_dir):
    if filename.endswith(".html") and filename.startswith("product-"):
        match = re.match(r"product-(\d+)", filename)
        if match:
            product_id = match.group(1)
            new_name = f"product-{product_id}.html"
            
            if filename != new_name:
                old_path = os.path.join(products_dir, filename)
                new_path = os.path.join(products_dir, new_name)
                
                os.rename(old_path, new_path)
                print(f"✅ Renamed: {filename} -> {new_name}")

print("✨ Done!")
```

**الحل الثاني: استخدام PowerShell (للويندوز)**

```powershell
cd products-pages

Get-ChildItem -Filter "product-*.html" | ForEach-Object {
    if ($_.Name -match '^product-(\d+)') {
        $newName = "product-$($matches[1]).html"
        if ($_.Name -ne $newName) {
            Rename-Item $_.FullName -NewName $newName
            Write-Host "✅ Renamed: $($_.Name) -> $newName"
        }
    }
}

Write-Host "✨ Done!"
```

**الحل الثالث: استخدام Git Bash (للويندوز/لينكس)**

```bash
cd products-pages

for file in product-*.html; do
    if [[ $file =~ ^product-([0-9]+) ]]; then
        id="${BASH_REMATCH[1]}"
        newname="product-${id}.html"
        if [ "$file" != "$newname" ]; then
            mv "$file" "$newname"
            echo "✅ Renamed: $file -> $newname"
        fi
    fi
done

echo "✨ Done!"
```

### 2️⃣ رفع التغييرات إلى GitHub

```bash
git add products-pages/
git commit -m "Fix: rename all product pages to use ID only"
git push origin main
```

### 3️⃣ اختبار الموقع

بعد رفع التغييرات، انتظر 1-2 دقيقة حتى يتم نشر GitHub Pages، ثم:

1. امسح الذاكرة المؤقتة (Ctrl + Shift + Delete)
2. افتح الموقع: https://sooq-masr.arabsad.com
3. انقر على أي منتج للتأكد من عمل الروابط

---

## ملاحظات هامة

- ✅ تم تعديل `app.js` ليستخدم فقط ID في الروابط
- ✅ ملف `styles.css` موجود وبالمسار الصحيح
- ⚠️ يجب إعادة تسمية جميع ملفات المنتجات (أكثر من 250 ملف)

---

## مثال على التغيير

### قبل:
```
product-1-جهاز-ديناميك-لإعادة-تأهيل-اليد-ايسر.html
product-10-Odessa-hair-care-set.html
product-100-نظام-اللياقة-البدنية-الذكي-3-في-1-الكهربائية.html
```

### بعد:
```
product-1.html
product-10.html
product-100.html
```

---

🚀 **جرّب أي حل من الحلول أعلاه وسيعمل الموقع فوراً!**
