#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""سكريبت توليد صفحات المنتجات بالتصميم المبهر"""

import json
import os
import sys

# قراءة ملف المنتجات
try:
    with open('products.json', 'r', encoding='utf-8') as f:
        products = json.load(f)
    print(f"✅ تم تحميل {len(products)} منتج")
except FileNotFoundError:
    print("❌ خطأ: لم يتم العثور على ملنتجات.json")
    sys.exit(1)

# قراءة القالب
try:
    with open('product-template.html', 'r', encoding='utf-8') as f:
        template = f.read()
    print("✅ تم تحميل القالب")
except FileNotFoundError:
    print("❌ خطأ: لم يتم العثور على product-template.html")
    sys.exit(1)

# إنشاء مجلد صفحات المنتجات
os.makedirs('products-pages', exist_ok=True)

def clean_filename(text):
    """تنظيف اسم الملف"""
    forbidden = {
        '<': '‹', '>': '›', ':': '∶', '"': '＂',
        '/': '⁄', '\\': '⧹', '|': '｜', '?': '？', '*': '✱'
    }
    
    cleaned = text
    for char, replacement in forbidden.items():
        cleaned = cleaned.replace(char, replacement)
    
    cleaned = cleaned.replace(' ', '-')
    cleaned = cleaned.replace('(', '').replace(')', '')
    cleaned = '-'.join(filter(None, cleaned.split('-')))
    
    return cleaned

def generate_stars(rating):
    """توليد نجوم التقييم"""
    full_stars = int(rating)
    half_star = 1 if (rating - full_stars) >= 0.5 else 0
    empty_stars = 5 - full_stars - half_star
    
    stars = '★' * full_stars
    if half_star:
        stars += '☆'
    stars += '☆' * empty_stars
    
    return stars

def format_price(price):
    """تنسيق السعر"""
    return f"{int(price):,}".replace(',', '،')

def generate_reviews_html(reviews):
    """توليد HTML للتقييمات"""
    if not reviews or len(reviews) == 0:
        return '<p style="color: #718096; text-align: center; padding: 40px; font-size: 1.1rem;">لا توجد تقييمات بعد. كن أول من يقيّم هذا المنتج！</p>'
    
    html = ''
    for review in reviews[:5]:  # عرض أول 5 تقييمات
        stars = generate_stars(review.get('rating', 5))
        html += f'''
            <div class="review-card">
                <div class="review-header">
                    <span class="reviewer-name">{review.get('reviewer_name', 'عميل')}</span>
                    <span class="review-date">{review.get('date', '')}</span>
                </div>
                <div class="stars" style="color: #fbbf24; font-size: 1.2rem; margin: 10px 0;">{stars}</div>
                <p class="review-text">{review.get('comment', '')}</p>
            </div>
        '''
    return html

# توليد صفحة لكل منتج
for idx, product in enumerate(products, 1):
    # حساب الخصم
    discount = 0
    discount_badge = ''
    original_price_html = ''
    discount_badge_img = ''
    
    if product.get('price') and product.get('sale_price'):
        if product['price'] > product['sale_price']:
            discount = round(((product['price'] - product['sale_price']) / product['price']) * 100)
            if discount > 0:
                discount_badge = f'<span class="discount-badge">وفر {discount}%</span>'
                original_price_html = f'<span class="original-price">{format_price(product["price"])} جنيه</span>'
                discount_badge_img = f'<div class="discount-badge-img">خصم {discount}%</div>'
    
    # النجوم والتقييم
    rating = product.get('rating', 0)
    stars = generate_stars(rating)
    reviews_count = product.get('review_count', 0)
    
    # قسم التقييمات
    reviews_html = generate_reviews_html(product.get('reviews', []))
    
    # تعبئة القالب
    page_html = template
    replacements = {
        '{{PRODUCT_ID}}': str(product.get('id', '')),
        '{{PRODUCT_TITLE}}': product.get('title', ''),
        '{{PRODUCT_DESCRIPTION}}': product.get('description', ''),
        '{{PRODUCT_IMAGE}}': product.get('image_link', ''),
        '{{PRODUCT_PRICE}}': str(product.get('price', product.get('sale_price', 0))),
        '{{SALE_PRICE}}': format_price(product.get('sale_price', product.get('price', 0))),
        '{{SALE_PRICE_NUMBER}}': str(product.get('sale_price', product.get('price', 0))),
        '{{ORIGINAL_PRICE}}': original_price_html,
        '{{DISCOUNT_BADGE}}': discount_badge_img,
        '{{DISCOUNT_PERCENT}}': discount_badge,
        '{{STARS}}': stars,
        '{{RATING}}': str(rating),
        '{{REVIEWS_COUNT}}': str(reviews_count),
        '{{SHIPPING_COST}}': product.get('shipping_description', 'الشحن لكل مصر 100جنيه'),
        '{{DELIVERY_TIME}}': product.get('delivery_time', 'التوصيل خلال 3 أيام عمل'),
        '{{REVIEWS_SECTION}}': reviews_html
    }
    
    for key, value in replacements.items():
        page_html = page_html.replace(key, value)
    
    # إنشاء اسم الملف
    clean_slug = clean_filename(product.get('slug', product.get('title', '')))
    filename = f"product-{product.get('id')}-{clean_slug}.html"
    
    if len(filename) > 200:
        short_slug = clean_slug[:80]
        filename = f"product-{product.get('id')}-{short_slug}.html"
    
    # حفظ الملف
    filepath = os.path.join('products-pages', filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(page_html)
    
    print(f"{idx}/{len(products)} ✅ {filename[:60]}...")

print(f"\n🎉 تم إنشاء {len(products)} صفحة منتج بنجاح！")
print("✅ جاهز للرفع إلى GitHub")
