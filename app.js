// ============================================
// نظام البحث والفلترة المحسّن - سوق مصر
// ============================================

let allProducts = [];
let currentCategory = '';
let currentSearchTerm = '';
let cart = JSON.parse(localStorage.getItem('sooq-masr-cart')) || [];

const PRODUCTS_JSON_URL = 'https://raw.githubusercontent.com/sherow1982/sooq-masr/main/products.json';
const PRODUCTS_PAGES_BASE = 'products-pages/';

// ============================================
// تحميل المنتجات
// ============================================
async function loadProducts() {
    try {
        const response = await fetch(PRODUCTS_JSON_URL);
        allProducts = await response.json();
        displayProducts(allProducts);
        updateCartCount();
        console.log('تم تحميل المنتجات بنجاح:', allProducts.length);
    } catch (error) {
        console.error('خطأ في تحميل المنتجات:', error);
        showErrorMessage();
    }
}

// ============================================
// وظيفة البحث الذكي المحسّنة
// ============================================
function searchProducts(searchTerm) {
    currentSearchTerm = searchTerm.trim();
    
    if (!currentSearchTerm) {
        displayFilteredProducts();
        return;
    }
    
    const searchWords = currentSearchTerm.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 0);
    
    let baseProducts = currentCategory 
        ? allProducts.filter(product => matchesCategory(product, currentCategory))
        : allProducts;
    
    const results = baseProducts.filter(product => {
        const searchableText = [
            product.title || '',
            product.description || '',
            product.google_product_category || '',
            product.product_type || '',
            product.brand || '',
            product.material || '',
            product.color || ''
        ].join(' ').toLowerCase();
        
        // البحث عن أي كلمة من كلمات البحث
        return searchWords.some(word => searchableText.includes(word));
    });
    
    // ترتيب النتائج حسب الأهمية
    const scored = results.map(product => {
        let score = 0;
        const title = (product.title || '').toLowerCase();
        const category = (product.google_product_category || '').toLowerCase();
        
        searchWords.forEach(word => {
            if (title.includes(word)) score += 5;
            if (category.includes(word)) score += 3;
            if (title.startsWith(word)) score += 3;
        });
        
        return { product, score };
    });
    
    scored.sort((a, b) => b.score - a.score);
    const sortedResults = scored.map(item => item.product);
    
    displayProducts(sortedResults);
    showResultsCount(sortedResults.length, currentSearchTerm);
}

// ============================================
// الفلترة حسب الفئة
// ============================================
function filterByCategory(category) {
    currentCategory = category;
    displayFilteredProducts();
}

function displayFilteredProducts() {
    let filtered = currentCategory && currentCategory !== 'all'
        ? allProducts.filter(product => matchesCategory(product, currentCategory))
        : allProducts;
    
    if (currentSearchTerm) {
        const searchWords = currentSearchTerm.toLowerCase().split(/\s+/);
        filtered = filtered.filter(product => {
            const searchableText = [
                product.title || '',
                product.description || '',
                product.google_product_category || ''
            ].join(' ').toLowerCase();
            
            return searchWords.some(word => searchableText.includes(word));
        });
    }
    
    displayProducts(filtered);
    showResultsCount(filtered.length, currentSearchTerm, currentCategory);
}

function matchesCategory(product, category) {
    if (!category || category === 'all') return true;
    
    const productCategory = (product.google_product_category || '').toLowerCase();
    const productType = (product.product_type || '').toLowerCase();
    const productTitle = (product.title || '').toLowerCase();
    const categoryLower = category.toLowerCase();
    
    // خريطة الفئات - ربط أسماء الفئات بالكلمات المفتاحية
    const categoryMapping = {
        'health & beauty': ['health', 'beauty', 'صحة', 'جمال', 'cosmetics', 'makeup'],
        'home & garden': ['home', 'garden', 'منزل', 'حديقة', 'furniture', 'decor'],
        'apparel & accessories': ['apparel', 'accessories', 'ملابس', 'إكسسوارات', 'clothing', 'fashion'],
        'احذية': ['shoes', 'احذية', 'حذاء', 'footwear', 'sneakers', 'boots'],
        'حقائب': ['bag', 'حقيبة', 'حقائب', 'handbag', 'backpack', 'luggage'],
        'electronics': ['electronic', 'إلكتروني', 'phone', 'computer', 'tech'],
        'جلد': ['leather', 'جلد', 'جلدي', 'جلدية']
    };
    
    // الحصول على الكلمات المفتاحية للفئة المطلوبة
    const keywords = categoryMapping[categoryLower] || [categoryLower];
    
    // التحقق من وجود أي كلمة مفتاحية في بيانات المنتج
    return keywords.some(keyword => 
        productCategory.includes(keyword) || 
        productType.includes(keyword) || 
        productTitle.includes(keyword)
    );
}

