import json
import re
from pathlib import Path

def load_products():
    with open('products.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def sanitize_filename(filename):
    """تنظيف اسم الملف من الأحرف غير المسموح بها"""
    # إزالة الأحرف الخاصة وغير المسموح بها في Windows
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
    # إزالة المسافات الزائدة
    filename = re.sub(r'\s+', '-', filename)
    # إزالة الشرطات المتكررة
    filename = re.sub(r'-+', '-', filename)
    # إزالة الشرطات من البداية والنهاية
    filename = filename.strip('-')
    return filename

def generate_product_page(product, template):
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
    
    # حساب التقييمات
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
    
    html = template.replace('{{PRODUCT_ID}}', str(product['id']))
    html = html.replace('{{PRODUCT_TITLE}}', product['title'])
    html = html.replace('{{PRODUCT_IMAGE}}', product['image_link'])
    html = html.replace('{{PRODUCT_PRICE}}', str(product['price']))
    html = html.replace('{{PRODUCT_SALE_PRICE}}', str(product['sale_price']))
    html = html.replace('{{PRODUCT_RATING}}', str(product['rating']))
    html = html.replace('{{PRODUCT_RATING_STARS}}', stars)
    html = html.replace('{{REVIEW_COUNT}}', str(product['review_count']))
    html = html.replace('{{PRODUCT_DESCRIPTION}}', product['description'])
    html = html.replace('{{SHIPPING_COST}}', str(product['shipping_cost']))
    html = html.replace('{{SHIPPING_DESCRIPTION}}', product['shipping_description'])
    html = html.replace('{{DELIVERY_TIME}}', product['delivery_time'])
    html = html.replace('{{REVIEWS_HTML}}', reviews_html)
    html = html.replace('{{RATING_BARS}}', rating_bars)
    html = html.replace('{{DISCOUNT_PERCENTAGE}}', str(int((1 - product['sale_price'] / product['price']) * 100)))
    
    return html

def main():
    print('🚀 بدء توليد صفحات المنتجات...')
    
    products = load_products()
    
    with open('product-template.html', 'r', encoding='utf-8') as f:
        template = f.read()
    
    output_dir = Path('products-pages')
    output_dir.mkdir(exist_ok=True)
    
    success_count = 0
    error_count = 0
    
    for product in products:
        try:
            # تنظيف اسم الملف
            clean_slug = sanitize_filename(product['slug'])
            filename = f"product-{product['id']}-{clean_slug}.html"
            filepath = output_dir / filename
            
            html = generate_product_page(product, template)
            
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
