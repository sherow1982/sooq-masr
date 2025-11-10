// نظام السلة المحسن والمُصلح
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

// تحديث السلة في localStorage
function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}

// تحديث عداد السلة
function updateCartBadge() {
    const badges = document.querySelectorAll('.cart-badge, #cartBadge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    badges.forEach(badge => {
        if (badge) {
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    });
}

// إضافة منتج للسلة
function addToCart(product) {
    // التحقق من البيانات
    if (!product || !product.id) {
        console.error('❌ بيانات المنتج غير صحيحة:', product);
        showNotification('⚠️ خطأ في إضافة المنتج', 'error');
        return;
    }
    
    const existing = cart.find(item => item.id === product.id);
    
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            id: product.id,
            title: product.title || product.t,
            price: product.sale_price || product.sp || product.price || product.p,
            image: product.image_link || product.img,
            quantity: 1
        });
    }
    
    updateCart();
    showNotification('✅ تمت الإضافة للسلة بنجاح');
    
    // الانتقال التلقائي لصفحة السلة
    setTimeout(() => {
        window.location.href = '/cart.html';
    }, 800);
}

// حذف منتج من السلة
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    if (typeof displayCart === 'function') displayCart();
    showNotification('🗑️ تم حذف المنتج من السلة');
}

// تحديث كمية المنتج
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCart();
            if (typeof displayCart === 'function') displayCart();
        }
    }
}

// عرض إشعار
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? '#4CAF50' : '#f44336';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 99999;
        animation: slideIn 0.3s ease;
        font-weight: 600;
        font-family: 'Cairo', sans-serif;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// عرض محتويات السلة في صفحة cart.html
function displayCart() {
    const cartContainer = document.getElementById('cartItems');
    const totalPriceElement = document.getElementById('totalPrice');
    
    if (!cartContainer) {
        console.error('❌ لم يتم العثور على عنصر السلة');
        return;
    }
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<div style="text-align: center; padding: 60px 20px; color: #999;"><h3>🛒 السلة فارغة</h3><p>لم تقم بإضافة أي منتجات بعد</p><a href="/" class="btn btn-primary" style="margin-top: 20px; color: white;">تسوق الآن</a></div>';
        if (totalPriceElement) totalPriceElement.textContent = '0';
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        html += `
            <div class="cart-item" style="display: flex; gap: 20px; padding: 20px; background: white; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                <img src="${item.image}" alt="${item.title}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">
                <div style="flex: 1;">
                    <h3 style="font-size: 18px; margin-bottom: 10px; color: #333;">${item.title}</h3>
                    <p style="font-size: 20px; font-weight: 700; color: #e91e63; margin-bottom: 10px;">${item.price} جنيه</p>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button onclick="updateQuantity(${item.id}, -1)" class="btn" style="padding: 5px 15px; background: #f44336; color: white;">-</button>
                        <span style="font-weight: 600; font-size: 18px;">${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, 1)" class="btn" style="padding: 5px 15px; background: #4CAF50; color: white;">+</button>
                        <button onclick="removeFromCart(${item.id})" class="btn" style="padding: 5px 15px; background: #999; color: white; margin-right: 10px;">🗑️ حذف</button>
                    </div>
                </div>
                <div style="text-align: left; font-weight: 700; font-size: 20px; color: #667eea;">
                    ${itemTotal} جنيه
                </div>
            </div>
        `;
    });
    
    cartContainer.innerHTML = html;
    if (totalPriceElement) totalPriceElement.textContent = total;
}

// إفراغ السلة بالكامل
function clearCart() {
    if (confirm('هل تريد إفراغ السلة بالكامل؟')) {
        cart = [];
        updateCart();
        if (typeof displayCart === 'function') displayCart();
        showNotification('🗑️ تم إفراغ السلة');
    }
}

// إرسال طلب السلة عبر واتساب
function sendCartToWhatsApp() {
    if (cart.length === 0) {
        alert('⚠️ السلة فارغة! أضف منتجات أولاً');
        return;
    }
    
    const whatsappNumber = '201110760081';
    let message = '🛍️ *طلب جديد من سوق مصر*\n\n';
    
    let total = 0;
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        message += `${index + 1}. *${item.title}*\n`;
        message += `   السعر: ${item.price} جنيه × ${item.quantity} = ${itemTotal} جنيه\n\n`;
    });
    
    message += `━━━━━━━━━━━━━━━━━\n`;
    message += `💰 *الإجمالي:* ${total} جنيه\n\n`;
    message += `👤 *بيانات العميل:*\n`;
    message += `• الاسم: ___________\n`;
    message += `• الهاتف: ___________\n`;
    message += `• العنوان: ___________\n`;
    message += `• المدينة: ___________\n\n`;
    message += `✅ يرجى ملء البيانات وإرسالها لإتمام الطلب`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappURL, '_blank');
}

// تحديث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    
    // إذا كنا في صفحة السلة
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
    }
    
    console.log('🛒 نظام السلة جاهز. عدد المنتجات:', cart.reduce((sum, item) => sum + item.quantity, 0));
});

// CSS للأنيميشن - بدون تكرار
(function() {
    if (!document.getElementById('cart-animations-style')) {
        const animationStyle = document.createElement('style');
        animationStyle.id = 'cart-animations-style';
        animationStyle.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(animationStyle);
    }
})();
