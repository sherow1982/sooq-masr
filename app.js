// ============= سوق مصر - المتجر الإلكتروني الاحترافي =============
const SITE_NAME = 'سوق مصر';
const WHATSAPP_NUMBER = '201110760081';
const PRODUCTS_PAGES_FOLDER = 'products-pages';
const PRODUCTS_PER_PAGE = 12;

let allProducts = [];
let filteredProducts = [];
let displayedProducts = [];
let currentPage = 1;

function enrichProduct(product) {
    return {
        ...product,
        rating: product.rating || 4.8,
        review_count: product.review_count || 30,
        description: product.description || `منتج أصلي ${product.title} بأفضل سعر في مصر. شحن سريع لجميع المحافظات.`,
        google_product_category: product.google_product_category || "Apparel & Accessories > Shoes"
    };
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

function getProductFilename(product) {
    let base = `product-${product.id}-${(product.title||'').replace(/[\s\n]+/g,'-').replace(/[^\w\-\u0600-\u06FF]+/g,'')}.html`;
    return PRODUCTS_PAGES_FOLDER + '/' + base;
}

function createProductCardPure(product) {
    const price = parseFloat(product.price) || 0;
    const salePrice = parseFloat(product.sale_price) || price;
    const discount = price !== salePrice ? Math.round((price - salePrice) / price * 100) : 0;
    const hasDiscount = discount > 0;

    const productLink = getProductFilename(product);
    const fullProductUrl = `https://sooq-masr.arabsad.com/${productLink}`;

    const whatsappMessage = encodeURIComponent(
        `مرحباً! 👋\n\n🏪 *${SITE_NAME}*\n━━━━━━━━━━━━━━━━━\n\nأرغب بطلب:\n\n📦 ${product.title}\n💰 ${salePrice.toFixed(2)} ج.م\n🔗 ${fullProductUrl}\n\n━━━━━━━━━━━━━━━━━\n📋 *بيانات العميل:*\n\n✅ الاسم: _____________\n✅ الهاتف: _____________\n✅ العنوان: _____________\n✅ المحافظة: _____________\n✅ العدد: _____________\n\nشكراً 🌟`
    );
    const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

    return `
        <div class="product-card" style="background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);transition:all 0.4s;cursor:pointer;display:flex;flex-direction:column;height:100%" onmouseover="this.style.transform='translateY(-12px)';this.style.boxShadow='0 20px 40px rgba(102,126,234,0.25)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 20px rgba(0,0,0,0.08)';" onclick="window.open('${productLink}','_blank')">
            ${hasDiscount ? `<div style='position:absolute;top:16px;right:16px;background:linear-gradient(135deg,#ef4444,#dc2626);color:white;padding:10px 24px;border-radius:50px;font-weight:900;font-size:15px;z-index:10;box-shadow:0 8px 25px rgba(239,68,68,0.5)'>خصم ${discount}%</div>` : ''}
            <div style="background:linear-gradient(135deg,#f9fafb,#f3f4f6);padding:30px;min-height:300px;display:flex;align-items:center;justify-content:center">
                <img data-src="${product.image_link}" alt="${product.title}" class="lazy-image" style="width:100%;height:280px;object-fit:contain;transition:transform 0.6s;opacity:0" onmouseover="this.style.transform='scale(1.15) rotate(3deg)'" onmouseout="this.style.transform='scale(1)'" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27300%27 height=%27300%27%3E%3Crect fill=%27%23f0f0f0%27 width=%27300%27 height=%27300%27/%3E%3Ctext fill=%27%23999%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 font-size=%2730%27%3E🛒%3C/text%3E%3C/svg%3E'">
            </div>
            <div style="padding:24px;flex:1;display:flex;flex-direction:column">
                <h3 style="font-size:17px;font-weight:700;margin-bottom:16px;color:#1f2937;line-height:1.5;min-height:52px">${truncateText(product.title,60)}</h3>
                <div style="margin-bottom:20px;flex:1">
                    ${hasDiscount ? `<div style="font-size:16px;color:#9ca3af;text-decoration:line-through;margin-bottom:4px">${price.toFixed(2)} ج.م</div>` : ''}
                    <span style="font-size:32px;font-weight:900;color:#e91e63">${salePrice.toFixed(2)} ج.م</span>
                </div>
                <div style="display:grid;gap:10px">
                    <button onclick="event.stopPropagation();window.open('${productLink}','_blank')" style="background:white;color:#667eea;padding:12px;border:2px solid #667eea;border-radius:10px;font-weight:700;font-size:18px;cursor:pointer;font-family:inherit;transition:all 0.2s" onmouseover="this.style.background='#667eea';this.style.color='white'" onmouseout="this.style.background='white';this.style.color='#667eea'">👁️ التفاصيل</button>
                    <button onclick="event.stopPropagation();window.open('${whatsappLink}','_blank')" style="background:linear-gradient(135deg,#25D366,#128C7E);color:white;padding:12px;border:none;border-radius:10px;font-weight:700;font-size:18px;cursor:pointer;box-shadow:0 4px 15px rgba(37,211,102,0.3);font-family:inherit" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">📱 واتساب</button>
                </div>
            </div>
        </div>
    `;
}

function renderProducts(products, append = false) {
    const productsGrid = document.getElementById('productsGrid');
    const noResults = document.getElementById('noResults');
    
    if (!productsGrid) return;
    
    if (!products || products.length === 0) {
        if (!append) productsGrid.innerHTML = '';
        if (noResults) noResults.style.display = 'block';
        return;
    }
    
    if (noResults) noResults.style.display = 'none';
    if (append) {
        productsGrid.innerHTML += products.map(createProductCardPure).join('');
    } else {
        productsGrid.innerHTML = products.map(createProductCardPure).join('');
    }
    
    updateLoadMoreButton();
    lazyLoadImages();
}

function updateLoadMoreButton() {
    const btn = document.getElementById('loadMoreBtn');
    if (!btn) return;
    btn.style.display = displayedProducts.length >= filteredProducts.length ? 'none' : 'inline-block';
    if (btn.style.display !== 'none') {
        btn.textContent = `تحميل المزيد (${filteredProducts.length - displayedProducts.length} منتج)`;
    }
}

function loadMore() {
    const start = currentPage * PRODUCTS_PER_PAGE;
    const newProducts = filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
    displayedProducts = displayedProducts.concat(newProducts);
    currentPage++;
    renderProducts(newProducts, true);
}

function lazyLoadImages() {
    const lazyImages = document.querySelectorAll('.lazy-image');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.style.opacity = '1';
                    observer.unobserve(img);
                }
            });
        });
        lazyImages.forEach(img => observer.observe(img));
    } else {
        lazyImages.forEach(img => { img.src = img.dataset.src; img.style.opacity = '1'; });
    }
}

