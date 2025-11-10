// ============= إجبار البطاقة على المسار الدقيق =============
const SITE_NAME = 'سوق مصر';
const WHATSAPP_NUMBER = '201110760081';
const PRODUCTS_PAGES_FOLDER = 'products-pages';
const PRODUCTS_PER_PAGE = 12; // عدد المنتجات في كل صفحة

let allProducts = [];
let filteredProducts = [];
let displayedProducts = [];
let currentPage = 1;

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

function getProductFilename(product) {
    if (product.link) {
        let f = product.link.trim();
        if (!f.startsWith(PRODUCTS_PAGES_FOLDER)) {
            f = PRODUCTS_PAGES_FOLDER + '/' + f;
        }
        return f;
    }
    let base = `product-${product.id}-${(product.title||'').replace(/[\s\n]+/g,'-').replace(/[^\w\-\u0600-\u06FF]+/g,'')}.html`;
    return PRODUCTS_PAGES_FOLDER + '/' + base;
}

function createProductCardPure(product) {
    const price = parseFloat(product.price) || 0;
    const salePrice = parseFloat(product.sale_price) || price;
    const discount = price !== salePrice ? Math.round((price - salePrice) / price * 100) : 0;
    const hasDiscount = discount > 0;

    const productFilename = getProductFilename(product);
    const productLink = productFilename;
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
                <h3 style="font-size:17px;font-weight:700;margin-bottom:16px;color:#1f2937;line-height:1.5;min-height:52px;overflow:hidden">${truncateText(product.title,60)}</h3>
                <div style="margin-bottom:20px;flex:1">
                    ${hasDiscount ? `<div style="font-size:16px;color:#9ca3af;text-decoration:line-through;margin-bottom:4px">${price.toFixed(2)} ج.م</div>` : ''}
                    <span style="font-size:32px;font-weight:900;color:#e91e63;display:block">${salePrice.toFixed(2)} ج.م</span>
                </div>
                <div style="display:grid;gap:10px">
                    <button onclick="event.stopPropagation();window.open('${productLink}','_blank')" style="background:white;color:#667eea;padding:12px 0;border:2px solid #667eea;border-radius:10px;font-weight:700;font-size:20px;cursor:pointer;font-family:inherit;transition:all 0.2s;margin-bottom:0.5em" onmouseover="this.style.background='#667eea';this.style.color='white'" onmouseout="this.style.background='white';this.style.color='#667eea'">👁️ شاهد التفاصيل</button>
                    <button onclick="event.stopPropagation();window.open('${whatsappLink}','_blank')" style="background:linear-gradient(135deg,#25D366,#128C7E);color:white;padding:12px 0;border:none;border-radius:10px;font-weight:700;font-size:20px;cursor:pointer;box-shadow:0 4px 15px rgba(37,211,102,0.3);font-family:inherit;transition:transform 0.2s;margin-bottom:0.5em" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">📱 واتساب</button>
                </div>
            </div>
        </div>
    `;
}

function renderProducts(products, append = false) {
    const productsGrid = document.getElementById('productsGrid');
    const noResults = document.getElementById('noResults');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (!productsGrid) return;
    
    if (!products || products.length === 0) {
        if (!append) productsGrid.innerHTML = '';
        if (noResults) noResults.style.display = 'block';
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
    }
    
    if (noResults) noResults.style.display = 'none';
    
    if (append) {
        productsGrid.innerHTML += products.map(product => createProductCardPure(product)).join('');
    } else {
        productsGrid.innerHTML = products.map(product => createProductCardPure(product)).join('');
    }
    
    // تحديث زر "تحميل المزيد"
    updateLoadMoreButton();
    lazyLoadImages();
}

function updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!loadMoreBtn) return;
    
    const totalProducts = filteredProducts.length;
    const displayedCount = displayedProducts.length;
    
    if (displayedCount >= totalProducts) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-block';
        const remaining = totalProducts - displayedCount;
        loadMoreBtn.textContent = `تحميل المزيد (${remaining} منتج متبقي)`;
    }
}

function loadMore() {
    const startIndex = currentPage * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    const newProducts = filteredProducts.slice(startIndex, endIndex);
    
    displayedProducts = displayedProducts.concat(newProducts);
    currentPage++;
    
    renderProducts(newProducts, true);
}

function lazyLoadImages() {
    const lazyImages = document.querySelectorAll('.lazy-image');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.style.opacity = '1';
                    img.classList.remove('lazy-image');
                    imageObserver.unobserve(img);
                }
            });
        });
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.style.opacity = '1';
        });
    }
}

function filterProducts() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedCategory = categoryFilter ? categoryFilter.value : '';
    
    filteredProducts = allProducts.filter(product => {
        const matchesSearch = !searchTerm || 
            product.title.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm));
        const matchesCategory = !selectedCategory || 
            product.google_product_category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    
    // إعادة تعيين الصفحة الحالية
    currentPage = 1;
    displayedProducts = filteredProducts.slice(0, PRODUCTS_PER_PAGE);
    
    renderProducts(displayedProducts, false);
}

function sortProducts() {
    const sortFilter = document.getElementById('sortFilter');
    if (!sortFilter) return;
    const sortValue = sortFilter.value;
    
    switch(sortValue) {
        case 'price-asc':
            filteredProducts.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
            break;
        case 'name-asc':
            filteredProducts.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
            break;
        case 'name-desc':
            filteredProducts.sort((a, b) => b.title.localeCompare(a.title, 'ar'));
            break;
        default:
            break;
    }
    
    // إعادة تعيين الصفحة الحالية
    currentPage = 1;
    displayedProducts = filteredProducts.slice(0, PRODUCTS_PER_PAGE);
    
    renderProducts(displayedProducts, false);
}

function populateCategories(products) {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    const categories = [...new Set(products.map(p => p.google_product_category).filter(Boolean))];
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

async function loadProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const products = await response.json();
        
        allProducts = products;
        filteredProducts = products;
        displayedProducts = products.slice(0, PRODUCTS_PER_PAGE);
        
        populateCategories(products);
        renderProducts(displayedProducts, false);
        
        // إضافة زر "تحميل المزيد" إذا لم يكن موجوداً
        addLoadMoreButton();
        
    } catch (error) {
        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid) {
            productsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #ef4444;">
                    <div style="font-size: 64px; margin-bottom: 20px;">😞</div>
                    <h3 style="font-size: 24px; margin-bottom: 12px; font-weight: 700;">عذراً، حدث خطأ!</h3>
                    <p style="font-size: 16px; color: #6b7280; margin-bottom: 24px;">لم نتمكن من تحميل المنتجات. يرجى المحاولة مرة أخرى.</p>
                    <button onclick="location.reload()" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 14px 32px; border: none; border-radius: 10px; font-size: 16px; font-weight: 700; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">🔄 إعادة المحاولة</button>
                </div>
            `;
        }
    }
}

function addLoadMoreButton() {
    const productsSection = document.querySelector('.products-section .container');
    if (!productsSection || document.getElementById('loadMoreBtn')) return;
    
    const loadMoreContainer = document.createElement('div');
    loadMoreContainer.style.cssText = 'text-align: center; margin-top: 3rem;';
    loadMoreContainer.innerHTML = `
        <button id="loadMoreBtn" onclick="loadMore()" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 16px 48px; border: none; border-radius: 12px; font-size: 18px; font-weight: 700; cursor: pointer; box-shadow: 0 8px 25px rgba(102,126,234,0.3); transition: all 0.3s; font-family: inherit;" onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 12px 35px rgba(102,126,234,0.4)'" onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 8px 25px rgba(102,126,234,0.3)'">
            تحميل المزيد 📦
        </button>
    `;
    
    productsSection.appendChild(loadMoreContainer);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProducts);
} else {
    loadProducts();
}