// ============================================
// عرض المنتجات
// ============================================
function displayProducts(products) {
    const container = document.getElementById('products-container');
    
    if (!container) {
        console.error('لم يتم العثور على حاوية المنتجات');
        return;
    }
    
    if (products.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--color-text-secondary);">
                <div style="font-size: 4rem; margin-bottom: 20px;">🔍</div>
                <h3 style="font-size: 1.5rem; margin-bottom: 10px;">لا توجد نتائج</h3>
                <p>حاول استخدام كلمات بحث مختلفة أو تصفح الفئات المتاحة</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    products.forEach(product => {
        const card = createProductCard(product);
        container.appendChild(card);
    });
}

// ============================================
// إنشاء بطاقة المنتج
// ============================================
function createProductCard(product) {
    const card = document.createElement('a');
    card.className = 'product-card';
    
    const filename = getProductPageFilename(product);
    card.href = `${PRODUCTS_PAGES_BASE}${filename}`;
    card.target = '_blank';
    
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
                <button class="view-btn" onclick="event.preventDefault(); window.open('${card.href}', '_blank');">عرض المنتج</button>
            </div>
        </div>
    `;
    
    return card;
}

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

function cleanFilename(text) {
    const forbidden = {
        '<': '‹', '>': '›', ':': '∶', '"': '＂',
        '/': '⁄', '\\': '⧹', '|': '｜', '?': '？', '*': '✱'
    };
    
    let cleaned = text;
    for (let [char, replacement] of Object.entries(forbidden)) {
        cleaned = cleaned.split(char).join(replacement);
    }
    
    cleaned = cleaned.replace(/\s+/g, '-');
    cleaned = cleaned.replace(/[()]/g, '');
    cleaned = cleaned.replace(/-+/g, '-');
    cleaned = cleaned.replace(/^-+|-+$/g, '');
    
    return cleaned;
}

function getProductPageFilename(product) {
    const cleanSlug = cleanFilename(product.slug || product.title);
    let filename = `product-${product.id}-${cleanSlug}.html`;
    
    if (filename.length > 200) {
        const shortSlug = cleanSlug.substring(0, 80);
        filename = `product-${product.id}-${shortSlug}.html`;
    }
    
    return filename;
}

// ============================================
// عرض عداد النتائج
// ============================================
function showResultsCount(count, searchTerm = null, category = null) {
    let countDiv = document.querySelector('.results-count');
    
    if (!countDiv) {
        countDiv = document.createElement('div');
        countDiv.className = 'results-count';
        countDiv.style.cssText = `
            text-align: center;
            padding: 15px;
            margin: 20px 0;
            background: var(--color-secondary);
            border-radius: var(--radius-lg);
            color: var(--color-text);
            font-weight: var(--font-weight-medium);
        `;
        const container = document.getElementById('products-container');
        if (container && container.parentNode) {
            container.parentNode.insertBefore(countDiv, container);
        }
    }
    
    let message = `تم العثور على <strong style="color: var(--color-primary);">${count}</strong> منتج`;
    
    if (searchTerm) {
        message += ` لكلمة "<strong>${searchTerm}</strong>"`;
    }
    
    if (category && category !== 'all') {
        message += ` في الفئة المختارة`;
    }
    
    countDiv.innerHTML = message;
}

function showErrorMessage() {
    const container = document.getElementById('products-container');
    container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
            <div style="font-size: 4rem; margin-bottom: 20px; color: var(--color-error);">⚠️</div>
            <h3 style="color: var(--color-error); margin-bottom: 10px;">عذراً، حدث خطأ في تحميل المنتجات</h3>
            <button onclick="location.reload()" class="btn" style="margin-top: 20px; background: var(--color-primary); color: white; padding: 12px 30px; border: none; border-radius: var(--radius-full); cursor: pointer;">إعادة المحاولة</button>
        </div>
    `;
}

// ============================================
// إعداد البحث الفوري
// ============================================
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchProducts(e.target.value);
        }, 300);
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            clearTimeout(searchTimeout);
            searchProducts(e.target.value);
        }
    });
}

// ============================================
// تحديث عداد السلة
// ============================================
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// ============================================
// التهيئة عند تحميل الصفحة
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        loadProducts();
        setupSearch();
        setInterval(updateCartCount, 1000);
    });
} else {
    loadProducts();
    setupSearch();
    setInterval(updateCartCount, 1000);
}