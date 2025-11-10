/**
 * نظام واتساب محسن لسحب بيانات المنتج كاملة
 */

function sendWhatsAppOrder(product) {
    // التحقق من وجود بيانات المنتج
    if (!product) {
        alert('⚠️ خطأ: لم يتم العثور على بيانات المنتج');
        return;
    }

    // رقم الواتساب
    const whatsappNumber = '201110760081';
    
    // جمع بيانات المنتج
    const productName = product.t || product.title || 'غير محدد';
    const productPrice = product.sp || product.sale_price || product.p || product.price || '0';
    const productLink = window.location.href;
    const productImage = product.img || product.image_link || '';
    
    // حساب الخصم إن وجد
    const originalPrice = product.p || product.price || 0;
    const salePrice = product.sp || product.sale_price || originalPrice;
    const discount = originalPrice > salePrice ? originalPrice - salePrice : 0;
    const discountPercent = originalPrice > 0 ? Math.round((discount / originalPrice) * 100) : 0;
    
    // إنشاء رسالة احترافية
    let message = `🛍️ *طلب منتج جديد من سوق مصر*\n\n`;
    message += `📦 *اسم المنتج:*\n${productName}\n\n`;
    message += `💰 *السعر:* ${salePrice} جنيه`;
    
    if (discount > 0) {
        message += ` ~~${originalPrice} جنيه~~`;
        message += `\n💥 *وفّرت:* ${discount} جنيه (${discountPercent}% خصم)`;
    }
    
    message += `\n\n🔗 *رابط المنتج:*\n${productLink}`;
    
    if (productImage) {
        message += `\n\n🖼️ *صورة المنتج:*\n${productImage}`;
    }
    
    message += `\n\n━━━━━━━━━━━━━━━━━\n👤 *بيانات العميل:*\n\n`;
    message += `• الاسم الكامل: ___________\n`;
    message += `• رقم الهاتف: ___________\n`;
    message += `• العنوان بالتفصيل: ___________\n`;
    message += `• المدينة: ___________\n`;
    message += `• ملاحظات إضافية: ___________\n\n`;
    message += `✅ يرجى ملء البيانات وإرسالها لإتمام الطلب`;
    
    // تشفير الرسالة
    const encodedMessage = encodeURIComponent(message);
    
    // إنشاء رابط واتساب
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // فتح الرابط في نافذة جديدة
    window.open(whatsappURL, '_blank');
}

// دالة للحصول على بيانات المنتج من الصفحة
function getProductDataFromPage() {
    // محاولة الحصول على البيانات من window.productData
    if (typeof window.productData !== 'undefined') {
        return window.productData;
    }
    
    // محاولة استخراج البيانات من عناصر الصفحة
    const productData = {};
    
    const titleElement = document.querySelector('h1');
    if (titleElement) productData.t = titleElement.textContent.trim();
    
    const priceElement = document.querySelector('.price');
    if (priceElement) {
        const priceText = priceElement.textContent.replace(/[^0-9]/g, '');
        productData.sp = parseInt(priceText);
    }
    
    const imageElement = document.querySelector('.product-image img, .product-gallery img');
    if (imageElement) productData.img = imageElement.src;
    
    return productData;
}

console.log('✅ ملف whatsapp.js جاهز');
