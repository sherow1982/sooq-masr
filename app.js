
// تحميل المنتجات من GitHub
const PRODUCTS_JSON_URL = 'https://raw.githubusercontent.com/sherow1982/sooq-masr/main/products.json';
const PRODUCTS_PAGES_BASE = 'products-pages/';

// تنظيف اسم الملف (إزالة المسافات والأحرف الممنوعة)
function cleanFilename(text) {
    const forbidden = {
        '<': '‹', '>': '›', ':': '∶', '"': '＂',
        '/': '⁄', '\\': '⧹', '|': '｜', '?': '？', '*': '✱'
    };

    let cleaned = text;

    // استبدال الأحرف الممنوعة
    for (let [char, replacement] of Object.entries(forbidden)) {
        cleaned = cleaned.split(char).join(replacement);
    }

    // استبدال جميع المسافات بشرطات (مهم!)
    cleaned = cleaned.replace(/\s+/g, '-');

    // إزالة الأقواس
    cleaned = cleaned.replace(/[()]/g, '');

    // إزالة الشرطات المتكررة
    cleaned = cleaned.replace(/-+/g, '-');

    // إزالة الشرطات من البداية والنهاية
    cleaned = cleaned.replace(/^-+|-+$/g, '');

    return cleaned;
}

// الحصول على اسم ملف المنتج
function getProductPageFilename(product) {
    const cleanSlug = cleanFilename(product.slug);
    let filename = `product-${product.id}-${cleanSlug}.html`;

    // تقصير إذا كان طويل جداً
    if (filename.length > 200) {
        const shortSlug = cleanSlug.substring(0, 80);
        filename = `product-${product.id}-${shortSlug}.html`;
    }

    return filename;
}

// تحميل المنتجات
async function loadProducts() {
    try {
        const response = await fetch(PRODUCTS_JSON_URL);
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('خطأ:', error);
        document.getElementById('products-container').innerHTML = 
            '<p class="error-msg">عذراً، حدث خطأ في تحميل المنتجات</p>';
    }
}

// عرض المنتجات
function displayProducts(products) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    products.forEach(product => {
        const card = createProductCard(product);
        container.appendChild(card);
    });
}

// إنشاء بطاقة منتج
function createProductCard(product) {
    const card = document.createElement('a');
    card.className = 'product-card';

    const filename = getProductPageFilename(product);
    card.href = `${PRODUCTS_PAGES_BASE}${filename}`;

    const discount = product.price && product.sale_price ? 
        Math.round(((product.price - product.sale_price) / product.price) * 100) : 0;

    card.innerHTML = `
        <div class="card-badge-container">
            ${discount > 0 ? `<span class="discount-badge">خصم ${discount}%</span>` : ''}
            ${product.rating >= 4.5 ? '<span class="bestseller-badge">الأكثر مبيعاً</span>' : ''}
        </div>

        <div class="card-image">
            <img src="${product.image_link}" alt="${product.title}" loading="lazy" 
                 onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
        </div>

        <div class="card-body">
            <h3 class="card-title">${product.title}</h3>

            <div class="card-rating">
                <div class="stars">${generateStars(product.rating || 0)}</div>
                <span class="rating-text">(${product.review_count || 0} تقييم)</span>
            </div>

            <p class="card-description">${product.description || ''}</p>

            <div class="card-price-container">
                ${product.price && product.sale_price ? 
                    `<span class="original-price">${product.price} جنيه</span>
                     <span class="sale-price">${product.sale_price} جنيه</span>` :
                    `<span class="sale-price">${product.sale_price || product.price} جنيه</span>`
                }
            </div>

            <div class="card-footer">
                <div class="shipping-info">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/>
                    </svg>
                    <span>${product.delivery_time || 'توصيل سريع'}</span>
                </div>
                <button class="view-btn">عرض المنتج</button>
            </div>
        </div>
    `;

    return card;
}

// توليد النجوم
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
        stars += '<span class="star filled">★</span>';
    }
    if (hasHalfStar) {
        stars += '<span class="star half">★</span>';
    }
    for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
        stars += '<span class="star">★</span>';
    }

    return stars;
}

// البحث
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.product-card');

            cards.forEach(card => {
                const title = card.querySelector('.card-title').textContent.toLowerCase();
                const description = card.querySelector('.card-description').textContent.toLowerCase();

                if (title.includes(searchTerm) || description.includes(searchTerm)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
}

// تهيئة
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupSearch();
});
