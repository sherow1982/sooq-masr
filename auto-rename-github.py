#!/usr/bin/env python3
"""
سكريبت إعادة تسمية ملفات المنتجات تلقائياً من GitHub

هذا السكريبت:
1. يقرأ جميع ملفات المنتجات من GitHub
2. يقوم بإعادة تسميتها من product-{id}-{name}.html إلى product-{id}.html
3. يحفظ التغييرات مباشرة على GitHub

المتطلبات:
- Python 3.6+
- requests library (pip install requests)
- GitHub Personal Access Token (بصلاحيات repo)

الاستخدام:
1. قم بإنشاء Personal Access Token من GitHub:
   Settings > Developer settings > Personal access tokens > Generate new token
   اختر صلاحية 'repo'

2. قم بتثبيت المكتبة requests:
   pip install requests

3. شغّل السكريبت:
   python auto-rename-github.py
"""

import os
import sys
import re
import requests
from typing import List, Dict
import time

# إعدادات GitHub
GITHUB_OWNER = "sherow1982"
GITHUB_REPO = "sooq-masr"
GITHUB_BRANCH = "main"
PRODUCTS_PATH = "products-pages"

# سيتم الطلب من المستخدم إدخال التوكن
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN', '')

class GitHubRenamer:
    def __init__(self, token: str):
        self.token = token
        self.headers = {
            'Authorization': f'token {token}',
            'Accept': 'application/vnd.github.v3+json'
        }
        self.base_url = f'https://api.github.com/repos/{GITHUB_OWNER}/{GITHUB_REPO}'
        
    def get_all_files(self) -> List[Dict]:
        """قراءة جميع الملفات من مجلد products-pages"""
        url = f'{self.base_url}/contents/{PRODUCTS_PATH}'
        print(f"🔍 جاري قراءة الملفات من: {url}")
        
        response = requests.get(url, headers=self.headers)
        
        if response.status_code != 200:
            print(f"❌ خطأ في قراءة الملفات: {response.status_code}")
            print(f"Response: {response.text}")
            return []
        
        files = response.json()
        print(f"✅ تم العثور على {len(files)} ملف")
        return files
    
    def get_file_content(self, file_path: str) -> tuple:
        """قراءة محتوى الملف والحصول على SHA"""
        url = f'{self.base_url}/contents/{file_path}'
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            data = response.json()
            return data.get('content', ''), data.get('sha', '')
        return None, None
    
    def delete_file(self, file_path: str, sha: str, message: str) -> bool:
        """حذف ملف"""
        url = f'{self.base_url}/contents/{file_path}'
        data = {
            'message': message,
            'sha': sha,
            'branch': GITHUB_BRANCH
        }
        
        response = requests.delete(url, headers=self.headers, json=data)
        return response.status_code in [200, 204]
    
    def create_file(self, file_path: str, content: str, message: str) -> bool:
        """إنشاء ملف جديد"""
        url = f'{self.base_url}/contents/{file_path}'
        data = {
            'message': message,
            'content': content,
            'branch': GITHUB_BRANCH
        }
        
        response = requests.put(url, headers=self.headers, json=data)
        return response.status_code == 201
    
    def rename_file(self, old_path: str, new_path: str) -> bool:
        """إعادة تسمية ملف (حذف وإنشاء)"""
        # قراءة محتوى الملف القديم
        content, sha = self.get_file_content(old_path)
        
        if not content or not sha:
            print(f"  ❌ فشل في قراءة الملف: {old_path}")
            return False
        
        # إنشاء الملف بالاسم الجديد
        if not self.create_file(new_path, content, f"Rename: {os.path.basename(old_path)} -> {os.path.basename(new_path)}"):
            print(f"  ❌ فشل في إنشاء الملف الجديد: {new_path}")
            return False
        
        # حذف الملف القديم
        if not self.delete_file(old_path, sha, f"Delete old file: {os.path.basename(old_path)}"):
            print(f"  ⚠️  تم إنشاء الملف الجديد ولكن فشل حذف الملف القديم")
            return False
        
        return True

def main():
    print("="*60)
    print("🚀 سكريبت إعادة تسمية ملفات المنتجات تلقائياً")
    print("="*60)
    
    # الحصول على GitHub Token
    global GITHUB_TOKEN
    if not GITHUB_TOKEN:
        print("\n🔑 يرجى إدخال GitHub Personal Access Token:")
        print("   (يمكنك إنشاؤه من: GitHub > Settings > Developer settings > Tokens)")
        GITHUB_TOKEN = input("> ").strip()
        
        if not GITHUB_TOKEN:
            print("❌ يجب إدخال Token صالح")
            return
    
    renamer = GitHubRenamer(GITHUB_TOKEN)
    
    # قراءة الملفات
    files = renamer.get_all_files()
    
    if not files:
        print("❌ لم يتم العثور على ملفات")
        return
    
    # تصفية ملفات HTML فقط
    html_files = [f for f in files if f['name'].endswith('.html') and f['name'].startswith('product-')]
    print(f"\n📄 عدد ملفات HTML: {len(html_files)}")
    
    renamed = 0
    skipped = 0
    errors = 0
    
    print("\n🔄 بدء عملية إعادة التسمية...\n")
    
    for file in html_files:
        filename = file['name']
        
        # استخراج ID
        match = re.match(r'^product-(\d+)', filename)
        
        if not match:
            print(f"⚠️  تخطي: {filename} (لا يتطابق مع النمط)")
            skipped += 1
            continue
        
        product_id = match.group(1)
        new_filename = f"product-{product_id}.html"
        
        # إذا كان الاسم مطابق بالفعل
        if filename == new_filename:
            skipped += 1
            continue
        
        old_path = f"{PRODUCTS_PATH}/{filename}"
        new_path = f"{PRODUCTS_PATH}/{new_filename}"
        
        print(f"🔄 {filename} -> {new_filename}")
        
        if renamer.rename_file(old_path, new_path):
            print(f"   ✅ نجح!")
            renamed += 1
        else:
            print(f"   ❌ فشل!")
            errors += 1
        
        # تأخير بسيط لتجنب Rate Limiting
        time.sleep(0.5)
    
    print("\n" + "="*60)
    print("📊 ملخص العملية:")
    print(f"   ✅ تمت إعادة التسمية: {renamed} ملف")
    print(f"   ⏭️  تم التخطي: {skipped} ملف")
    print(f"   ❌ أخطاء: {errors} ملف")
    print("="*60)
    
    if errors == 0 and renamed > 0:
        print("\n✨ تمت العملية بنجاح!")
        print("🎉 يمكنك الآن اختبار الموقع")
    elif renamed == 0 and skipped > 0:
        print("\n✅ جميع الملفات بالفعل بالأسماء الصحيحة!")
    else:
        print("\n⚠️  تمت العملية مع بعض الأخطاء")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  تم إيقاف العملية بواسطة المستخدم")
    except Exception as e:
        print(f"\n❌ خطأ غير متوقع: {str(e)}")
        import traceback
        traceback.print_exc()
