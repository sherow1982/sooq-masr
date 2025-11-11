// ============================================
// Header & Footer Components - سوق مصر
// ============================================

const LEGAL_PAGES = [
    { name: 'سياسة الخصوصية', url: '/privacy.html' },
    { name: 'شروط الاستخدام', url: '/terms-of-service.html' },
    { name: 'سياسة الاسترجاع', url: '/refund-policy.html' },
    { name: 'سياسة الشحن', url: '/shipping-policy.html' },
    { name: 'اتصل بنا', url: '/contact.html' }
];

const NAV_LINKS = [
    { name: 'الرئيسية', url: '/index.html', icon: '🏠' },
    { name: 'المنتجات', url: '/all-products.html', icon: '🛍️' },
    { name: 'السلة', url: '/cart.html', icon: '🛒' }
];

function createHeader() {
    return `
        <header class="site-header">
            <div class="header-container">
                <div class="header-top">
                    <div class="logo">
                        <a href="/index.html">
                            <span class="logo-icon">🛍️</span>
                            <span class="logo-text">سوق مصر</span>
                        </a>
                    </div>
                    
                    <nav class="main-nav">
                        ${NAV_LINKS.map(link => `
                            <a href="${link.url}" class="nav-link">
                                <span class="nav-icon">${link.icon}</span>
                                <span class="nav-text">${link.name}</span>
                            </a>
                        `).join('')}
                    </nav>
                    
                    <a href="/cart.html" class="cart-icon-header">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z">
                            </path>
                        </svg>
                        <span id="header-cart-count" class="cart-badge">0</span>
                    </a>
                </div>
            </div>
        </header>
    `;
}

function createFooter() {
    return `
        <footer class="site-footer">
            <div class="footer-container">
                <div class="footer-content">
                    <div class="footer-section">
                        <h3 class="footer-title">عن سوق مصر</h3>
                        <p class="footer-text">
                            متجرك الإلكتروني الموثوق للحصول على أفضل المنتجات بأسعار تنافسية وجودة عالية.
                        </p>
                    </div>
                    
                    <div class="footer-section">
                        <h3 class="footer-title">روابط سريعة</h3>
                        <ul class="footer-links">
                            ${LEGAL_PAGES.map(page => `
                                <li><a href="${page.url}" class="footer-link">${page.name}</a></li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <div class="footer-section">
                        <h3 class="footer-title">تواصل معنا</h3>
                        <div class="contact-info">
                            <p class="contact-item">
                                <span class="contact-icon">📧</span>
                                <a href="mailto:sherow1982@gmail.com" class="footer-link">sherow1982@gmail.com</a>
                            </p>
                            <p class="contact-item">
                                <span class="contact-icon">📱</span>
                                <span>خدمة العملاء متاحة 24/7</span>
                            </p>
                        </div>
                    </div>
                    
                    <div class="footer-section">
                        <h3 class="footer-title">وسائل الدفع</h3>
                        <div class="payment-methods">
                            <span class="payment-icon">💳</span>
                            <span class="payment-icon">💰</span>
                            <span class="payment-icon">📱</span>
                        </div>
                        <p class="footer-text">دفع آمن ومضمون 100%</p>
                    </div>
                </div>
                
                <div class="footer-bottom">
                    <p class="copyright">
                        © ${new Date().getFullYear()} سوق مصر. جميع الحقوق محفوظة.
                    </p>
                    <div class="footer-legal-links">
                        ${LEGAL_PAGES.slice(0, 3).map(page => `
                            <a href="${page.url}" class="footer-legal-link">${page.name}</a>
                        `).join(' • ')}
                    </div>
                </div>
            </div>
        </footer>
    `;
}

function injectHeaderAndFooter() {
    // Inject header at the beginning of body
    const headerHTML = createHeader();
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    
    // Inject footer at the end of body
    const footerHTML = createFooter();
    document.body.insertAdjacentHTML('beforeend', footerHTML);
    
    // Update cart count in header
    updateHeaderCartCount();
}

function updateHeaderCartCount() {
    const cart = JSON.parse(localStorage.getItem('sooq-masr-cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('header-cart-count');
    
    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Auto-inject on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectHeaderAndFooter);
} else {
    injectHeaderAndFooter();
}

// Update cart count periodically
setInterval(updateHeaderCartCount, 1000);

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.sooqMasrComponents = {
        createHeader,
        createFooter,
        updateHeaderCartCount
    };
}