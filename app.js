// app.js - إدارة المنتجات لمتجر سوّق مصر

// متغيرات عامة
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 12;

// تحميل المنتجات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupEventListeners();
});

// تحميل المنتجات من ملف JSON
async function loadProducts() {
    try {
        console.log('🔄 جاري تحميل المنتجات...');
        
        const response = await fetch('products.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // تحقق من أن البيانات array
        if (!Array.isArray(data)) {
            throw new Error('البيانات ليست في الشكل الصحيح (Array)');
        }
        
        allProducts = data;
        filteredProducts = [...allProducts];
        
        console.log(`✅ تم تحميل ${allProducts.length} منتج بنجاح`);
        
        // عرض المنتجات
        displayProducts();
        updateProductCount();
        
    } catch (error) {
        console.error('❌ خطأ في تحميل المنتجات:', error);
        showError('عذراً، حدث خطأ في تحميل المنتجات. يرجى المحاولة مرة أخرى لاحقاً.');
    }
}

// عرض المنتجات
function displayProducts() {
    const productsContainer = document.getElementById('products-container');
    
    if (!productsContainer) {
        console.error('❌ لم يتم العثور على عنصر products-container');
        return;
    }
    
    // مسح المحتوى الحالي
    productsContainer.innerHTML = '';
    
    // حساب المنتجات للصفحة الحالية
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);
    
    // عرض رسالة إذا لم توجد منتجات
    if (productsToShow.length === 0) {
        productsContainer.innerHTML = '<div class="no-products">لا توجد منتجات لعرضها</div>';
        return;
    }
    
    // إنشاء بطاقات المنتجات
    productsToShow.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
    });
    
    // تحديث الترقيم
    updatePagination();
}

// إنشاء بطاقة منتج
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // حساب نسبة الخصم
    const discountPercent = product.sale_price && product.price > product.sale_price
        ? Math.round(((product.price - product.sale_price) / product.price) * 100)
        : 0;
    
    card.innerHTML = `
        ${discountPercent > 0 ? `<div class="discount-badge">-${discountPercent}%</div>` : ''}
        
        <div class="product-image">
            <img src="${product.image_link}" 
                 alt="${product.title}" 
                 loading="lazy"
                 onerror="this.src='images/placeholder.jpg'">
        </div>
        
        <div class="product-info">
            <h3 class="product-title">${product.title}</h3>
            
            <div class="product-rating">
                ${generateStars(product.rating || 0)}
                <span class="review-count">(${product.review_count || 0})</span>
            </div>
            
            <div class="product-price">
                ${product.sale_price && product.sale_price < product.price ? `
                    <span class="original-price">${product.price} جنيه</span>
                    <span class="sale-price">${product.sale_price} جنيه</span>
                ` : `
                    <span class="sale-price">${product.price} جنيه</span>
                `}
            </div>
            
            <p class="product-description">${truncateText(product.description || '', 100)}</p>
            
            <button class="btn-primary" onclick="viewProduct(${product.id})">
                عرض التفاصيل
            </button>
        </div>
    `;
    
    return card;
}

// توليد النجوم للتقييم
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    
    // نجوم ممتلئة
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    // نجمة نصف ممتلئة
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // نجوم فارغة
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
}

// اختصار النص
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// عرض تفاصيل المنتج
function viewProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// تحديث عدد المنتجات
function updateProductCount() {
    const countElement = document.getElementById('product-count');
    if (countElement) {
        countElement.textContent = `عرض ${filteredProducts.length} منتج`;
    }
}

// تحديث الترقيم (Pagination)
function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const paginationContainer = document.getElementById('pagination');
    
    if (!paginationContainer || totalPages <= 1) {
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // زر السابق
    paginationHTML += `
        <button onclick="changePage(${currentPage - 1})" 
                ${currentPage === 1 ? 'disabled' : ''}>
            السابق
        </button>
    `;
    
    // أرقام الصفحات
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <button onclick="changePage(${i})" 
                    class="${i === currentPage ? 'active' : ''}">
                ${i}
            </button>
        `;
    }
    
    // زر التالي
    paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" 
                ${currentPage === totalPages ? 'disabled' : ''}>
            التالي
        </button>
    `;
    
    paginationContainer.innerHTML = paginationHTML;
}

// تغيير الصفحة
function changePage(page) {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    displayProducts();
    
    // التمرير للأعلى
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// البحث في المنتجات
function searchProducts(query) {
    if (!query || query.trim() === '') {
        filteredProducts = [...allProducts];
    } else {
        const searchTerm = query.toLowerCase().trim();
        filteredProducts = allProducts.filter(product => 
            product.title.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm))
        );
    }
    
    currentPage = 1;
    displayProducts();
    updateProductCount();
}

// الترتيب
function sortProducts(sortBy) {
    switch(sortBy) {
        case 'price-asc':
            filteredProducts.sort((a, b) => 
                (a.sale_price || a.price) - (b.sale_price || b.price)
            );
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => 
                (b.sale_price || b.price) - (a.sale_price || a.price)
            );
            break;
        case 'rating':
            filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        case 'newest':
            filteredProducts.sort((a, b) => b.id - a.id);
            break;
        default:
            filteredProducts = [...allProducts];
    }
    
    currentPage = 1;
    displayProducts();
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // البحث
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchProducts(e.target.value);
        });
    }
    
    // الترتيب
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortProducts(e.target.value);
        });
    }
}

// عرض رسالة خطأ
function showError(message) {
    const productsContainer = document.getElementById('products-container');
    if (productsContainer) {
        productsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
                <button onclick="location.reload()">إعادة المحاولة</button>
            </div>
        `;
    }
}