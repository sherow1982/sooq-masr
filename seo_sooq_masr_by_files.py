#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
تهيئة السيو وسكيما لجميع ملفات المنتجات في products-pages ريبو سوق مصر
"""

import sys
import re
from pathlib import Path
from datetime import datetime, timedelta

def extract_title(html):
    m = re.search(r'<title[^>]*>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
    if m:
        return m.group(1).strip()
    m = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.IGNORECASE | re.DOTALL)
    if m:
        return re.sub(r'<.*?>', '', m.group(1)).strip()
    return "منتج من سوق مصر"

def extract_image(html):
    m = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', html, re.IGNORECASE)
    if m:
        src = m.group(1)
        if src.startswith('http'):
            return src
        return f"https://sherow1982.github.io/sooq-masr/{src.lstrip('/')}"
    return "https://sherow1982.github.io/sooq-masr/logo.png"

def extract_price(html):
    m = re.search(r'(\d+[\.,]?\d*)\s*(EGP|جنيه|جم|ج\.م)', html, re.IGNORECASE)
    if m:
        val = m.group(1).replace(',', '.')
        try:
            return float(val)
        except:
            return 0
    return 0

def build_product_url(file_path: Path):
    name = file_path.name
    return f"https://sherow1982.github.io/sooq-masr/products-pages/{name}"

def create_product_schema(title, image, url, price):
    if not price:
        price = 0
    price_valid_until = (datetime.now() + timedelta(days=365)).strftime('%Y-%m-%d')
    schema = f"""
{{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "{title}",
  "image": ["{image}"],
  "description": "{title} - تسوق الآن من سوق مصر مع توصيل سريع لجميع المحافظات.",
  "sku": "",
  "mpn": "",
  "brand": {{
    "@type": "Brand",
    "name": "سوق مصر"
  }},
  "offers": {{
    "@type": "Offer",
    "url": "{url}",
    "priceCurrency": "EGP",
    "price": "{price}",
    "priceValidUntil": "{price_valid_until}",
    "itemCondition": "https://schema.org/NewCondition",
    "availability": "https://schema.org/InStock",
    "seller": {{
      "@type": "Organization",
      "name": "سوق مصر"
    }}
  }}
}}
"""
    return schema.strip()

def create_local_business_schema():
    return """
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "سوق مصر",
  "image": "https://sherow1982.github.io/sooq-masr/logo.png",
  "url": "https://sherow1982.github.io/sooq-masr/",
  "telephone": "+201110760081",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "جمهورية مصر العربية",
    "addressLocality": "القاهرة",
    "addressRegion": "القاهرة",
    "postalCode": "11511",
    "addressCountry": "EG"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "30.033333",
    "longitude": "31.233334"
  },
  "openingHours": "Su-Sa 08:00-23:00",
  "priceRange": "$$",
  "areaServed": [
    {"@type": "City", "name": "القاهرة"},
    {"@type": "City", "name": "الإسكندرية"},
    {"@type": "City", "name": "الجيزة"},
    {"@type": "City", "name": "المنصورة"},
    {"@type": "City", "name": "أسيوط"}
  ]
}
""".strip()

def create_meta_tags(title, desc, image, url, price):
    if len(desc) > 155:
        desc = desc[:152] + "..."
    governorates = "القاهرة، الإسكندرية، الجيزة، أسيوط، المنصورة"
    meta = f"""
    <!-- SEO Meta Tags -->
    <title>{title} - سوق مصر | أفضل العروض والأسعار</title>
    <meta name="description" content="{desc} اشتري الآن من سوق مصر - توصيل شامل المحافظة.">
    <meta name="keywords" content="{title}, سوق مصر, تسوق اونلاين, منتجات مصر, عروض مصر, {governorates}">
    <meta name="robots" content="index, follow">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="geo.region" content="EG">
    <meta name="geo.placename" content="مصر">
    <meta name="geo.position" content="30.033333;31.233334">
    <meta name="ICBM" content="30.033333, 31.233334">
    <link rel="canonical" href="{url}">
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="{title} - سوق مصر">
    <meta property="og:description" content="{desc}">
    <meta property="og:image" content="{image}">
    <meta property="og:url" content="{url}">
    <meta property="og:type" content="product">
    <meta property="og:site_name" content="سوق مصر">
    <meta property="og:locale" content="ar_EG">
    <meta property="product:price:amount" content="{price}">
    <meta property="product:price:currency" content="EGP">
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{title} - سوق مصر">
    <meta name="twitter:description" content="{desc}">
    <meta name="twitter:image" content="{image}">
    """
    return meta

def inject_seo(html, title, image, url, price):
    head_close = "</head>"
    if head_close not in html:
        print("   ⚠️ لا يوجد </head> في الصفحة، سيتم تخطي الملف")
        return html

    html = re.sub(
        r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>.*?</script>',
        '',
        html,
        flags=re.DOTALL | re.IGNORECASE
    )

    desc = title
    meta = create_meta_tags(title, desc, image, url, price)
    product_schema = create_product_schema(title, image, url, price)
    local_schema = create_local_business_schema()

    injection = f"""
{meta}

<!-- Product Schema JSON-LD (Auto) -->
<script type="application/ld+json">
{product_schema}
</script>

<!-- LocalBusiness Schema JSON-LD (Auto) -->
<script type="application/ld+json">
{local_schema}
</script>

</head>"""

    return html.replace(head_close, injection)

def process_file(file_path: Path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            html = f.read()
        title = extract_title(html)
        image = extract_image(html)
        price = extract_price(html)
        url = build_product_url(file_path)
        updated = inject_seo(html, title, image, url, price)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(updated)
        print(f"   ✅ تم تحديث: {file_path.name}")
        return True
    except Exception as e:
        print(f"   ❌ خطأ في {file_path.name}: {e}")
        return False

def main():
    print("\n" + "="*60)
    print("🇪🇬 سكربت سيو/سكيما لكل ملفات المنتجات في products-pages - سوق مصر 🇪🇬")
    print("="*60 + "\n")

    root = Path(".")
    products_dir = root / "products-pages"

    if not products_dir.exists():
        print(f"❌ مجلد products-pages غير موجود في: {root.resolve()}")
        sys.exit(1)

    html_files = list(products_dir.glob("*.html"))
    if not html_files:
        print("❌ لا يوجد أي ملفات HTML داخل products-pages/")
        sys.exit(1)

    print(f"📦 تم العثور على {len(html_files)} صفحة منتج في products-pages/\n")

    ok = 0
    fail = 0

    for i, fp in enumerate(html_files, 1):
        print(f"[{i}/{len(html_files)}] معالجة: {fp.name} ...")
        if process_file(fp):
            ok += 1
        else:
            fail += 1

    print("\n" + "="*60)
    print("📊 النتائج النهائية:")
    print("="*60)
    print(f"✅ نجح: {ok} ملف")
    print(f"❌ فشل: {fail} ملف")
    if html_files:
        print(f"📈 نسبة النجاح: {(ok/len(html_files)*100):.1f}%")
    print("\n✨ انتهى التنفيذ، الصفحات التي نجحت الآن تحتوي على سكيما ومنظومة ميتا كاملة جاهزة للـ SEO والـ Rich Results\n")

if __name__ == "__main__":
    main()
