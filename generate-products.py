import json
import re
from pathlib import Path

def load_products():
    with open('products.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def sanitize_filename(filename):
    """تنظيف اسم الملف من الأحرف غير المسموح بها"""
    filename = filename.replace('"', '')
    filename = filename.replace('\t', '')
    filename = filename.replace('\\', '-')
    filename = filename.replace('/', '-')
    filename = filename.replace(':', '-')
    filename = filename.replace('*', '-')
    filename = filename.replace('?', '-')
    filename = filename.replace('<', '-')
    filename = filename.replace('>', '-')
    filename = filename.replace('|', '-')
    filename = re.sub(r'\s+', '-', filename)
    filename = re.sub(r'-+', '-', filename)
    filename = filename.strip('-')
    return filename

def get_css():
    """CSS مدمج في الصفحة"""
    return '''
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
            padding: 20px;
            direction: rtl;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            text-align: center;
            color: white;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        .breadcrumb {
            padding: 20px 30px;
            background: #f8f9fa;
            border-bottom: 1px solid #e0e0e0;
        }

        .breadcrumb a {
            color: #667eea;
            text-decoration: none;
            margin: 0 5px;
        }

        .product-main {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            padding: 40px;
        }

        @media (max-width: 968px) {
            .product-main {
                grid-template-columns: 1fr;
            }
        }

        .product-image-section {
            position: sticky;
            top: 20px;
            height: fit-content;
        }

        .main-image {
            width: 100%;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            transition: transform 0.3s;
        }

        .main-image:hover {
            transform: scale(1.02);
        }

        .discount-badge {
            position: absolute;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 1.2em;
            box-shadow: 0 5px 15px rgba(245,87,108,0.4);
        }

        .product-info {
            padding: 20px;
        }

        .product-title {
            font-size: 2em;
            color: #2d3436;
            margin-bottom: 15px;
            line-height: 1.4;
        }

        .rating-section {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 20px;
            padding: 15px;
            background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
            border-radius: 10px;
        }

        .stars {
            color: #ffd700;
            font-size: 1.5em;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }

        .rating-number {
            font-size: 1.8em;
            font-weight: bold;
            color: #2d3436;
        }

        .review-count {
            color: #636e72;
        }

        .price-section {
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            padding: 25px;
            border-radius: 15px;
            margin: 25px 0;
        }

        .price-row {
            display: flex;
            align-items: center;
            gap: 20px;
            flex-wrap: wrap;
        }

        .current-price {
            font-size: 3em;
            color: #00b894;
            font-weight: bold;
        }

        .old-price {
            font-size: 1.8em;
            color: #b2bec3;
            text-decoration: line-through;
        }

        .save-amount {
            background: #00b894;
            color: white;
            padding: 8px 15px;
            border-radius: 20px;
            font-weight: bold;
        }

        .description {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 15px;
            margin: 25px 0;
            line-height: 1.8;
            font-size: 1.1em;
            color: #2d3436;
        }

        .shipping-info {
            background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
            padding: 25px;
            border-radius: 15px;
            margin: 25px 0;
        }

        .shipping-item {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 10px 0;
        }

        .shipping-icon {
            font-size: 1.8em;
        }

        .action-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 30px 0;
        }

        .btn {
            padding: 18px;
            border: none;
            border-radius: 12px;
            font-size: 1.2em;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            text-align: center;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 10px 25px rgba(102,126,234,0.4);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 35px rgba(102,126,234,0.5);
        }

        .btn-secondary {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            box-shadow: 0 10px 25px rgba(245,87,108,0.4);
        }

        .btn-secondary:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 35px rgba(245,87,108,0.5);
        }

        .reviews-section {
            padding: 40px;
            background: #f8f9fa;
        }

        .section-title {
            font-size: 2em;
            color: #2d3436;
            margin-bottom: 30px;
            text-align: center;
        }

        .rating-summary {
            background: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .rating-bar-row {
            display: flex;
            align-items: center;
            gap: 15px;
            margin: 10px 0;
        }

        .rating-bar-container {
            flex: 1;
            height: 10px;
            background: #e0e0e0;
            border-radius: 5px;
            overflow: hidden;
        }

        .rating-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #ffd700, #ffa500);
            transition: width 0.5s;
        }

        .review-card {
            background: white;
            padding: 25px;
            border-radius: 15px;
            margin-bottom: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            transition: transform 0.3s;
        }

        .review-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.12);
        }

        .review-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 15px;
        }

        .reviewer-info {
            display: flex;
            gap: 15px;
            align-items: center;
        }

        .reviewer-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5em;
            font-weight: bold;
        }

        .reviewer-name {
            font-weight: bold;
            color: #2d3436;
            font-size: 1.1em;
        }

        .review-date {
            color: #636e72;
            font-size: 0.9em;
        }

        .review-rating .stars {
            font-size: 1.2em;
        }

        .verified {
            color: #00b894;
            font-size: 0.85em;
            display: block;
            margin-top: 5px;
        }

        .review-comment {
            color: #2d3436;
            line-height: 1.6;
            font-size: 1.05em;
        }

        @media (max-width: 768px) {
            .product-main {
                padding: 20px;
            }
            
            .action-buttons {
                grid-template-columns: 1fr;
            }
            
            .product-title {
                font-size: 1.5em;
            }
            
            .current-price {
                font-size: 2em;
            }
        }
    </style>
    '''

def generate_product_page(product):
    """توليد صفحة منتج واحد"""
    reviews_html = ""
    for review in product['reviews']:
        stars = '★' * int(review['rating']) + '☆' * (5 - int(review['rating']))
        verified = '✓ عملية شراء موثقة' if review['verified_purchase'] else ''
        
        reviews_html += f'''
        <div class="review-card">
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="reviewer-avatar">{review['reviewer_name'][0]}</div>
                    <div>
                        <div class="reviewer-name">{review['reviewer_name']}</div>
                        <div class="review-date">{review['date']}</div>
                    </div>
                </div>
                <div class="review-rating">
                    <span class="stars">{stars}</span>
                    <span class="verified">{verified}</span>
                </div>
            </div>
            <div class="review-comment">{review['comment']}</div>
        </div>
        '''
    
    total_reviews = len(product['reviews'])
    rating_counts = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
    for review in product['reviews']:
        rating_counts[int(review['rating'])] += 1
    
    rating_bars = ""
    for i in range(5, 0, -1):
        count = rating_counts[i]
        percentage = (count / total_reviews * 100) if total_reviews > 0 else 0
        rating_bars += f'''
        <div class="rating-bar-row">
            <span>{i} نجمة</span>
            <div class="rating-bar-container">
                <div class="rating-bar-fill" style="width: {percentage}%"></div>
            </div>
            <span>{count}</span>
        </div>
        '''
    
    stars = '★' * int(product['rating']) + '☆' * (5 - int(product['rating']))
    discount = int((1 - product['sale_price'] / product['price']) * 100)
    save_amount = product['price'] - product['sale_price']
    
    html = f'''<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{product['title']} - سوق مصر</title>
    <meta name="description" content="{product['description']}">
    {get_css()}
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛍️ سوق مصر</h1>
            <p>منتجات أصلية بأفضل الأسعار</p>
        </div>

        <div class="breadcrumb">
            <a href="../index.html">الرئيسية</a> / 
            <a href="../products.html">المنتجات</a> / 
            <span>{product['title']}</span>
        </div>

        <div class="product-main">
            <div class="product-image-section">
                <div style="position: relative;">
                    <img src="{product['image_link']}" alt="{product['title']}" class="main-image">
                    <div class="discount-badge">-{discount}%</div>
                </div>
            </div>

            <div class="product-info">
                <h1 class="product-title">{product['title']}</h1>

                <div class="rating-section">
                    <span class="stars">{stars}</span>
                    <span class="rating-number">{product['rating']}</span>
                    <span class="review-count">({product['review_count']} تقييم)</span>
                </div>

                <div class="price-section">
                    <div class="price-row">
                        <span class="current-price">{product['sale_price']} جنيه</span>
                        <span class="old-price">{product['price']} جنيه</span>
                        <span class="save-amount">وفر {save_amount} جنيه</span>
                    </div>
                </div>

                <div class="description">
                    <h3>📝 وصف المنتج</h3>
                    <p>{product['description']}</p>
                </div>

                <div class="shipping-info">
                    <div class="shipping-item">
                        <span class="shipping-icon">🚚</span>
                        <div>
                            <strong>{product['shipping_description']}</strong>
                            <p>{product['delivery_time']}</p>
                        </div>
                    </div>
                </div>

                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="addToCart()">
                        🛒 أضف للسلة
                    </button>
                    <button class="btn btn-secondary" onclick="buyNow()">
                        ⚡ اشتر الآن
                    </button>
                </div>
            </div>
        </div>

        <div class="reviews-section">
            <h2 class="section-title">⭐ آراء العملاء</h2>

            <div class="rating-summary">
                <h3 style="margin-bottom: 20px;">توزيع التقييمات</h3>
                {rating_bars}
            </div>

            {reviews_html}
        </div>
    </div>

    <script>
        function addToCart() {{
            alert('تمت إضافة المنتج للسلة! 🛒');
        }}

        function buyNow() {{
            alert('جاري تحويلك لصفحة الدفع... ⚡');
        }}
    </script>
</body>
</html>'''
    
    return html

def main():
    print('🚀 بدء توليد صفحات المنتجات...')
    
    products = load_products()
    
    output_dir = Path('products-pages')
    output_dir.mkdir(exist_ok=True)
    
    success_count = 0
    error_count = 0
    
    for product in products:
        try:
            clean_slug = sanitize_filename(product['slug'])
            filename = f"product-{product['id']}-{clean_slug}.html"
            filepath = output_dir / filename
            
            html = generate_product_page(product)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html)
            
            success_count += 1
            print(f'✅ [{success_count}/{len(products)}] {filename}')
            
        except Exception as e:
            error_count += 1
            print(f'❌ خطأ في المنتج {product["id"]}: {str(e)}')
            continue
    
    print(f'\n✨ اكتمل! تم إنشاء {success_count} صفحة بنجاح')
    if error_count > 0:
        print(f'⚠️ فشل {error_count} صفحة')

if __name__ == '__main__':
    main()
