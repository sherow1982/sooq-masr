
// نظام السلة الكامل
class ShoppingCart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('sooq-masr-cart')) || [];
        this.updateCartUI();
    }

    // إضافة منتج للسلة
    addToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: product.id,
                title: product.title,
                price: product.sale_price || product.price,
                image: product.image_link,
                quantity: 1
            });
        }

        this.saveCart();
        this.updateCartUI();
        this.showNotification('✅ تمت الإضافة للسلة');
    }

    // حذف من السلة
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartUI();
    }

    // تحديث الكمية
    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveCart();
            this.updateCartUI();
        }
    }

    // حفظ في localStorage
    saveCart() {
        localStorage.setItem('sooq-masr-cart', JSON.stringify(this.cart));
    }

    // تحديث واجهة السلة
    updateCartUI() {
        const cartCount = document.getElementById('cart-count');
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);

        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    // عرض إشعار
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // الحصول على إجمالي السعر
    getTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // الحصول على تفاصيل الطلب (لواتساب)
    getOrderDetails() {
        let details = '🛍️ *طلب جديد من سوق مصر*\n\n';
        details += '*المنتجات:*\n';
        details += '─────────────\n';

        this.cart.forEach((item, index) => {
            details += `${index + 1}. ${item.title}\n`;
            details += `   الكمية: ${item.quantity}\n`;
            details += `   السعر: ${item.price} جنيه\n`;
            details += `   الإجمالي: ${item.price * item.quantity} جنيه\n\n`;
        });

        details += '─────────────\n';
        details += `*الإجمالي الكلي: ${this.getTotal()} جنيه*\n\n`;
        details += '*بيانات العميل:*\n';
        details += 'الاسم: \n';
        details += 'رقم الهاتف: \n';
        details += 'العنوان: \n';
        details += 'المحافظة: \n';

        return encodeURIComponent(details);
    }
}

// إنشاء نسخة عامة
const shoppingCart = new ShoppingCart();
