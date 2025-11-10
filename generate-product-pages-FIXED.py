
import json
import os
import re
from pathlib import Path

# قراءة بيانات المنتجات
with open('products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

# إنشاء مجلد products-pages إذا لم يكن موجوداً
Path('products-pages').mkdir(exist_ok=True)

def clean_filename(text):
    """
    تنظيف اسم الملف من الأحرف غير المسموحة في Windows
    الأحرف الممنوعة: < > : " / \\ | ? *
    """
    # استبدال الأحرف الممنوعة
    forbidden_chars = {
        '<': '‹',
        '>': '›',
        ':': '∶',
        '"': '＂',
        '/': '⁄',
        '\\': '⧹',
        '|': '｜',
        '?': '？',
        '*': '✱'  # استبدال النجمة بنجمة بديلة
    }

    for char, replacement in forbidden_chars.items():
        text = text.replace(char, replacement)

    # إزالة أي مسافات زائدة
    text = re.sub(r'\s+', '-', text.strip())

    # إزالة أي نقاط في نهاية الاسم
    text = text.rstrip('.')

    return text

def generate_product_page(product):
    """توليد صفحة HTML لمنتج"""

    # حساب نسبة الخصم
    discount = 0
    if product.get('price') and product.get('sale_price'):
        discount = round(((product['price'] - product['sale_price']) / product['price']) * 100)

    # توليد HTML للتقييمات
    reviews_html = ''
    if 'reviews' in product and product['reviews']:
        for review in product['reviews'][:5]:  # أول 5 تقييمات
            reviews_html += f"""
            <div class="review-card">
                <div class="review-header">
                    <div>
                        <div class="reviewer-name">👤 {review.get('reviewer_name', 'عميل')}</div>
                        <div class="stars">{'★' * int(review.get('rating', 5))}</div>
                    </div>
                    <div class="review-date">{review.get('date', '')}</div>
                </div>
                <div class="review-text">{review.get('comment', '')}</div>
                {'<span style="color: #48bb78; font-size: 0.85rem;">✓ عملية شراء موثقة</span>' if review.get('verified_purchase') else ''}
            </div>
            """

    # توليد النجوم
    rating = product.get('rating', 5)
    stars_html = '★' * int(rating) + ('☆' * (5 - int(rating)))

    html_content = f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{product.get('title', 'منتج')} - سوق مصر</title>
    <meta name="description" content="{product.get('description', '')}">

    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">

    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}

        body {{
            font-family: 'Cairo', 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            direction: rtl;
        }}

        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 24px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }}

        .back-btn {{
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
            margin-bottom: 30px;
            padding: 10px 20px;
            border-radius: 50px;
            transition: all 0.3s;
        }}

        .back-btn:hover {{ background: #f7fafc; }}

        .product-layout {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 50px;
            margin-bottom: 50px;
        }}

        .main-image {{
            width: 100%;
            aspect-ratio: 1;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }}

        .main-image img {{
            width: 100%;
            height: 100%;
            object-fit: cover;
        }}

        .product-title {{
            font-size: 2rem;
            color: #2d3748;
            margin-bottom: 15px;
            line-height: 1.3;
        }}

        .rating-section {{
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e2e8f0;
        }}

        .stars {{ color: #fbbf24; font-size: 1.3rem; }}

        .price-section {{
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 25px;
            border-radius: 16px;
            margin-bottom: 30px;
            color: white;
        }}

        .prices {{
            display: flex;
            align-items: center;
            gap: 15px;
            margin-top: 10px;
        }}

        .original-price {{
            font-size: 1.2rem;
            text-decoration: line-through;
            opacity: 0.8;
        }}

        .sale-price {{
            font-size: 2.5rem;
            font-weight: bold;
        }}

        .discount-badge {{
            background: rgba(255, 255, 255, 0.3);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 1rem;
        }}

        .description {{
            margin-bottom: 30px;
            padding: 20px;
            background: #f7fafc;
            border-radius: 12px;
        }}

        .description h3 {{
            font-size: 1.3rem;
            color: #2d3748;
            margin-bottom: 15px;
        }}

        .description p {{
            color: #4a5568;
            line-height: 1.8;
            font-size: 1.05rem;
        }}

        .shipping-info-box {{
            background: #f0fff4;
            border: 2px solid #48bb78;
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 30px;
        }}

        .shipping-info-box h4 {{
            color: #22543d;
            margin-bottom: 10px;
        }}

        .action-buttons {{
            display: flex;
            gap: 15px;
            margin-bottom: 30px;
        }}

        .btn {{
            flex: 1;
            padding: 18px;
            border: none;
            border-radius: 50px;
            font-size: 1.1rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s;
            font-family: 'Cairo', sans-serif;
        }}

        .btn-primary {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }}

        .btn-primary:hover {{
            transform: translateY(-3px);
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5);
        }}

        .btn-secondary {{
            background: white;
            color: #667eea;
            border: 2px solid #667eea;
        }}

        .reviews-section {{
            margin-top: 50px;
            padding-top: 50px;
            border-top: 2px solid #e2e8f0;
        }}

        .reviews-section h3 {{
            font-size: 1.8rem;
            color: #2d3748;
            margin-bottom: 30px;
        }}

        .review-card {{
            background: #f7fafc;
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 20px;
        }}

        .review-header {{
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }}

        .reviewer-name {{
            font-weight: 600;
            color: #2d3748;
        }}

        .review-date {{
            color: #718096;
            font-size: 0.9rem;
        }}

        .review-text {{
            color: #4a5568;
            line-height: 1.6;
            margin-top: 10px;
        }}

        @media (max-width: 768px) {{
            .product-layout {{ grid-template-columns: 1fr; }}
            .container {{ padding: 20px; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <a href="../index.html" class="back-btn">← العودة للمتجر</a>

        <div class="product-layout">
            <div class="main-image">
                <img src="{product.get('image_link', '')}" alt="{product.get('title', '')}">
            </div>

            <div class="product-info">
                <h1 class="product-title">{product.get('title', 'منتج')}</h1>

                <div class="rating-section">
                    <div class="stars">{stars_html}</div>
                    <span class="rating-text">{product.get('rating', 5)} ({product.get('review_count', 0)} تقييم)</span>
                </div>

                <div class="price-section">
                    <div class="price-label">السعر الخاص</div>
                    <div class="prices">
                        {'<span class="original-price">' + str(product.get('price', '')) + ' جنيه</span>' if product.get('price') else ''}
                        <span class="sale-price">{product.get('sale_price', product.get('price', ''))} جنيه</span>
                        {f'<span class="discount-badge">وفر {discount}%</span>' if discount > 0 else ''}
                    </div>
                </div>

                <div class="description">
                    <h3>📝 وصف المنتج</h3>
                    <p>{product.get('description', '')}</p>
                </div>

                <div class="shipping-info-box">
                    <h4>🚚 معلومات الشحن</h4>
                    <p>{product.get('shipping_description', 'الشحن لكل مصر')}</p>
                    <p>{product.get('delivery_time', 'التوصيل خلال 3 أيام عمل')}</p>
                </div>

                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="alert('سيتم التواصل معك قريباً لإتمام الطلب')">
                        🛒 اطلب الآن
                    </button>
                    <button class="btn btn-secondary" onclick="window.open('https://wa.me/201000000000?text=استفسار عن: {product.get('title', '')}', '_blank')">
                        💬 واتساب
                    </button>
                </div>
            </div>
        </div>

        <div class="reviews-section">
            <h3>⭐ آراء العملاء</h3>
            {reviews_html if reviews_html else '<p style="color: #718096;">لا توجد تقييمات بعد</p>'}
        </div>
    </div>
</body>
</html>"""

    return html_content

# توليد جميع صفحات المنتجات
print("🔄 بدء توليد صفحات المنتجات...")
print("="*70)

success_count = 0
error_count = 0
errors = []

for product in products:
    try:
        # تنظيف slug من الأحرف الممنوعة
        clean_slug = clean_filename(product['slug'])
        filename = f"product-{product['id']}-{clean_slug}.html"
        filepath = f"products-pages/{filename}"

        # التحقق من طول المسار (Windows له حد 260 حرف)
        if len(filepath) > 250:
            # تقصير الاسم
            short_slug = clean_slug[:100]
            filename = f"product-{product['id']}-{short_slug}.html"
            filepath = f"products-pages/{filename}"

        # توليد محتوى الصفحة
        page_content = generate_product_page(product)

        # حفظ الملف
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(page_content)

        print(f"✅ تم إنشاء: {filename}")
        success_count += 1

    except Exception as e:
        error_count += 1
        error_msg = f"❌ خطأ في المنتج ID={product['id']}: {str(e)}"
        print(error_msg)
        errors.append(error_msg)

print("="*70)
print(f"\n📊 النتيجة:")
print(f"   ✅ نجح: {success_count} صفحة")
print(f"   ❌ فشل: {error_count} صفحة")

if errors:
    print(f"\n⚠️ الأخطاء:")
    for error in errors:
        print(f"   {error}")

print(f"\n📁 الصفحات موجودة في: products-pages/")
