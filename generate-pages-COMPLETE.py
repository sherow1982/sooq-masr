
import json
import re
from pathlib import Path

print("🔄 بدء توليد صفحات المنتجات المُحسّنة...")
print("="*80)

# قراءة المنتجات
with open('products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

# إنشاء مجلد
Path('products-pages').mkdir(exist_ok=True)

def clean_filename(text):
    """تنظيف اسم الملف"""
    forbidden = {
        '<': '‹', '>': '›', ':': '∶', '"': '＂',
        '/': '⁄', '\\\\': '⧹', '|': '｜', '?': '？', '*': '✱'
    }

    cleaned = text
    for char, replacement in forbidden.items():
        cleaned = cleaned.replace(char, replacement)

    cleaned = re.sub(r'\\s+', '-', cleaned.strip())
    cleaned = cleaned.replace('(', '').replace(')', '')
    cleaned = re.sub(r'-+', '-', cleaned)
    cleaned = cleaned.strip('-')

    return cleaned

def generate_product_page(product):
    """توليد صفحة HTML كاملة للمنتج"""

    discount = 0
    if product.get('price') and product.get('sale_price'):
        discount = round(((product['price'] - product['sale_price']) / product['price']) * 100)

    reviews_html = ''
    if 'reviews' in product and product['reviews']:
        for review in product['reviews'][:10]:
            verified = '✓ عملية شراء موثقة' if review.get('verified_purchase') else ''
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
                <span style="color: #48bb78; font-size: 0.85rem;">{verified}</span>
            </div>
            """

    rating = product.get('rating', 5)
    stars_html = '★' * int(rating) + ('☆' * (5 - int(rating)))

    # رقم واتساب (غيّره لرقمك)
    whatsapp_number = '201000000000'

    return f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{product.get('title', 'منتج')} - سوق مصر</title>
    <meta name="description" content="{product.get('description', '')}">
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../style.css">
    <script src="../cart.js"></script>

    <style>
        body {{ font-family: 'Cairo', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; direction: rtl; margin: 0; }}
        .container {{ max-width: 1200px; margin: 0 auto; background: white; border-radius: 24px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }}
        .back-btn {{ display: inline-flex; align-items: center; gap: 8px; color: #667eea; text-decoration: none; font-weight: 600; margin-bottom: 30px; padding: 10px 20px; border-radius: 50px; transition: 0.3s; }}
        .back-btn:hover {{ background: #f7fafc; }}
        .product-layout {{ display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-bottom: 50px; }}
        .main-image {{ width: 100%; aspect-ratio: 1; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.15); }}
        .main-image img {{ width: 100%; height: 100%; object-fit: cover; }}
        .product-title {{ font-size: 2rem; color: #2d3748; margin-bottom: 15px; line-height: 1.3; }}
        .rating-section {{ display: flex; align-items: center; gap: 15px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0; }}
        .stars {{ color: #fbbf24; font-size: 1.3rem; }}
        .price-section {{ background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 25px; border-radius: 16px; margin-bottom: 30px; color: white; }}
        .prices {{ display: flex; align-items: center; gap: 15px; margin-top: 10px; flex-wrap: wrap; }}
        .original-price {{ font-size: 1.2rem; text-decoration: line-through; opacity: 0.8; }}
        .sale-price {{ font-size: 2.5rem; font-weight: bold; }}
        .discount-badge {{ background: rgba(255,255,255,0.3); padding: 8px 16px; border-radius: 20px; font-size: 1rem; }}
        .description {{ margin-bottom: 30px; padding: 20px; background: #f7fafc; border-radius: 12px; }}
        .description h3 {{ font-size: 1.3rem; color: #2d3748; margin-bottom: 15px; }}
        .description p {{ color: #4a5568; line-height: 1.8; font-size: 1.05rem; }}
        .shipping-info-box {{ background: #f0fff4; border: 2px solid #48bb78; border-radius: 16px; padding: 20px; margin-bottom: 30px; }}
        .shipping-info-box h4 {{ color: #22543d; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }}
        .shipping-info-box p {{ color: #2f855a; line-height: 1.6; margin: 8px 0; }}
        .action-buttons {{ display: flex; gap: 15px; margin-bottom: 30px; flex-wrap: wrap; }}
        .btn {{ flex: 1; min-width: 200px; padding: 18px 24px; border: none; border-radius: 50px; font-size: 1.1rem; font-weight: 700; cursor: pointer; transition: all 0.3s; font-family: 'Cairo', sans-serif; display: flex; align-items: center; justify-content: center; gap: 10px; }}
        .btn-primary {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; box-shadow: 0 6px 20px rgba(102,126,234,0.4); }}
        .btn-primary:hover {{ transform: translateY(-3px); box-shadow: 0 10px 30px rgba(102,126,234,0.5); }}
        .btn-success {{ background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); color: white; box-shadow: 0 6px 20px rgba(37,211,102,0.4); }}
        .btn-success:hover {{ transform: translateY(-3px); box-shadow: 0 10px 30px rgba(37,211,102,0.5); }}
        .reviews-section {{ margin-top: 50px; padding-top: 50px; border-top: 2px solid #e2e8f0; }}
        .reviews-section h3 {{ font-size: 1.8rem; color: #2d3748; margin-bottom: 30px; }}
        .review-card {{ background: #f7fafc; border-radius: 16px; padding: 20px; margin-bottom: 20px; border-right: 4px solid #667eea; }}
        .review-header {{ display: flex; justify-content: space-between; margin-bottom: 10px; align-items: center; }}
        .reviewer-name {{ font-weight: 600; color: #2d3748; font-size: 1.05rem; }}
        .review-date {{ color: #718096; font-size: 0.9rem; }}
        .review-text {{ color: #4a5568; line-height: 1.6; margin: 10px 0; }}
        .cart-notification {{ position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-100px); background: #48bb78; color: white; padding: 15px 30px; border-radius: 50px; box-shadow: 0 10px 30px rgba(72,187,120,0.4); z-index: 10000; opacity: 0; transition: all 0.3s; }}
        .cart-notification.show {{ opacity: 1; transform: translateX(-50%) translateY(0); }}
        @media (max-width: 768px) {{ 
            .product-layout {{ grid-template-columns: 1fr; gap: 30px; }} 
            .container {{ padding: 20px; }}
            .product-title {{ font-size: 1.5rem; }}
            .action-buttons {{ flex-direction: column; }}
            .btn {{ min-width: 100%; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <a href="../index.html" class="back-btn">← العودة للمتجر</a>

        <div class="product-layout">
            <div class="main-image">
                <img src="{product.get('image_link', '')}" alt="{product.get('title', '')}" id="product-image">
            </div>

            <div class="product-info">
                <h1 class="product-title" id="product-title">{product.get('title', 'منتج')}</h1>

                <div class="rating-section">
                    <div class="stars">{stars_html}</div>
                    <span class="rating-text">{product.get('rating', 5)} ({product.get('review_count', 0)} تقييم)</span>
                </div>

                <div class="price-section">
                    <div class="price-label">السعر الخاص</div>
                    <div class="prices">
                        {'<span class="original-price">' + str(product.get('price', '')) + ' جنيه</span>' if product.get('price') else ''}
                        <span class="sale-price" id="product-price">{product.get('sale_price', product.get('price', ''))} جنيه</span>
                        {f'<span class="discount-badge">وفر {discount}%</span>' if discount > 0 else ''}
                    </div>
                </div>

                <div class="description">
                    <h3>📝 وصف المنتج</h3>
                    <p>{product.get('description', '')}</p>
                </div>

                <div class="shipping-info-box">
                    <h4>🚚 معلومات الشحن</h4>
                    <p><strong>تكلفة الشحن:</strong> {product.get('shipping_description', 'الشحن لكل مصر 100 جنيه')}</p>
                    <p><strong>وقت التوصيل:</strong> {product.get('delivery_time', 'التوصيل خلال 3 أيام عمل')}</p>
                </div>

                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="addToCartAndNotify()">
                        🛒 ضع في السلة
                    </button>
                    <button class="btn btn-success" onclick="orderViaWhatsApp()">
                        💬 اطلب عبر واتساب
                    </button>
                </div>
            </div>
        </div>

        <div class="reviews-section">
            <h3>⭐ آراء العملاء</h3>
            {reviews_html if reviews_html else '<p style="color: #718096; text-align: center; padding: 40px;">لا توجد تقييمات بعد. كن أول من يقيّم هذا المنتج!</p>'}
        </div>
    </div>

    <script>
        // بيانات المنتج
        const productData = {{
            id: {product.get('id')},
            title: "{product.get('title', '')}",
            price: {product.get('sale_price', product.get('price', 0))},
            image_link: "{product.get('image_link', '')}",
            sale_price: {product.get('sale_price', 0)}
        }};

        // إضافة للسلة مع إشعار
        function addToCartAndNotify() {{
            shoppingCart.addToCart(productData);
        }}

        // الطلب عبر واتساب
        function orderViaWhatsApp() {{
            const productDetails = `🛍️ *طلب من سوق مصر*\n\n` +
                `*المنتج:* {product.get('title', '')}\n` +
                `*السعر:* {product.get('sale_price', product.get('price', ''))} جنيه\n` +
                `*الشحن:* {product.get('shipping_description', 'الشحن لكل مصر 100 جنيه')}\n\n` +
                `─────────────\n` +
                `*من فضلك أدخل بياناتك:*\n` +
                `الاسم: \n` +
                `رقم الهاتف: \n` +
                `العنوان التفصيلي: \n` +
                `المحافظة: \n` +
                `ملاحظات إضافية: `;

            const whatsappURL = `https://wa.me/{whatsapp_number}?text=${{encodeURIComponent(productDetails)}}`;
            window.open(whatsappURL, '_blank');
        }}
    </script>
</body>
</html>"""

# توليد الصفحات
success = 0
errors = []

for product in products:
    try:
        clean_slug = clean_filename(product['slug'])
        filename = f"product-{{product['id']}}-{{clean_slug}}.html"
        filepath = f"products-pages/{{filename}}"

        if len(filepath) > 240:
            clean_slug = clean_slug[:80]
            filename = f"product-{{product['id']}}-{{clean_slug}}.html"
            filepath = f"products-pages/{{filename}}"

        page_content = generate_product_page(product)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(page_content)

        success += 1
        if success % 50 == 0:
            print(f"   ✅ تم: {{success}} صفحة...")

    except Exception as e:
        errors.append(f"خطأ في {{product['id']}}: {{str(e)}}")

print("\n" + "="*80)
print(f"✅ تم بنجاح: {{success}} صفحة")
if errors:
    print(f"❌ أخطاء: {{len(errors)}}")
    for error in errors[:5]:
        print(f"   - {{error}}")
print("="*80)
