const fs = require('fs');
const path = require('path');

const PRODUCTS_DIR = 'products-pages';

function updateWhatsAppButton(html, filename) {
    const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/);
    const productName = titleMatch ? titleMatch[1].trim() : '';
    const priceMatch = html.match(/<div class="price">([\d.]+)\s*ج\.م<\/div>/);
    const price = priceMatch ? priceMatch[1] : '0';

    const newWhatsAppFunction =
        'function orderViaWhatsApp() {' +
        'const quantity = document.getElementById("quantity").value || 1;' +
        'const productName = "' + productName.replace(/"/g, '\\"') + '";' +
        'const productPrice = ' + price + ';' +
        'const productUrl = window.location.href;' +
        'const fullMessage = ' +
            '\'مرحباً! 👋\\n\\n\'' +
            ' + \'🏪 *سوق مصر*\\n\'' +
            ' + \'━━━━━━━━━━━━━━━━━\\n\\n\'' +
            ' + \'أرغب بطلب:\\n\\n\'' +
            ' + \'📦 \' + productName + \'\\n\'' +
            ' + \'💰 \' + productPrice + \' ج.م\\n\'' +
            ' + \'🔗 \' + productUrl + \'\\n\\n\'' +
            ' + \'━━━━━━━━━━━━━━━━━\\n\'' +
            ' + \'📋 *بيانات العميل:*\\n\\n\'' +
            ' + \'✅ الاسم: _____________\\n\'' +
            ' + \'✅ الهاتف: _____________\\n\'' +
            ' + \'✅ العنوان: _____________\\n\'' +
            ' + \'✅ المحافظة: _____________\\n\'' +
            ' + \'✅ العدد: \' + quantity + \'\\n\\n\'' +
            ' + \'شكراً 🌟\';' +
        'const encoded = encodeURIComponent(fullMessage);' +
        'window.open("https://wa.me/201110760081?text=" + encoded, "_blank");' +
        '}'; // end function

    const whatsappFunctionPattern = /function orderViaWhatsApp\(\)[\s\S]*?\}/;
    html = html.replace(whatsappFunctionPattern, newWhatsAppFunction.trim());

    return html;
}

function updatePriceDisplay(html) {
    const priceMatch = html.match(/<div class="price">([\d.]+)\s*ج\.م<\/div>/);
    const discountMatch = html.match(/خصم\s+(\d+)%/);

    if (!priceMatch) return html;
    const currentPrice = parseFloat(priceMatch[1]);

    if (discountMatch) {
        const discount = parseInt(discountMatch[1]);
        const originalPrice = (currentPrice / (1 - discount / 100)).toFixed(2);
        const savings = (originalPrice - currentPrice).toFixed(2);

        const newPriceBox = '<div class="price-box">'
            + '<div style="font-size:1.2rem;text-decoration:line-through;opacity:0.8;margin-bottom:0.5rem">' + originalPrice + ' ج.م</div>'
            + '<div class="price">' + currentPrice + ' ج.م</div>'
            + '<div style="margin-top:10px;font-size:1.2rem">خصم ' + discount + '%</div>'
            + '<div style="margin-top:8px;font-size:1rem;background:rgba(255,255,255,0.2);padding:8px;border-radius:8px">وفّر ' + savings + ' ج.م</div>'
            + '</div>';

        const oldPriceBoxPattern = /<div class="price-box">[\s\S]*?<\/div>\s*<\/div>/;
        html = html.replace(oldPriceBoxPattern, newPriceBox);
    }

    return html;
}

function updateProductPage(filePath) {
    try {
        let html = fs.readFileSync(filePath, 'utf8');
        html = updateWhatsAppButton(html, path.basename(filePath));
        html = updatePriceDisplay(html);
        fs.writeFileSync(filePath, html, 'utf8');
        return true;
    } catch (error) {
        console.error('❌ خطأ في معالجة ' + path.basename(filePath) + ':', error.message);
        return false;
    }
}

function updateAllProducts() {
    console.log('\n🚀 بدء تحديث صفحات المنتجات...\n');
    const files = fs.readdirSync(PRODUCTS_DIR);
    let updated = 0, failed = 0;
    files.forEach(file => {
        if (file.endsWith('.html')) {
            const filePath = path.join(PRODUCTS_DIR, file);
            if (updateProductPage(filePath)) {
                updated++; console.log('✅ ' + file);
            } else { failed++; }
        }
    });
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 اكتمل التحديث!');
    console.log('✅ تم تحديث: ' + updated + ' صفحة');
    if (failed > 0) console.log('❌ فشل: ' + failed + ' صفحة');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

updateAllProducts();
