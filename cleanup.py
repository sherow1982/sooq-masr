import json
import re
from pathlib import Path

print("🔄 بدء التنظيف الشامل...")
print("=" * 80)

# تنظيف products.json
with open('products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"\n📦 عدد المنتجات: {len(products)}")
print("\n🧹 تنظيف الأسماء...")

count = 0
for product in products:
    old_slug = product['slug']
    
    # استبدال المسافات بشرطات
    new_slug = re.sub(r'\s+', '-', old_slug)
    
    # إزالة الأقواس
    new_slug = new_slug.replace('(', '').replace(')', '')
    
    # تنظيف الأحرف الممنوعة
    forbidden = '<>:"\\/|?*'
    for char in forbidden:
        new_slug = new_slug.replace(char, '')
    
    # إزالة الشرطات المتكررة
    new_slug = re.sub(r'-+', '-', new_slug)
    
    # تنظيف البداية والنهاية
    new_slug = new_slug.strip('-')
    
    if old_slug != new_slug:
        print(f"   ✏️  ID {product['id']}: {old_slug[:40]}... → {new_slug[:40]}...")
        count += 1
    
    product['slug'] = new_slug

# حفظ
with open('products.json', 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print("\n" + "=" * 80)
print(f"✅ تم تنظيف {count} منتج بنجاح!")
print("✅ تم حفظ products.json")
print("\n📝 الخطوة التالية:")
print("   python generate-pages-COMPLETE.py")