function filterProducts() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase().trim() || '';
    const category = document.getElementById('categoryFilter')?.value || '';
    
    filteredProducts = allProducts.filter(p => {
        const matchSearch = !searchTerm || p.title.toLowerCase().includes(searchTerm);
        const matchCategory = !category || p.google_product_category === category;
        return matchSearch && matchCategory;
    });
    
    currentPage = 1;
    displayedProducts = filteredProducts.slice(0, PRODUCTS_PER_PAGE);
    renderProducts(displayedProducts, false);
}

function sortProducts() {
    const sort = document.getElementById('sortFilter')?.value;
    if (!sort) return;
    
    switch(sort) {
        case 'price-asc': filteredProducts.sort((a,b) => (a.sale_price||a.price) - (b.sale_price||b.price)); break;
        case 'price-desc': filteredProducts.sort((a,b) => (b.sale_price||b.price) - (a.sale_price||a.price)); break;
        case 'name-asc': filteredProducts.sort((a,b) => a.title.localeCompare(b.title, 'ar')); break;
        case 'name-desc': filteredProducts.sort((a,b) => b.title.localeCompare(a.title, 'ar')); break;
    }
    
    currentPage = 1;
    displayedProducts = filteredProducts.slice(0, PRODUCTS_PER_PAGE);
    renderProducts(displayedProducts, false);
}

function populateCategories(products) {
    const filter = document.getElementById('categoryFilter');
    if (!filter) return;
    const categories = [...new Set(products.map(p => p.google_product_category).filter(Boolean))];
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        filter.appendChild(opt);
    });
}

async function loadProducts() {
    try {
        const res = await fetch('products.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        let products = await res.json();
        
        products = products.map(enrichProduct);
        allProducts = products;
        filteredProducts = products;
        displayedProducts = products.slice(0, PRODUCTS_PER_PAGE);
        
        populateCategories(products);
        renderProducts(displayedProducts, false);
        addLoadMoreButton();
        
        console.log(`✅ تم تحميل ${allProducts.length} منتج`);
    } catch (error) {
        console.error('خطأ:', error);
        const grid = document.getElementById('productsGrid');
        if (grid) {
            grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#ef4444"><div style="font-size:64px">😞</div><h3 style="font-size:24px;font-weight:700;margin:20px 0">عذراً، حدث خطأ!</h3><button onclick="location.reload()" style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:14px 32px;border:none;border-radius:10px;font-size:16px;font-weight:700;cursor:pointer">🔄 إعادة المحاولة</button></div>';
        }
    }
}

function addLoadMoreButton() {
    const section = document.querySelector('.products-section .container');
    if (!section || document.getElementById('loadMoreBtn')) return;
    const div = document.createElement('div');
    div.style.cssText = 'text-align:center;margin-top:3rem';
    div.innerHTML = '<button id="loadMoreBtn" onclick="loadMore()" style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:16px 48px;border:none;border-radius:12px;font-size:18px;font-weight:700;cursor:pointer;box-shadow:0 8px 25px rgba(102,126,234,0.3);transition:all 0.3s;font-family:inherit" onmouseover="this.style.transform=\'scale(1.05)\'" onmouseout="this.style.transform=\'scale(1)\'">تحميل المزيد 📦</button>';
    section.appendChild(div);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProducts);
} else {
    loadProducts();
}