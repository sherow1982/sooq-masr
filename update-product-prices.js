const fs = require('fs');
const path = require('path');

const PRODUCTS_DIR = 'products-pages';

function updateProductPage(filePath) {
    try {
        let html = fs.readFileSync(filePath, 'utf8');
        
        // استخراج السعر الحالي
        const priceMatch = html.match(/<div class="price">([\d.]+)\s*ج\.م<\/div>/);
        const discountMatch = html.match(/خصم\s+(\d+)%/);
        
        if (!priceMatch) return false;
        
        const currentPrice = parseFloat(priceMatch[1]);
        
        if (discountMatch) {
            const discount = parseInt(discountMatch[1]);
            // حساب السعر الأصلي
            const originalPrice = (currentPrice / (1 - discount / 100)).toFixed(2);
            const savings = (originalPrice - currentPrice).toFixed(2);
            
            // إنشاء صندوق السعر الجديد
            const newPriceBox = `<div class="price-box">
    <div style="font-size:1.2rem;text-decoration:line-through;opacity:0.8;margin-bottom:0.5rem">${originalPrice} ج.م</div>
    <div class="price">${currentPrice} ج.م</div>
    <div style="margin-top:10px;font-size:1.2rem">خصم ${discount}%</div>
    <div style="margin-top:8px;font-size:1rem;background:rgba(255,255,255,0.2);padding:8px;border-radius:8px">وفّر ${savings} ج.م</div>
</div>`;
            
            // استبدال صندوق السعر القديم
            const oldPriceBoxPattern = /<div class="price-box">[\s\S]*?<\/div>\s*<\/div>/;
            html = html.replace(oldPriceBoxPattern, newPriceBox);
            
            // حفظ الملف المحدث
            fs.writeFileSync(filePath, html, 'utf8');
            return true;
        }
        
        return false;
    } catch (error) {
        console.error(`خطأ في معالجة ${filePath}:`, error.message);
        return false;
    }
}

function updateAllProducts() {
    const files = fs.readdirSync(PRODUCTS_DIR);
    let updated = 0;
    
    files.forEach(file => {
        if (file.endsWith('.html')) {
            const filePath = path.join(PRODUCTS_DIR, file);
            if (updateProductPage(filePath)) {
                updated++;
                console.log(`✅ تم تحديث: ${file}`);
            }
        }
    });
    
    console.log(`\n🎉 تم تحديث ${updated} صفحة منتج بنجاح!`);
}

// تشغيل التحديث
updateAllProducts();