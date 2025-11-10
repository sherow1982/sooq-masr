// app.js - إدارة المنتجات لمتجر سوّق مصر

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 12;

// عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupEventListeners();
});

async function loadProducts() {
    try {
        const response = await fetch('products.json');
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('البيانات ليست Array');
        allProducts = data;
        filteredProducts = [...allProducts];
        renderCategoryFilter(allProducts);
        displayProducts();
        updateProductCount();
    } catch (error) {
        showError('تعذر تحميل المنتجات، حاول لاحقاً');
    }
}

// دالة لتحويل عنوان المنتج إلى اسم الملف المطابق
function getProductPageFileName(product) {
    // إنشاء اسم الملف بناءً على ID والعنوان
    // مثال: product-1-جهاز-ديناميك-لإعادة-تأهيل-اليد-ايسر.html
    
    let title = product.title;
    
    // استبدال المسافات بشرطات
    title = title.replace(/\s+/g, '-');
    
    // إزالة الأحرف الخاصة ماعدا الحروف العربية والإنجليزية والأرقام والشرطات
    title = title.replace(/[^\u0600-\u06FFa-zA-Z0-9\-]/g, '');
    
    // إزالة الشرطات المتعددة المتتالية
    title = title.replace(/-+/g, '-');
    
    // إزالة الشرطات من البداية والنهاية
    title = title.replace(/^-|-$/g, '');
    
    return `products-pages/product-${product.id}-${title}.html`;
}

function displayProducts() {
    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = '';
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);
    
    if (productsToShow.length === 0) {
        productsContainer.innerHTML = '<div class="no-products">لا توجد منتجات بهذا البحث</div>';
        updatePagination();
        return;
    }
    
    productsToShow.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        // ربط البطاقة بصفحة المنتج الصحيحة في مجلد products-pages
        const productPageURL = getProductPageFileName(product);
        card.onclick = () => window.location.href = productPageURL;
        
        card.innerHTML = `
        ${product.google_product_category ? `<div class="product-category">${product.google_product_category.split('>').pop().trim()}</div>` : ''}
         ${(product.sale_price && product.price > product.sale_price) ? `<div class="discount-badge">-${Math.round((product.price-product.sale_price)/product.price*100)}%</div>` : ''}
            <div class="product-image">
                <img src="${product.image_link}" alt="${product.title}" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <div class="product-rating">
                    ${generateStars(product.rating||0)}
                    <span class="review-count">(${product.review_count||0})</span>
                </div>
                <div class="product-price">
                 ${(product.sale_price && product.sale_price < product.price) ? `<span class="old-price">${product.price} جنيه</span> <span class="current-price">${product.sale_price} جنيه</span>` : `<span class="current-price">${product.price} جنيه</span>`}
                </div>
                <p class="product-description">${truncateText(product.description||'', 80)}</p>
            </div>
        `;
        productsContainer.appendChild(card);
    });
    updatePagination();
}

function generateStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return '<span class="stars">' + '★'.repeat(full) + (half?'☆':'') + '☆'.repeat(5-full-(half?1:0)) + '</span>';
}

function truncateText(str, n) {
    return (str.length > n ? str.slice(0, n-1) + '...' : str);
}

function updateProductCount() {
    const elem = document.getElementById('product-count');
    if (elem) elem.textContent = `عرض ${filteredProducts.length} منتج`;
}

function updatePagination() {
    const pages = Math.ceil(filteredProducts.length / productsPerPage);
    const pag = document.getElementById('pagination');
    if (!pag) return;
    if (pages <= 1) { pag.innerHTML = ''; return; }
    let html = `<button onclick="changePage(${currentPage-1})" ${currentPage===1?'disabled':''}>السابق</button>`;
    for (let i = 1; i <= pages; i++)
        html += `<button onclick="changePage(${i})" class="${i===currentPage?'active':''}">${i}</button>`;
    html += `<button onclick="changePage(${currentPage+1})" ${currentPage===pages?'disabled':''}>التالي</button>`;
    pag.innerHTML = html;
}

function changePage(page) {
    const pages = Math.ceil(filteredProducts.length / productsPerPage);
    if (page < 1 || page > pages) return;
    currentPage = page;
    displayProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', e => applyFilters());
    }
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', e => applyFilters());
    }
    const catFilter = document.getElementById('category-filter');
    if (catFilter) {
        catFilter.addEventListener('change', () => applyFilters());
    }
}

function renderCategoryFilter(products) {
    const select = document.getElementById('category-filter');
    if (!select) return;
    const cats = Array.from(new Set(products.map(p=>p.google_product_category && p.google_product_category.split('>').pop().trim()).filter(Boolean)));
    select.innerHTML = `<option value="">جميع الفئات</option>` + cats.map(cat=>`<option value="${cat}">${cat}</option>`).join('');
}

function applyFilters() {
    const searchVal = (document.getElementById('search-input')||{}).value || '';
    const sortVal   = (document.getElementById('sort-select')||{}).value || '';
    const catVal    = (document.getElementById('category-filter')||{}).value || '';
    filteredProducts = allProducts.filter(product => {
        let matchesSearch = !searchVal || product.title.toLowerCase().includes(searchVal.toLowerCase()) || (product.description && product.description.toLowerCase().includes(searchVal.toLowerCase()));
        let matchesCat = !catVal || (product.google_product_category && product.google_product_category.split('>').pop().trim() === catVal);
        return matchesSearch && matchesCat;
    });
    if (sortVal === 'price-asc') filteredProducts.sort((a,b)=> (a.sale_price||a.price)-(b.sale_price||b.price));
    else if (sortVal === 'price-desc') filteredProducts.sort((a,b)=> (b.sale_price||b.price)-(a.sale_price||a.price));
    else if (sortVal === 'rating') filteredProducts.sort((a,b)=>(b.rating||0)-(a.rating||0));
    else if (sortVal === 'newest') filteredProducts.sort((a,b)=>b.id-a.id);
    currentPage = 1;
    displayProducts();
    updateProductCount();
}

function showError(msg) {
    const c = document.getElementById('products-container');
    if (c) c.innerHTML = `<div class='error-message'>${msg}</div>`;
}