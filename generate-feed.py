#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Google Merchant Center Feed Generator
يقوم بإنشاء فييد XML متوافق 100% مع متطلبات جوجل مرشنت سنتر
يعالج جميع المنتجات في الموقع (860 منتج)
يحافظ على نفس بنية الروابط الأصلية
"""

import json
import xml.etree.ElementTree as ET
from xml.dom import minidom
from urllib.parse import quote
import re

def clean_text(text):
    """تنظيف النصوص من المحارف الغير صالحة"""
    if not text:
        return ""
    text = str(text).strip()
    text = text.replace('\t', ' ').replace('\n', ' ')
    text = re.sub(r'\s+', ' ', text)
    text = text.strip('"').strip("'")
    return text

def get_category_mapping(google_cat):
    """تحديد التصنيف بناءً على نوع المنتج"""
    google_cat = str(google_cat).lower()
    
    if 'makeup' in google_cat or 'cosmetic' in google_cat:
        return 'Health & Beauty > Personal Care > Cosmetics'
    elif 'hair care' in google_cat or 'hair' in google_cat:
        return 'Health & Beauty > Personal Care > Hair Care'
    elif 'skin care' in google_cat or 'skin' in google_cat:
        return 'Health & Beauty > Personal Care > Cosmetics > Skin Care'
    elif 'furniture' in google_cat:
        return 'Home & Garden > Furniture'
    elif 'massage' in google_cat or 'relaxation' in google_cat:
        return 'Health & Beauty > Health Care > Massage & Relaxation'
    elif 'medical' in google_cat or 'equipment' in google_cat:
        return 'Health & Beauty > Health Care > Medical Supplies & Equipment'
    else:
        return 'Health & Beauty > Personal Care'

def generate_product_url(product_id, title, slug):
    """توليد رابط بنفس بنية الروابط الأصلية"""
    clean_slug = re.sub(r'-\d+$', '', slug)
    encoded_title = quote(clean_slug)
    return f"https://sooq-masr.arabsad.com/products-pages/product-{product_id}-{encoded_title}-{product_id}.html"

def generate_feed():
    """توليد الفييد الكامل"""
    
    print('🔄 بدء توليد فييد Google Merchant Center...')
    
    try:
        with open('products.json', 'r', encoding='utf-8') as f:
            products = json.load(f)
    except FileNotFoundError:
        print('❌ ملف products.json غير موجود!')
        return
    except json.JSONDecodeError as e:
        print(f'❌ خطأ في قراءة JSON: {e}')
        return
    
    print(f'📊 إجمالي المنتجات: {len(products)}')
    
    rss = ET.Element('rss', {
        'version': '2.0',
        'xmlns:g': 'http://base.google.com/ns/1.0'
    })
    
    channel = ET.SubElement(rss, 'channel')
    
    ET.SubElement(channel, 'title').text = 'سوق مصر - منتجات أصلية بأفضل الأسعار'
    ET.SubElement(channel, 'link').text = 'https://sooq-masr.arabsad.com'
    ET.SubElement(channel, 'description').text = 'متجر إلكتروني متخصص في بيع المنتجات الأصلية بأسعار تنافسية'
    
    valid_count = 0
    skipped_count = 0
    errors = []
    
    for idx, product in enumerate(products, 1):
        try:
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
            
            product_id = str(product['id'])
            title = clean_text(product['title'])
            description = clean_text(product['description'])
            slug = clean_text(product['slug'])
            
            product_url = generate_product_url(product_id, title, slug)
            
            sale_price = float(product['sale_price'])
            price = float(product.get('price', sale_price))
            
            ET.SubElement(item, 'g:id').text = product_id
            ET.SubElement(item, 'g:title').text = title[:150]
            ET.SubElement(item, 'g:description').text = description[:5000]
            ET.SubElement(item, 'g:link').text = product_url
            ET.SubElement(item, 'g:image_link').text = clean_text(product['image_link'])
            ET.SubElement(item, 'g:availability').text = 'in stock'
            ET.SubElement(item, 'g:price').text = f'{sale_price:.2f} EGP'
            ET.SubElement(item, 'g:brand').text = 'سوق مصر'
            ET.SubElement(item, 'g:condition').text = 'new'
            
            google_category = get_category_mapping(product.get('google_product_category', ''))
            ET.SubElement(item, 'g:google_product_category').text = google_category
            ET.SubElement(item, 'g:product_type').text = google_category
            
            ET.SubElement(item, 'g:mpn').text = product_id
            ET.SubElement(item, 'g:identifier_exists').text = 'false'
            
            shipping = ET.SubElement(item, 'g:shipping')
            ET.SubElement(shipping, 'g:country').text = 'EG'
            ET.SubElement(shipping, 'g:service').text = 'Standard'
            ET.SubElement(shipping, 'g:price').text = '0 EGP'
            
            valid_count += 1
            
            if valid_count % 100 == 0:
                print(f'⏳ معالجة {valid_count} منتج...')
            
        except Exception as e:
            error_msg = f'منتج {idx} (ID: {product.get("id")}): {str(e)}'
            errors.append(error_msg)
            skipped_count += 1
            continue
    
    try:
        xml_str = ET.tostring(rss, encoding='utf-8', method='xml')
        dom = minidom.parseString(xml_str)
        pretty_xml = dom.toprettyxml(indent="", encoding='UTF-8')
        
        xml_lines = pretty_xml.decode('utf-8').split('\n')
        final_xml = '\n'.join([xml_lines[0]] + [line for line in xml_lines[1:] if line.strip()])
        
        with open('google-merchant-feed.xml', 'w', encoding='utf-8') as f:
            f.write(final_xml)
        
        print(f'\n✅ تم إنشاء الفييد بنجاح!')
        print(f'📝 عدد المنتجات: {valid_count}')
        print(f'⚠️ متجاوز: {skipped_count}')
        print(f'📁 الملف: google-merchant-feed.xml')
        print(f'🔗 الرابط: https://sooq-masr.arabsad.com/google-merchant-feed.xml')
        
        if errors and len(errors) <= 10:
            print('\n⚠️ الأخطاء:')
            for error in errors:
                print(f'  - {error}')
        elif len(errors) > 10:
            print(f'\n⚠️ إجمالي الأخطاء: {len(errors)}')
                
    except Exception as e:
        print(f'❌ خطأ في حفظ الملف: {str(e)}')

if __name__ == '__main__':
    generate_feed()
