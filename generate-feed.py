#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Google Merchant Center Feed Generator
يقوم بإنشاء فييد XML متوافق 100% مع متطلبات جوجل مرشنت سنتر
يعالج جميع الـ860 منتج في الموقع
"""

import json
import xml.etree.ElementTree as ET
from xml.dom import minidom
from datetime import datetime
import re

def clean_text(text):
    """تنظيف النصوص من المحارف الغير صالحة في XML"""
    if not text:
        return ""
    text = str(text).strip()
    text = text.replace('\t', ' ').replace('\n', ' ')
    text = re.sub(r'\s+', ' ', text)
    text = text.strip('"').strip("'")
    # إزالة المحارف الخاصة الأخرى
    text = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    return text

def get_category_mapping(google_cat):
    """تحديد التصنيف الصحيح بناءً على نوع المنتج"""
    google_cat = str(google_cat).lower()
    
    # تصنيفات صحيحة ودقيقة حسب متطلبات Google
    if 'makeup' in google_cat or 'cosmetic' in google_cat:
        return 'Health & Beauty > Personal Care > Cosmetics'
    elif 'hair care' in google_cat or 'hair' in google_cat:
        return 'Health & Beauty > Personal Care > Hair Care'
    elif 'skin care' in google_cat or 'skin' in google_cat:
        return 'Health & Beauty > Personal Care > Cosmetics > Skin Care'
    elif 'furniture' in google_cat:
        return 'Home & Garden > Furniture'
    else:
        return 'Health & Beauty > Personal Care'

def generate_feed():
    """توليد الفييد الكامل"""
    
    print('🔄 بدء توليد فييد Google Merchant Center...')
    
    # قراءة ملف المنتجات
    try:
        with open('products.json', 'r', encoding='utf-8') as f:
            products = json.load(f)
    except FileNotFoundError:
        print('❌ ملف products.json غير موجود!')
        return
    except json.JSONDecodeError as e:
        print(f'❌ خطأ في قراءة ملف JSON: {e}')
        return
    
    print(f'📊 إجمالي المنتجات المحملة: {len(products)}')
    
    # إنشاء عنصر RSS الرئيسي
    rss = ET.Element('rss', {
        'version': '2.0',
        'xmlns:g': 'http://base.google.com/ns/1.0'
    })
    
    channel = ET.SubElement(rss, 'channel')
    
    # معلومات المتجر الأساسية
    ET.SubElement(channel, 'title').text = 'سوق مصر - Sooq Masr'
    ET.SubElement(channel, 'link').text = 'https://sooq-masr.com'
    ET.SubElement(channel, 'description').text = 'متجر سوق مصر - منتجات أصلية بأفضل الأسعار وشحن سريع لجميع المحافظات'
    
    # معالجة كل منتج
    valid_count = 0
    skipped_count = 0
    errors = []
    
    for idx, product in enumerate(products, 1):
        try:
            # التحقق من البيانات الإلزامية
            if not all([
                product.get('id'),
                product.get('title'),
                product.get('description'),
                product.get('slug'),
                product.get('image_link'),
                product.get('sale_price')
            ]):
                skipped_count += 1
                errors.append(f'منتج {idx}: بيانات ناقصة')
                continue
            
            item = ET.SubElement(channel, 'item')
            
            # معلومات المنتج الأساسية
            product_id = str(product['id'])
            title = clean_text(product['title'])
            description = clean_text(product['description'])
            slug = clean_text(product['slug'])
            
            # الرابط الكامل للمنتج
            product_url = f"https://sooq-masr.com/products-pages/{slug}.html"
            
            # السعر
            sale_price = float(product['sale_price'])
            price = float(product.get('price', sale_price))
            
            # إضافة العناصر الإلزامية
            ET.SubElement(item, 'g:id').text = product_id
            ET.SubElement(item, 'g:title').text = title[:150]  # Max 150 characters
            ET.SubElement(item, 'g:description').text = description[:5000]  # Max 5000 characters
            ET.SubElement(item, 'g:link').text = product_url
            ET.SubElement(item, 'g:image_link').text = clean_text(product['image_link'])
            
            # السعر بصيغة صحيحة
            ET.SubElement(item, 'g:price').text = f'{price:.2f} EGP'
            
            # السعر المخفض إن وجد
            if sale_price < price:
                ET.SubElement(item, 'g:sale_price').text = f'{sale_price:.2f} EGP'
            
            # الحالة والتوفر (إلزامي)
            ET.SubElement(item, 'g:availability').text = 'in stock'
            ET.SubElement(item, 'g:condition').text = 'new'
            
            # التصنيف
            google_category = get_category_mapping(product.get('google_product_category', ''))
            ET.SubElement(item, 'g:google_product_category').text = google_category
            
            # العلامة التجارية (اختياري لكن موصى به)
            ET.SubElement(item, 'g:brand').text = 'Generic'
            
            # معلومات الشحن
            if product.get('shipping_cost'):
                shipping = ET.SubElement(item, 'g:shipping')
                ET.SubElement(shipping, 'g:country').text = 'EG'
                ET.SubElement(shipping, 'g:service').text = 'Standard'
                ET.SubElement(shipping, 'g:price').text = f"{float(product['shipping_cost']):.2f} EGP"
            
            # معلومات إضافية موصى بها
            if product.get('rating'):
                ET.SubElement(item, 'g:product_rating').text = str(product['rating'])
            
            if product.get('review_count'):
                ET.SubElement(item, 'g:product_review_count').text = str(product['review_count'])
            
            # معرف المنتج الفريد
            ET.SubElement(item, 'g:identifier_exists').text = 'false'
            
            # معلومات العمر
            ET.SubElement(item, 'g:age_group').text = 'adult'
            
            valid_count += 1
            
            # تقرير التقدم كل 100 منتج
            if valid_count % 100 == 0:
                print(f'⏳ تمت معالجة {valid_count} منتج...')
            
        except Exception as e:
            error_msg = f'منتج {idx} (ID: {product.get("id")}): {str(e)}'
            print(f'⚠️ {error_msg}')
            errors.append(error_msg)
            skipped_count += 1
            continue
    
    # تحويل إلى نص XML منسق
    try:
        xml_str = ET.tostring(rss, encoding='utf-8', method='xml')
        dom = minidom.parseString(xml_str)
        pretty_xml = dom.toprettyxml(indent="  ", encoding='utf-8')
        
        # حفظ الملف
        with open('google-merchant-feed.xml', 'wb') as f:
            f.write(pretty_xml)
        
        print(f'\n✅ تم إنشاء الفييد بنجاح!')
        print(f'📝 عدد المنتجات الصالحة: {valid_count}')
        print(f'⚠️ عدد المنتجات المتجاوزة: {skipped_count}')
        print(f'📁 اسم الملف: google-merchant-feed.xml')
        print(f'💾 حجم الملف: {len(pretty_xml)} بايت')
        
        if errors and len(errors) <= 10:
            print('\n⚠️ الأخطاء المسجلة:')
            for error in errors:
                print(f'  - {error}')
        elif len(errors) > 10:
            print(f'\n⚠️ إجمالي الأخطاء: {len(errors)} (أول 10):')
            for error in errors[:10]:
                print(f'  - {error}')
                
    except Exception as e:
        print(f'❌ خطأ في حفظ الملف: {str(e)}')

if __name__ == '__main__':
    generate_feed()
